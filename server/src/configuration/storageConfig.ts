import multer from "multer";

// SVG is refused: it can carry scripts and is served publicly from the bucket
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Version MEMORY : files are buffered in memory, so size and count must be bounded
export const uploadConfig = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  },
});
