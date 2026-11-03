import { describe, it, expect, beforeEach, afterAll, beforeAll, vi } from "vitest";
import request from "supertest";
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import { io as ioClient } from "socket.io-client";

// External services are mocked: no Firebase, Stripe or email calls during tests
const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));
vi.mock("../src/lib/firebase.js", () => ({
  bucket: { name: "test-bucket", file: () => ({ save: vi.fn(), delete: vi.fn().mockResolvedValue(undefined) }) },
  firebaseAuth: { verifyIdToken },
}));
vi.mock("../src/utils/generateRandomAvatar.js", () => ({ generateRandomAvatar: vi.fn().mockResolvedValue("") }));
vi.mock("../src/utils/sendEmail.js", () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../src/services/stripeService.js", () => ({
  stripeService: {
    retrieveSubscription: vi.fn(),
    updateSubscriptionItem: vi.fn(),
    cancelSubscription: vi.fn(),
    createCustomer: vi.fn(),
    createCheckoutSession: vi.fn(),
  },
}));

import { app } from "../src/app.js";
import { initSockets } from "../src/sockets/socket.js";
import { User } from "../src/models/userModel.js";
import { Restaurant } from "../src/models/restaurantModel.js";
import { Plan } from "../src/models/planModel.js";
import { Booking } from "../src/models/bookingModel.js";
import { VerificationCode } from "../src/models/verificationCodeModel.js";
import { generateAccessToken } from "../src/utils/generateAccessToken.js";
import { userRoles } from "../src/utils/enums/userRoles.js";
import { restaurantRoles } from "../src/utils/enums/restaurantRoles.js";

const createUser = async (suffix: string, role: string = userRoles.USER) => {
  const user = await User.create({
    name: "Doe",
    forename: "John",
    email: `${suffix}@test.fr`,
    username: suffix,
    password: "hashed",
    role,
    isVerified: true,
  });
  return { user, token: generateAccessToken(user._id) };
};

const createRestaurant = async (adminId: any) =>
  Restaurant.create({
    name: "Chez Test",
    slug: `chez-test-${Date.now()}`,
    adress: "1 rue du Test",
    phone: "0102030405",
    email: "resto@test.fr",
    collaborators: [adminId],
    collaboratorRoles: new Map([[adminId.toString(), restaurantRoles.ADMIN]]),
  });

beforeEach(async () => {
  await Restaurant.deleteMany({});
  await Plan.deleteMany({});
  await VerificationCode.deleteMany({});
  verifyIdToken.mockReset();
});

describe("Google sign-in", () => {
  it("rejects a request carrying only an email", async () => {
    await createUser("victim", userRoles.ADMIN);
    const res = await request(app).post("/api/auth/login/google").send({ email: "victim@test.fr" });
    expect(res.status).toBe(422);
    expect(res.body.accessToken).toBeUndefined();
  });

  it("rejects a forged ID token", async () => {
    verifyIdToken.mockRejectedValue(new Error("invalid signature"));
    const res = await request(app).post("/api/auth/login/google").send({ idToken: "forged" });
    expect(res.status).toBe(401);
  });

  it("logs in the account matching the verified token email", async () => {
    const { user } = await createUser("googler");
    verifyIdToken.mockResolvedValue({
      email: "googler@test.fr",
      email_verified: true,
      name: "John Doe",
      firebase: { sign_in_provider: "google.com" },
    });
    const res = await request(app).post("/api/auth/login/google").send({ idToken: "valid", email: "someone-else@test.fr" });
    expect(res.status).toBe(201);
    expect(res.body.user._id).toBe(user._id.toString());
  });
});

describe("Registration", () => {
  it("no longer creates a verified account without password via photoURL", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Doe",
      forename: "John",
      email: "new@test.fr",
      username: "newuser",
      photoURL: "https://example.com/a.png",
    });
    expect(res.status).toBe(422);
    expect(await User.countDocuments({ email: "new@test.fr" })).toBe(0);
  });
});

describe("User routes", () => {
  it("forbids updating another user", async () => {
    const { token } = await createUser("attacker");
    const { user: victim } = await createUser("victim");
    const res = await request(app)
      .put(`/api/users/${victim._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "attacker2@test.fr" });
    expect(res.status).toBe(403);
    expect((await User.findById(victim._id))!.email).toBe("victim@test.fr");
  });

  it("ignores protected fields on self update", async () => {
    const { user, token } = await createUser("self");
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ forename: "Jane", role: userRoles.ADMIN, isVerified: false, auth_type: "google", resetPasswordToken: "x" });
    expect(res.status).toBe(200);
    const updated = await User.findById(user._id);
    expect(updated!.forename).toBe("Jane");
    expect(updated!.role).toBe(userRoles.USER);
    expect(updated!.isVerified).toBe(true);
    expect(updated!.auth_type).toBe("local");
    expect(updated!.resetPasswordToken).toBeUndefined();
  });

  it("requires a verified code to change one's email", async () => {
    const { user, token } = await createUser("mover");
    const auth = { Authorization: `Bearer ${token}` };

    const denied = await request(app).put(`/api/users/${user._id}`).set(auth).send({ email: "new-address@test.fr" });
    expect(denied.status).toBe(400);

    await VerificationCode.create({ email: "new-address@test.fr", code: "123456" });
    const injection = await request(app)
      .post("/api/restaurants/verify-verification-code")
      .set(auth)
      .send({ email: "new-address@test.fr", code: { $ne: null } });
    expect(injection.status).toBe(400);

    const verified = await request(app)
      .post("/api/restaurants/verify-verification-code")
      .set(auth)
      .send({ email: "New-Address@test.fr", code: "123456" });
    expect(verified.status).toBe(200);

    const allowed = await request(app).put(`/api/users/${user._id}`).set(auth).send({ email: "new-address@test.fr" });
    expect(allowed.status).toBe(200);
    expect(allowed.body.user.email).toBe("new-address@test.fr");
  });

  it("forbids changing another user's password", async () => {
    const { token } = await createUser("attacker");
    const { user: victim } = await createUser("victim");
    const res = await request(app)
      .put(`/api/users/${victim._id}/password`)
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "x", newPassword: "Azerty123!", newPasswordConfirm: "Azerty123!" });
    expect(res.status).toBe(403);
  });

  it("forbids changing another user's avatar", async () => {
    const { token } = await createUser("attacker");
    const { user: victim } = await createUser("victim");
    const res = await request(app)
      .post(`/api/uploads/avatar/${victim._id}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", Buffer.from("fake"), { filename: "a.png", contentType: "image/png" });
    expect(res.status).toBe(403);
  });
});

describe("Restaurant update", () => {
  it("forbids non-collaborators", async () => {
    const { user: owner } = await createUser("owner");
    const { user: attacker, token } = await createUser("attacker");
    const restaurant = await createRestaurant(owner._id);
    const res = await request(app)
      .put(`/api/restaurants/${restaurant._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ collaborators: [attacker._id] });
    expect(res.status).toBe(403);
  });

  it("strips protected fields for restaurant admins and returns the updated document", async () => {
    const { user: owner, token } = await createUser("owner");
    const restaurant = await createRestaurant(owner._id);
    const res = await request(app)
      .put(`/api/restaurants/${restaurant._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nouveau nom", stripeAccountId: "acct_evil", subscriptionStatus: "active", features: ["x"], apiKey: "k" });
    expect(res.status).toBe(200);
    expect(res.body.restaurant.name).toBe("Nouveau nom");
    const updated = await Restaurant.findById(restaurant._id);
    expect(updated!.stripeAccountId).toBeNull();
    expect(updated!.subscriptionStatus).not.toBe("active");
    expect(updated!.apiKey).toBeNull();
  });
});

describe("Payments", () => {
  it("forbids changing the plan of someone else's restaurant", async () => {
    const { user: owner } = await createUser("owner");
    const { token } = await createUser("attacker");
    const restaurant = await createRestaurant(owner._id);
    const plan = await Plan.create({ name: "Free", price: 0 });
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ restaurantId: restaurant._id, planId: plan._id });
    expect(res.status).toBe(403);
  });

  it("never activates a paid plan without Stripe", async () => {
    const { user: owner, token } = await createUser("owner");
    const restaurant = await createRestaurant(owner._id);
    const plan = await Plan.create({ name: "Premium", price: 49 });
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ restaurantId: restaurant._id, planId: plan._id, amount: 0 });
    expect(res.status).toBe(400);
    expect((await Restaurant.findById(restaurant._id))!.plan).toBeNull();
  });

  it("records a free plan with the plan price, not the client amount", async () => {
    const { user: owner, token } = await createUser("owner");
    const restaurant = await createRestaurant(owner._id);
    const plan = await Plan.create({ name: "Free", price: 0 });
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ restaurantId: restaurant._id, planId: plan._id, amount: 99999 });
    expect(res.status).toBe(201);
    expect(res.body.payment.amount).toBe(0);
  });

  it("refuses switching to a paid plan without a Stripe subscription", async () => {
    const { user: owner, token } = await createUser("owner");
    const restaurant = await createRestaurant(owner._id);
    const plan = await Plan.create({ name: "Premium", price: 49, stripePriceId: "price_x" });
    const res = await request(app)
      .put(`/api/restaurants/${restaurant._id}/subscription`)
      .set("Authorization", `Bearer ${token}`)
      .send({ planId: plan._id });
    expect(res.status).toBe(400);
    expect((await Restaurant.findById(restaurant._id))!.plan).toBeNull();
  });
});

describe("Manual booking route", () => {
  it("is removed", async () => {
    const { user: owner } = await createUser("owner");
    const { token } = await createUser("attacker");
    const restaurant = await createRestaurant(owner._id);
    const res = await request(app)
      .post("/api/bookings/manual")
      .set("Authorization", `Bearer ${token}`)
      .send({ restaurant: restaurant._id, bookingDate: new Date().toISOString(), guests: 2, customer: { name: "Fake" } });
    expect(res.status).toBe(404);
    expect(await Booking.countDocuments({ restaurant: restaurant._id })).toBe(0);
  });
});

describe("Sockets", () => {
  let httpServer: Server;
  let url: string;

  beforeAll(async () => {
    httpServer = createServer(app);
    const io = initSockets(httpServer);
    (globalThis as any).__io = io;
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    url = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    (globalThis as any).__io.close();
  });

  it("rejects connections without a valid token", async () => {
    const socket = ioClient(url, { auth: { token: "forged" }, reconnection: false });
    const error = await new Promise<Error>((resolve) => socket.on("connect_error", resolve));
    expect(error.message).toBe("Unauthorized");
    socket.close();
  });

  it("only lets collaborators join a restaurant room", async () => {
    const { user: owner, token: ownerToken } = await createUser("owner");
    const { token: attackerToken } = await createUser("attacker");
    const restaurant = await createRestaurant(owner._id);
    const io = (globalThis as any).__io;

    const connect = (token: string) =>
      new Promise<any>((resolve) => {
        const s = ioClient(url, { auth: { token }, reconnection: false });
        s.on("connect", () => resolve(s));
      });
    const ownerSocket = await connect(ownerToken);
    const attackerSocket = await connect(attackerToken);

    const received = { owner: false, attacker: false };
    ownerSocket.on("newBooking", () => (received.owner = true));
    attackerSocket.on("newBooking", () => (received.attacker = true));

    ownerSocket.emit("joinRestaurant", restaurant._id.toString());
    attackerSocket.emit("joinRestaurant", restaurant._id.toString());
    await new Promise((r) => setTimeout(r, 300));

    io.to(`restaurant_${restaurant._id}`).emit("newBooking", { customer: { name: "Secret" } });
    await new Promise((r) => setTimeout(r, 300));

    expect(received.owner).toBe(true);
    expect(received.attacker).toBe(false);
    ownerSocket.close();
    attackerSocket.close();
  });
});
