/**
 * @function escapeHtml
 * @description Escapes a user-provided value before inserting it into an HTML email
 * (customer names, notes, messages...), so it is displayed as text and cannot inject markup or links.
 * @returns {string} The escaped value ("" for null/undefined).
 */
export const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};
