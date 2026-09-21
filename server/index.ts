import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { testDbConnection } from './config/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const isProd = process.env.NODE_ENV === 'production';

// Sécurité de base avec Helmet (désactivation CSP stricte pour Three.js / fonts externes)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Parsers avec limitation de charge utile
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Montage des routes d'API
app.use('/api', apiRouter);

// En production : distribution des assets statiques compilés du frontend
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Toutes les autres requêtes mènent vers index.html (Routing SPA)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Gestion des erreurs globales
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur serveur non interceptée :', err);
  res.status(500).json({
    success: false,
    error: 'Une erreur interne est survenue sur le serveur.',
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Serveur ITID France démarré sur http://localhost:${PORT}`);
  console.log(`Mode : ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);

  // Vérification de la base de données au démarrage
  const dbStatus = await testDbConnection();
  if (dbStatus.success) {
    console.log(`[Base de données] ✅ ${dbStatus.message}`);
  } else {
    console.log(`[Base de données] ⚠️ ${dbStatus.message}`);
  }
});
