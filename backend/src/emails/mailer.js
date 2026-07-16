// Envoi d'emails via l'API HTTP de Brevo (voir plus bas) — nodemailer n'est
// plus utilisé, gardé en dépendance au cas où un jour on veut revenir au SMTP.

// Empêche un envoi SMTP lent/bloqué (fréquent en prod) de faire attendre
// indéfiniment une requête qui a besoin de savoir si l'email est parti (ex: OTP).
const withTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Envoi email trop long (timeout)")), ms)),
  ]);
};

// Extrait { name, email } depuis un format "Nom <email@ex.com>" ou juste "email@ex.com"
const parseFrom = (fromStr) => {
  const match = fromStr && fromStr.match(/^(.*)<(.+)>$/);
  if (match) return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
  return { email: (fromStr || "").trim() };
};

// Envoi via l'API HTTP de Brevo (pas de SMTP) — Render bloque les connexions
// SMTP sortantes, l'API HTTP classique passe sans souci.
// On garde la même forme d'appel que Nodemailer (`transporter.sendMail({...})`)
// pour ne rien changer ailleurs dans ce fichier.
const transporter = {
  sendMail: async ({ from, to, subject, html }) => {
    const sender = parseFrom(from || process.env.MAIL_FROM);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Brevo API error ${response.status}: ${errBody}`);
    }
    return response.json();
  },
};

const sendOTPEmail = async (to, name, otp, type = "register") => {
  const subject =
    type === "register"
      ? "Vérification de votre compte ShopFlow"
      : "Réinitialisation de votre mot de passe ShopFlow";

  const title =
    type === "register"
      ? "Confirmez votre inscription"
      : "Réinitialisez votre mot de passe";

  const subtitle =
    type === "register"
      ? "Entrez ce code pour activer votre compte vendeur"
      : "Entrez ce code pour réinitialiser votre mot de passe";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#6C63FF,#4ECDC4);padding:40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">ShopFlow</h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">La boutique en ligne simple et locale</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <p style="margin:0 0 8px;color:#888;font-size:14px;">Bonjour ${name},</p>
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:600;">${title}</h2>
                <p style="margin:0 0 32px;color:#666;font-size:15px;line-height:1.6;">${subtitle}</p>
                <!-- OTP Box -->
                <div style="background:#f8f7ff;border:2px dashed #6C63FF;border-radius:12px;padding:32px;text-align:center;margin-bottom:32px;">
                  <p style="margin:0 0 8px;color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Votre code</p>
                  <span style="font-size:40px;font-weight:700;color:#6C63FF;letter-spacing:8px;">${otp}</span>
                  <p style="margin:12px 0 0;color:#e74c3c;font-size:13px;">⏱ Expire dans 10 minutes</p>
                </div>
                <p style="margin:0;color:#999;font-size:13px;line-height:1.6;">Si vous n'avez pas fait cette demande, ignorez cet email. Votre compte reste sécurisé.</p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;color:#bbb;font-size:12px;">© 2024 ShopFlow · Dakar, Sénégal</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async (to, name, storeSlug) => {
  const storeUrl = `${process.env.FRONTEND_URL}/boutique/${storeSlug}`;
  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#6C63FF,#4ECDC4);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;">🎉 Bienvenue sur ShopFlow !</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#444;font-size:16px;">Bonjour <strong>${name}</strong>,</p>
              <p style="color:#666;font-size:15px;line-height:1.7;">Votre boutique a été <strong style="color:#6C63FF;">activée par notre équipe</strong>. Vous pouvez maintenant commencer à ajouter vos produits et recevoir des commandes.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${storeUrl}" style="background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Voir ma boutique →</a>
              </div>
              <p style="color:#999;font-size:13px;">Votre lien boutique : <a href="${storeUrl}" style="color:#6C63FF;">${storeUrl}</a></p>
            </td>
          </tr>
          <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#bbb;font-size:12px;">© 2024 ShopFlow · Dakar, Sénégal</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Votre boutique ShopFlow est active ! 🚀",
    html,
  });
};

const sendPaymentConfirmedEmail = async (to, name, { orderId, storeName, amount, trackingUrl }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#6C63FF,#4ECDC4);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;">✅ Paiement confirmé</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#444;font-size:16px;">Bonjour ${name},</p>
              <p style="color:#666;font-size:15px;line-height:1.7;">
                Bonne nouvelle : <strong>${storeName}</strong> a confirmé avoir bien reçu votre paiement Wave de
                <strong>${Number(amount).toLocaleString()} FCFA</strong> pour la commande
                <strong>#${orderId.slice(-6).toUpperCase()}</strong>. Votre commande est en cours de préparation.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${trackingUrl}" style="background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Suivre ma commande →</a>
              </div>
            </td>
          </tr>
          <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#bbb;font-size:12px;">© 2024 ShopFlow · Dakar, Sénégal</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Paiement confirmé — commande #${orderId.slice(-6).toUpperCase()}`,
    html,
  });
};

const sendPaymentRejectedEmail = async (to, name, { orderId, storeName, amount, trackingUrl }) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#e74c3c;padding:40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;">⚠️ Paiement introuvable</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#444;font-size:16px;">Bonjour ${name},</p>
              <p style="color:#666;font-size:15px;line-height:1.7;">
                <strong>${storeName}</strong> n'a pas retrouvé votre paiement Wave de
                <strong>${Number(amount).toLocaleString()} FCFA</strong> pour la commande
                <strong>#${orderId.slice(-6).toUpperCase()}</strong>. Vérifiez que le transfert a bien été envoyé,
                puis réessayez ou contactez directement le vendeur.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${trackingUrl}" style="background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Voir ma commande →</a>
              </div>
            </td>
          </tr>
          <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#bbb;font-size:12px;">© 2024 ShopFlow · Dakar, Sénégal</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Paiement introuvable — commande #${orderId.slice(-6).toUpperCase()}`,
    html,
  });
};

const sendOrdersAccessEmail = async (to, name, link) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#6C63FF,#4ECDC4);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;">📦 Vos commandes ShopFlow</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#444;font-size:16px;">Bonjour ${name},</p>
              <p style="color:#666;font-size:15px;line-height:1.7;">
                Cliquez sur le bouton ci-dessous pour retrouver toutes vos commandes passées sur ShopFlow, toutes boutiques confondues.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${link}" style="background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Voir mes commandes →</a>
              </div>
              <p style="color:#999;font-size:13px;line-height:1.6;">Ce lien est valable 7 jours. Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
            </td>
          </tr>
          <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;color:#bbb;font-size:12px;">© 2024 ShopFlow · Dakar, Sénégal</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Retrouvez vos commandes ShopFlow",
    html,
  });
};

module.exports = { sendOTPEmail, sendWelcomeEmail, sendPaymentConfirmedEmail, sendPaymentRejectedEmail, sendOrdersAccessEmail, withTimeout };