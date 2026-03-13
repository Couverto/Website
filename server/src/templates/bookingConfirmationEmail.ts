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
  cancellationCode?: string;
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
  cancellationCode,
}: BookingConfirmationProps): string => {
  const statusBadgeClass = isConfirmed ? "status-success" : "status-pending";
  const statusIcon = isConfirmed ? "✅" : "⏳";

  const content = `
    <h2>Bonjour ${customerName} 👋</h2>
    
    <p>Votre demande de réservation a bien été enregistrée.</p>
    
    <div class="text-center my-6">
      <p class="restaurant-name">${restaurantName}</p>
      <p class="datetime">📅 ${date} à ${time}</p>
    </div>
    
    <div class="info-box">
      <h3>Détails de votre réservation</h3>
      <div class="info-row">
        <span class="info-label">👥 Personnes :</span>
        <span class="info-value"><strong>${guests} ${guests > 1 ? "convives" : "convive"}</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">📍 Lieu :</span>
        <span class="info-value">${address || restaurantName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📊 Statut :</span>
        <span class="info-value">
          <span class="${statusBadgeClass}">${statusIcon} ${status}</span>
        </span>
      </div>
    </div>

    ${
      !isConfirmed
        ? `
    <div class="highlight-box">
      <p>⏳ <strong>En attente de confirmation</strong><br>
      Vous recevrez un email dès que le restaurant aura confirmé votre table.</p>
    </div>
    `
        : `
    <div class="highlight-box">
      <p>🎉 <strong>Réservation confirmée !</strong><br>
      Votre table vous attend. À bientôt !</p>
    </div>
    `
    }

    <div class="divider"></div>

    <p style="margin-bottom: 8px;"><strong>Coordonnées du restaurant :</strong></p>
    ${address ? `<p style="margin: 4px 0; font-size: 14px;">📍 ${address}</p>` : ""}
    ${phone ? `<p style="margin: 4px 0; font-size: 14px;">📞 ${phone}</p>` : ""}
    ${website ? `<p style="margin: 4px 0; font-size: 14px;">🌐 <a href="${website}">${website}</a></p>` : ""}
    
    <div class="text-center my-6">
      <a href="${process.env.CORS_ORIGIN || "#"}/account/bookings" class="button">
        📋 Voir ma réservation
      </a>
    </div>

    ${
      cancellationCode
        ? `
    <div style="text-align: center; margin-top: 20px;">
      <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Vous ne pouvez pas venir ?</p>
      <a href="${process.env.CORS_ORIGIN || "#"}/cancel-booking/${cancellationCode}" style="color: #666; text-decoration: underline; font-size: 14px;">
        Annuler ma réservation
      </a>
    </div>
    `
        : ""
    }
  `;
  return baseEmailLayout(content, `Réservation ${status} - ${restaurantName}`);
};
