import express, { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  uploadConfig,
  uploadTempConfig,
  uploadCoverConfig,
  uploadGalleryConfig,
  uploadMenuConfig,
} from "../configuration/storageConfig.js";
import { updateUserAvatar, uploadImage } from "../controllers/uploadController.js";

export const uploadRouter: Router = express.Router();

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
 * @description Uploads an image to a temporary folder.
 * @middleware verifyToken() - Ensures the user is authenticated.
 * @middleware uploadTempConfig.single("image") - Handles single file upload.
 */
uploadRouter.post("/image", verifyToken(), uploadTempConfig.single("image"), uploadImage);

/**
 * @route POST /restaurants/cover
 * @description Uploads a restaurant cover image.
 */
uploadRouter.post("/restaurants/cover", verifyToken(), uploadCoverConfig.single("image"), uploadImage);

/**
 * @route POST /restaurants/gallery
 * @description Uploads a restaurant gallery image.
 */
uploadRouter.post("/restaurants/gallery", verifyToken(), uploadGalleryConfig.single("image"), uploadImage);

/**
 * @route POST /restaurants/menu
 * @description Uploads a restaurant menu image.
 */
uploadRouter.post("/restaurants/menu", verifyToken(), uploadMenuConfig.single("image"), uploadImage);
