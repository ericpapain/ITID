# ARCHITECTURE DE PERSISTANCE & CYCLE DE DÉPLOIEMENT ITID

Ce document définit les règles absolues régissant la séparation entre le **code applicatif versionné** et les **données persistantes du CMS** sur l'infrastructure Hostinger d'ITID France.

---

## 1. RÈGLE D'OR DE DÉVELOPPEMENT

> **Toute nouvelle fonctionnalité doit d'abord vérifier si elle modifie le code, le schéma de données ou les données CMS. Une modification du code ne doit JAMAIS réinitialiser les données CMS. Toute modification de schéma doit utiliser une migration non destructive. Tout fichier créé ou uploadé par un utilisateur doit être stocké dans un emplacement persistant et indépendant du déploiement Git.**

---

## 2. SÉPARATION ABSOLUE DU CODE ET DES DONNÉES

```
                    ┌─────────────────────────┐
                    │       GIT / GITHUB      │
                    │                         │
                    │  Code source (React)    │
                    │  Composants & Pages     │
                    │  Styles & Animations    │
                    │  Logique Backend & API  │
                    │  Configuration de base  │
                    └───────────┬─────────────┘
                                │
                                │ Déploiement CI/CD
                                │ (LFTP avec exclusions)
                                ▼
                    ┌─────────────────────────┐
                    │       APPLICATION       │
                    │       (Hostinger)       │
                    └───────────┬─────────────┘
                                │
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│   STOCKAGE PERSISTANT   │           │    STOCKAGE DES MÉDIAS  │
│                         │           │                         │
│  Base SQLite            │           │  Dossier /uploads/      │
│  - Cas cliniques        │           │  - Photos des cas       │
│  - Traitements          │           │  - Imagerie médicale    │
│  - Pathologies          │           │  - Documents et vidéos  │
│  - Actualités           │           │                         │
│  - Messages & Leads     │           │  (Exclu du miroir LFTP, │
│                         │           │   jamais écrasé)        │
│  (Exclu du miroir LFTP, │           └────────────▲────────────┘
│   jamais écrasé)        │                        │
└────────────▲────────────┘                        │
             │                                     │
             └──────────────────┬──────────────────┘
                                │
                    ┌───────────┴─────────────┐
                    │    CMS ADMINISTRATEUR   │
                    │                         │
                    │  Création & Édition     │
                    │  Uploads de photos      │
                    │  Gestion des messages   │
                    └─────────────────────────┘
```

---

## 3. PRINCIPES DIRECTEURS

### A. Le Code (Géré par Git)
- Versionné dans Git.
- Toute modification du code (`src/`, `public/`, `server/`) est compilée par Vite et déployée sans impacter les données.
- Ne contient **aucune donnée médicale administrable en dur**. Les tableaux de fallback (`DEFAULT_CAS_CLINIQUES`, etc.) ne sont sollicités que si la base de données est strictement vierge (0 enregistrement). Dès qu'un contenu CMS existe, il prend la priorité 1 absolue.

### B. Les Données (Gérées par le CMS et SQLite)
- Emplacement de production : `/home/u697661607/domains/itid-france.com/public_html/api/data/itid.sqlite` (ou dossier hors webroot `itid_data/itid.sqlite`).
- **Ne fait PAS partie du dépôt Git** (figurant dans `.gitignore`).
- **Exclu formellement du déploiement LFTP** (`--exclude-glob *.sqlite* --exclude-glob api/data/`).
- Concurrence optimisée avec `PRAGMA busy_timeout = 10000;` (10s) et mode `WAL` pour éviter tout verrouillage d'écriture lors des pics de fréquentation.

### C. Les Médias et Uploads
- Emplacement : `/public_html/uploads/` sur Hostinger.
- **Exclu formellement de Git et de LFTP** (`--exclude-glob uploads/`).
- Indexé et audité via la table `media_files` de la base SQLite.

### D. Les Migrations de Schéma
- Si une nouvelle colonne est requise, utiliser impérativement :
  `ALTER TABLE nom_table ADD COLUMN nom_colonne TYPE DEFAULT ...;`
- **Interdiction formelle** d'utiliser `DROP TABLE` ou `DELETE FROM` lors d'une mise à jour logicielle.

### E. Les Formulaires & Flux d'Emails
- Les messages soumis via `/api/contact` effectuent jusqu'à **3 tentatives d'insertion** avec temporisation pour garantir l'enregistrement dans la table `contact_messages`.
- L'email envoyé à l'équipe médicale ITID via Outlook n'est acheminé qu'une fois la persistance assurée.
- Un badge d'alerte en temps réel signale les messages non lus dans le CMS.

---

## 4. PROCÉDURE DE SAUVEGARDE & RESTAURATION

L'administrateur dispose de 2 outils intégrés dans le CMS (section *Sauvegarde & Sécurité*) :
1. **Export JSON / Base** : télécharge l'intégralité des tables et contenus.
2. **Export ZIP des Médias** : télécharge l'archive complète de tous les uploads (`/uploads/`).
