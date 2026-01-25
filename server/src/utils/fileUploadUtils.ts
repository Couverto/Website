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
