import https from "https";
import mongoose from "mongoose";
import { uploadToFirebase } from "../controllers/uploadController.js";
import { IMAGE_MIME_TYPES, UPLOAD_MAX_SIZE } from "../configuration/storageConfig.js";

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

    const request = https
      .get(photoURL, { timeout: 10000 }, (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          return reject(new Error(`Failed to get image, status code: ${response.statusCode}`));
        }

        // Only store real images, never arbitrary content on our public bucket
        const mimetype = (response.headers["content-type"] || "").split(";")[0].trim();
        if (!IMAGE_MIME_TYPES.includes(mimetype)) {
          response.resume();
          return reject(new Error(`Unsupported avatar content type: ${mimetype}`));
        }

        const chunks: Buffer[] = [];
        let size = 0;

        response.on("data", (chunk) => {
          size += chunk.length;
          if (size > UPLOAD_MAX_SIZE) {
            request.destroy();
            return reject(new Error("Avatar too large"));
          }
          chunks.push(chunk);
        });

        response.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks);

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
      .on("timeout", () => {
        request.destroy(new Error("Avatar download timed out"));
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
