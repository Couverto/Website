import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { createLog } from "../controllers/logController.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { userRoles } from "../utils/enums/userRoles.js";
import mongoose from "mongoose";
import { sendServerError } from "../utils/sendServerError.js";

interface TokenPayload extends JwtPayload {
  id: string;
  v?: number;
}

interface VerifyTokenOptions {
  role?: userRoles;
}

/**
 * Middleware to verify JWT token and optionally check user role.
 * @param options - Options including required role.
 * @returns Express middleware function.
 */
export const verifyToken = ({ role }: VerifyTokenOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Session expirée" });
      return;
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN as string) as TokenPayload;

      const user = await User.findOne({ _id: decoded.id });
      // Unknown user or revoked token (password changed since it was issued)
      if (!user || (decoded.v ?? 0) !== (user.tokenVersion ?? 0)) {
        res.status(401).json({ error: "Session expirée" });
        return;
      }

      req.userId = new mongoose.Types.ObjectId(decoded.id);
      // @ts-ignore - Add full user object for controllers that need email etc.
      req.user = user;

      if (role && user.role !== role) {
        await createLog({
          message: `User ${user.username} attempted to access a restricted route`,
          userId: user._id,
          level: logLevels.ERROR,
        });
        res.status(403).json({ error: "Accès retreint" });
        return;
      }

      next();
    } catch (err: any) {
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        res.status(401).json({ error: "Session expirée" });
        return;
      }
      sendServerError(res, err);
    }
  };
};
