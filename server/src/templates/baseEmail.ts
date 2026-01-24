/**
 * Base email layout with common styling
 */
export const baseEmailLayout = (content: string, title: string = "Couverto"): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #2ecc9a; padding: 20px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2ecc9a; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; text-align: center; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; background-color: #f3f4f6; }
        .info-row { margin-bottom: 10px; display: flex; align-items: center; }
        .info-label { font-weight: bold; width: 120px; color: #4b5563; }
        h2 { color: #111827; font-size: 20px; margin-top: 0; }
        p { margin-bottom: 15px; }
        ul { padding-left: 20px; }
        li { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Couverto</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Couverto. Tous droits réservés.</p>
          <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
