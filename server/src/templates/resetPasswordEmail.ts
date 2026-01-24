import { baseEmailLayout } from "./baseEmail.js";

interface ResetPasswordProps {
  url: string;
}

export const resetPasswordTemplate = ({ url }: ResetPasswordProps): string => {
  const content = `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Couverto.</p>
    <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
    
    <center>
      <a href="${url}" class="button">Réinitialiser mon mot de passe</a>
    </center>
    
    <p style="margin-top: 20px; font-size: 14px;">Ce lien n'est valide que pour 10 minutes.</p>
    <p style="font-size: 14px; color: #9ca3af;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
  `;
  return baseEmailLayout(content, "Réinitialisation de mot de passe");
};
