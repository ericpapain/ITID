import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { executeQuery, isConnected } from '../config/db';
import { sendContactNotification } from '../config/mail';

// En mémoire de secours pour le développement local si MySQL n'est pas encore démarré
const inMemoryMessages: any[] = [];
let memId = 1;

export const contactSchema = z.object({
  formName: z.string().min(1).max(100).default('contact_general'),
  name: z.string().max(255).optional(),
  email: z.string().email('Format d\'adresse email invalide').max(255),
  phone: z.string().max(50).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(1, 'Le message ne peut être vide').max(5000, 'Message trop long'),
  metadata: z.record(z.any()).optional(),
  // Honeypot anti-spam : si ce champ est renseigné par un robot, on ignore
  _website_hp: z.string().max(100).optional(),
});

export async function handleContactSubmission(req: Request, res: Response) {
  try {
    const parseResult = contactSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Données de formulaire invalides';
      return res.status(400).json({ success: false, error: firstError });
    }

    const { formName, name, email, phone, subject, message, metadata, _website_hp } = parseResult.data;

    // Protection anti-spam Honeypot : simulation de succès sans traitement si rempli
    if (_website_hp && _website_hp.trim().length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Votre message a été transmis avec succès.',
      });
    }

    // Hashage de l'adresse IP (respect RGPD)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipHash = crypto.createHash('sha256').update(String(clientIp)).digest('hex');

    let insertedId: number | null = null;
    let emailSent = false;
    let emailError: string | null = null;

    // 1. Enregistrement préalable en base de données MySQL
    try {
      const insertSql = `
        INSERT INTO contact_messages 
          (form_name, name, email, phone, subject, message, metadata, ip_hash, status, email_sent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unread', 0)
      `;
      const params = [
        formName,
        name || null,
        email.toLowerCase().trim(),
        phone || null,
        subject || null,
        message,
        metadata ? JSON.stringify(metadata) : null,
        ipHash,
      ];
      const result: any = await executeQuery(insertSql, params);
      insertedId = result?.insertId || null;
    } catch (dbErr: any) {
      console.warn('⚠️ Sauvegarde MySQL indisponible, stockage temporaire mémoire :', dbErr.message);
      insertedId = memId++;
      inMemoryMessages.unshift({
        id: insertedId,
        form_name: formName,
        name,
        email: email.toLowerCase().trim(),
        phone,
        subject,
        message,
        metadata,
        status: 'unread',
        email_sent: false,
        created_at: new Date(),
      });
    }

    // 2. Envoi de la notification par email vers contact@itid-france.com
    try {
      await sendContactNotification({
        formName,
        name,
        email: email.toLowerCase().trim(),
        phone,
        subject,
        message,
        metadata,
      });
      emailSent = true;
    } catch (mailErr: any) {
      emailError = mailErr.message;
      console.warn('⚠️ Envoi email SMTP échoué (le message reste conservé en base) :', mailErr.message);
    }

    // 3. Mise à jour du statut d'envoi en base
    if (insertedId && typeof insertedId === 'number') {
      try {
        await executeQuery(
          'UPDATE contact_messages SET email_sent = ?, email_error = ? WHERE id = ?',
          [emailSent ? 1 : 0, emailError, insertedId]
        );
      } catch {
        const memItem = inMemoryMessages.find((m) => m.id === insertedId);
        if (memItem) {
          memItem.email_sent = emailSent;
          memItem.email_error = emailError;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Votre message a été transmis avec succès. Notre équipe vous répondra dans les plus brefs délais.',
      id: insertedId,
    });
  } catch (error: any) {
    console.error('Erreur contactController :', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer ultérieurement.',
    });
  }
}

// -------------------------------------------------------------
// Contrôleurs d'administration (Messages)
// -------------------------------------------------------------

export async function getAdminMessages(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    try {
      let whereClause = '1=1';
      const params: any[] = [];

      if (status && ['unread', 'read', 'archived'].includes(status)) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      if (search && search.trim().length > 0) {
        whereClause += ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
        const wild = `%${search.trim()}%`;
        params.push(wild, wild, wild);
      }

      const countSql = `SELECT COUNT(*) as total FROM contact_messages WHERE ${whereClause}`;
      const countRes = await executeQuery(countSql, params);
      const total = countRes[0]?.total || 0;

      const dataSql = `
        SELECT id, form_name, name, email, phone, subject, message, metadata, status, email_sent, email_error, created_at 
        FROM contact_messages 
        WHERE ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const messages = await executeQuery(dataSql, [...params, limit, offset]);

      return res.json({
        success: true,
        data: messages,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch {
      // Repli mémoire si la BDD n'est pas encore connectée
      let filtered = [...inMemoryMessages];
      if (status) filtered = filtered.filter((m) => m.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name?.toLowerCase().includes(s) ||
            m.email?.toLowerCase().includes(s) ||
            m.message?.toLowerCase().includes(s)
        );
      }
      const paginated = filtered.slice(offset, offset + limit);
      return res.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateMessageStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Statut invalide' });
    }

    try {
      await executeQuery('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    } catch {
      const item = inMemoryMessages.find((m) => String(m.id) === String(id));
      if (item) item.status = status;
    }

    return res.json({ success: true, message: 'Statut mis à jour avec succès.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function exportMessagesCsv(req: Request, res: Response) {
  try {
    let rows: any[] = [];
    try {
      rows = await executeQuery(
        'SELECT id, form_name, name, email, phone, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC'
      );
    } catch {
      rows = inMemoryMessages;
    }

    const header = ['ID', 'Formulaire', 'Nom', 'Email', 'Téléphone', 'Objet', 'Message', 'Statut', 'Date'];
    const csvLines = [
      header.join(';'),
      ...rows.map((r) =>
        [
          r.id,
          `"${(r.form_name || '').replace(/"/g, '""')}"`,
          `"${(r.name || '').replace(/"/g, '""')}"`,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          `"${(r.phone || '').replace(/"/g, '""')}"`,
          `"${(r.subject || '').replace(/"/g, '""')}"`,
          `"${(r.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          r.status,
          r.created_at ? new Date(r.created_at).toISOString() : '',
        ].join(';')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="itid-messages-export.csv"');
    return res.send('\uFEFF' + csvLines.join('\r\n'));
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
