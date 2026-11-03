import fs from "fs";
import path from "path";
import { bucket } from "../lib/firebase.js";

/**
 * Moves a file from the temp directory to a permanent directory.
 * @param tempUrl The URL of the temporary file.
 * @param destinationFolder The relative path to the destination folder (e.g., "uploads/restaurants/123/cover").
 * @returns The new permanent URL.
 */

/**
 * Deletes a file given its URL (handles local and Firebase Storage).
 * @param fileUrl The URL of the file to delete.
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) return;

  try {
    // Check if it's a Firebase Storage URL
    if (fileUrl.includes("storage.googleapis.com")) {
      try {
        const url = new URL(fileUrl);
        // Extract the path from the URL.
        // Example: /bucket-name/folder/filename.jpg -> folder/filename.jpg
        const pathSegments = url.pathname.split("/").filter(Boolean);
        if (pathSegments.length > 1) {
          const storagePath = decodeURIComponent(pathSegments.slice(1).join("/"));
          console.log(`[deleteFile] Attempting to delete from Firebase: ${storagePath}`);
          await bucket
            .file(storagePath)
            .delete()
            .catch((err) => {
              if (err.code === 404) {
                console.warn(`[deleteFile] File not found in Firebase: ${storagePath}`);
              } else {
                throw err;
              }
            });
          console.log(`[deleteFile] Deleted from Firebase: ${storagePath}`);
          return; // Exit if Firebase deletion was handled
        }
      } catch (err) {
        console.warn(`[deleteFile] Failed to parse or delete Firebase URL: ${fileUrl}`, err);
      }
    }

    let relativePath = fileUrl;

    // If it's a full local development URL, extract pathname
    if (fileUrl.startsWith("http") || fileUrl.startsWith("https")) {
      try {
        const url = new URL(fileUrl);
        relativePath = url.pathname;
      } catch (err) {
        // Not a valid URL, treat as relative path
      }
    }

    // Remove leading slash to match relative path from root
    if (relativePath.startsWith("/")) {
      relativePath = relativePath.slice(1);
    }

    // Security check/Sanity check: ensure it points to uploads
    if (!relativePath.startsWith("uploads/")) {
      console.warn(`[deleteFile] Security check failed or path skipped. Relative path: ${relativePath}`);
      return;
    }

    const filePath = path.join(process.cwd(), relativePath);
    console.log(`[deleteFile] Attempting to delete local file: ${filePath} (Original: ${fileUrl})`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[deleteFile] Deleted local file: ${filePath}`);
    } else {
      console.warn(`[deleteFile] Local file not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`[deleteFile] Error deleting file ${fileUrl}:`, error);
  }
};

/**
 * Deletes a directory and all its contents.
 * @param dirPath Relative path to directory from cwd.
 */
export const deleteDirectory = (dirPath: string): void => {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
};

// Bucket folders restaurant users can upload to (see uploadRoutes)
const RESTAURANT_UPLOAD_FOLDERS = ["restaurants/", "temp/"];

/**
 * Deletes a restaurant image (cover, gallery, menu) only if it is safe to do so.
 * Image lists come from the client, so a URL may point to someone else's file (another restaurant's photo,
 * a user avatar). The file is deleted only when it lives in a restaurant upload folder of our bucket and no
 * other restaurant references it.
 * @param fileUrl The URL of the file to delete.
 * @param restaurantId The restaurant releasing the file.
 */
export const deleteRestaurantFile = async (fileUrl: string, restaurantId: string): Promise<void> => {
  if (!fileUrl || typeof fileUrl !== "string") return;

  const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
  if (!fileUrl.startsWith(bucketPrefix)) return;
  const storagePath = decodeURIComponent(fileUrl.slice(bucketPrefix.length));
  if (storagePath.includes("..") || !RESTAURANT_UPLOAD_FOLDERS.some((folder) => storagePath.startsWith(folder))) return;

  const { Restaurant } = await import("../models/restaurantModel.js");
  const usedElsewhere = await Restaurant.exists({
    _id: { $ne: restaurantId },
    $or: [{ coverImage: fileUrl }, { images: fileUrl }, { menu: fileUrl }],
  });
  if (usedElsewhere) return;

  await deleteFile(fileUrl);
};
