<?php
// ======================================================================
// ITID France || Modèle de Configuration (config.sample.php)
// Renommez ou copiez ce fichier en 'config.php' sur votre serveur.
// ======================================================================

return [
    // Choix du pilote : 'sqlite' (zéro configuration) ou 'mysql' (base Hostinger)
    'db_type' => 'sqlite',

    // Paramètres MySQL (uniquement si 'db_type' => 'mysql')
    'mysql_host' => 'localhost',
    'mysql_name' => '',       // ex: u123456789_itid
    'mysql_user' => '',       // ex: u123456789_user
    'mysql_password' => '',       // mot de passe MySQL Hostinger

    // Email de notification réception
    'admin_email' => 'contact@itid-france.com',

    // Identifiants administrateur du back-office
    'admin_user' => 'contact@itid-france.com',
    'admin_pass' => 'AdminItid2026!',
    'jwt_secret' => 'itid_secret_salt_2026_super_secure',
];
