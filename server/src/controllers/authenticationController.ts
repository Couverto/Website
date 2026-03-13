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
import { sendDiscordNotification } from "../utils/discordUtils.js";

/**
 * Registers a new user.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, forename, email, username, photoURL, password, confirmPassword } = req.body;

  if (!username || !email || !name || !forename || (!photoURL && (!password || !confirmPassword))) {
    res.status(422).json({ error: "Champs requis manquants" });
    return;
  }

  if (!photoURL) {
    if (!Constants.REGEX_PASSWORD.test(password)) {
      res.status(400).json({
        error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
      return;
    }
  }

  try {
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
    if (existingEmailUser) {
      res.status(409).json({ error: "Cet email est déjà utilisé" });
      return;
    }

    const existingUsernameUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUsernameUser) {
      res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris" });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      name,
      forename,
      auth_type: photoURL ? authTypes.GOOGLE : authTypes.LOCAL,
      verificationToken: photoURL ? undefined : verificationTokenHash,
      verificationTokenExpire: photoURL ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isVerified: photoURL ? true : false,
    });

    if (photoURL) {
      try {
        const avatarUrl = await saveAvatarFromUrl(photoURL, user._id);
        if (avatarUrl) {
          user.avatar = avatarUrl;
          await user.save();
        }
      } catch (err: any) {
        console.error("Failed to download avatar:", err.message);
      }
    } else {
      // Generate random avatar and upload to Firebase
      const avatarUrl = await generateRandomAvatar(user._id);
      user.avatar = avatarUrl;
      await user.save();
    }

    const userCount = await User.countDocuments();
    if (userCount === 1) {
      user.role = userRoles.ADMIN;
      user.isVerified = true; // First user (admin) auto-verified? Or should they verify too? Let's say yes for simplicity or security.
      // Actually typically admin setup might bypass. Let's auto-verify the first admin.
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save();
    }

    createLog({
      message: `New user ${user.username} registered - Verification pending`,
      userId: user._id,
      level: logLevels.INFO,
    });

    sendDiscordNotification(`🆕 **Nouvel utilisateur inscrit** : ${user.forename} ${user.name} (@${user.username}) - ${user.email}`);

    // Send Verification Email if not verified (Google users are auto-verified)
    try {
      if (user.email && !user.isVerified) {
        const clientUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
        const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

        const { verifyEmailTemplate } = await import("../templates/verifyEmailTemplate.js");
        const htmlContent = verifyEmailTemplate({ url: verifyUrl });

        await sendEmail({
          email: user.email,
          subject: "Vérifiez votre adresse email - Couverto",
          message: htmlContent,
        });
      } else if (user.email && user.isVerified && user.auth_type === authTypes.GOOGLE) {
        // Send Welcome Email directly for Google users since they are auto-verified
        try {
          const { welcomeEmailTemplate } = await import("../templates/welcomeEmail.js");
          const htmlContent = welcomeEmailTemplate({ name: user.forename });
          await sendEmail({
            email: user.email,
            subject: "Bienvenue sur Couverto !",
            message: htmlContent,
          });
        } catch (emailErr) {
          console.error("Welcome email failed for Google user", emailErr);
        }
      }
    } catch (emailErr) {
      console.error("Email process failed", emailErr);
    }

    res.status(201).json({
      message: user.isVerified ? "Inscription réussie." : "Inscription réussie. Veuillez vérifier votre email pour activer votre compte.",
      user: { email: user.email }, // Return minimal info, no token
    });
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
    res.status(422).json({ error: "Champs requis manquants" });
    return;
  }

  try {
    const user = await User.findOne({
      $or: [...(username ? [{ username: username.toLowerCase() }] : []), ...(email ? [{ email: email.toLowerCase() }] : [])],
    }).select("+password");

    if (!user) {
      res.status(400).json({ error: "Utilisateur introuvable" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ error: "Veuillez vérifier votre email avant de vous connecter." });
      return;
    }

    if (!user.password && user.auth_type === authTypes.GOOGLE) {
      res.status(400).json({
        error: "Cet email est associé à un compte Google. Aucun mot de passe n'a été défini pour ce compte.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      createLog({
        message: `Invalid credentials while trying to login`,
        userId: user._id,
        level: logLevels.ERROR,
      });
      res.status(400).json({ error: "Identifiants invalides" });
      return;
    }

    const accessToken = generateAccessToken(user._id);

    const { password: _password, ...userWithoutPassword } = user.toObject();
    const userWithHasPassword = { ...userWithoutPassword, hasPassword: !!user.password };

    createLog({
      message: `User ${user.username} logged in successfully`,
      userId: user._id,
      level: logLevels.INFO,
    });

    res.status(201).json({ user: userWithHasPassword, message: "Connexion réussie", accessToken });
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
  res.status(200).json({ message: "Déconnexion réussie" });
};

/**
 * Retrieves the currently connected user's details.
 */
export const getConnectedUser = async (req: Request, res: Response): Promise<void> => {
  const id = req.userId;

  try {
    const user = await User.findById(id).select("+password");
    if (!user) {
      res.status(404).json({ error: "Utilisateur introuvable" });
      return;
    }
    const userObj = user.toObject();
    const { password: _password, ...userWithoutPassword } = userObj;
    res.status(200).json({ ...userWithoutPassword, hasPassword: !!user.password });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Signs in a user using Google OAuth.
 */
export const signInWithGoogle = async (req: Request, res: Response): Promise<void> => {
  const { email, name, photoURL } = req.body;

  if (!email) {
    res.status(422).json({ error: "Champs requis manquants" });
    return;
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      if (!name) {
        res.status(400).json({ error: "Le nom est requis pour la création automatique du compte" });
        return;
      }

      const forename = name.split(" ")[0] || "";
      const lastName = name.split(" ").slice(1).join(" ") || "";
      const username = name.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random() * 1000);

      user = await User.create({
        email: email.toLowerCase(),
        username: username,
        name: lastName || forename,
        forename: forename,
        auth_type: authTypes.GOOGLE,
        avatar: photoURL || "",
        isVerified: true,
      });

      if (photoURL) {
        try {
          const avatarUrl = await saveAvatarFromUrl(photoURL, user._id);
          if (avatarUrl) {
            user.avatar = avatarUrl;
            await user.save();
          }
        } catch (err: any) {
          console.error("Failed to download avatar from Google:", err.message);
        }
      }

      createLog({
        message: `New user ${user.username} registered automatically with Google`,
        userId: user._id,
        level: logLevels.INFO,
      });

      sendDiscordNotification(`🚀 **Nouvel utilisateur (Google)** : ${user.forename} ${user.name} (@${user.username}) - ${user.email}`);

      // Send Welcome Email for new Google users
      try {
        const { welcomeEmailTemplate } = await import("../templates/welcomeEmail.js");
        const htmlContent = welcomeEmailTemplate({ name: user.forename });
        await sendEmail({
          email: user.email,
          subject: "Bienvenue sur Couverto !",
          message: htmlContent,
        });
      } catch (emailErr) {
        console.error("Welcome email failed for Google user (signInWithGoogle)", emailErr);
      }
    } else if (user.auth_type !== authTypes.GOOGLE) {
      // Link the account to Google Auth permanently
      user.auth_type = authTypes.GOOGLE;
      if (!user.isVerified) {
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
      }
      await user.save();

      createLog({
        message: `User ${user.username} linked their local account with Google`,
        userId: user._id,
        level: logLevels.INFO,
      });
    }

    const accessToken = generateAccessToken(user._id);

    createLog({
      message: `User ${user.username} logged in with Google`,
      userId: user._id,
      level: logLevels.INFO,
    });

    const userWithPasswordState = await User.findById(user._id).select("+password");
    const userObj = user.toObject();
    const userWithHasPassword = { ...userObj, hasPassword: !!userWithPasswordState?.password };

    res.status(201).json({ user: userWithHasPassword, message: "Connexion réussie", accessToken });
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
      res.status(404).json({ error: "Email introuvable" });
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

      createLog({
        message: `Password reset email sent to ${user.email}`,
        userId: user._id,
        level: logLevels.INFO,
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
    res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
    return;
  }

  try {
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: "Jeton de réinitialisation invalide" });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    createLog({
      message: `Password reset successfully for user ${user.username}`,
      userId: user._id,
      level: logLevels.INFO,
    });

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

/**
 * Verifies the user's email address.
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    const verificationTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: verificationTokenHash,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ error: "Jeton de vérification invalide ou expiré" });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    const accessToken = generateAccessToken(user._id);

    // Send Welcome Email now that they are verified
    try {
      const { welcomeEmailTemplate } = await import("../templates/welcomeEmail.js");
      const htmlContent = welcomeEmailTemplate({ name: user.forename });
      await sendEmail({
        email: user.email,
        subject: "Bienvenue sur Couverto !",
        message: htmlContent,
      });
    } catch (emailErr) {
      console.error("Welcome email failed", emailErr);
    }

    const { password: _password, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      data: "Email verified successfully",
      accessToken,
      user: { ...userWithoutPassword, hasPassword: !!user.password },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
