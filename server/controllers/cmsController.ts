import { Request, Response } from 'express';
import { executeQuery } from '../config/db';

export interface CasCliniqueItem {
  id: number;
  title_fr: string;
  title_en: string;
  category_fr: string;
  category_en: string;
  image: string;
  display_order: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

// In-memory initial data for Cas Cliniques
let inMemoryCasCliniques: CasCliniqueItem[] = [
  {
    id: 1,
    title_fr: "Cas Clinique #1",
    title_en: "Clinical Case #1",
    category_fr: "Infiltration lombaire",
    category_en: "Lumbar Infiltration",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop",
    display_order: 1,
    is_active: 1
  },
  {
    id: 2,
    title_fr: "Cas Clinique #2",
    title_en: "Clinical Case #2",
    category_fr: "Radiofréquence",
    category_en: "Radiofrequency",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop",
    display_order: 2,
    is_active: 1
  },
  {
    id: 3,
    title_fr: "Cas Clinique #3",
    title_en: "Clinical Case #3",
    category_fr: "Douleur pelvienne",
    category_en: "Pelvic Pain",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop",
    display_order: 3,
    is_active: 1
  },
  {
    id: 4,
    title_fr: "Cas Clinique #4",
    title_en: "Clinical Case #4",
    category_fr: "Bloc nerveux",
    category_en: "Nerve Block",
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop",
    display_order: 4,
    is_active: 1
  },
  {
    id: 5,
    title_fr: "Innovation #5",
    title_en: "Innovation #5",
    category_fr: "Réalité Virtuelle",
    category_en: "Virtual Reality",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
    display_order: 5,
    is_active: 1
  },
  {
    id: 6,
    title_fr: "Cas Clinique #6",
    title_en: "Clinical Case #6",
    category_fr: "Céphalées chroniques",
    category_en: "Chronic Headaches",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop",
    display_order: 6,
    is_active: 1
  },
  {
    id: 7,
    title_fr: "Cas Clinique #7",
    title_en: "Clinical Case #7",
    category_fr: "Névralgie cervico-brachiale",
    category_en: "Cervicobrachial Neuralgia",
    image: "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?q=80&w=800&auto=format&fit=crop",
    display_order: 7,
    is_active: 1
  },
  {
    id: 8,
    title_fr: "Cas Clinique #8",
    title_en: "Clinical Case #8",
    category_fr: "SDRC Type 1",
    category_en: "CRPS Type 1",
    image: "https://images.unsplash.com/photo-1582719478250-c89af14eb2de?q=80&w=800&auto=format&fit=crop",
    display_order: 8,
    is_active: 1
  },
  {
    id: 9,
    title_fr: "Innovation #9",
    title_en: "Innovation #9",
    category_fr: "Neuromodulation",
    category_en: "Neuromodulation",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop",
    display_order: 9,
    is_active: 1
  }
];

let nextId = 10;

// GET /api/cms/cas_cliniques or /api/cms/cas-cliniques (Public)
export async function getPublicCasCliniques(req: Request, res: Response) {
  try {
    try {
      const rows: any = await executeQuery('SELECT * FROM cms_cas_cliniques WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
      if (rows && rows.length > 0) {
        return res.json({ success: true, cases: rows, items: rows });
      }
    } catch {}

    const active = inMemoryCasCliniques.filter(c => c.is_active === 1).sort((a, b) => a.display_order - b.display_order);
    return res.json({ success: true, cases: active, items: active });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Router handler for /api/admin/cms
export async function handleAdminCms(req: Request, res: Response) {
  const method = req.method;
  const type = (req.query.type as string) || '';
  const id = req.query.id ? parseInt(req.query.id as string, 10) : null;

  if (type === 'cas_cliniques') {
    if (method === 'GET') {
      try {
        const rows: any = await executeQuery('SELECT * FROM cms_cas_cliniques ORDER BY display_order ASC, id ASC');
        if (rows && rows.length > 0) {
          return res.json({ success: true, items: rows });
        }
      } catch {}

      return res.json({ success: true, items: [...inMemoryCasCliniques].sort((a, b) => a.display_order - b.display_order) });
    }

    if (method === 'POST') {
      const body = req.body || {};
      const newItem: CasCliniqueItem = {
        id: nextId++,
        title_fr: body.title_fr || 'Nouveau Cas Clinique',
        title_en: body.title_en || 'New Clinical Case',
        category_fr: body.category_fr || 'Geste Interventionnel',
        category_en: body.category_en || 'Interventional Procedure',
        image: body.image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
        display_order: parseInt(body.display_order ?? 0, 10),
        is_active: body.is_active !== undefined ? parseInt(body.is_active, 10) : 1
      };

      try {
        await executeQuery(
          'INSERT INTO cms_cas_cliniques (title_fr, title_en, category_fr, category_en, image, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [newItem.title_fr, newItem.title_en, newItem.category_fr, newItem.category_en, newItem.image, newItem.display_order, newItem.is_active]
        );
      } catch {}

      inMemoryCasCliniques.push(newItem);
      return res.json({ success: true, id: newItem.id, message: 'Cas clinique créé avec succès.' });
    }

    if (method === 'PUT') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });
      const body = req.body || {};

      try {
        await executeQuery(
          'UPDATE cms_cas_cliniques SET title_fr = ?, title_en = ?, category_fr = ?, category_en = ?, image = ?, display_order = ?, is_active = ? WHERE id = ?',
          [body.title_fr, body.title_en, body.category_fr, body.category_en, body.image, body.display_order, body.is_active, id]
        );
      } catch {}

      const idx = inMemoryCasCliniques.findIndex(c => c.id === id);
      if (idx !== -1) {
        inMemoryCasCliniques[idx] = {
          ...inMemoryCasCliniques[idx],
          ...body,
          id
        };
      }
      return res.json({ success: true, message: 'Cas clinique mis à jour avec succès.' });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });

      try {
        await executeQuery('DELETE FROM cms_cas_cliniques WHERE id = ?', [id]);
      } catch {}

      inMemoryCasCliniques = inMemoryCasCliniques.filter(c => c.id !== id);
      return res.json({ success: true, message: 'Cas clinique supprimé avec succès.' });
    }
  }

  return res.status(400).json({ success: false, error: `Type non supporté en dev Node : ${type}` });
}
