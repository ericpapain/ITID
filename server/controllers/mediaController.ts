import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { executeQuery, isConnected } from '../config/db';

const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de stockage Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const baseName = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 40) || 'media';
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const randomHex = crypto.randomBytes(4).toString('hex');
    cb(null, `${baseName}_${timestamp}_${randomHex}${ext}`);
  },
});

const allowedMimes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'application/pdf', 'model/gltf-binary', 'application/octet-stream'
];

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|svg|gif|mp4|webm|ogg|mov|pdf|glb)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, SVG, GIF, MP4, WEBM, MOV, PDF.'));
    }
  },
});

export async function handleUploadMedia(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier reçu.' });
    }

    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const ext = path.extname(file.filename).toLowerCase();
    let mediaType = 'image';
    if (file.mimetype.startsWith('video/') || ['.mp4', '.webm', '.mov', '.ogg'].includes(ext)) {
      mediaType = 'video';
    } else if (ext === '.pdf') {
      mediaType = 'document';
    }

    const versionParam = Date.now();
    const publicUrl = `/uploads/${file.filename}?v=${versionParam}`;

    let insertedId = 0;
    try {
      const result = await executeQuery(
        `INSERT INTO media_files (
          filename, original_name, file_path, public_url, mime_type, file_size, file_hash, media_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          file.filename,
          file.originalname,
          filePath,
          publicUrl,
          file.mimetype,
          file.size,
          fileHash,
          mediaType,
        ]
      );
      if (result && typeof result.insertId === 'number') {
        insertedId = result.insertId;
      }
    } catch (err: any) {
      console.warn('[Media Upload] Fallback sans MySQL DB :', err?.message);
    }

    return res.json({
      success: true,
      id: insertedId,
      url: publicUrl,
      cleanUrl: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mime: file.mimetype,
      media_type: mediaType,
      message: 'Média téléversé et enregistré avec succès.',
    });
  } catch (error: any) {
    console.error('Erreur handleUploadMedia :', error);
    return res.status(500).json({ success: false, error: error.message || 'Erreur lors du téléversement.' });
  }
}

export async function handleGetMedia(req: Request, res: Response) {
  try {
    const { type, search, audit } = req.query;

    let items: any[] = [];
    try {
      let query = 'SELECT * FROM media_files WHERE 1=1';
      const params: any[] = [];

      if (type && typeof type === 'string') {
        query += ' AND media_type = ?';
        params.push(type);
      }
      if (search && typeof search === 'string') {
        query += ' AND (filename LIKE ? OR original_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      query += ' ORDER BY id DESC';

      items = await executeQuery(query, params);
    } catch {
      // Fallback si la table media_files n'est pas encore créée en local
      items = [];
    }

    // Si la liste DB est vide en local, scanner public/images et public/uploads pour offrir une expérience fluide
    if (items.length === 0) {
      const scanDirs = [
        { dir: path.resolve(process.cwd(), 'public/uploads'), prefix: '/uploads/' },
        { dir: path.resolve(process.cwd(), 'public/images'), prefix: '/images/' },
        { dir: path.resolve(process.cwd(), 'public/images/treatments'), prefix: '/images/treatments/' },
      ];

      scanDirs.forEach(({ dir, prefix }) => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach((f, idx) => {
            if (f === '.htaccess' || fs.statSync(path.join(dir, f)).isDirectory()) return;
            const ext = path.extname(f).toLowerCase();
            const isVid = ['.mp4', '.webm', '.mov', '.ogg'].includes(ext);
            const isDoc = ext === '.pdf';
            const mType = isVid ? 'video' : isDoc ? 'document' : 'image';

            if (type && type !== mType) return;
            if (search && !f.toLowerCase().includes(String(search).toLowerCase())) return;

            const st = fs.statSync(path.join(dir, f));
            items.push({
              id: items.length + 1,
              filename: f,
              original_name: f,
              file_path: path.join(dir, f),
              public_url: prefix + f,
              mime_type: isVid ? 'video/mp4' : isDoc ? 'application/pdf' : 'image/jpeg',
              file_size: st.size,
              media_type: mType,
              created_at: st.birthtime.toISOString(),
            });
          });
        }
      });
    }

    let orphans: any = null;
    if (audit === 'orphans') {
      const diskFiles = fs.existsSync(uploadsDir)
        ? fs.readdirSync(uploadsDir).filter((f) => f !== '.htaccess' && !fs.statSync(path.join(uploadsDir, f)).isDirectory())
        : [];
      const dbFilenames = items.map((it) => it.filename);

      const filesWithoutDb = diskFiles
        .filter((df) => !dbFilenames.includes(df))
        .map((df) => ({
          filename: df,
          file_path: path.join(uploadsDir, df),
          file_size: fs.statSync(path.join(uploadsDir, df)).size,
          public_url: `/uploads/${df}`,
        }));

      const dbWithoutFiles = items.filter((it) => {
        if (it.public_url && it.public_url.startsWith('/uploads/')) {
          const p = path.join(uploadsDir, it.filename);
          return !fs.existsSync(p);
        }
        return false;
      });

      orphans = { filesWithoutDb, dbWithoutFiles };
    }

    return res.json({
      success: true,
      count: items.length,
      items,
      orphans,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleDeleteMedia(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const queryFilename = (req.query.filename as string) || '';
    const queryId = req.query.id ? Number(req.query.id) : null;

    let targetFilename = '';
    const numId = id && !isNaN(Number(id)) ? Number(id) : queryId;

    if (numId) {
      try {
        const rows = await executeQuery('SELECT * FROM media_files WHERE id = ? LIMIT 1', [numId]);
        if (Array.isArray(rows) && rows.length > 0) {
          targetFilename = rows[0].filename;
          await executeQuery('DELETE FROM media_files WHERE id = ?', [numId]);
        }
      } catch {}
    }

    if (!targetFilename) {
      if (id && isNaN(Number(id))) {
        targetFilename = path.basename(id);
      } else if (queryFilename) {
        targetFilename = path.basename(queryFilename);
      }
      if (targetFilename) {
        try {
          await executeQuery('DELETE FROM media_files WHERE filename = ?', [targetFilename]);
        } catch {}
      }
    }

    if (targetFilename) {
      const diskPath = path.join(uploadsDir, path.basename(targetFilename));
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (unlinkErr: any) {
          console.warn('[Media Delete] Unlink warning:', unlinkErr.message);
        }
      }
    }

    return res.json({ success: true, message: 'Média supprimé avec succès.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
