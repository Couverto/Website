import { baseEmailLayout } from "./baseEmail.js";

interface ResetPasswordProps {
  url: string;
}

export const resetPasswordTemplate = ({ url }: ResetPasswordProps): string => {
  const content = `
    <h2>Réinitialisation de mot de passe 🔐</h2>
    
    <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Couverto.</p>
    
    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
    
    <div class="text-center my-6">
      <a href="${url}" class="button">
        🔑 Réinitialiser mon mot de passe
      </a>
    </div>
    
    <div class="info-box">
      <p style="margin: 0; font-size: 14px;">
        <strong>⏱️ Ce lien expire dans 10 minutes</strong><br>
        Pour des raisons de sécurité, ce lien n'est valable que pendant une courte durée.
      </p>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af;">
      Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
      Votre mot de passe restera inchangé.
    </p>
    
    <p style="font-size: 12px; color: #9ca3af;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
      <a href="${url}" style="word-break: break-all;">${url}</a>
    </p>
  `;
  return baseEmailLayout(content, "Réinitialisation de mot de passe");
};
