import { sendEmail } from "../utils/sendEmail.js";
import { reviewRequestEmail } from "../templates/reviewRequestEmail.js";
import { thankYouReviewEmail } from "../templates/thankYouReviewEmail.js";

export const sendReviewRequestEmail = async (email: string, customerName: string, restaurantName: string, reviewUrl: string) => {
  const message = reviewRequestEmail(customerName, restaurantName, reviewUrl);

  await sendEmail({
    email,
    subject: `Votre avis sur ${restaurantName}`,
    message,
  });
};

export const sendThankYouReviewEmail = async (email: string, customerName: string, restaurantName: string) => {
  const message = thankYouReviewEmail(customerName, restaurantName);

  await sendEmail({
    email,
    subject: `Merci pour votre avis sur ${restaurantName}`,
    message,
  });
};
