import { Resend } from "resend";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  console.log("Using Resend Service");

  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY in environment variables");
    throw new Error("Internal Server Error: Email service not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Use user configured sender or Resend default for testing
  const from = process.env.EMAIL_FROM;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: options.email,
      subject: options.subject,
      html: options.message,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error sending email with Resend:", error);
    throw error;
  }
};
