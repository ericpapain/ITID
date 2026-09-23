import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleContactSubmission,
  getAdminMessages,
  updateMessageStatus,
  exportMessagesCsv,
} from '../controllers/contactController';
import {
  handleSubscribe,
  handleUnsubscribe,
  handleTriggerCampaign,
  getAdminSubscribers,
  manualUnsubscribe,
  exportSubscribersCsv,
} from '../controllers/newsletterController';
import { handleAdminLogin, handleGetMe } from '../controllers/authController';
import {
  getContentSection,
  getAllContent,
  updateContentSection,
} from '../controllers/contentController';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();

// Limitation de débit (Rate Limiting) sur les soumissions de formulaires publics
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 messages par tranche de 15 min par IP
  message: {
    success: false,
    error: 'Trop de requêtes envoyées depuis cette adresse. Veuillez patienter quelques minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Trop de requêtes d\'inscription. Veuillez patienter quelques minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// -------------------------------------------------------------
// Routes Publiques
// -------------------------------------------------------------

// Formulaire de contact général et formulaires dérivés
router.post('/contact', contactLimiter, handleContactSubmission);

// Inscription et désinscription Newsletter
router.post('/newsletter/subscribe', newsletterLimiter, handleSubscribe);
router.get('/newsletter/unsubscribe', handleUnsubscribe);

// Déclencheur automatique de campagne newsletter (protégé par x-cron-secret)
router.post('/newsletter/trigger-campaign', handleTriggerCampaign);

// Authentification Administrateur
router.post('/auth/login', handleAdminLogin);

// Contenus dynamiques publics (FR/EN)
router.get('/content', getAllContent);
router.get('/content/:section', getContentSection);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ITID Backend API', timestamp: new Date() });
});

// -------------------------------------------------------------
// Routes Administrateur Protégées (Bearer JWT)
// -------------------------------------------------------------

router.get('/auth/me', requireAdminAuth, handleGetMe);

// Messages reçus
router.get('/admin/messages', requireAdminAuth, getAdminMessages);
router.patch('/admin/messages/:id/status', requireAdminAuth, updateMessageStatus);
router.get('/admin/messages/export/csv', requireAdminAuth, exportMessagesCsv);

// Abonnés Newsletter
router.get('/admin/newsletter/subscribers', requireAdminAuth, getAdminSubscribers);
router.post('/admin/newsletter/subscribers/:id/unsubscribe', requireAdminAuth, manualUnsubscribe);
router.get('/admin/newsletter/subscribers/export/csv', requireAdminAuth, exportSubscribersCsv);

// Édition de contenus CMS
router.put('/content/:section', requireAdminAuth, updateContentSection);

// Analytics
import {
  handleTrack,
  getAnalyticsOverview,
  getAnalyticsTimeseries,
  getAnalyticsTopPages,
  getAnalyticsGeo,
  getAnalyticsDevices,
  getAnalyticsVisitors,
  getVisitorDetail,
} from '../controllers/analyticsController';

router.post('/analytics/track', handleTrack);
router.get('/admin/analytics/overview', requireAdminAuth, getAnalyticsOverview);
router.get('/admin/analytics/timeseries', requireAdminAuth, getAnalyticsTimeseries);
router.get('/admin/analytics/top-pages', requireAdminAuth, getAnalyticsTopPages);
router.get('/admin/analytics/geo', requireAdminAuth, getAnalyticsGeo);
router.get('/admin/analytics/devices', requireAdminAuth, getAnalyticsDevices);
router.get('/admin/analytics/visitors', requireAdminAuth, getAnalyticsVisitors);
router.get('/admin/analytics/visitors/:id', requireAdminAuth, getVisitorDetail);

export default router;
