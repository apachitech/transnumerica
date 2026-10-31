/**
 * Transnumerica Safe Super Admin Seed Script
 * 
 * Usage:
 *   $env:SUPER_ADMIN_EMAIL="direction@transnumerica.cd"
 *   $env:SUPER_ADMIN_PHONE="+243810000001"
 *   $env:SUPER_ADMIN_PASSWORD="StrongSecurePassword2026!"
 *   node scripts/seed-super-admin.js
 */

const crypto = require('crypto');

function generateSecureRandomKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

console.log('=================================================================');
console.log(' TRANSNUMERICA DR CONGO — SUPER ADMIN SEED & HARDENING GENERATOR');
console.log('=================================================================');

const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@transnumerica.cd';
const phone = process.env.SUPER_ADMIN_PHONE || '+243810000001';
const password = process.env.SUPER_ADMIN_PASSWORD || 'Transnumerica@RDC2026!';
const salt = crypto.randomBytes(16).toString('hex');
const passwordHash = hashPassword(password, salt);
const totpSecret = process.env.SUPER_ADMIN_TOTP_SECRET || 'JBSWY3DPEHPK3PXP';

console.log('\n[INFO] Configuration du compte racine SUPER_ADMIN générée :');
console.log(`- Email racine     : ${email}`);
console.log(`- Téléphone RDC    : ${phone}`);
console.log(`- Statut 2FA       : MANDATORY (Obligatoire)`);
console.log(`- Secret TOTP      : ${totpSecret}`);
console.log(`- Sel PBKDF2 (Salt): ${salt}`);
console.log(`- Empreinte Hachée : ${passwordHash.slice(0, 32)}... (SHA-512)`);

console.log('\n[SÉCURITÉ] Variables d\'environnement recommandées pour production (.env.production) :');
console.log(`SUPER_ADMIN_EMAIL="${email}"`);
console.log(`SUPER_ADMIN_PHONE="${phone}"`);
console.log(`SUPER_ADMIN_PASSWORD="${password}"`);
console.log(`SUPER_ADMIN_TOTP_SECRET="${totpSecret}"`);
console.log('ADMIN_IP_ALLOWLIST=""  # Optionnel: Liste blanche d\'adresses IP autorisées séparées par des virgules');

console.log('\n[INSTRUCTIONS] :');
console.log('1. Définissez ces variables d\'environnement sur votre serveur sécurisé.');
console.log('2. Connectez-vous via l\'URL sécurisée: /admin/login');
console.log('3. Saisissez votre identifiant et votre mot de passe, puis validez avec le code 2FA.');
console.log('4. Après la première connexion, révoquez le mot de passe initial et configurez votre application TOTP (Google Authenticator).');
console.log('=================================================================\n');

