import { baseEmailLayout } from "./baseEmail.js";

interface RestaurantBookingNotificationProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  serviceGuests?: number;
  notes?: string;
  restaurantName: string;
  restaurantId: string;
}

export const restaurantBookingNotificationTemplate = ({
  customerName,
  customerEmail,
  customerPhone,
  date,
  time,
  guests,
  serviceGuests,
  notes,
  restaurantName,
  restaurantId,
}: RestaurantBookingNotificationProps): string => {
  const guestsLabel = guests === 1 ? "convive" : "convives";
  const serviceGuestsLabel = serviceGuests === 1 ? "couvert" : "couverts";
  const serviceGuestsRow =
    typeof serviceGuests === "number"
      ? `
      <div class="info-row">
        <span class="info-label">🍽️ Total service :</span>
        <span class="info-value"><strong>${serviceGuests} ${serviceGuestsLabel}</strong></span>
      </div>
      `
      : "";
  const serviceGuestsSummary =
    typeof serviceGuests === "number"
      ? `<p style="margin: 6px 0 0 0; font-size: 15px; color: #4b5563;">🍽️ <strong>${serviceGuests} ${serviceGuestsLabel}</strong> sur le service</p>`
      : "";

  const content = `
    <h2>Nouvelle Réservation ! 🎉</h2>

    <div class="highlight-box" style="text-align: center;">
      <p style="margin: 0; font-size: 22px; font-weight: 700; color: #173B15;">👥 ${guests} ${guestsLabel}</p>
      ${serviceGuestsSummary}
    </div>

    <p>Vous avez reçu une nouvelle demande de réservation pour <strong>${restaurantName}</strong>.</p>

    <div class="info-box">
      <h3>Détails du client</h3>
      <div class="info-row">
        <span class="info-label">👤 Nom :</span>
        <span class="info-value"><strong>${customerName}</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">📧 Email :</span>
        <span class="info-value"><a href="mailto:${customerEmail}">${customerEmail}</a></span>
      </div>
      <div class="info-row">
        <span class="info-label">📞 Téléphone :</span>
        <span class="info-value"><a href="tel:${customerPhone}">${customerPhone}</a></span>
      </div>
    </div>

    <div class="info-box" style="margin-top: 20px;">
      <h3>Détails de la réservation</h3>
      <div class="info-row">
        <span class="info-label">📅 Date :</span>
        <span class="info-value"><strong>${date}</strong> à <strong>${time}</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">👥 Personnes :</span>
        <span class="info-value"><strong>${guests} ${guestsLabel}</strong></span>
      </div>
      ${serviceGuestsRow}
      ${
        notes
          ? `
      <div class="info-row">
        <span class="info-label">📝 Note :</span>
        <span class="info-value">${notes}</span>
      </div>
      `
          : ""
      }
    </div>

    <div class="text-center my-6">
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurant/${restaurantId}/bookings" class="button">
        Gérer mes réservations
      </a>
    </div>
  `;
  return baseEmailLayout(content, `Nouvelle réservation ${date} à ${time} - ${customerName}`);
};
