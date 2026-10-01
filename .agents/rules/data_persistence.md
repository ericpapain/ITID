# 🚨 RÈGLE ABSOLUE : PERSISTANCE ET NON-RÉINITIALISATION DES DONNÉES

Sur ce projet, à chaque déploiement, mise à jour de code ou push Git, TOUTES les données existantes DOIVENT IMPÉRATIVEMENT être conservées et cumulatives. Il est STRICTEMENT INTERDIT de réinitialiser la base de données ou de repartir d'un état vierge.

## 1. Données à préserver de manière permanente :
- Les statistiques de visites, sessions, pages vues et historique de fréquentation (Analytics cumulatifs).
- Les messages et demandes reçus via tous les formulaires de contact.
- La liste des abonnés à la newsletter.
- Les comptes administrateurs, configurations et contenus CMS personnalisés.

## 2. Règles d'architecture obligatoires :
- **Emplacement de la base de données :** Le fichier de base de données (SQLite) ne doit JAMAIS être placé dans le répertoire public écrasé par les déploiements Git/FTP (ex: `public_html/` ou `dist/`). Il doit être stocké en dehors du webroot (ex: `../itid_data/itid.sqlite`) ou utiliser une base MySQL persistante.
- **Protection Git :** Aucun fichier de base de données (`*.sqlite`, `*.db`, `*.sqlite3`) ne doit être suivi ou écrasé par Git. Le fichier `.gitignore` doit systématiquement ignorer ces fichiers.
- **Migration & Auto-Récupération :** À chaque démarrage ou mise à jour, le script de connexion DB (`db.php`) doit vérifier si la base active existe et contient des données. Si une base vide est détectée alors qu'une base avec historique existe ailleurs, le système doit automatiquement restaurer/migrer les données existantes au lieu de créer une base neuve à zéro.
- **Mode Cumulatif :** Les compteurs (visiteurs du jour, total des messages, historique) s'incrémentent continuellement et ne doivent jamais être réinitialisés lors d'un build ou redémarrage de serveur.
