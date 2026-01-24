import { Request, Response } from "express";
import { User } from "../models/userModel.js";
import { authTypes } from "../utils/enums/authTypes.js";
import { welcomeEmailTemplate } from "../templates/welcomeEmail.js";
import { resetPasswordTemplate } from "../templates/resetPasswordEmail.js";
import { userRoles } from "../utils/enums/userRoles.js";
import { logLevels } from "../utils/enums/logLevels.js";
import { generateAccessToken } from "../utils/generateAccessToken.js";
import { Constants } from "../constants/constants.js";
import { createLog } from "./logController.js";
import { generateRandomAvatar } from "../utils/generateRandomAvatar.js";
import { saveAvatarFromUrl } from "../utils/saveAvatarFromUrl.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Registers a new user.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, forename, email, username, photoURL, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword || !name || !forename) {
    res.status(422).json({ error: "server.global.errors.missing_fields" });
    return;
  }

  if (!Constants.REGEX_PASSWORD.test(password)) {
    res.status(400).json({ error: "server.auth.errors.regex" });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: "server.auth.errors.password_no_match" });
    return;
  }

  try {
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
    if (existingEmailUser) {
      res.status(409).json({ error: "server.auth.errors.email_taken" });
      return;
    }

    const existingUsernameUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUsernameUser) {
      res.status(409).json({ error: "server.auth.errors.username_taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      name,
      forename,
      auth_type: photoURL ? authTypes.GOOGLE : authTypes.LOCAL,
    });

    if (photoURL) {
      try {
        const avatarPath = await saveAvatarFromUrl(photoURL, user._id);
        if (avatarPath) {
          user.avatar = `${req.protocol}://${req.get("host")}${avatarPath}`;
          await user.save();
        }
      } catch (err: any) {
        console.error("Failed to download avatar:", err.message);
      }
    } else {
      const avatarPath = await generateRandomAvatar(user._id);
      user.avatar = `${req.protocol}://${req.get("host")}${avatarPath}`;
      await user.save();
    }

    const userCount = await User.countDocuments();
    if (userCount === 1) {
      user.role = userRoles.ADMIN;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);

    createLog({
      message: `New user ${user.username} registered successfully`,
      userId: user._id,
      level: logLevels.INFO,
    });

    const { password: _password, ...userWithoutPassword } = user.toObject();

    // Send Welcome Email
    try {
      if (user.email) {
        const htmlContent = welcomeEmailTemplate({ name: user.forename });
        await sendEmail({
          email: user.email,
          subject: "Bienvenue sur Couverto !",
          message: htmlContent,
        });
      }
    } catch (emailErr) {
      console.error("Welcome email failed", emailErr);
    }

    res.status(201).json({ user: userWithoutPassword, message: "server.auth.messages.register_success", accessToken });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
};

/**
 * Logs in a user.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password, email } = req.body;

  if (!password || (!username && !email)) {
    res.status(422).json({ error: "server.global.errors.missing_fields" });
    return;
  }

  try {
    const user = await User.findOne({
      $or: [...(username ? [{ username: username.toLowerCase() }] : []), ...(email ? [{ email: email.toLowerCase() }] : [])],
    }).select("+password");

    if (!user) {
      res.status(400).json({ error: "server.global.errors.no_such_user" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      createLog({
        message: `Invalid credentials while trying to login`,
        userId: user._id,
        level: logLevels.ERROR,
      });
      res.status(400).json({ error: "server.auth.errors.invalid_credentials" });
      return;
    }

    const accessToken = generateAccessToken(user._id);

    const { password: _password, ...userWithoutPassword } = user.toObject();

    createLog({
      message: `User ${user.username} logged in successfully`,
      userId: user._id,
      level: logLevels.INFO,
    });

    res.status(201).json({ user: userWithoutPassword, message: "server.auth.messages.login_success", accessToken });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Logs out a user by clearing the access token cookie.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  if (req.userId) {
    const user = await User.findById(req.userId);
    createLog({
      message: `User ${user?.username || req.userId} logged out`,
      userId: req.userId,
      level: logLevels.INFO,
    });
  }
  res.status(200).json({ message: "server.auth.messages.logout_success" });
};

/**
 * Retrieves the currently connected user's details.
 */
export const getConnectedUser = async (req: Request, res: Response): Promise<void> => {
  const id = req.userId;

  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Signs in a user using Google OAuth.
 */
export const signInWithGoogle = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(422).json({ error: "server.global.errors.missing_fields" });
    return;
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ error: "User not found, lets register !" });
      return;
    }

    const accessToken = generateAccessToken(user._id);

    createLog({
      message: `User ${user.username} logged in with Google`,
      userId: user._id,
      level: logLevels.INFO,
    });

    res.status(201).json({ user, message: "server.auth.messages.login_success", accessToken });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
/**
 * Initiates the password reset process by sending an email with a reset token.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ error: "server.auth.errors.email_not_found" });
      return;
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and save to database
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const clientUrl = process.env.CORS_ORIGIN;
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const htmlContent = resetPasswordTemplate({ url: resetUrl });

    try {
      await sendEmail({
        email: user.email,
        subject: "Réinitialisation de mot de passe",
        message: htmlContent,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.error("Forgot Password Email Error:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ error: "Email could not be sent" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Resets the password using a valid token.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({ error: "server.auth.errors.password_no_match" });
    return;
  }

  try {
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid Reset Token" });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const accessToken = generateAccessToken(user._id);

    res.status(201).json({
      success: true,
      data: "Password Reset Success",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        forename: user.forename,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
