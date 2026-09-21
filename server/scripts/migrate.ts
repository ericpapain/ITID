import fs from 'fs';
import path from 'path';
import { getDbPool, testDbConnection } from '../config/db';

async function runMigration() {
  console.log('--- Lancement des migrations MySQL ITID France ---');

  const connTest = await testDbConnection();
  if (!connTest.success) {
    console.error('❌ Impossible de se connecter à MySQL :');
    console.error(connTest.message);
    process.exit(1);
  }

  const sqlPath = path.resolve(process.cwd(), 'server/migrations/001_init_schema.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Séparation des requêtes SQL par point-virgule
  const statements = sqlContent
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    console.log(`Exécution de ${statements.length} requêtes SQL...`);
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('✅ Migrations MySQL appliquées avec succès !');
  } catch (error: any) {
    console.error('❌ Erreur lors de la migration SQL :', error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error('Erreur inattendue :', err);
  process.exit(1);
});
