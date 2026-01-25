// import multer from "multer";
// import { Request } from "express";
// import path from "path";
// import mongoose from "mongoose";

// interface MulterRequest extends Request {
//   userId: mongoose.Types.ObjectId;
// }

// // Configuration for Multer to handle file uploads
// // Configuration for Multer to handle file uploads
// const storageConfig = (dest: string) =>
//   multer.diskStorage({
//     destination: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//       // Ensure directory exists (optional, but good practice if not guaranteed)
//       // For now assuming the directory exists or is created elsewhere, typically 'uploads' folders are pre-created or we can add fs.mkdirSync
//       cb(null, dest);
//     },

//     filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//       const extension = path.extname(file.originalname);
//       // For temp files, we just need a unique name. For avatars, we kept the userId pattern.
//       // let's stick to unique generic names for temp to avoid confusion.
//       const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
//       cb(null, `file_${uniqueSuffix}${extension}`);
//     },
//   });

// // Specific config for avatars (keeping backward compatibility logic if needed, or refactoring)
// // The original code used userId in filename.
// const avatarStorageConfig = multer.diskStorage({
//   destination: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
//     cb(null, "./uploads/users/avatars");
//   },
//   filename: (req: MulterRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
//     const extension = path.extname(file.originalname);
//     const userIdPart = req.userId;
//     cb(null, `avatar_${userIdPart}_${Date.now()}${extension}`);
//   },
// });

// export const uploadConfig = multer({
//   storage: avatarStorageConfig,
// });

// export const uploadTempConfig = multer({
//   storage: storageConfig("./uploads/temp"),
// });

// export const uploadCoverConfig = multer({
//   storage: storageConfig("./uploads/restaurants/coverImages"),
// });

// export const uploadGalleryConfig = multer({
//   storage: storageConfig("./uploads/restaurants/galleries"),
// });

// export const uploadMenuConfig = multer({
//   storage: storageConfig("./uploads/restaurants/menus"),
// });

import multer from "multer";

// Version MEMORY :
export const uploadConfig = multer({
  storage: multer.memoryStorage(),
});
