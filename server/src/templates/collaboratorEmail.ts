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
      <h2>Bonjour ${name} !</h2>
      <p>Vous avez été ajouté en tant que collaborateur au restaurant <strong>${restaurantName}</strong>.</p>
      <p>Votre rôle est : <strong>${role}</strong>.</p>
      <p>Vous pouvez désormais accéder à l'espace professionnel de ce restaurant.</p>
      <center>
        <a href="${process.env.CORS_ORIGIN}/restaurant/dashboard" class="button">Accéder au Dashboard</a>
      </center>
    `
      : `
      <h2>Bonjour ${name} !</h2>
      <p>Nous vous informons que vous n'êtes plus collaborateur du restaurant <strong>${restaurantName}</strong>.</p>
      <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur du restaurant.</p>
    `;

  const subject = action === "added" ? `Invitation à collaborer - ${restaurantName}` : `Fin de collaboration - ${restaurantName}`;

  return baseEmailLayout(content, subject);
};
