import { sendEmail } from "../utils/sendEmail.js";
import { reviewRequestEmail } from "../templates/reviewRequestEmail.js";

export const sendReviewRequestEmail = async (email: string, customerName: string, restaurantName: string, reviewUrl: string) => {
  const message = reviewRequestEmail(customerName, restaurantName, reviewUrl);

  await sendEmail({
    email,
    subject: `Votre avis sur ${restaurantName}`,
    message,
  });
};
