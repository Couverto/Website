import { baseEmailLayout } from "./baseEmail.js";

interface VerifyEmailProps {
  url: string;
}

export const verifyEmailTemplate = ({ url }: VerifyEmailProps): string => {
  const content = `
    <h2>Vérifiez votre adresse email 📧</h2>
    
    <p>Merci de vous être inscrit sur Couverto !</p>
    
    <div class="highlight-box">
      <p>Pour activer votre compte et accéder à toutes nos fonctionnalités, veuillez confirmer votre adresse email.</p>
    </div>
    
    <div class="text-center my-6">
      <a href="${url}" class="button">
        ✅ Vérifier mon email
      </a>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      Si vous n'avez pas créé de compte sur Couverto, vous pouvez ignorer cet email.
    </p>
  `;
  return baseEmailLayout(content, "Vérifiez votre email");
};
