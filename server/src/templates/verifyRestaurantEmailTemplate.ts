import { Constants } from "../constants/constants.js";

export const verifyRestaurantEmailTemplate = ({ url, restaurantName }: { url: string; restaurantName: string }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Vérification de l'email de votre restaurant</h2>
    <p>Bonjour,</p>
    <p>Vous avez créé le restaurant <strong>${restaurantName}</strong> sur Couverto avec cette adresse email.</p>
    <p>Pour finaliser la configuration et prouver que vous avez bien accès à cette boîte mail, veuillez cliquer sur le bouton ci-dessous :</p>
    <p><a href="${url}" class="button">Vérifier mon email restaurant</a></p>
    <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
    <p>${url}</p>
    <div class="footer">
      <p>L'équipe Couverto</p>
    </div>
  </div>
</body>
</html>
`;
