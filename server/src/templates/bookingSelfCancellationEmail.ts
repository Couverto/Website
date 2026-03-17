import { baseEmailLayout } from "./baseEmail.js";

interface BookingCancellationProps {
  customerName: string;
  restaurantName: string;
  date: string;
  time: string;
  address?: string;
  phone?: string;
  website?: string;
}

export const bookingSelfCancellationTemplate = ({
  customerName,
  restaurantName,
  date,
  time,
  address,
  phone,
  website,
}: BookingCancellationProps): string => {
  const content = `
    <h2>Confirmation d'annulation</h2>
    
    <p>Bonjour ${customerName},</p>
    
    <p>Nous vous confirmons que votre réservation a bien été annulée à votre demande.</p>
    
    <div class="text-center my-6">
      <p class="restaurant-name">${restaurantName}</p>
      <p style="font-size: 20px; font-weight: 600; color: #6b7280; margin: 8px 0 0 0;">
        📅 ${date} à ${time}
      </p>
    </div>

    <div class="info-box" style="background-color: #f9fafb; border-color: #e5e7eb;">
      <p style="margin: 0; color: #4b5563; font-style: italic; text-align: center;">
        "Votre réservation a été annulée avec succès."
      </p>
    </div>

    <div class="divider"></div>

    <p style="margin-bottom: 8px;"><strong>Coordonnées du restaurant :</strong></p>
    ${address ? `<p style="margin: 4px 0; font-size: 14px;">📍 ${address}</p>` : ""}
    ${phone ? `<p style="margin: 4px 0; font-size: 14px;">📞 ${phone}</p>` : ""}
    ${website ? `<p style="margin: 4px 0; font-size: 14px;">🌐 <a href="${website}">${website}</a></p>` : ""}

    <p>Si vous changez d'avis, vous pouvez toujours effectuer une nouvelle réservation en ligne.</p>
    
    <div class="text-center my-6">
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurants" class="button">
        🔍 Découvrir d'autres restaurants
      </a>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      À bientôt sur Couverto !
    </p>
  `;
  return baseEmailLayout(content, `Confirmation d'annulation - ${restaurantName}`);
};
