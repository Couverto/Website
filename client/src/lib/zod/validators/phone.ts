import { isValidPhoneNumber } from "react-phone-number-input";

/**
 * Validates a phone number using libphonenumber-js
 * Returns true if valid, false otherwise
 */
export const validatePhone = (phone: string | undefined): boolean => {
  if (!phone) return false;
  return isValidPhoneNumber(phone);
};

/**
 * Validates an optional phone number
 * Returns true if empty or valid
 */
export const validateOptionalPhone = (phone: string | undefined): boolean => {
  if (!phone || phone === "") return true;
  return isValidPhoneNumber(phone);
};
