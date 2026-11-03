import { Request } from "express";
import rateLimit, { Options } from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const createLimiter = (windowMs: number, limit: number, options: Partial<Options> = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Trop de tentatives, veuillez réessayer dans quelques minutes." },
    ...options,
  });

/** Whole API, per IP: protects against floods without bothering a busy restaurant (several staff behind one IP). */
export const globalLimiter = createLimiter(FIFTEEN_MINUTES, 2000);

/** Login, Google login, register, password reset, email verification: brute force and email spam. */
export const authLimiter = createLimiter(FIFTEEN_MINUTES, 20);

/** Sending a 6-digit verification code (email cost). */
export const sendCodeLimiter = createLimiter(FIFTEEN_MINUTES, 5);

/** Checking a 6-digit code: per IP and per target email, so a distributed brute force stays bounded. */
export const verifyCodeIpLimiter = createLimiter(FIFTEEN_MINUTES, 20);
export const verifyCodeEmailLimiter = createLimiter(FIFTEEN_MINUTES, 10, {
  keyGenerator: (req: Request) => {
    const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase() : "";
    return `email:${email}`;
  },
});

/** Public referral / sponsor code validation (sponsor codes can grant free plans). */
export const referralLimiter = createLimiter(FIFTEEN_MINUTES, 30);

/** Contact form (emails sent to the team). */
export const contactLimiter = createLimiter(ONE_HOUR, 5);

/** Guest bookings and Stripe SetupIntents (each creates data / Stripe customers without an account). */
export const guestBookingLimiter = createLimiter(FIFTEEN_MINUTES, 30);
