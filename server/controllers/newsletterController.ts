import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { executeQuery } from '../config/db';
import { sendNewsletterWelcome, getTransporter, escapeHtml } from '../config/mail';

const inMemorySubscribers: any[] = [];
let memSubId = 1;

export const subscribeSchema = z.object({
  email: z.string().email('Format d\'email invalide').max(255),
  firstName: z.string().max(100).optional(),
  source: z.string().max(100).default('website'),
});

export async function handleSubscribe(req: Request, res: Response) {
  try {
    const parseResult = subscribeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Adresse email invalide.',
      });
    }

    const email = parseResult.data.email.toLowerCase().trim();
    const firstName = parseResult.data.firstName || null;
    const source = parseResult.data.source;

    // Création d'un token de désinscription unique et sécurisé (hash SHA-256)
    const rawUnsubToken = crypto.randomBytes(32).toString('hex');
    const unsubTokenHash = crypto.createHash('sha256').update(rawUnsubToken).digest('hex');

    try {
      // Vérifier si l'adresse existe déjà
      const existing: any = await executeQuery(
        'SELECT id, status FROM newsletter_subscribers WHERE email = ?',
        [email]
      );

      if (existing && existing.length > 0) {
        // Si désinscrit auparavant, réactivation propre
        if (existing[0].status === 'unsubscribed') {
          await executeQuery(
            'UPDATE newsletter_subscribers SET status = "subscribed", unsubscribe_token_hash = ?, consent_at = NOW(), unsubscribed_at = NULL WHERE id = ?',
            [unsubTokenHash, existing[0].id]
          );
        }
        // Message générique pour ne pas révéler l'existence préalable d'un compte
        return res.status(200).json({
          success: true,
          message: 'Merci ! Votre inscription à la newsletter a bien été prise en compte.',
        });
      }

      await executeQuery(
        `INSERT INTO newsletter_subscribers 
          (email, first_name, status, unsubscribe_token_hash, source, consent_at) 
         VALUES (?, ?, 'subscribed', ?, ?, NOW())`,
        [email, firstName, unsubTokenHash, source]
      );
    } catch {
      // Repli mémoire si la BDD n'est pas encore prête
      const found = inMemorySubscribers.find((s) => s.email === email);
      if (!found) {
        inMemorySubscribers.push({
          id: memSubId++,
          email,
          first_name: firstName,
          status: 'subscribed',
          unsubscribe_token_hash: unsubTokenHash,
          source,
          consent_at: new Date(),
        });
      }
    }

    // Envoi de l'email de bienvenue avec lien de désinscription
    const appBaseUrl = process.env.APP_BASE_URL || 'https://itid-france.com';
    try {
      await sendNewsletterWelcome(email, rawUnsubToken, appBaseUrl);
    } catch (err: any) {
      console.warn('⚠️ Notification de bienvenue newsletter non envoyée :', err.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Merci ! Votre inscription à la newsletter a bien été prise en compte.',
    });
  } catch (error: any) {
    console.error('Erreur newsletter subscribe :', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.',
    });
  }
}

export async function handleUnsubscribe(req: Request, res: Response) {
  try {
    const rawToken = req.query.token as string;
    if (!rawToken || typeof rawToken !== 'string') {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Lien de désinscription invalide</h2>
          <p>Le jeton de désinscription est manquant ou erroné.</p>
        </div>
      `);
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    try {
      await executeQuery(
        'UPDATE newsletter_subscribers SET status = "unsubscribed", unsubscribed_at = NOW() WHERE unsubscribe_token_hash = ?',
        [tokenHash]
      );
    } catch {
      const sub = inMemorySubscribers.find((s) => s.unsubscribe_token_hash === tokenHash);
      if (sub) {
        sub.status = 'unsubscribed';
        sub.unsubscribed_at = new Date();
      }
    }

    return res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Désinscription confirmée — ITID France</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0c1a2e; color: #ffffff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #ffffff; color: #1a3a5c; padding: 40px; border-radius: 16px; max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
          h2 { color: #2a9d8f; margin-top: 0; }
          a { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #2a9d8f; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Désinscription confirmée</h2>
          <p>Votre adresse email a bien été retirée de la liste de diffusion d'ITID France. Vous ne recevrez plus nos communications par email.</p>
          <a href="/">Retour au site ITID France</a>
        </div>
      </body>
      </html>
    `);
  } catch (error: any) {
    return res.status(500).send('Erreur lors de la désinscription.');
  }
}

export async function handleTriggerCampaign(req: Request, res: Response) {
  try {
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
    const expectedSecret = process.env.NEWSLETTER_CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      return res.status(403).json({ success: false, error: 'Accès non autorisé (secret cron invalide).' });
    }

    const { subject, contentTitle, contentUrl, contentSummary } = req.body;
    if (!subject || !contentTitle) {
      return res.status(400).json({ success: false, error: 'Champs "subject" et "contentTitle" requis.' });
    }

    // Récupération des abonnés actifs (statut = subscribed)
    let subscribers: any[] = [];
    try {
      subscribers = await executeQuery(
        'SELECT email, unsubscribe_token_hash FROM newsletter_subscribers WHERE status = "subscribed"'
      );
    } catch {
      subscribers = inMemorySubscribers.filter((s) => s.status === 'subscribed');
    }

    if (subscribers.length === 0) {
      return res.json({ success: true, message: 'Aucun abonné actif à notifier.', sentCount: 0 });
    }

    // Enregistrement de la campagne
    let campaignId = null;
    try {
      const campResult: any = await executeQuery(
        'INSERT INTO newsletter_campaigns (content_id, content_url, subject, status) VALUES (?, ?, ?, "processing")',
        [contentTitle, contentUrl || null, subject]
      );
      campaignId = campResult?.insertId;
    } catch (e) {
      console.warn('Impossible d\'enregistrer la campagne en BDD :', e);
    }

    const transporter = getTransporter();
    const appBaseUrl = process.env.APP_BASE_URL || 'https://itid-france.com';
    let sentCount = 0;

    // Envoi par lot
    for (const sub of subscribers) {
      const unsubUrl = `${appBaseUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token_hash}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0c1a2e; padding: 20px; text-align: center; border-bottom: 3px solid #2a9d8f;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">ITID France || Nouvelle Publication</h2>
          </div>
          <div style="padding: 24px; color: #334155; line-height: 1.6;">
            <h3 style="color: #1a3a5c; margin-top: 0;">${escapeHtml(contentTitle)}</h3>
            <p>${escapeHtml(contentSummary || '')}</p>
            ${contentUrl
          ? `<div style="margin: 24px 0;"><a href="${contentUrl}" style="padding: 12px 24px; background: #2a9d8f; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Lire l'article complet</a></div>`
          : ''
        }
            <p style="margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              Vous recevez ce message car vous êtes abonné(e) aux actualités d'ITID France.<br>
              <a href="${unsubUrl}" style="color: #2a9d8f;">Se désinscrire</a>
            </p>
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"${process.env.NEWSLETTER_FROM_NAME || 'ITID France'}" <${process.env.SMTP_USER}>`,
          to: sub.email,
          subject,
          html: emailHtml,
        });
        sentCount++;
      } catch (err) {
        console.error(`Échec d'envoi newsletter à ${sub.email} :`, err);
      }
    }

    if (campaignId) {
      try {
        await executeQuery(
          'UPDATE newsletter_campaigns SET status = "sent", sent_at = NOW(), sent_count = ? WHERE id = ?',
          [sentCount, campaignId]
        );
      } catch { }
    }

    return res.json({
      success: true,
      message: `Campagne envoyée avec succès à ${sentCount} abonnés.`,
      sentCount,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// -------------------------------------------------------------
// Contrôleurs d'administration (Newsletter)
// -------------------------------------------------------------

export async function getAdminSubscribers(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    try {
      let whereClause = '1=1';
      const params: any[] = [];

      if (status && ['pending', 'subscribed', 'unsubscribed'].includes(status)) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      if (search && search.trim().length > 0) {
        whereClause += ' AND email LIKE ?';
        params.push(`%${search.trim()}%`);
      }

      const countSql = `SELECT COUNT(*) as total FROM newsletter_subscribers WHERE ${whereClause}`;
      const countRes = await executeQuery(countSql, params);
      const total = countRes[0]?.total || 0;

      const dataSql = `
        SELECT id, email, first_name, status, source, consent_at, confirmed_at, unsubscribed_at, created_at 
        FROM newsletter_subscribers 
        WHERE ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const subscribers = await executeQuery(dataSql, [...params, limit, offset]);

      return res.json({
        success: true,
        data: subscribers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch {
      let filtered = [...inMemorySubscribers];
      if (status) filtered = filtered.filter((s) => s.status === status);
      if (search) {
        filtered = filtered.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
      }
      return res.json({
        success: true,
        data: filtered.slice(offset, offset + limit),
        pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function manualUnsubscribe(req: Request, res: Response) {
  try {
    const { id } = req.params;
    try {
      await executeQuery(
        'UPDATE newsletter_subscribers SET status = "unsubscribed", unsubscribed_at = NOW() WHERE id = ?',
        [id]
      );
    } catch {
      const sub = inMemorySubscribers.find((s) => String(s.id) === String(id));
      if (sub) {
        sub.status = 'unsubscribed';
        sub.unsubscribed_at = new Date();
      }
    }
    return res.json({ success: true, message: 'Abonné désinscrit avec succès.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function exportSubscribersCsv(req: Request, res: Response) {
  try {
    let rows: any[] = [];
    try {
      rows = await executeQuery(
        'SELECT id, email, first_name, status, source, consent_at, unsubscribed_at FROM newsletter_subscribers ORDER BY created_at DESC'
      );
    } catch {
      rows = inMemorySubscribers;
    }

    const header = ['ID', 'Email', 'Prénom', 'Statut', 'Source', 'Date Consentement', 'Date Désinscription'];
    const csvLines = [
      header.join(';'),
      ...rows.map((r) =>
        [
          r.id,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          `"${(r.first_name || '').replace(/"/g, '""')}"`,
          r.status,
          `"${(r.source || '').replace(/"/g, '""')}"`,
          r.consent_at ? new Date(r.consent_at).toISOString() : '',
          r.unsubscribed_at ? new Date(r.unsubscribed_at).toISOString() : '',
        ].join(';')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="itid-newsletter-subscribers.csv"');
    return res.send('\uFEFF' + csvLines.join('\r\n'));
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
