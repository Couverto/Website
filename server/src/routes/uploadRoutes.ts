import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { updateUserAvatar, uploadImage } from "../controllers/uploadController.js";
import { uploadConfig } from "../configuration/storageConfig.js";

export const uploadRouter: Router = express.Router();

/**
 * Middleware to set the target Firebase folder in req.body.
 */
const setFolder = (folder: string) => (req: any, res: any, next: any) => {
  req.body = req.body || {};
  req.body.folder = folder;
  next();
};

/**
 * @route POST /avatar/:id
 * @description Updates the avatar of a user by their ID.
 * @param {string} id - The ID of the user whose avatar is being updated.
 * @middleware verifyToken() - Ensures the user is authenticated to access this route.
 * @middleware uploadConfig.single("avatar") - Handles the file upload for the "avatar" field.
 */
uploadRouter.post("/avatar/:id", verifyToken(), uploadConfig.single("avatar"), updateUserAvatar);

/**
 * @route POST /image
 * @description Uploads an image to a temporary folder in Firebase.
 */
uploadRouter.post("/image", verifyToken(), uploadConfig.single("image"), setFolder("temp"), uploadImage);

/**
 * @route POST /restaurants/cover
 * @description Uploads a restaurant cover image.
 */
uploadRouter.post("/restaurants/cover", verifyToken(), uploadConfig.single("image"), setFolder("restaurants/coverImages"), uploadImage);

/**
 * @route POST /restaurants/gallery
 * @description Uploads a restaurant gallery image.
 */
uploadRouter.post("/restaurants/gallery", verifyToken(), uploadConfig.single("image"), setFolder("restaurants/galleries"), uploadImage);

/**
 * @route POST /restaurants/menu
 * @description Uploads a restaurant menu image.
 */
uploadRouter.post("/restaurants/menu", verifyToken(), uploadConfig.single("image"), setFolder("restaurants/menus"), uploadImage);
