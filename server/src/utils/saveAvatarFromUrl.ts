import https from "https";
import mongoose from "mongoose";
import { uploadToFirebase } from "../controllers/uploadController.js";

/**
 * Downloads an image from a given URL and saves it to the server's filesystem.
 * @param photoURL - The URL of the image to download.
 * @param userId - The ID of the user, used to create a unique filename.
 * @param extension - File extension/type, defaults to 'jpg'.
 * @returns Promise resolving to the relative path of the saved image.
 */
export const saveAvatarFromUrl = async (photoURL: string, userId: mongoose.Types.ObjectId, extension: string = "jpg"): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filename = `avatar_${userId.toString()}_${Date.now()}.${extension}`;

    try {
      new URL(photoURL);
    } catch {
      return reject(new Error("Invalid URL"));
    }

    https
      .get(photoURL, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to get image, status code: ${response.statusCode}`));
        }

        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks);

            const mimetype = response.headers["content-type"] || `image/${extension}`;

            const publicUrl = await uploadToFirebase(
              {
                buffer,
                mimetype,
              },
              "avatars",
              filename,
            );

            resolve(publicUrl);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
