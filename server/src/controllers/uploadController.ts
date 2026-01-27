import { User } from "../models/userModel.js";
import { Constants } from "../constants/constants.js";
import { bucket } from "../lib/firebase.js";
import { deleteFile } from "../utils/fileUploadUtils.js";

/**
 * Helper to upload a buffer to Firebase Storage and return the public URL.
 */
export const uploadToFirebase = async (
  file: { buffer: Buffer; mimetype: string },
  folder: string,
  customFilename?: string,
): Promise<string> => {
  let extension = file.mimetype.split("/")[1];
  if (extension.includes("+")) extension = extension.split("+")[0];

  const filename = customFilename || `${Date.now()}_${Math.round(Math.random() * 1e9)}.${extension}`;
  const fullPath = `${folder}/${filename}`;

  const blob = bucket.file(fullPath);
  await blob.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
    public: true,
  });

  return `https://storage.googleapis.com/${bucket.name}/${fullPath}`;
};

export const updateUserAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Type de fichier invalide" });
    }

    if (req.file.size > Constants.AVATAR_MAX_SIZE) {
      return res.status(400).json({
        error: `Taille maximale de fichier dépassée (${Constants.AVATAR_MAX_SIZE / 1024} KB)`,
      });
    }

    // Delete old avatar if it exists
    if (user.avatar) {
      await deleteFile(user.avatar);
    }

    let extension = req.file.mimetype.split("/")[1];
    if (extension.includes("+")) extension = extension.split("+")[0];
    const customFilename = `avatar_${userId}_${Date.now()}.${extension}`;

    const publicUrl = await uploadToFirebase(req.file, "avatars", customFilename);

    user.avatar = publicUrl;
    await user.save();

    res.status(200).json({
      message: "Avatar mis à jour avec succès",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Une erreur inattendue est survenue lors de l'upload" });
  }
};

/**
 * @function uploadImage
 * @description Uploads an image to Firebase Storage and returns its URL.
 */
export const uploadImage = async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier fourni" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({ error: "Type de fichier invalide" });
      return;
    }

    // Determine folder from req.body or fallback to temp
    const folder = req.body.folder || "temp";
    const publicUrl = await uploadToFirebase(req.file, folder);

    res.status(200).json({
      message: "Image uploadée avec succès",
      url: publicUrl,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
