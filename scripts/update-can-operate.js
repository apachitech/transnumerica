const fs = require('fs');

let content = fs.readFileSync('src/lib/server/provider-store.ts', 'utf8');

const oldCanOperate = `export function canProviderOperate(provider: ProviderAccount): {
  allowed: boolean;
  reason?: string;
  code?: 'NOT_APPROVED' | 'SUSPENDED' | 'EXPIRED_DOCUMENT' | 'NO_VEHICLE' | 'NO_PAYOUT_ACCOUNT';
} {
  // 1. Must be APPROVED by admin
  if (provider.status !== 'APPROVED') {
    return {
      allowed: false,
      reason: \`Votre compte est actuellement au statut "\${provider.status}". L'approbation administrative de votre dossier KYC est obligatoire pour circuler.\`,
      code: 'NOT_APPROVED',
    };
  }

  // 2. Check for any expired document
  const expiredDoc = provider.documents.find((d) => d.isExpired || d.status === 'EXPIRED');
  if (expiredDoc) {
    return {
      allowed: false,
      reason: \`Opération bloquée : Le document "\${expiredDoc.name}" a expiré. Une mise à jour est requise.\`,
      code: 'EXPIRED_DOCUMENT',
    };
  }`;

const newCanOperate = `export function canProviderOperate(provider: ProviderAccount): {
  allowed: boolean;
  reason?: string;
  code?: 'NOT_APPROVED' | 'SUSPENDED' | 'EXPIRED_DOCUMENT' | 'NO_VEHICLE' | 'NO_PAYOUT_ACCOUNT';
} {
  // 1. Check for any expired document
  const expiredDoc = provider.documents.find((d) => d.isExpired || d.status === 'EXPIRED');
  if (expiredDoc) {
    return {
      allowed: false,
      reason: \`Opération bloquée : Le document "\${expiredDoc.name}" a expiré. Une mise à jour est requise.\`,
      code: 'EXPIRED_DOCUMENT',
    };
  }

  // 2. Suspended status check
  if (provider.status === 'SUSPENDED') {
    return {
      allowed: false,
      reason: provider.suspensionReason || 'Votre compte a été suspendu par l’administration.',
      code: 'SUSPENDED',
    };
  }

  // 3. Must be APPROVED by admin
  if (provider.status !== 'APPROVED') {
    return {
      allowed: false,
      reason: \`Votre compte est actuellement au statut "\${provider.status}". L'approbation administrative de votre dossier KYC est obligatoire pour circuler.\`,
      code: 'NOT_APPROVED',
    };
  }`;

content = content.replace(oldCanOperate, newCanOperate);
fs.writeFileSync('src/lib/server/provider-store.ts', content, 'utf8');

// Update test assertion
let testContent = fs.readFileSync('src/lib/server/provider-store.test.ts', 'utf8');
testContent = testContent.replace(
  /\/Vous ne pouvez pas passer en ligne sans dossier KYC approuvé\//,
  "/L'approbation administrative de votre dossier KYC est obligatoire/"
);
fs.writeFileSync('src/lib/server/provider-store.test.ts', testContent, 'utf8');

console.log('Updated canProviderOperate and provider-store.test.ts');

