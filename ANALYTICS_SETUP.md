# Guide d'Installation & Fonctionnement — Analytics ITID France

Système complet de suivi et d'analyse des visiteurs, souverain, respectueux de la vie privée (RGPD) et connecté directement à la base de données Hostinger.

---

## 1. Nouvelles Tables de Base de Données

Les tables sont définies dans `server/migrations/002_analytics_schema.sql` (MySQL) et initialisées automatiquement par `public/api/db.php` :

1. **`visitors`** :
   - Représente un visiteur unique reconnu par son token pseudonymisé `visitor_token` (ex: `v_m83fx_...`).
   - Champs : `id`, `visitor_token`, `first_seen_at`, `last_seen_at`, `total_sessions`, `total_page_views`, `total_duration_seconds`, `first_ip_address`, `last_ip_address`, `country`, `country_code`, `city`, `device_type`, `browser`, `operating_system`, `language`, `created_at`, `updated_at`.
2. **`visitor_sessions`** :
   - Représente une session de visite (active pendant la navigation, expire après 30 minutes d'inactivité).
   - Champs : `id`, `visitor_id`, `session_token`, `started_at`, `last_activity_at`, `ended_at`, `duration_seconds`, `page_views`, `entry_page`, `exit_page`, `ip_address`, `country`, `country_code`, `city`, `region`, `timezone`, `device_type`, `device_brand`, `browser`, `browser_version`, `operating_system`, `os_version`, `screen_width`, `screen_height`, `language`, `referrer`, `landing_url`, `is_bot`, `created_at`.
3. **`page_views`** :
   - Enregistre chaque page consultée au cours de la session.
   - Champs : `id`, `session_id`, `visitor_id`, `page_url`, `page_path`, `page_title`, `referrer`, `entered_at`, `left_at`, `duration_seconds`, `created_at`.
4. **`visitor_events`** :
   - Permet d'enregistrer des événements personnalisés futurs (clics, formulaire, vidéo, téléchargement).
   - Champs : `id`, `visitor_id`, `session_id`, `event_name`, `event_data`, `page_url`, `created_at`.

---

## 2. Nouvelles Routes API

### Routes Publiques (Collecte Analytics) :
- `POST /api/analytics/track` :
  - Reçoit les signaux du client (`pageview`, `heartbeat`, `leave`, `event`).
  - Enregistre les métriques sans jamais bloquer l'affichage du site.

### Routes Administrateur Protégées :
- `GET /api/admin/analytics/overview` : KPIs globaux + visiteurs actifs en direct (dernières 5 min).
- `GET /api/admin/analytics/timeseries?range=7d` : Données temporelles (Aujourd'hui, Hier, 7j, 30j, 90j).
- `GET /api/admin/analytics/top-pages` : Classement des pages les plus consultées et durées moyennes.
- `GET /api/admin/analytics/geo` : Répartition géographique par pays et villes.
- `GET /api/admin/analytics/devices` : Répartition par appareil (desktop, mobile, tablette), OS et navigateur.
- `GET /api/admin/analytics/visitors` : Liste paginée et filtrable des visiteurs récents.
- `GET /api/admin/analytics/visitors/:id` : Fiche détaillée d'un visiteur avec le parcours chronologique précis de ses sessions.
- `GET /api/admin/analytics/export/csv` : Export au format CSV (compatible Excel avec BOM UTF-8).

---

## 3. Fonctionnement du Tracking

Le suivi s'exécute automatiquement via le hook React `src/hooks/useVisitorTracker.ts` :
1. **Intégration globale** : Appelé dans `src/App.tsx` au sein du composant principal `AppContent()`.
2. **Exclusion stricte** : Ne collecte aucune donnée sur les pages d'administration (`/admin/*`).
3. **Tokens techniques pseudonymisés** :
   - `visitor_token` stocké dans `localStorage` (`itid_analytics_vid`).
   - `session_token` stocké dans `sessionStorage` (`itid_analytics_sid`).
4. **Zéro impact sur les performances** :
   - Requêtes asynchrones en tâche de fond.
   - Utilise `navigator.sendBeacon()` ou `fetch(..., { keepalive: true })` à la fermeture ou au changement de page pour ne perdre aucune donnée.

---

## 4. Calcul des Sessions

- Une session débute dès la première requête d'un visiteur.
- Elle reste active tant que le visiteur navigue. Un "heartbeat" régulier (toutes les 45 secondes d'activité visible) met à jour `last_activity_at`.
- Si le délai entre deux interactions dépasse **30 minutes**, une nouvelle session (`visitor_sessions`) est automatiquement démarrée.
- Les robots connus (Googlebot, Bingbot, Lighthouse, crawlers) sont détectés côté serveur et marqués `is_bot = 1`.

---

## 5. Calcul du Temps Passé

1. **Par page** :
   - `entered_at` est horodaté au moment de l'entrée sur la route.
   - `left_at` est calculé lors du changement de page ou à la fermeture de l'onglet (`visibilitychange` / `pagehide`).
   - `duration_seconds = left_at - entered_at`.
2. **Par session** :
   - `duration_seconds` est cumulé au fur et à mesure de l'activité réelle du visiteur.

---

## 6. Géolocalisation IP

- Détection sécurisée de l'IP réelle du visiteur côté serveur (`HTTP_CF_CONNECTING_IP`, `HTTP_X_REAL_IP`, `HTTP_X_FORWARDED_FOR`, `REMOTE_ADDR`).
- Géolocalisation serveur via un service rapide (IP-API) avec un **timeout strict de 1.5s** et un **cache local fichier** (`public/api/data/geo_cache.json`) pour ne jamais ralentir le chargement du site.
- Détermine approximativement le pays, code pays, région et ville (sans jamais chercher d'adresse postale exacte).

---

## 7. Configuration & Variables d'Environnement

Dans `public/api/config.php` (ou variables d'environnement) :
```php
return [
    'db_type'        => 'sqlite', // ou 'mysql' pour Hostinger MySQL
    'mysql_host'     => 'localhost',
    'mysql_name'     => 'u123456789_itid',
    'mysql_user'     => 'u123456789_user',
    'mysql_password' => 'VotreMotDePasseMySQL',
    'retention_days' => 90, // Durée de rétention RGPD recommandée
];
```

---

## 8. Durée de Conservation & RGPD

- **Minimisation des données** : Aucun nom, prénom, email, mot de passe ou contenu de formulaire n'est collecté par le système analytics.
- **Rétention recommandée** : 90 jours (`ANALYTICS_RETENTION_DAYS=90`).
- Les données de navigation sont stockées dans vos propres tables, sur votre propre serveur, sans transmission à des régies publicitaires tierces.

---

## 9. Fonctionnement du Dashboard Admin

Accessible depuis le menu latéral de l'espace administration :
👉 **Administration → Visiteurs & Analytics (`/admin/analytics`)**

Il comprend :
- Le badge temps réel : `🟢 X visiteurs actifs en direct`.
- Les 6 KPIs majeurs : Visiteurs aujourd'hui, Visiteurs uniques, Sessions, Pages vues, Durée moyenne, Pages/session.
- Le graphique d'activité dans le temps avec sélecteur de période (Aujourd'hui, Hier, 7j, 30j, 90j).
- Le tableau des pages les plus consultées avec le temps moyen passé.
- La carte des origines géographiques (Top Pays et Top Villes).
- La répartition des appareils (Desktop, Mobile, Tablette), navigateurs et systèmes d'exploitation.
- Le tableau interactif de tous les visiteurs récents avec filtres et recherche.
- **La fiche détaillée d'un visiteur** : Clic sur « Parcours » pour ouvrir l'arborescence chronologique complète de la navigation (heure d'entrée, page consultée, temps passé).
- Le bouton **« Exporter CSV »** pour télécharger les données brutes.

---

## 10. Suppression et Anonymisation des Données

Pour purger les données antérieures à la durée de rétention :
```sql
DELETE FROM visitor_events WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM page_views WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM visitor_sessions WHERE started_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM visitors WHERE last_seen_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

---

## 11. Déploiement sur Hostinger

1. Le build de production est déjà compilé dans le dossier `dist/`.
2. L'archive prête au déploiement [`dist_hostinger.zip`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Jerry/Site/ITID/dist_hostinger.zip) contient l'ensemble des fichiers mis à jour.
3. Déposez [`dist_hostinger.zip`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Jerry/Site/ITID/dist_hostinger.zip) dans le dossier `public_html` de votre gestionnaire de fichiers Hostinger et cliquez sur **Extraire**.
4. Le système commence à enregistrer les visiteurs immédiatement et alimente le tableau de bord dans `/admin/analytics`.
