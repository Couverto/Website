/**
 * @function escapeRegex
 * @description Escapes user input before using it in a RegExp / $regex, so it is matched literally
 * (prevents regex injection and catastrophic backtracking, ReDoS).
 */
export const escapeRegex = (value: unknown): string => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
