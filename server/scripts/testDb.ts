import { testDbConnection, getDbPool } from '../config/db';

async function main() {
  console.log('--- Test de connectivité Base de données MySQL Hostinger ---');
  const result = await testDbConnection();
  if (result.success) {
    console.log('✅', result.message);
    const pool = getDbPool();
    await pool.end();
    process.exit(0);
  } else {
    console.warn('⚠️', result.message);
    console.log('\nPour connecter la base Hostinger :');
    console.log('1. Rendez-vous sur votre panneau Hostinger hPanel > Bases de données MySQL.');
    console.log('2. Renseignez dans le fichier .env : DB_HOST, DB_NAME, DB_USER, DB_PASSWORD.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Erreur :', err);
  process.exit(1);
});
