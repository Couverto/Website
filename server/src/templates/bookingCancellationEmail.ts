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
    
    <div style="text-align: center; margin: 30px 0;">
        <h1 style="margin: 0; color: #111827; font-size: 24px;">${restaurantName}</h1>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #ef4444;">${date} à ${time}</p>
    </div>

    <p>Nous sommes désolés de vous informer que votre réservation a été annulée par l'établissement.</p>
    
    ${
      reason
        ? `
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 0.9em; color: #4b5563;"><strong>Motif de l'annulation :</strong></p>
      <p style="margin: 5px 0 0 0; font-style: italic;">"${reason}"</p>
    </div>
    `
        : ""
    }

    <div style="margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        <p style="margin: 0; font-weight: bold;">Coordonnées du restaurant :</p>
        ${address ? `<p style="margin: 5px 0 0 0;">📍 ${address}</p>` : ""}
        ${phone ? `<p style="margin: 5px 0 0 0;">📞 ${phone}</p>` : ""}
        ${website ? `<p style="margin: 5px 0 0 0;">🌐 <a href="${website}">${website}</a></p>` : ""}
    </div>

    <p>Nous vous invitons à contacter le restaurant directement pour plus d'informations ou à effectuer une nouvelle recherche.</p>
    
    <center>
      <a href="${process.env.CORS_ORIGIN || "#"}/restaurants" class="button" style="background-color: #4b5563;">Trouver un autre restaurant</a>
    </center>
  `;
  return baseEmailLayout(content, `Réservation Annulée - ${restaurantName}`);
};
