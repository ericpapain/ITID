import { testSmtpConnection } from '../config/mail';

async function main() {
  console.log('--- Test de connectivité SMTP Hostinger (itid-france.com) ---');
  const result = await testSmtpConnection();
  if (result.success) {
    console.log('✅', result.message);
    process.exit(0);
  } else {
    console.warn('⚠️', result.message);
    console.log('\nPour configurer les emails Hostinger :');
    console.log('1. Rendez-vous sur Hostinger hPanel > Emails.');
    console.log('2. Renseignez dans le fichier .env : SMTP_USER (ex: contact@itid-france.com) et SMTP_PASSWORD.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Erreur :', err);
  process.exit(1);
});
