<?php
// ======================================================================
// ITID France — Configuration de la base de données & Administration
// ======================================================================
// Ce fichier permet de choisir le mode de stockage :
// - 'sqlite' : Fonctionne immédiatement à 100% sur Hostinger sans aucune
//              création de base de données (recommandé par défaut).
// - 'mysql'  : Si vous avez créé une base de données MySQL dans le hPanel Hostinger.
// ======================================================================

return [
    // Choix du pilote : 'sqlite' (zéro configuration) ou 'mysql'
    'db_type'     => 'sqlite',

    // ====================================================================
    // PERSISTANCE SQLITE — IMPORTANT POUR ÉVITER LA PERTE DE DONNÉES
    // ====================================================================
    // Définissez ici un chemin ABSOLU vers un dossier HORS du webroot
    // sur Hostinger. Ce dossier ne sera jamais écrasé lors d'un déploiement.
    //
    // Pour trouver votre chemin sur Hostinger :
    //   1. Connectez-vous à hPanel > File Manager
    //   2. Remontez au niveau de 'domains' (au-dessus de public_html)
    //   3. Créez un dossier 'itid_data' à cet endroit
    //   4. Le chemin ressemble à : /home/uXXXXXX/domains/itid-france.com/itid_data/itid.sqlite
    //
    // Tant que ce champ est vide, le système choisit automatiquement
    // le meilleur emplacement disponible hors du webroot.
    'sqlite_path' => '',

    // Paramètres MySQL (uniquement si 'db_type' => 'mysql')
    'mysql_host'     => 'localhost',
    'mysql_name'     => '',       // ex: u123456789_itid
    'mysql_user'     => '',       // ex: u123456789_user
    'mysql_password' => '',       // mot de passe MySQL Hostinger

    // Email de notification réception
    'admin_email' => 'contact@itid-france.com',

    // Identifiants administrateur du back-office
    'admin_user'  => 'contact@itid-france.com',
    'admin_pass'  => 'AdminItid2026!',
    'jwt_secret'  => 'itid_secret_salt_2026_super_secure',
];

