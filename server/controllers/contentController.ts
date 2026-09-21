import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const inMemoryContent: Record<string, { fr: any; en: any; updated_at: Date }> = {};

export async function getContentSection(req: Request, res: Response) {
  try {
    const { section } = req.params;
    try {
      const rows: any = await executeQuery('SELECT content_fr, content_en FROM site_content WHERE section_key = ?', [section]);
      if (rows && rows.length > 0) {
        return res.json({
          success: true,
          section,
          content_fr: typeof rows[0].content_fr === 'string' ? JSON.parse(rows[0].content_fr) : rows[0].content_fr,
          content_en: typeof rows[0].content_en === 'string' ? JSON.parse(rows[0].content_en) : rows[0].content_en,
        });
      }
    } catch {}

    const mem = inMemoryContent[section];
    if (mem) {
      return res.json({
        success: true,
        section,
        content_fr: mem.fr,
        content_en: mem.en,
      });
    }

    return res.json({ success: true, section, content_fr: null, content_en: null });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAllContent(req: Request, res: Response) {
  try {
    const result: Record<string, { fr: any; en: any }> = {};
    try {
      const rows: any = await executeQuery('SELECT section_key, content_fr, content_en FROM site_content');
      if (rows && rows.length > 0) {
        for (const row of rows) {
          result[row.section_key] = {
            fr: typeof row.content_fr === 'string' ? JSON.parse(row.content_fr) : row.content_fr,
            en: typeof row.content_en === 'string' ? JSON.parse(row.content_en) : row.content_en,
          };
        }
        return res.json({ success: true, sections: result });
      }
    } catch {}

    for (const [k, v] of Object.entries(inMemoryContent)) {
      result[k] = { fr: v.fr, en: v.en };
    }
    return res.json({ success: true, sections: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateContentSection(req: AuthenticatedRequest, res: Response) {
  try {
    const { section } = req.params;
    const { content_fr, content_en, notifyNewsletter, articleInfo } = req.body;

    if (!content_fr && !content_en) {
      return res.status(400).json({ success: false, error: 'Données de contenu requises.' });
    }

    const jsonFr = JSON.stringify(content_fr || {});
    const jsonEn = JSON.stringify(content_en || {});
    const updatedBy = req.user?.email || 'admin';

    try {
      await executeQuery(
        `INSERT INTO site_content (section_key, content_fr, content_en, updated_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           content_fr = VALUES(content_fr),
           content_en = VALUES(content_en),
           updated_by = VALUES(updated_by),
           updated_at = NOW()`,
        [section, jsonFr, jsonEn, updatedBy]
      );
    } catch {
      inMemoryContent[section] = {
        fr: content_fr,
        en: content_en,
        updated_at: new Date(),
      };
    }

    // Étape 7 : Si la publication concerne un nouvel article et que l'option notifyNewsletter est cochée
    let newsletterNotice = '';
    if (notifyNewsletter && articleInfo) {
      try {
        const cronSecret = process.env.NEWSLETTER_CRON_SECRET || 'itid_dev_cron_secret_12345';
        const baseUrl = `http://localhost:${process.env.PORT || 3001}`;
        await fetch(`${baseUrl}/api/newsletter/trigger-campaign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': cronSecret,
          },
          body: JSON.stringify({
            subject: `Nouvelle publication ITID : ${articleInfo.title || 'Actualité médicale'}`,
            contentTitle: articleInfo.title,
            contentUrl: articleInfo.url,
            contentSummary: articleInfo.summary,
          }),
        });
        newsletterNotice = ' + Campagne newsletter déclenchée avec succès';
      } catch (e: any) {
        console.warn('Erreur envoi auto newsletter :', e.message);
      }
    }

    return res.json({
      success: true,
      message: `Section "${section}" enregistrée avec succès${newsletterNotice}.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
