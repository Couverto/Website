import { baseEmailLayout } from "./baseEmail.js";

interface EmailData {
  code: string;
}

export const verificationCodeTemplate = (data: EmailData): string => {
  const content = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #2d5a43; margin-bottom: 20px;">Vérification de votre email</h2>
      <p style="color: #4a5568; margin-bottom: 20px;">
        Voici votre code de vérification pour la création de votre restaurant :
      </p>
      <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2d5a43; margin-bottom: 30px;">
        ${data.code}
      </div>
      <p style="color: #718096; font-size: 14px;">
        Ce code est valable pendant 5 minutes.
      </p>
    </div>
  `;

  return baseEmailLayout(content);
};
