import { baseEmailLayout } from "./baseEmail.js";

export const verifyRestaurantEmailTemplate = ({ url, restaurantName }: { url: string; restaurantName: string }) => {
  const content = `
    <h2>Bienvenue sur Couverto ! 🎉</h2>
    
    <p>Vous avez créé le restaurant suivant avec cette adresse email :</p>
    
    <div class="text-center my-4">
      <p class="restaurant-name">${restaurantName}</p>
    </div>
    
    <div class="highlight-box">
      <p>⚠️ Action requise : Veuillez vérifier votre email</p>
    </div>
    
    <p>Pour finaliser la configuration et prouver que vous avez bien accès à cette boîte mail, veuillez cliquer sur le bouton ci-dessous :</p>
    
    <div class="text-center my-6">
      <a href="${url}" class="button">
        ✅ Vérifier mon adresse
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; text-align: center;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
      <a href="${url}" style="word-break: break-all;">${url}</a>
    </p>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      Merci d'avoir choisi Couverto pour la gestion de votre restaurant.
    </p>
  `;

  return baseEmailLayout(content, `Vérification de l'email de votre restaurant - ${restaurantName}`);
};
