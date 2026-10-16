import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import fs from 'fs';
import path from 'path';

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

const realClinicalImages = [
  "/images/treatments/infiltrations_rachidiennes.jpg",
  "/images/treatments/radiofrequence.jpg",
  "/images/lombalgie.jpg",
  "/images/treatments/blocs_anesthesiques.jpg",
  "/images/treatments/hypnovr.jpg",
  "/images/migraine.jpg",
  "/images/nevralgie_arnold.jpg",
  "/images/sdrc.jpg",
  "/images/treatments/stimulation_ganglion_dorsal.jpg"
];

export function sanitizeCaseImage(img: string | undefined | null, index: number = 0): string {
  const fallback = realClinicalImages[index % realClinicalImages.length] || realClinicalImages[0];
  if (!img || typeof img !== 'string' || img.trim().length === 0) return fallback;
  const trimmed = img.trim();
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('unsplash.com')) return fallback;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:') && !trimmed.startsWith('/')) {
    return '/' + trimmed;
  }
  return trimmed;
}

// Initial seed data for Cas Cliniques
const initialCasCliniques: CasCliniqueItem[] = [
  {
    id: 1,
    title_fr: "Cas Clinique #1",
    title_en: "Clinical Case #1",
    category_fr: "Infiltration lombaire",
    category_en: "Lumbar Infiltration",
    image: "/images/treatments/infiltrations_rachidiennes.jpg",
    display_order: 1,
    is_active: 1
  },
  {
    id: 2,
    title_fr: "Cas Clinique #2",
    title_en: "Clinical Case #2",
    category_fr: "Radiofréquence",
    category_en: "Radiofrequency",
    image: "/images/treatments/radiofrequence.jpg",
    display_order: 2,
    is_active: 1
  },
  {
    id: 3,
    title_fr: "Cas Clinique #3",
    title_en: "Clinical Case #3",
    category_fr: "Douleur pelvienne",
    category_en: "Pelvic Pain",
    image: "/images/lombalgie.jpg",
    display_order: 3,
    is_active: 1
  },
  {
    id: 4,
    title_fr: "Cas Clinique #4",
    title_en: "Clinical Case #4",
    category_fr: "Bloc nerveux",
    category_en: "Nerve Block",
    image: "/images/treatments/blocs_anesthesiques.jpg",
    display_order: 4,
    is_active: 1
  },
  {
    id: 5,
    title_fr: "Innovation #5",
    title_en: "Innovation #5",
    category_fr: "Réalité Virtuelle",
    category_en: "Virtual Reality",
    image: "/images/treatments/hypnovr.jpg",
    display_order: 5,
    is_active: 1
  },
  {
    id: 6,
    title_fr: "Cas Clinique #6",
    title_en: "Clinical Case #6",
    category_fr: "Céphalées chroniques",
    category_en: "Chronic Headaches",
    image: "/images/migraine.jpg",
    display_order: 6,
    is_active: 1
  },
  {
    id: 7,
    title_fr: "Cas Clinique #7",
    title_en: "Clinical Case #7",
    category_fr: "Névralgie cervico-brachiale",
    category_en: "Cervicobrachial Neuralgia",
    image: "/images/nevralgie_arnold.jpg",
    display_order: 7,
    is_active: 1
  },
  {
    id: 8,
    title_fr: "Cas Clinique #8",
    title_en: "Clinical Case #8",
    category_fr: "SDRC Type 1",
    category_en: "CRPS Type 1",
    image: "/images/sdrc.jpg",
    display_order: 8,
    is_active: 1
  },
  {
    id: 9,
    title_fr: "Innovation #9",
    title_en: "Innovation #9",
    category_fr: "Neuromodulation",
    category_en: "Neuromodulation",
    image: "/images/treatments/stimulation_ganglion_dorsal.jpg",
    display_order: 9,
    is_active: 1
  }
];

const dataDir = path.resolve(process.cwd(), 'server/data');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const casCliniquesFilePath = path.join(dataDir, 'cms_cas_cliniques.json');
const pagesFilePath = path.join(dataDir, 'cms_pages.json');

function loadCasCliniquesFromDisk(): CasCliniqueItem[] {
  ensureDataDir();
  if (fs.existsSync(casCliniquesFilePath)) {
    try {
      const content = fs.readFileSync(casCliniquesFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.error('Erreur lecture cms_cas_cliniques.json:', err);
    }
  }
  return [...initialCasCliniques];
}

function saveCasCliniquesToDisk(items: CasCliniqueItem[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(casCliniquesFilePath, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture cms_cas_cliniques.json:', err);
  }
}

let inMemoryCasCliniques: CasCliniqueItem[] = loadCasCliniquesFromDisk();
let nextId = Math.max(...inMemoryCasCliniques.map(c => c.id || 0), 0) + 1;

// GET /api/cms/cas_cliniques or /api/cms/cas-cliniques (Public)
export async function getPublicCasCliniques(req: Request, res: Response) {
  try {
    try {
      const rows: any = await executeQuery('SELECT * FROM cms_cas_cliniques WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
      if (rows && rows.length > 0) {
        const cleaned = rows.map((r: any, idx: number) => ({
          ...r,
          image: sanitizeCaseImage(r.image, idx)
        }));
        return res.json({ success: true, cases: cleaned, items: cleaned });
      }
    } catch {}

    const active = inMemoryCasCliniques
      .filter(c => c.is_active === 1)
      .sort((a, b) => a.display_order - b.display_order)
      .map((c, idx) => ({
        ...c,
        image: sanitizeCaseImage(c.image, idx)
      }));
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
          const cleaned = rows.map((r: any, idx: number) => ({
            ...r,
            image: sanitizeCaseImage(r.image, idx)
          }));
          return res.json({ success: true, items: cleaned });
        }
      } catch {}

      const cleanedMemory = [...inMemoryCasCliniques]
        .sort((a, b) => a.display_order - b.display_order)
        .map((c, idx) => ({
          ...c,
          image: sanitizeCaseImage(c.image, idx)
        }));
      return res.json({ success: true, items: cleanedMemory });
    }

    if (method === 'POST') {
      const body = req.body || {};
      const newItem: CasCliniqueItem = {
        id: nextId++,
        title_fr: body.title_fr || 'Nouveau Cas Clinique',
        title_en: body.title_en || 'New Clinical Case',
        category_fr: body.category_fr || 'Geste Interventionnel',
        category_en: body.category_en || 'Interventional Procedure',
        image: sanitizeCaseImage(body.image, inMemoryCasCliniques.length),
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
      saveCasCliniquesToDisk(inMemoryCasCliniques);
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
      saveCasCliniquesToDisk(inMemoryCasCliniques);
      return res.json({ success: true, id, message: 'Cas clinique mis à jour avec succès.' });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'ID manquant' });

      try {
        await executeQuery('DELETE FROM cms_cas_cliniques WHERE id = ?', [id]);
      } catch {}

      inMemoryCasCliniques = inMemoryCasCliniques.filter(c => c.id !== id);
      saveCasCliniquesToDisk(inMemoryCasCliniques);
      return res.json({ success: true, message: 'Cas clinique supprimé avec succès.' });
    }
  }

  if (type === 'pages') {
    const pageKey = (req.query.page as string) || 'home';

    if (method === 'GET') {
      const pageData = inMemoryPages[pageKey] || { content_fr: {}, content_en: {} };
      return res.json({
        success: true,
        page_key: pageKey,
        content_fr: pageData.content_fr || {},
        content_en: pageData.content_en || {}
      });
    }

    if (method === 'PUT' || method === 'POST') {
      const body = req.body || {};
      inMemoryPages[pageKey] = {
        content_fr: body.content_fr || {},
        content_en: body.content_en || {}
      };
      savePagesToDisk(inMemoryPages);
      return res.json({ success: true, message: 'Page enregistrée avec succès.' });
    }
  }

  return res.status(400).json({ success: false, error: `Type non supporté en dev Node : ${type}` });
}

// In-memory pages storage
const defaultHeroMedia = [
  {
    id: 'media-1',
    type: 'video',
    url: '/images/video-fond.mp4',
    title: 'Vidéo Fond Institut (Originale)',
    duration: 10
  },
  {
    id: 'media-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop',
    title: 'Plateau Interventionnel Guidé',
    duration: 6
  },
  {
    id: 'media-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1600&auto=format&fit=crop',
    title: 'Imagerie Médicale Haute Définition',
    duration: 6
  }
];

const initialPages: Record<string, { content_fr: any; content_en: any }> = {
  home: {
    content_fr: {
      heroTitle1: "Institut du Traitement",
      heroTitle2: "Interventionnel de la Douleur",
      heroSubtitle: "Centre d'excellence dédié au diagnostic de précision et aux thérapeutiques interventionnelles guidées par imagerie pour les douleurs chroniques rebelles.",
      heroBtn1: "Prendre Rendez-vous",
      heroBtn1Url: "https://www.doctolib.fr",
      heroMediaList: defaultHeroMedia
    },
    content_en: {
      heroTitle1: "Institute for Interventional",
      heroTitle2: "Pain Management & Relief",
      heroSubtitle: "Center of excellence dedicated to precision diagnostics and image-guided interventional therapies for refractory chronic pain.",
      heroBtn1: "Book Appointment",
      heroBtn1Url: "https://www.doctolib.fr",
      heroMediaList: defaultHeroMedia
    }
  }
};

function loadPagesFromDisk(): Record<string, { content_fr: any; content_en: any }> {
  ensureDataDir();
  if (fs.existsSync(pagesFilePath)) {
    try {
      const content = fs.readFileSync(pagesFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (err) {
      console.error('Erreur lecture cms_pages.json:', err);
    }
  }
  return { ...initialPages };
}

function savePagesToDisk(pages: Record<string, { content_fr: any; content_en: any }>) {
  try {
    ensureDataDir();
    fs.writeFileSync(pagesFilePath, JSON.stringify(pages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture cms_pages.json:', err);
  }
}

const inMemoryPages: Record<string, { content_fr: any; content_en: any }> = loadPagesFromDisk();

// GET /api/cms/pages?page=home
export async function getPublicPageContent(req: Request, res: Response) {
  try {
    const pageKey = (req.query.page as string) || 'home';
    const pageData = inMemoryPages[pageKey] || { content_fr: {}, content_en: {} };
    return res.json({
      success: true,
      page_key: pageKey,
      content_fr: pageData.content_fr || {},
      content_en: pageData.content_en || {}
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

