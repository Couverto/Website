import { Request } from "express";

/**
 * Parses pagination parameters from the request query.
 * @param req - Express request object.
 * @param defaultSize - Default number of items per page.
 * @returns {Object} An object containing page and size.
 */
export const getPaginationParams = (req: Request, defaultSize: number = 10) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || defaultSize;
  return { page, size };
};
