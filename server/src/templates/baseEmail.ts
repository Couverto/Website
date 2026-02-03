/**
 * Base email layout with Couverto branding
 * Colors: Primary #173B15 (dark green), Accent #2ecc9a (teal)
 * Font: System fonts with Inter fallback for modern look
 */
export const baseEmailLayout = (content: string, title: string = "Couverto"): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${title}</title>
      <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          line-height: 1.6; 
          color: #1f2937; 
          margin: 0; 
          padding: 0; 
          background-color: #f3f4f6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .wrapper {
          padding: 40px 20px;
        }
        
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 10px 40px rgba(23, 59, 21, 0.1);
        }
        
        .header { 
          background: linear-gradient(135deg, #173B15 0%, #1a4518 50%, #1e5a1a 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 200%;
          background: radial-gradient(circle, rgba(46, 204, 154, 0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        
        .logo-container {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 16px 24px;
          margin-bottom: 12px;
        }
        
        .logo-icon {
          font-size: 36px;
          display: block;
          margin-bottom: 4px;
        }
        
        .header h1 { 
          margin: 0; 
          color: #ffffff; 
          font-size: 32px; 
          font-weight: 700;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }
        
        .header-tagline {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-top: 8px;
          font-weight: 400;
        }
        
        .content { 
          padding: 40px 35px; 
        }
        
        .button { 
          display: inline-block; 
          padding: 16px 32px; 
          background: linear-gradient(135deg, #2ecc9a 0%, #25b388 100%);
          color: #ffffff !important; 
          text-decoration: none; 
          border-radius: 10px; 
          font-weight: 600; 
          font-size: 16px;
          text-align: center;
          box-shadow: 0 6px 20px rgba(46, 204, 154, 0.35);
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(46, 204, 154, 0.4);
        }
        
        .button-secondary {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          box-shadow: 0 6px 20px rgba(107, 114, 128, 0.25);
        }
        
        .footer { 
          padding: 30px 35px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
          border-top: 1px solid #e5e7eb;
        }
        
        .footer a {
          color: #2ecc9a;
          text-decoration: none;
          font-weight: 500;
        }
        
        .footer a:hover {
          text-decoration: underline;
        }
        
        .footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #173B15;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 12px;
        }
        
        .footer-brand span {
          font-size: 18px;
        }
        
        .footer p {
          margin: 6px 0;
        }
        
        .info-box {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid #e5e7eb;
        }
        
        .info-box h3 {
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #e5e7eb;
          color: #173B15;
          font-size: 16px;
          font-weight: 600;
        }
        
        .info-row { 
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 15px;
        }
        
        .info-row:last-child {
          margin-bottom: 0;
        }
        
        .info-label { 
          font-weight: 600; 
          min-width: 130px; 
          color: #173B15;
        }
        
        .info-value {
          color: #4b5563;
        }
        
        h2 { 
          color: #173B15; 
          font-size: 24px; 
          margin-top: 0;
          margin-bottom: 16px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        
        p { 
          margin-bottom: 16px;
          color: #4b5563;
          font-size: 15px;
          line-height: 1.7;
        }
        
        ul { 
          padding-left: 24px;
          margin: 16px 0;
        }
        
        li { 
          margin-bottom: 10px;
          color: #4b5563;
          font-size: 15px;
          line-height: 1.6;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #e5e7eb 20%, #e5e7eb 80%, transparent 100%);
          margin: 28px 0;
        }
        
        .highlight-box {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 20px 24px;
          border-radius: 12px;
          margin: 24px 0;
          border-left: 4px solid #2ecc9a;
        }
        
        .highlight-box p {
          margin: 0;
          color: #173B15;
          font-weight: 500;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        
        .status-success {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-error {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        strong {
          color: #173B15;
          font-weight: 600;
        }
        
        a {
          color: #2ecc9a;
        }
        
        .restaurant-name {
          font-size: 26px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        
        .datetime {
          font-size: 20px;
          font-weight: 600;
          color: #2ecc9a;
          margin: 8px 0 0 0;
        }
        
        .text-center {
          text-align: center;
        }
        
        .mt-0 { margin-top: 0; }
        .mb-0 { margin-bottom: 0; }
        .my-4 { margin-top: 16px; margin-bottom: 16px; }
        .my-6 { margin-top: 24px; margin-bottom: 24px; }
        
        @media only screen and (max-width: 600px) {
          .wrapper {
            padding: 20px 12px;
          }
          .container {
            border-radius: 12px;
          }
          .header {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 26px;
          }
          .content {
            padding: 28px 20px;
          }
          .footer {
            padding: 24px 20px;
          }
          .info-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .info-label {
            min-width: auto;
            margin-bottom: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <span class="logo-icon">🍽️</span>
            </div>
            <h1>Couverto</h1>
            <p class="header-tagline">Réservez votre table en un clic</p>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <div class="footer-brand">
              <span>🍽️</span> Couverto
            </div>
            <p>© ${new Date().getFullYear()} Couverto. Tous droits réservés.</p>
            <p style="color: #9ca3af; font-size: 12px;">Ceci est un message automatique, merci de ne pas y répondre.</p>
            <p style="margin-top: 16px;"><a href="${process.env.CORS_ORIGIN || "#"}">www.couverto.fr</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
