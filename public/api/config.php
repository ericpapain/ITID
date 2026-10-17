<?php
// ======================================================================
// ITID France — Configuration de la base de données & Administration
// ======================================================================
// Ce fichier permet de choisir le mode de stockage :
// - 'sqlite' : Fonctionne immédiatement à 100% sur Hostinger sans aucune
//              création de base de données (recommandé par défaut).
// - 'mysql'  : Si vous avez créé une base de données MySQL dans le hPanel Hostinger.
// ======================================================================

$envHost = getenv('DB_HOST') ?: (isset($_ENV['DB_HOST']) ? $_ENV['DB_HOST'] : 'localhost');
$envName = getenv('DB_NAME') ?: (isset($_ENV['DB_NAME']) ? $_ENV['DB_NAME'] : '');
$envUser = getenv('DB_USER') ?: (isset($_ENV['DB_USER']) ? $_ENV['DB_USER'] : '');
$envPass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : (isset($_ENV['DB_PASSWORD']) ? $_ENV['DB_PASSWORD'] : '');

$hasMysqlEnv = !empty($envName) && !empty($envUser);

return [
    // Choix du pilote : 'mysql' en priorité si configuré, sinon 'sqlite'
    'db_type'     => $hasMysqlEnv ? 'mysql' : 'sqlite',

    // ====================================================================
    // PERSISTANCE SQLITE — IMPORTANT POUR ÉVITER LA PERTE DE DONNÉES
    // ====================================================================
    'sqlite_path' => __DIR__ . '/data/itid.sqlite',

    // Paramètres MySQL (lus depuis l'environnement Hostinger ou renseignés ici)
    'mysql_host'     => $envHost ?: 'localhost',
    'mysql_name'     => $envName ?: '',       // ex: u123456789_itid
    'mysql_user'     => $envUser ?: '',       // ex: u123456789_user
    'mysql_password' => $envPass ?: '',       // mot de passe MySQL Hostinger

    // Email de notification réception
    'admin_email' => 'contact@itid-france.com',

    // Identifiants administrateur du back-office
    'admin_user'  => 'contact@itid-france.com',
    'admin_pass'  => 'AdminItid2026!',
    'jwt_secret'  => 'itid_secret_salt_2026_super_secure',
];

