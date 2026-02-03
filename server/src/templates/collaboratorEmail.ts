import { baseEmailLayout } from "./baseEmail.js";

interface CollaboratorEmailProps {
  name: string;
  restaurantName: string;
  role?: string;
  action: "added" | "removed";
}

export const collaboratorEmailTemplate = ({ name, restaurantName, role, action }: CollaboratorEmailProps): string => {
  const content =
    action === "added"
      ? `
      <h2>Félicitations ${name} ! 🎊</h2>
      
      <p>Vous avez été ajouté en tant que collaborateur au restaurant :</p>
      
      <div class="text-center my-4">
        <p class="restaurant-name">${restaurantName}</p>
      </div>
      
      <div class="info-box">
        <h3>Informations de votre rôle</h3>
        <div class="info-row">
          <span class="info-label">👤 Votre rôle :</span>
          <span class="info-value"><strong>${role}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 Restaurant :</span>
          <span class="info-value">${restaurantName}</span>
        </div>
      </div>
      
      <p>Vous pouvez désormais accéder à l'espace professionnel de ce restaurant pour gérer les réservations, répondre aux avis et plus encore.</p>
      
      <div class="text-center my-6">
        <a href="${process.env.CORS_ORIGIN}/restaurant/dashboard" class="button">
          🚀 Accéder au Dashboard
        </a>
      </div>
    `
      : `
      <h2>Bonjour ${name},</h2>
      
      <p>Nous vous informons que votre collaboration avec le restaurant suivant a pris fin :</p>
      
      <div class="text-center my-4">
        <p class="restaurant-name">${restaurantName}</p>
      </div>
      
      <div class="info-box">
        <p style="margin: 0;">
          Vous n'avez plus accès à l'espace professionnel de cet établissement.
        </p>
      </div>
      
      <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur du restaurant directement.</p>
      
      <div class="divider"></div>
      
      <p style="font-size: 13px; color: #9ca3af; text-align: center;">
        Merci d'avoir utilisé Couverto pour la gestion de ce restaurant.
      </p>
    `;

  const subject = action === "added" ? `🎉 Invitation à collaborer - ${restaurantName}` : `Fin de collaboration - ${restaurantName}`;

  return baseEmailLayout(content, subject);
};
