import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { User } from "../models/userModel.js";
import { Constants } from "../constants/constants.js";

/**
 * @function updateUserAvatar
 * @description Updates the avatar of a user by uploading a new file, validating the file type and size,
 * and replacing the old avatar if it exists.
 * @param {string} req.params.id - The ID of the user whose avatar is being updated.
 * @param {Object} req.file - The uploaded file containing the user's new avatar.
 * @returns {Object} JSON response with success or error message.
 */
export const updateUserAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const user = await User.findById(userId);

    if (!user) {
      res.status(400).json({ error: "Utilisateur introuvable" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier fourni" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({ error: "Type de fichier invalide" });
      return;
    }

    if (req.file.size > Constants.AVATAR_MAX_SIZE) {
      res.status(400).json({ error: `server.upload.errors.limit` });
      return;
    }

    if (user.avatar) {
      const oldAvatarPath = path.join(process.cwd(), "uploads", "users", "avatars", path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const newAvatarUrl = `${req.protocol}://${req.get("host")}/uploads/users/avatars/${req.file.filename}`;

    user.avatar = newAvatarUrl;
    await user.save();

    res.status(200).json({
      message: "Avatar mis à jour",
      user,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @function uploadImage
 * @description Uploads an image to a temporary folder and returns its URL.
 * @param {Object} req.file - The uploaded file.
 * @returns {Object} JSON response with the file URL.
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier fourni" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Remove the file if it was uploaded but is invalid
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: "Type de fichier invalide" });
      return;
    }

    // Construct URL based on where the file was saved
    // We can infer the folder from req.file.destination or just inspect it
    const destination = req.file.destination;
    let urlPath = "";

    if (destination.includes("temp")) {
      urlPath = "uploads/temp";
    } else if (destination.includes("coverImages")) {
      urlPath = "uploads/restaurants/coverImages";
    } else if (destination.includes("galleries")) {
      urlPath = "uploads/restaurants/galleries";
    } else if (destination.includes("menus")) {
      urlPath = "uploads/restaurants/menus";
    } else {
      // Fallback
      urlPath = "uploads/temp";
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/${urlPath}/${req.file.filename}`;

    res.status(200).json({
      message: "Image uploadée avec succès",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (err: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};
