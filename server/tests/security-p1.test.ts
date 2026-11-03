import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";

// External services are mocked: no Firebase, Stripe or email calls during tests
const { deleteSpy, stripeMock } = vi.hoisted(() => ({
  deleteSpy: vi.fn().mockResolvedValue(undefined),
  stripeMock: {
    retrieveSubscription: vi.fn(),
    cancelSetupIntent: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("../src/lib/firebase.js", () => ({
  bucket: { name: "test-bucket", file: () => ({ save: vi.fn(), delete: deleteSpy }) },
  firebaseAuth: { verifyIdToken: vi.fn() },
}));
vi.mock("../src/utils/generateRandomAvatar.js", () => ({ generateRandomAvatar: vi.fn().mockResolvedValue("") }));
vi.mock("../src/utils/sendEmail.js", () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../src/services/stripeService.js", () => ({ stripeService: stripeMock }));

import { app } from "../src/app.js";
import { User } from "../src/models/userModel.js";
import { Restaurant } from "../src/models/restaurantModel.js";
import { Plan } from "../src/models/planModel.js";
import { Booking } from "../src/models/bookingModel.js";
import { VerificationCode } from "../src/models/verificationCodeModel.js";
import { generateAccessToken } from "../src/utils/generateAccessToken.js";
import { restaurantRoles } from "../src/utils/enums/restaurantRoles.js";
import { getEnvProblems } from "../src/configuration/env.js";
import { escapeHtml } from "../src/utils/escapeHtml.js";
import { deleteRestaurantFile } from "../src/utils/fileUploadUtils.js";
import { expireUnpaidSubscriptions } from "../src/cron/subscriptionExpiry.js";

const PASSWORD = "Azerty123!";
const DAY = 24 * 60 * 60 * 1000;

const createUser = async (suffix: string) => {
  const user = await User.create({
    name: "Doe",
    forename: "John",
    email: `${suffix}@test.fr`,
    username: suffix,
    password: await bcrypt.hash(PASSWORD, 4),
    isVerified: true,
  });
  return { user, token: generateAccessToken(user._id, user.tokenVersion) };
};

const createRestaurant = async (adminId: any, fields: Record<string, unknown> = {}) =>
  Restaurant.create({
    name: "Chez Test",
    slug: `chez-test-${Date.now()}-${Math.random()}`,
    adress: `${Math.random()} rue du Test`,
    phone: "0102030405",
    email: "resto@test.fr",
    collaborators: [adminId],
    collaboratorRoles: new Map([[adminId.toString(), restaurantRoles.ADMIN]]),
    ...fields,
  });

const createBooking = async (userId: any, restaurantId: any, inMs: number, fields: Record<string, unknown> = {}) =>
  Booking.create({
    restaurant: restaurantId,
    user: userId,
    bookingDate: new Date(Date.now() + inMs),
    guests: 2,
    customer: { name: "Client", phone: "0600000000", email: "client@test.fr" },
    status: "CONFIRMED",
    ...fields,
  });

beforeEach(async () => {
  await Restaurant.deleteMany({});
  await Plan.deleteMany({});
  await Booking.deleteMany({});
  await VerificationCode.deleteMany({});
  deleteSpy.mockClear();
  stripeMock.retrieveSubscription.mockReset();
});

describe("Required environment", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it("reports missing and weak secrets by name only", () => {
    process.env.SECRET_ACCESS_TOKEN = "short-value-xyz";
    delete process.env.API_KEY_SECRET;
    let problems = getEnvProblems();
    expect(problems).toContain("API_KEY_SECRET : variable absente");
    expect(problems).toContain("SECRET_ACCESS_TOKEN : trop courte (32 caractères minimum)");
    expect(problems.join(" ")).not.toContain("short-value-xyz");

    process.env.SECRET_ACCESS_TOKEN = "your-super-secret-token-change-me";
    problems = getEnvProblems();
    expect(problems.some((p) => p.startsWith("SECRET_ACCESS_TOKEN : valeur d'exemple"))).toBe(true);
  });
});

describe("Login and password reset", () => {
  it("answers the same for an unknown account and a wrong password", async () => {
    await createUser("known");
    const unknown = await request(app).post("/api/auth/login").send({ email: "nobody@test.fr", password: PASSWORD });
    const wrong = await request(app).post("/api/auth/login").send({ email: "known@test.fr", password: "Wrong123!" });
    expect(unknown.status).toBe(wrong.status);
    expect(unknown.body.error).toBe(wrong.body.error);
  });

  it("does not reveal whether an email has an account", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({ email: "nobody@test.fr" });
    expect(res.status).toBe(200);
  });
});

describe("Sessions", () => {
  it("revokes old tokens when the password changes and returns a fresh one", async () => {
    const { user, token } = await createUser("rotate");
    const res = await request(app)
      .put(`/api/users/${user._id}/password`)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: PASSWORD, newPassword: "Nouveau123!", newPasswordConfirm: "Nouveau123!" });
    expect(res.status).toBe(200);

    const oldToken = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(oldToken.status).toBe(401);
    const newToken = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${res.body.accessToken}`);
    expect(newToken.status).toBe(200);
  });
});

describe("Verification code brute force", () => {
  it("blocks after 10 wrong codes for the same email", async () => {
    const { token } = await createUser("brute");
    await VerificationCode.create({ email: "target@test.fr", code: "654321" });
    let last;
    for (let i = 0; i < 11; i++) {
      last = await request(app)
        .post("/api/restaurants/verify-verification-code")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "target@test.fr", code: String(100000 + i) });
    }
    expect(last!.status).toBe(429);
  });
});

describe("Uploads", () => {
  it("refuses SVG files", async () => {
    const { token } = await createUser("svg");
    const res = await request(app)
      .post("/api/uploads/image")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.from("<svg onload='alert(1)'/>"), { filename: "x.svg", contentType: "image/svg+xml" });
    expect(res.status).toBe(400);
  });

  it("refuses files over 5 MB", async () => {
    const { token } = await createUser("big");
    const res = await request(app)
      .post("/api/uploads/image")
      .set("Authorization", `Bearer ${token}`)
      .attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), { filename: "big.png", contentType: "image/png" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Fichier trop volumineux (5 Mo maximum)");
  });

  it("never deletes avatars or another restaurant's images", async () => {
    const { user } = await createUser("files");
    const base = "https://storage.googleapis.com/test-bucket/";
    const mine = await createRestaurant(user._id);
    await createRestaurant(user._id, { images: [`${base}restaurants/galleries/other.png`] });

    await deleteRestaurantFile(`${base}avatars/avatar_victim.png`, mine._id.toString());
    await deleteRestaurantFile(`${base}restaurants/galleries/other.png`, mine._id.toString());
    expect(deleteSpy).not.toHaveBeenCalled();

    await deleteRestaurantFile(`${base}restaurants/galleries/mine.png`, mine._id.toString());
    expect(deleteSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Public data", () => {
  it("hides billing and secret fields on public restaurant pages", async () => {
    const { user } = await createUser("public");
    const restaurant = await createRestaurant(user._id, { stripeAccountId: "acct_1", apiKey: "hash", stripeCustomerId: "cus_1" });
    const res = await request(app).get(`/api/restaurants/public/${restaurant._id}`);
    expect(res.status).toBe(200);
    for (const field of ["stripeAccountId", "apiKey", "stripeCustomerId", "collaboratorRoles", "verificationToken"]) {
      expect(res.body.restaurant[field]).toBeUndefined();
    }
  });

  it("only finds users by exact email", async () => {
    const { token } = await createUser("searcher");
    await createUser("findme");
    const auth = { Authorization: `Bearer ${token}` };
    const partial = await request(app).get("/api/users/search").query({ q: "find" }).set(auth);
    expect(partial.body.users).toHaveLength(0);
    const regex = await request(app).get("/api/users/search").query({ q: ".*@test.fr" }).set(auth);
    expect(regex.body.users).toHaveLength(0);
    const exact = await request(app).get("/api/users/search").query({ q: "FindMe@test.fr" }).set(auth);
    expect(exact.body.users).toHaveLength(1);
  });

  it("does not leak internal error details", async () => {
    const { token } = await createUser("errors");
    const res = await request(app).get("/api/bookings/not-an-id").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Données invalides");
  });

  it("escapes user input in emails", () => {
    expect(escapeHtml('<a href="x">Jean</a>')).toBe("&lt;a href=&quot;x&quot;&gt;Jean&lt;/a&gt;");
  });
});

describe("Cancellation policy", () => {
  it("refuses cancelling a bank-imprint booking less than 24 h before", async () => {
    const { user, token } = await createUser("late");
    const restaurant = await createRestaurant(user._id);
    const booking = await createBooking(user._id, restaurant._id, 10 * 60 * 60 * 1000, {
      bankImprintStatus: "secured",
      stripeSetupIntentId: "seti_1",
    });
    const res = await request(app).patch(`/api/bookings/${booking._id}/cancel`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect((await Booking.findById(booking._id))!.bankImprintStatus).toBe("secured");
  });

  it("refuses cancelling a past booking", async () => {
    const { user, token } = await createUser("past");
    const restaurant = await createRestaurant(user._id);
    const booking = await createBooking(user._id, restaurant._id, -2 * 60 * 60 * 1000);
    const res = await request(app).patch(`/api/bookings/${booking._id}/cancel`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("allows cancelling earlier than 24 h before", async () => {
    const { user, token } = await createUser("early");
    const restaurant = await createRestaurant(user._id);
    const booking = await createBooking(user._id, restaurant._id, 3 * DAY, { bankImprintStatus: "secured", stripeSetupIntentId: "seti_2" });
    const res = await request(app).patch(`/api/bookings/${booking._id}/cancel`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect((await Booking.findById(booking._id))!.bankImprintStatus).toBe("released");
  });
});

describe("Unpaid subscriptions", () => {
  it("closes paid restaurants only after the 7-day grace period", async () => {
    const { user } = await createUser("billing");
    const paid = await Plan.create({ name: "Premium", price: 49 });
    const free = await Plan.create({ name: "Free", price: 0 });
    const expired = await createRestaurant(user._id, {
      plan: paid._id,
      subscriptionStatus: "active",
      isClosed: false,
      subscriptionEndDate: new Date(Date.now() - 8 * DAY),
    });
    const inGrace = await createRestaurant(user._id, {
      plan: paid._id,
      subscriptionStatus: "active",
      isClosed: false,
      subscriptionEndDate: new Date(Date.now() - 5 * DAY),
    });
    const freePlan = await createRestaurant(user._id, {
      plan: free._id,
      subscriptionStatus: "active",
      isClosed: false,
      subscriptionEndDate: new Date(Date.now() - 30 * DAY),
    });

    expect(await expireUnpaidSubscriptions()).toBe(1);
    const closed = await Restaurant.findById(expired._id);
    expect(closed!.subscriptionStatus).toBe("expired");
    expect(closed!.isClosed).toBe(true);
    expect((await Restaurant.findById(inGrace._id))!.isClosed).toBe(false);
    expect((await Restaurant.findById(freePlan._id))!.isClosed).toBe(false);
  });

  it("keeps a restaurant open when Stripe says the subscription is still active", async () => {
    const { user } = await createUser("stripeok");
    const paid = await Plan.create({ name: "Premium", price: 49 });
    const restaurant = await createRestaurant(user._id, {
      plan: paid._id,
      subscriptionStatus: "active",
      isClosed: false,
      stripeSubscriptionId: "sub_1",
      subscriptionEndDate: new Date(Date.now() - 10 * DAY),
    });
    stripeMock.retrieveSubscription.mockResolvedValue({ status: "active", current_period_end: Math.floor((Date.now() + 20 * DAY) / 1000) });

    expect(await expireUnpaidSubscriptions()).toBe(0);
    const updated = await Restaurant.findById(restaurant._id);
    expect(updated!.isClosed).toBe(false);
    expect(updated!.subscriptionEndDate!.getTime()).toBeGreaterThan(Date.now());
  });

  it("refuses reopening an expired restaurant", async () => {
    const { user, token } = await createUser("reopen");
    const restaurant = await createRestaurant(user._id, { subscriptionStatus: "expired", isClosed: true });
    const res = await request(app).patch(`/api/restaurants/${restaurant._id}/toggle-closed`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect((await Restaurant.findById(restaurant._id))!.isClosed).toBe(true);
  });
});
