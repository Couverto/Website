import { baseEmailLayout } from "./baseEmail.js";

interface BookingConfirmationProps {
  customerName: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  isConfirmed: boolean;
  address?: string;
  phone?: string;
  website?: string;
  restaurantId?: string;
}

export const bookingConfirmationTemplate = ({
  customerName,
  restaurantName,
  date,
  time,
  guests,
  status,
  isConfirmed,
  address,
  phone,
  website,
  restaurantId,
}: BookingConfirmationProps): string => {
  const statusColor = isConfirmed ? "#2ecc9a" : "#f59e0b";
  const statusIcon = isConfirmed ? "✅" : "⏳";

  const content = `
    <h2>Bonjour ${customerName}</h2>
    
    <div style="text-align: center; margin: 30px 0;">
        <h1 style="margin: 0; color: #111827; font-size: 24px;">${restaurantName}</h1>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2ecc9a;">${date} à ${time}</p>
    </div>

    <p>Votre demande de réservation a bien été enregistrée.</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Détails de la réservation</h3>
      <div class="info-row"><span class="info-label">👥 Personnes :</span> <span>${guests}</span></div>
      <div class="info-row"><span class="info-label">📍 Lieu :</span> <span>${address || restaurantName}</span></div>
      <div class="info-row"><span class="info-label">📊 Statut :</span> <span style="color: ${statusColor}; font-weight: bold;">${statusIcon} ${status}</span></div>
    </div>

    ${!isConfirmed ? "<p><em>Vous recevrez une nouvelle notification dès que le restaurant aura confirmé votre table.</em></p>" : ""}

    <div style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        <p style="margin: 0; font-weight: bold;">Coordonnées du restaurant :</p>
        ${address ? `<p style="margin: 5px 0 0 0;">📍 ${address}</p>` : ""}
        ${phone ? `<p style="margin: 5px 0 0 0;">📞 ${phone}</p>` : ""}
        ${website ? `<p style="margin: 5px 0 0 0;">🌐 <a href="${website}">${website}</a></p>` : ""}
    </div>
    
     <center>
      <a href="${process.env.CORS_ORIGIN || "#"}/account/bookings" class="button">Voir ma réservation</a>
    </center>
  `;
  return baseEmailLayout(content, `Réservation ${status} - ${restaurantName}`);
};
