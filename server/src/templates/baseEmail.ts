/**
 * Base email layout with Couverto branding
 * Colors: Primary #173B15 (dark green), Accent #2ecc9a (teal)
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
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f9fafb; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          border-radius: 12px; 
          overflow: hidden; 
          margin-top: 20px; 
          margin-bottom: 20px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
        }
        .header { 
          background: linear-gradient(135deg, #173B15 0%, #1e4d1a 100%);
          padding: 30px 20px; 
          text-align: center; 
        }
        .header img {
          height: 50px;
          margin-bottom: 10px;
        }
        .header h1 { 
          margin: 0; 
          color: #ffffff; 
          font-size: 28px; 
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .content { 
          padding: 35px 30px; 
        }
        .button { 
          display: inline-block; 
          padding: 14px 28px; 
          background: linear-gradient(135deg, #2ecc9a 0%, #27b085 100%);
          color: #ffffff !important; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          margin-top: 20px; 
          text-align: center;
          box-shadow: 0 4px 12px rgba(46, 204, 154, 0.3);
          transition: transform 0.2s ease;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .footer { 
          padding: 25px; 
          text-align: center; 
          font-size: 12px; 
          color: #6b7280; 
          background-color: #f3f4f6;
          border-top: 1px solid #e5e7eb;
        }
        .footer a {
          color: #2ecc9a;
          text-decoration: none;
        }
        .info-row { 
          margin-bottom: 12px; 
          display: flex; 
          align-items: center; 
        }
        .info-label { 
          font-weight: 600; 
          width: 120px; 
          color: #173B15; 
        }
        h2 { 
          color: #173B15; 
          font-size: 22px; 
          margin-top: 0;
          font-weight: 600;
        }
        p { 
          margin-bottom: 16px;
          color: #4b5563;
        }
        ul { 
          padding-left: 20px; 
        }
        li { 
          margin-bottom: 8px;
          color: #4b5563;
        }
        .divider {
          height: 1px;
          background-color: #e5e7eb;
          margin: 25px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="font-size: 40px; margin-bottom: 8px;">🍽️</div>
          <h1>Couverto</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Couverto. Tous droits réservés.</p>
          <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
          <p><a href="${process.env.CORS_ORIGIN || "#"}">www.couverto.fr</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};
