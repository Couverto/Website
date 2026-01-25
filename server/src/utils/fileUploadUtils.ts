import fs from "fs";
import path from "path";

/**
 * Moves a file from the temp directory to a permanent directory.
 * @param tempUrl The URL of the temporary file.
 * @param destinationFolder The relative path to the destination folder (e.g., "uploads/restaurants/123/cover").
 * @returns The new permanent URL.
 */

/**
 * Deletes a file given its URL.
 * @param fileUrl The URL of the file to delete.
 */
export const deleteFile = (fileUrl: string): void => {
  if (!fileUrl) return;

  try {
    let relativePath = fileUrl;

    // If it's a full URL, extract pathname
    if (fileUrl.startsWith("http") || fileUrl.startsWith("https")) {
      const url = new URL(fileUrl);
      relativePath = url.pathname;
    }

    // Remove leading slash to match relative path from root
    if (relativePath.startsWith("/")) {
      relativePath = relativePath.slice(1);
    }

    // Security check/Sanity check: ensure it points to uploads
    // This assumes all uploads go to "uploads/" at the root
    if (!relativePath.startsWith("uploads/")) {
      console.warn(`[deleteFile] Security check failed or path skipped. Relative path: ${relativePath}`);
      return;
    }

    const filePath = path.join(process.cwd(), relativePath);
    console.log(`[deleteFile] Attempting to delete: ${filePath} (Original: ${fileUrl})`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[deleteFile] Deleted file: ${filePath}`);
    } else {
      console.warn(`[deleteFile] File not found: ${filePath}`);
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
