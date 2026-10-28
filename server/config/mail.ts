import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const {
  SMTP_HOST = 'smtp.hostinger.com',
  SMTP_PORT = '465',
  SMTP_SECURE = 'true',
  SMTP_USER = 'contact@itid-france.com',
  SMTP_PASSWORD = '',
  CONTACT_EMAIL = 'contact@itid-france.com',
  NEWSLETTER_FROM_EMAIL = 'contact@itid-france.com',
  NEWSLETTER_FROM_NAME = 'ITID France',
} = process.env;

export function getTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/** Échappe les caractères HTML dangereux pour prévenir les injections dans les emails */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!SMTP_PASSWORD) {
      return {
        success: false,
        message: 'SMTP_PASSWORD non renseigné dans .env. Renseignez le mot de passe de la boîte Hostinger.',
      };
    }
    const transporter = getTransporter();
    await transporter.verify();
    return {
      success: true,
      message: `Connexion SMTP Hostinger réussie sur ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Échec de connexion SMTP Hostinger : ${error.message} (Vérifier SMTP_USER et SMTP_PASSWORD dans .env)`,
    };
  }
}

export interface ContactNotificationPayload {
  formName: string;
  name?: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
}

export async function sendContactNotification(data: ContactNotificationPayload): Promise<void> {
  const transporter = getTransporter();

  const safeName = escapeHtml(data.name || 'Visiteur');
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone || 'Non renseigné');
  const safeSubject = escapeHtml(data.subject || `Nouveau message - ${data.formName}`);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br>');
  const safeForm = escapeHtml(data.formName);

  let metadataHtml = '';
  if (data.metadata && Object.keys(data.metadata).length > 0) {
    metadataHtml = `
      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 8px 0; color: #1a3a5c; font-size: 13px;">Détails complémentaires :</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #475569;">
          ${Object.entries(data.metadata)
        .map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v))}</li>`)
        .join('')}
        </ul>
      </div>
    `;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0c1a2e; padding: 24px; text-align: center; border-bottom: 3px solid #2a9d8f;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">ITID France || Nouvelle Demande</h2>
        <span style="display: inline-block; margin-top: 6px; padding: 3px 10px; background: #2a9d8f; color: #ffffff; font-size: 11px; font-weight: bold; border-radius: 20px; text-transform: uppercase;">
          ${safeForm}
        </span>
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; width: 130px; font-weight: bold; color: #64748b; font-size: 13px;">Expéditeur :</td>
            <td style="padding: 8px 0; color: #0c1a2e; font-size: 14px; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #64748b; font-size: 13px;">Email :</td>
            <td style="padding: 8px 0; color: #2a9d8f; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #2a9d8f; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #64748b; font-size: 13px;">Téléphone :</td>
            <td style="padding: 8px 0; color: #0c1a2e; font-size: 14px;">${safePhone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #64748b; font-size: 13px;">Objet :</td>
            <td style="padding: 8px 0; color: #0c1a2e; font-size: 14px;">${safeSubject}</td>
          </tr>
        </table>

        <div style="background: #f1f5f9; padding: 18px; border-radius: 8px; border-left: 4px solid #2a9d8f; margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #0c1a2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message :</h4>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${safeMessage}</p>
        </div>

        ${metadataHtml}

        <div style="margin-top: 24px; text-align: center;">
          <a href="mailto:${safeEmail}?subject=RE: ${encodeURIComponent(data.subject || 'Votre demande ITID France')}"
             style="display: inline-block; padding: 12px 28px; background: #2a9d8f; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px;">
            Répondre directement à ${safeName}
          </a>
        </div>
      </div>

      <div style="background: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        Cet email a été envoyé automatiquement depuis le site web officiel itid-france.com
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${NEWSLETTER_FROM_NAME}" <${SMTP_USER}>`,
    to: CONTACT_EMAIL,
    replyTo: data.email,
    subject: `[${data.formName}] ${data.subject || 'Nouveau message reçu'} - ${data.name || data.email}`,
    html,
  });
}

export async function sendNewsletterWelcome(email: string, unsubscribeToken: string, appBaseUrl: string): Promise<void> {
  const transporter = getTransporter();
  const unsubUrl = `${appBaseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0c1a2e; padding: 24px; text-align: center; border-bottom: 3px solid #2a9d8f;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Bienvenue à l'ITID France</h2>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Bonjour,</p>
        <p>Nous vous confirmons votre inscription à la lettre d'information de l'<strong>Institut du Traitement Interventionnel de la Douleur (ITID)</strong>.</p>
        <p>Vous recevrez nos dernières actualités médicales, avancées thérapeutiques et publications.</p>
        <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
          Vous pouvez vous désinscrire à tout moment en cliquant sur ce lien :
          <a href="${unsubUrl}" style="color: #2a9d8f;">Se désinscrire</a>
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${NEWSLETTER_FROM_NAME}" <${SMTP_USER}>`,
    to: email,
    subject: `Confirmation d'inscription — ITID France`,
    html,
  });
}
