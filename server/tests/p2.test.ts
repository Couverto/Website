import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// External services are mocked: no Firebase, Stripe or email calls during tests
vi.mock("../src/lib/firebase.js", () => ({
  bucket: { name: "test-bucket", file: () => ({ save: vi.fn(), delete: vi.fn() }) },
  firebaseAuth: { verifyIdToken: vi.fn() },
}));
vi.mock("../src/utils/generateRandomAvatar.js", () => ({ generateRandomAvatar: vi.fn().mockResolvedValue("") }));
vi.mock("../src/utils/sendEmail.js", () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../src/services/stripeService.js", () => ({ stripeService: {} }));
vi.mock("../src/services/emailService.js", () => ({ sendThankYouReviewEmail: vi.fn().mockResolvedValue(undefined) }));

import { app } from "../src/app.js";
import { User } from "../src/models/userModel.js";
import { Restaurant } from "../src/models/restaurantModel.js";
import { Booking } from "../src/models/bookingModel.js";
import { Review } from "../src/models/reviewModel.js";
import { Plan } from "../src/models/planModel.js";
import { Feature } from "../src/models/featureModel.js";
import { VerificationCode } from "../src/models/verificationCodeModel.js";
import { generateAccessToken } from "../src/utils/generateAccessToken.js";
import { restaurantRoles } from "../src/utils/enums/restaurantRoles.js";
import { getParisWeekday } from "../src/utils/dateFormatter.js";
import { mergeAmenities, isRestaurantOpen } from "../src/utils/restaurantUtils.js";
import { withKeyedLock } from "../src/utils/keyedLock.js";

const DAY = 24 * 60 * 60 * 1000;
const ALWAYS_OPEN = Object.fromEntries(
  ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => [
    day,
    { isClosed: false, periods: [{ open: "00:00", close: "23:59" }] },
  ]),
);

const createUser = async (suffix: string, fields: Record<string, unknown> = {}) => {
  const user = await User.create({
    name: "Doe",
    forename: "John",
    email: `${suffix}@test.fr`,
    username: suffix,
    password: await bcrypt.hash("Azerty123!", 4),
    isVerified: true,
    ...fields,
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
    isClosed: false,
    openingHours: ALWAYS_OPEN,
    ...fields,
  });

const guestBooking = (restaurantId: any, fields: Record<string, unknown> = {}) => ({
  restaurant: restaurantId.toString(),
  bookingDate: new Date(Date.now() + 2 * DAY).toISOString(),
  guests: 2,
  customer: { name: "Client", phone: "0600000000", email: "client@test.fr" },
  ...fields,
});

beforeEach(async () => {
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await Plan.deleteMany({});
  await Feature.deleteMany({});
  await VerificationCode.deleteMany({});
});

describe("Restaurant email verification", () => {
  it("applies the new email when the link from the email is opened", async () => {
    const { user } = await createUser("owner-verify");
    const rawToken = "a".repeat(40);
    const restaurant = await createRestaurant(user._id, {
      tempEmail: "nouveau@test.fr",
      verificationToken: crypto.createHash("sha256").update(rawToken).digest("hex"),
      verificationTokenExpire: new Date(Date.now() + DAY),
    });

    const res = await request(app).get(`/api/restaurants/verify-email/${rawToken}`);
    expect(res.status).toBe(200);
    const updated = await Restaurant.findById(restaurant._id);
    expect(updated?.email).toBe("nouveau@test.fr");
    expect(updated?.isVerified).toBe(true);

    // The link only works once
    expect((await request(app).get(`/api/restaurants/verify-email/${rawToken}`)).status).toBe(400);
  });
});

describe("Restaurant email change from the settings", () => {
  const createSettingsRestaurant = async () => {
    const { user, token } = await createUser(`owner-settings-${Math.random()}`.replace(".", ""));
    const feature = await Feature.create({ name: "Paramètres", associatedPages: ["settings"] });
    const plan = await Plan.create({ name: "Test", price: 0, features: [feature._id] });
    const restaurant = await createRestaurant(user._id, { plan: plan._id, isClosed: true });
    return { restaurant, token };
  };

  it("applies an email verified with a code right away", async () => {
    const { restaurant, token } = await createSettingsRestaurant();
    await VerificationCode.create({ email: "verifie@test.fr", code: "123456", verified: true });

    const res = await request(app)
      .put(`/api/restaurants/${restaurant._id}/settings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "verifie@test.fr" });
    expect(res.status).toBe(200);
    expect((await Restaurant.findById(restaurant._id))?.email).toBe("verifie@test.fr");
  });

  it("keeps the old email until an unverified address is confirmed", async () => {
    const { restaurant, token } = await createSettingsRestaurant();

    const res = await request(app)
      .put(`/api/restaurants/${restaurant._id}/settings`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "pirate@test.fr" });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("lien de vérification");
    const updated = await Restaurant.findById(restaurant._id);
    expect(updated?.email).toBe("resto@test.fr");
    expect(updated?.tempEmail).toBe("pirate@test.fr");
  });
});

describe("Reviews", () => {
  it("lets a restaurant manager reply, but only to its own restaurant's reviews", async () => {
    const { user: owner, token } = await createUser("owner-review");
    const { user: customer } = await createUser("customer-review");
    const restaurant = await createRestaurant(owner._id);
    const other = await createRestaurant(customer._id);
    const booking = await Booking.create(guestBooking(restaurant._id, { bookingDate: new Date(Date.now() - DAY) }));
    const otherBooking = await Booking.create(guestBooking(other._id, { bookingDate: new Date(Date.now() - DAY) }));
    const review = await Review.create({ restaurant: restaurant._id, user: customer._id, booking: booking._id, rating: 4 });
    const otherReview = await Review.create({ restaurant: other._id, user: customer._id, booking: otherBooking._id, rating: 1 });

    const ok = await request(app)
      .post(`/api/reviews/restaurant/${restaurant._id}/${review._id}/reply`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Merci !" });
    expect(ok.status).toBe(200);
    expect(ok.body.reply.text).toBe("Merci !");

    // Collaborator of restaurant A trying to answer a review of restaurant B through A's URL
    const forged = await request(app)
      .post(`/api/reviews/restaurant/${restaurant._id}/${otherReview._id}/reply`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Pirate" });
    expect(forged.status).toBe(404);
    expect((await Review.findById(otherReview._id))?.reply?.text).toBeUndefined();
  });

  it("refuses a review before the booking took place or on a cancelled booking", async () => {
    const { user: owner } = await createUser("owner-early");
    const { user: customer, token } = await createUser("customer-early");
    const restaurant = await createRestaurant(owner._id);
    const future = await Booking.create({ ...guestBooking(restaurant._id), user: customer._id, status: "CONFIRMED" });
    const cancelled = await Booking.create({
      ...guestBooking(restaurant._id, { bookingDate: new Date(Date.now() - DAY) }),
      user: customer._id,
      status: "CANCELLED",
    });

    for (const booking of [future, cancelled]) {
      const res = await request(app).post("/api/reviews").set("Authorization", `Bearer ${token}`).send({ bookingId: booking._id, rating: 5 });
      expect(res.status).toBe(400);
    }
    expect(await Review.countDocuments()).toBe(0);
  });
});

describe("Booking validation", () => {
  it("refuses invalid guest counts, past dates and closed restaurants", async () => {
    const { user } = await createUser("owner-booking");
    const restaurant = await createRestaurant(user._id);
    const closed = await createRestaurant(user._id, { isClosed: true });

    for (const guests of [0, -3, "abc", 2.5, 500]) {
      expect((await request(app).post("/api/bookings/guest").send(guestBooking(restaurant._id, { guests }))).status).toBe(400);
    }
    const past = await request(app)
      .post("/api/bookings/guest")
      .send(guestBooking(restaurant._id, { bookingDate: new Date(Date.now() - DAY).toISOString() }));
    expect(past.status).toBe(400);
    expect((await request(app).post("/api/bookings/guest").send(guestBooking(closed._id))).status).toBe(400);
    expect(await Booking.countDocuments()).toBe(0);

    expect((await request(app).post("/api/bookings/guest").send(guestBooking(restaurant._id))).status).toBe(201);
  });

  it("does not overwrite the phone already saved on the profile", async () => {
    const { user: owner } = await createUser("owner-phone");
    const { user, token } = await createUser("customer-phone", { phone: "0611111111" });
    const restaurant = await createRestaurant(owner._id);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send(guestBooking(restaurant._id, { customer: { name: "Ami", phone: "0699999999" } }));
    expect(res.status).toBe(201);
    expect((await User.findById(user._id))?.phone).toBe("0611111111");
  });

  it("does not attach a booking entered by the restaurant to the staff member's account", async () => {
    const { user: owner, token } = await createUser("owner-staff");
    const restaurant = await createRestaurant(owner._id);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send(guestBooking(restaurant._id, { isManual: true, customer: { name: "Au téléphone", phone: "0612121212" } }));
    expect(res.status).toBe(201);
    expect(res.body.booking.user).toBeNull();
    expect((await User.findById(owner._id))?.phone).toBe("");
  });

  it("never overbooks when the last seats are booked simultaneously", async () => {
    const { user } = await createUser("owner-race");
    const restaurant = await createRestaurant(user._id, {
      capacity: 4,
      zones: [{ id: "z1", name: "Salle", tables: [{ id: "t1", label: "1", seats: 4, x: 0, y: 0, width: 1, height: 1 }] }],
    });

    const results = await Promise.all(
      [1, 2, 3].map((i) =>
        request(app)
          .post("/api/bookings/guest")
          .send(guestBooking(restaurant._id, { guests: 3, customer: { name: `Client ${i}`, phone: "0600000000" } })),
      ),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(await Booking.countDocuments()).toBe(1);
  });
});

describe("Paris time", () => {
  it("computes the weekday in Paris, not on the server clock", () => {
    // Monday 23:30 UTC is already Tuesday 00:30 in Paris (winter time)
    expect(getParisWeekday("2026-11-02T23:30:00.000Z")).toBe("tuesday");
  });

  it("knows a restaurant is open right now", () => {
    expect(isRestaurantOpen(new Map(Object.entries(ALWAYS_OPEN)))).toBe(true);
  });
});

describe("Amenities", () => {
  it("only lets a restaurant change amenities, never admin-granted features", () => {
    expect(mergeAmenities(["Wifi", "tablePlan", "Bar"], ["Terrasse", "Statistiques"])).toEqual(["Statistiques", "Wifi", "Bar"]);
    expect(mergeAmenities("Wifi", ["Statistiques"])).toEqual(["Statistiques"]);
  });
});

describe("Keyed lock", () => {
  it("runs tasks with the same key one after the other", async () => {
    const order: string[] = [];
    const task = (name: string, ms: number) => async () => {
      order.push(`${name}:start`);
      await new Promise((r) => setTimeout(r, ms));
      order.push(`${name}:end`);
    };
    await Promise.all([withKeyedLock("k", task("a", 30)), withKeyedLock("k", task("b", 1))]);
    expect(order).toEqual(["a:start", "a:end", "b:start", "b:end"]);
  });
});
