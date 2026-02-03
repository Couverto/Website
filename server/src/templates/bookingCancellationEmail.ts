import { baseEmailLayout } from "./baseEmail.js";

interface BookingCancellationProps {
  customerName: string;
  restaurantName: string;
  date: string;
  time: string;
  reason?: string;
  address?: string;
  phone?: string;
  website?: string;
}

export const bookingCancellationTemplate = ({
  customerName,
  restaurantName,
  date,
  time,
  reason,
  address,
  phone,
  website,
}: BookingCancellationProps): string => {
  const content = `
    <h2>Annulation de réservation</h2>
    
    <p>Bonjour ${customerName},</p>
    
    <p>Nous sommes désolés de vous informer que votre réservation a été annulée.</p>
    
    <div class="text-center my-6">
      <p class="restaurant-name">${restaurantName}</p>
      <p style="font-size: 20px; font-weight: 600; color: #ef4444; margin: 8px 0 0 0;">
        ❌ ${date} à ${time}
      </p>
    </div>

    ${
      reason
        ? `
    <div class="info-box">
      <h3>Motif de l'annulation</h3>
      <p style="margin: 0; font-style: italic; color: #4b5563;">"${reason}"</p>
    </div>
    `
        : ""
    }

    <div class="divider"></div>

    <p style="margin-bottom: 8px;"><strong>Coordonnées du restaurant :</strong></p>
    ${address ? `<p style="margin: 4px 0; font-size: 14px;">📍 ${address}</p>` : ""}
    ${phone ? `<p style="margin: 4px 0; font-size: 14px;">📞 ${phone}</p>` : ""}
    ${website ? `<p style="margin: 4px 0; font-size: 14px;">🌐 <a href="${website}">${website}</a></p>` : ""}

    <p>Nous vous invitons à contacter le restaurant directement pour plus d'informations ou à rechercher un autre établissement.</p>
    
    <div class="text-center my-6">
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurants" class="button button-secondary">
        🔍 Trouver un autre restaurant
      </a>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      Nous nous excusons pour la gêne occasionnée.
    </p>
  `;
  return baseEmailLayout(content, `Réservation Annulée - ${restaurantName}`);
};
