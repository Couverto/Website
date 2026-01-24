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
  restaurantId,
}: BookingConfirmationProps): string => {
  const statusColor = isConfirmed ? "#2ecc9a" : "#f59e0b";
  const statusIcon = isConfirmed ? "✅" : "⏳";

  const content = `
    <h2>Bonjour ${customerName}</h2>
    <p>Votre demande de réservation chez <strong>${restaurantName}</strong> a bien été enregistrée.</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Détails de la réservation</h3>
      <div class="info-row"><span class="info-label">📅 Date :</span> <span>${date}</span></div>
      <div class="info-row"><span class="info-label">🕒 Heure :</span> <span>${time}</span></div>
      <div class="info-row"><span class="info-label">👥 Personnes :</span> <span>${guests}</span></div>
      <div class="info-row"><span class="info-label">📍 Lieu :</span> <span>${address || restaurantName}</span></div>
      <div class="info-row"><span class="info-label">📊 Statut :</span> <span style="color: ${statusColor}; font-weight: bold;">${statusIcon} ${status}</span></div>
    </div>

    ${!isConfirmed ? "<p><em>Vous recevrez une nouvelle notification dès que le restaurant aura confirmé votre table.</em></p>" : ""}
    
     <center>
      <a href="${process.env.CORS_ORIGIN || "#"}/account/bookings" class="button">Voir ma réservation</a>
    </center>
  `;
  return baseEmailLayout(content, `Réservation ${status} - ${restaurantName}`);
};
