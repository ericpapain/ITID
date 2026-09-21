# Prompt à copier dans votre IDE de développement

Tu es un développeur senior chargé d’analyser et de modifier cette application web Node.js existante. Travaille directement dans le dépôt actuel, sans réécrire l’application inutilement et sans casser les fonctionnalités existantes.

## Objectif général

Mettre en place une gestion complète et sécurisée de tous les formulaires du site :

1. Détecter tous les formulaires existants dans le frontend et le backend.
2. Faire envoyer chaque soumission à `contact@itid-france.com`.
3. Enregistrer durablement chaque message reçu dans la base de données MySQL hébergée chez Hostinger.
4. Créer une gestion des abonnés à la newsletter.
5. Enregistrer les inscriptions à la newsletter dans la base de données.
6. Préparer l’envoi automatique d’un email aux abonnés lorsqu’un nouveau contenu est publié.
7. Ajouter une interface sécurisée permettant de consulter les messages et les abonnés.

## Étape 1 - Analyse obligatoire avant toute modification

Commence par analyser le dépôt et identifie :

- Le framework frontend utilisé.
- Le framework backend utilisé.
- Le point d’entrée du serveur.
- Toutes les pages contenant un formulaire.
- Tous les composants de formulaire réutilisables.
- Toutes les routes API existantes.
- Le système d’authentification existant.
- Le système actuel de publication de contenu.
- Le système actuel d’envoi d’emails, s’il existe.
- La méthode actuelle de connexion à la base de données.
- Les fichiers de configuration et les variables d’environnement existantes.

Avant d’écrire du code, affiche un rapport synthétique des fichiers concernés et explique l’architecture que tu vas utiliser. Ne supprime aucune fonctionnalité existante.

## Étape 2 - Configuration des variables d’environnement

Utilise exclusivement des variables d’environnement pour les informations sensibles. Ne mets jamais de mot de passe ou de clé SMTP directement dans le code.

Prévois les variables suivantes, en réutilisant les noms déjà présents dans le projet lorsqu’ils existent :

```env
DB_HOST=
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
CONTACT_EMAIL=contact@itid-france.com

APP_BASE_URL=
NEWSLETTER_FROM_EMAIL=
NEWSLETTER_FROM_NAME=ITID France

ADMIN_EMAIL=
NEWSLETTER_CRON_SECRET=
```

Crée ou mets à jour un fichier `.env.example` sans valeur secrète. Vérifie que `.env` est bien exclu de Git.

Ne devine pas les identifiants de la base de données Hostinger. Si une information manque, laisse la variable vide dans `.env.example` et indique précisément à l’utilisateur quelles valeurs Hostinger doit fournir.

## Étape 3 - Connexion à la base de données Hostinger

Utilise la base MySQL existante de l’application si elle existe déjà. N’en crée pas une seconde sans nécessité.

Adapte-toi au système déjà présent :

- Prisma : créer une migration Prisma.
- Sequelize : créer une migration Sequelize.
- Knex : créer une migration Knex.
- SQL brut : créer un script SQL versionné et idempotent.
- Aucun ORM : choisir une solution compatible avec l’architecture existante et expliquer le choix avant de l’installer.

Les migrations doivent pouvoir être rejouées sans créer de doublons.

Crée les tables ou modèles suivants.

### Table `contact_messages`

Champs minimum :

- `id` : identifiant unique.
- `form_name` : nom du formulaire concerné.
- `name` : nom de l’expéditeur, nullable si le formulaire ne le prévoit pas.
- `email` : adresse email de l’expéditeur.
- `phone` : téléphone, nullable.
- `subject` : objet, nullable.
- `message` : contenu du message.
- `metadata` : données supplémentaires du formulaire, au format JSON si MySQL le permet.
- `status` : `unread`, `read`, `archived`.
- `email_sent` : booléen indiquant si l’email de notification a été envoyé.
- `email_error` : erreur éventuelle, sans exposer de mot de passe.
- `ip_hash` : empreinte de l’adresse IP, jamais l’IP en clair si elle n’est pas indispensable.
- `created_at`.
- `updated_at`.

Ajoute des index sur `email`, `status` et `created_at`.

### Table `newsletter_subscribers`

Champs minimum :

- `id` : identifiant unique.
- `email` : adresse email unique.
- `first_name` : nullable.
- `status` : `pending`, `subscribed`, `unsubscribed`.
- `confirmation_token_hash` : hash du token de confirmation, jamais le token brut.
- `unsubscribe_token_hash` : hash du token de désinscription.
- `consent_at`.
- `confirmed_at` : nullable.
- `unsubscribed_at` : nullable.
- `source` : page ou formulaire d’origine.
- `created_at`.
- `updated_at`.

Ajoute une contrainte d’unicité sur `email` et des index sur `status` et `created_at`.

### Table `newsletter_campaigns` ou équivalent

Crée une structure permettant de suivre les contenus envoyés :

- `id`.
- `content_id` ou `content_url`, selon le modèle de contenu existant.
- `subject`.
- `status` : `pending`, `processing`, `sent`, `failed`.
- `sent_at`.
- `created_at`.
- `error_message`.

Si une table de contenu existe déjà, utilise sa clé étrangère au lieu de dupliquer le contenu.

## Étape 4 - Détection et normalisation de tous les formulaires

Recherche tous les formulaires du site, y compris :

- Formulaire de contact.
- Demande de devis.
- Formulaire de réservation.
- Formulaire de demande d’information.
- Formulaire de candidature.
- Formulaire de newsletter.
- Formulaires présents dans les modales ou composants réutilisables.

Pour chaque formulaire :

1. Vérifie qu’il possède un attribut ou identifiant stable.
2. Vérifie que les champs obligatoires sont validés côté frontend et côté backend.
3. Vérifie le format des adresses email.
4. Empêche l’envoi multiple accidentel avec un état de chargement et une protection backend.
5. Affiche un message de succès clair après confirmation du serveur.
6. Affiche un message d’erreur compréhensible sans révéler les détails techniques.
7. Conserve le nom du formulaire dans `form_name`.
8. Envoie les données vers une route backend sécurisée.

Ne fais jamais confiance aux données envoyées par le navigateur.

## Étape 5 - API de réception des formulaires

Crée ou adapte une route backend de type :

```text
POST /api/contact
```

Cette route doit :

1. Valider et nettoyer toutes les données reçues.
2. Refuser les champs inattendus dangereux.
3. Vérifier les limites de longueur.
4. Protéger contre les injections SQL grâce aux requêtes paramétrées ou à l’ORM.
5. Protéger contre les injections HTML dans les emails.
6. Ajouter une limitation de fréquence par adresse ou session.
7. Vérifier un honeypot ou une protection anti-spam déjà présente.
8. Enregistrer d’abord le message dans `contact_messages`.
9. Envoyer une notification à `contact@itid-france.com` via SMTP Hostinger.
10. Mettre `email_sent` à `true` uniquement si l’envoi a réussi.
11. En cas d’échec SMTP, conserver le message en base et retourner une erreur contrôlée.
12. Ne jamais perdre un message simplement parce que l’email n’a pas été envoyé.

Configuration de l’email :

- Destinataire : `contact@itid-france.com`.
- Expéditeur : une adresse email du domaine configurée dans `SMTP_USER`.
- `replyTo` : l’adresse du visiteur, après validation.
- Objet : inclure le nom du formulaire.
- Corps : présenter les champs de manière lisible.
- Échapper toutes les valeurs utilisateur avant de les insérer dans le HTML.

Utilise une file d’attente ou un mécanisme de retry si l’application en possède déjà un. Sinon, implémente au minimum une stratégie permettant de réessayer les emails échoués sans créer de doublons.

## Étape 6 - Inscription à la newsletter

Crée ou adapte une route :

```text
POST /api/newsletter/subscribe
```

La route doit :

1. Valider l’adresse email.
2. Normaliser l’email en minuscules sans modifier sa validité.
3. Refuser les adresses manifestement invalides.
4. Éviter les doublons.
5. Enregistrer la source de l’inscription.
6. Enregistrer la date et l’heure du consentement.
7. Mettre l’abonné en statut `pending` si une confirmation est activée.
8. Envoyer un email de confirmation si le double opt-in est implémenté.
9. Ne jamais envoyer de newsletter aux contacts non confirmés.
10. Retourner un message générique qui ne révèle pas si un email existe déjà dans la base.

Crée une route de désinscription :

```text
GET /api/newsletter/unsubscribe?token=...
```

Le token doit être signé ou aléatoire, stocké uniquement sous forme de hash et invalidable. La désinscription doit fonctionner sans connexion à l’administration.

Ajoute une case de consentement explicite si elle n’existe pas déjà. Ne coche jamais cette case par défaut.

## Étape 7 - Envoi automatique lors de la publication d’un nouveau contenu

Identifie la fonction ou la route qui publie un nouveau contenu.

Ne lance pas un envoi directement depuis le navigateur. Déclenche une opération backend après la publication réussie.

Le système doit :

1. Détecter la publication réelle d’un nouveau contenu.
2. Éviter de renvoyer automatiquement le même contenu deux fois.
3. Créer une campagne dans `newsletter_campaigns`.
4. Récupérer uniquement les abonnés avec le statut `subscribed`.
5. Envoyer les messages par lots pour éviter les limites SMTP.
6. Ajouter un lien de désinscription dans chaque email.
7. Utiliser un expéditeur du domaine `itid-france.com`.
8. Enregistrer le résultat de chaque campagne.
9. Journaliser les erreurs sans enregistrer de mot de passe ni de token brut.
10. Prévoir une reprise après interruption.

Si l’application utilise déjà un système de tâches planifiées, réutilise-le. Sinon, implémente un mécanisme compatible avec le déploiement Hostinger, par exemple une route interne protégée appelée par une tâche cron.

La route interne de traitement doit :

- Être inaccessible publiquement sans secret.
- Vérifier `NEWSLETTER_CRON_SECRET`.
- Être idempotente.
- Traiter uniquement les campagnes en attente.
- Ne pas envoyer de newsletter si aucune campagne n’est prête.

Avant d’implémenter cette partie, identifie ce que le projet appelle exactement un “nouveau contenu” : article, publication, produit, page ou autre. Ne crée pas un nouveau système éditorial si un système existe déjà.

## Étape 8 - Interface d’administration

Si l’application possède déjà un espace administrateur, ajoute des pages protégées pour :

### Messages reçus

- Liste paginée des messages.
- Recherche par nom ou email.
- Filtre par formulaire et statut.
- Lecture du contenu complet.
- Marquage comme lu.
- Archivage.
- Date de réception.
- Statut de livraison de l’email.

### Abonnés à la newsletter

- Liste paginée.
- Recherche par email.
- Filtre par statut.
- Source d’inscription.
- Date d’inscription.
- Date de confirmation.
- Désinscription manuelle avec confirmation.
- Export CSV uniquement si l’utilisateur administrateur est autorisé.

N’expose jamais ces informations aux visiteurs non authentifiés. Réutilise l’authentification et les permissions existantes. Si aucun système d’administration n’existe, crée uniquement les API sécurisées et explique les éléments nécessaires avant de créer une interface complète.

## Étape 9 - Sécurité et conformité

Implémente les protections suivantes :

- Requêtes SQL paramétrées ou ORM.
- Validation côté serveur.
- Limitation de taille des requêtes.
- Rate limiting sur les routes de formulaire.
- Protection anti-spam.
- Protection CSRF si l’architecture l’exige.
- Échappement HTML dans les emails et l’interface d’administration.
- Pas de secrets dans Git.
- Pas de mot de passe dans les logs.
- Pas de token brut dans les logs.
- Pas d’adresse email personnelle dans le champ `From`.
- L’adresse du visiteur doit être utilisée uniquement dans `Reply-To`.
- Les actions d’administration doivent être authentifiées et autorisées.
- Les messages d’erreur publics doivent rester génériques.

## Étape 10 - Tests obligatoires

Ajoute ou exécute des tests pour vérifier :

1. Un formulaire valide est enregistré en base.
2. Un email est envoyé à `contact@itid-france.com`.
3. Une adresse invalide est refusée.
4. Les champs trop longs sont refusés.
5. Les valeurs HTML ou SQL dangereuses sont neutralisées.
6. Un doublon de newsletter n’est pas créé.
7. Un nouvel abonné est bien enregistré.
8. Un abonné désinscrit ne reçoit plus de campagne.
9. Une campagne n’est pas envoyée deux fois.
10. Un échec SMTP ne supprime pas le message de la base.
11. Les routes d’administration refusent les visiteurs non authentifiés.
12. Le formulaire fonctionne correctement sur mobile.

Si possible, crée une commande de test qui vérifie la connexion MySQL et la connexion SMTP sans envoyer de message réel. Utilise une adresse de test ou un mode simulé pour les tests automatisés.

## Étape 11 - Déploiement Hostinger

Prépare les éléments nécessaires au déploiement :

- Variables d’environnement à renseigner dans Hostinger.
- Migration de base de données à exécuter.
- Commande de build.
- Commande de démarrage.
- Configuration du port utilisée par Hostinger.
- Configuration de la tâche cron ou de l’endpoint interne de newsletter.
- Vérification que les identifiants MySQL correspondent à la base Hostinger.
- Vérification que la boîte SMTP utilisée existe réellement sur le domaine `itid-france.com`.

Ne crée pas de base ou de boîte email avec des identifiants inventés. Si l’application ne peut pas se connecter, affiche une erreur de configuration claire et indique quelles variables manquent.

## Livrable final attendu

À la fin :

1. Présente la liste des fichiers modifiés.
2. Présente les migrations créées.
3. Présente les nouvelles routes API.
4. Présente les variables d’environnement nécessaires, sans révéler de secrets.
5. Présente les commandes à exécuter en local et sur Hostinger.
6. Explique comment tester un formulaire.
7. Explique comment vérifier qu’un message est bien enregistré.
8. Explique comment vérifier l’inscription à la newsletter.
9. Explique comment publier un contenu de test et vérifier l’envoi automatique.
10. Signale explicitement tout élément que tu n’as pas pu identifier dans le dépôt.

Ne prétends pas qu’un email ou une migration a fonctionné tant que le test correspondant n’a pas réussi. Ne supprime aucune donnée existante et demande confirmation avant toute migration destructive.