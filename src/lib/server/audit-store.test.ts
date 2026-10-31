import { describe, it, expect, beforeEach } from 'vitest';
import {
  auditStore,
  recordAuditEntry,
  updateAuditEntry,
  deleteAuditEntry,
  verifyAuditLogIntegrity,
  getAuditDiff,
  detectSuspiciousPatterns,
  exportAuditLogs,
  ImmutableAuditLogError,
  __corruptAuditLogForTesting,
  __restoreAuditStoreForTesting,
  GENESIS_HASH,
} from './audit-store';

describe('Audit Store - Immutability & Tamper Evidence', () => {
  beforeEach(() => {
    __restoreAuditStoreForTesting();
  });

  it('prohibits modification and deletion through immutability guards', () => {
    expect(() => updateAuditEntry()).toThrow(ImmutableAuditLogError);
    expect(() => deleteAuditEntry()).toThrow(ImmutableAuditLogError);
  });

  it('builds a cryptographically valid hash chain upon initialization', () => {
    const verification = verifyAuditLogIntegrity();
    expect(verification.valid).toBe(true);
    expect(verification.totalVerified).toBeGreaterThan(0);
    expect(verification.corruptedBlockSequence).toBeNull();
    expect(verification.error).toBeNull();
  });

  it('correctly appends new blocks linked to the previous block hash', () => {
    const preCheck = verifyAuditLogIntegrity();
    const lastHashBefore = preCheck.lastBlockHash;

    const newEntry = recordAuditEntry({
      actor: 'superadmin@transnumerica.cd',
      action: 'AJOUT_LIGNE_TEST',
      entityType: 'ROUTE',
      entityId: 'route-test-01',
      previousState: null,
      newState: { name: 'Gbadolite - Kisangani', distanceKm: 650 },
      reason: 'Ouverture ligne commerciale test',
      ipAddress: '197.157.208.45',
      status: 'SUCCESS',
    });

    expect(newEntry.previousHash).toBe(lastHashBefore);
    expect(newEntry.hash).toHaveLength(64); // SHA-256 hex string

    const postCheck = verifyAuditLogIntegrity();
    expect(postCheck.valid).toBe(true);
    expect(postCheck.lastBlockSequence).toBe(newEntry.sequence);
    expect(postCheck.lastBlockHash).toBe(newEntry.hash);
  });

  it('detects tampering and breaks hash verification if a historical entry is modified', () => {
    // 1. Initial chain is valid
    expect(verifyAuditLogIntegrity().valid).toBe(true);

    // 2. Corrupt block #2 by changing its action
    __corruptAuditLogForTesting(2, 'FRAUDULENT_ACTION_MUTATED_DIRECTLY_IN_DATABASE');

    // 3. Verification must fail
    const corruptedCheck = verifyAuditLogIntegrity();
    expect(corruptedCheck.valid).toBe(false);
    expect(corruptedCheck.corruptedBlockSequence).toBe(2);
    expect(corruptedCheck.error).toContain('Altération de données détectée au bloc #2');
  });

  it('computes accurate before/after diffs highlighting added, modified, and removed fields', () => {
    const entry = recordAuditEntry({
      actor: 'finance@transnumerica.cd',
      action: 'AJUSTEMENT_TAUX_COMMISSION',
      entityType: 'SETTINGS',
      entityId: 'commission-rates',
      previousState: {
        operatorRate: 8.5,
        currency: 'CDF',
        legacyField: 'to-be-removed',
      },
      newState: {
        operatorRate: 10.0,
        currency: 'CDF',
        newPromotion: 'FÊTES_FIN_ANNÉE',
      },
      reason: 'Mise à niveau contractuelle opérateurs',
      status: 'SUCCESS',
    });

    const diff = getAuditDiff(entry.id);
    expect(diff).not.toBeNull();
    expect(diff?.entryId).toBe(entry.id);

    const changes = diff!.changes;
    const rateChange = changes.find((c) => c.field === 'operatorRate');
    expect(rateChange).toBeDefined();
    expect(rateChange?.changeType).toBe('MODIFIED');
    expect(rateChange?.beforeValue).toBe(8.5);
    expect(rateChange?.afterValue).toBe(10.0);

    const currencyChange = changes.find((c) => c.field === 'currency');
    expect(currencyChange?.changeType).toBe('UNCHANGED');

    const removedChange = changes.find((c) => c.field === 'legacyField');
    expect(removedChange?.changeType).toBe('REMOVED');
    expect(removedChange?.beforeValue).toBe('to-be-removed');

    const addedChange = changes.find((c) => c.field === 'newPromotion');
    expect(addedChange?.changeType).toBe('ADDED');
    expect(addedChange?.afterValue).toBe('FÊTES_FIN_ANNÉE');
  });

  it('detects suspicious activity patterns: burst failed logins', () => {
    const maliciousIp = '196.201.214.99';
    const now = Date.now();

    // Generate 3 failed logins within 5 minutes
    for (let i = 0; i < 3; i++) {
      recordAuditEntry({
        actor: 'hacker@target.cd',
        action: 'CONNEXION_ÉCHOUÉE',
        entityType: 'AUTH',
        entityId: 'failed-session',
        reason: 'Mot de passe erroné (force brute)',
        ipAddress: maliciousIp,
        status: 'DENIED',
      });
    }

    const alerts = detectSuspiciousPatterns();
    const burstAlert = alerts.find(
      (a) => a.type === 'FAILED_LOGINS_BURST' && a.ipAddress === maliciousIp
    );
    expect(burstAlert).toBeDefined();
    expect(burstAlert?.severity).toBe('CRITICAL');
    expect(burstAlert?.eventCount).toBe(3);
  });

  it('detects off-hours role changes (between 22h and 06h UTC+1 Kinshasa time)', () => {
    const alerts = detectSuspiciousPatterns();
    // Seed data already contains a 23h45 Kinshasa role modification
    const offHoursAlert = alerts.find((a) => a.type === 'OFF_HOURS_ROLE_CHANGE');
    expect(offHoursAlert).toBeDefined();
    expect(offHoursAlert?.title).toContain('hors heures ouvrées');
  });

  it('detects bulk deletes executed within 10 minutes by the same actor', () => {
    const rogueActor = 'rogue_ops@transnumerica.cd';

    for (let i = 0; i < 3; i++) {
      recordAuditEntry({
        actor: rogueActor,
        action: 'SUPPRESSION_DÉFINITIVE_TICKET',
        entityType: 'BOOKING',
        entityId: `ticket-delete-${i}`,
        reason: 'Purge manuelle non planifiée',
        ipAddress: '10.0.0.99',
        status: 'SUCCESS',
      });
    }

    const alerts = detectSuspiciousPatterns();
    const bulkAlert = alerts.find(
      (a) => a.type === 'BULK_DELETES' && a.actor === rogueActor
    );
    expect(bulkAlert).toBeDefined();
    expect(bulkAlert?.severity).toBe('HIGH');
    expect(bulkAlert?.eventCount).toBe(3);
  });

  it('exports audit logs in CSV and JSON formats and logs the export event', () => {
    const preCount = auditStore.entries.length;

    const csvResult = exportAuditLogs(
      {},
      'csv',
      'auditor@transnumerica.cd',
      'Rapport trimestriel de conformité RGPD/RDC'
    );

    expect(csvResult.mimeType).toContain('text/csv');
    expect(csvResult.filename).toMatch(/^transnumerica-audit-.*\.csv$/);
    expect(csvResult.content).toContain('Sequence,Date_Heure_ISO,Acteur');
    expect(csvResult.content).toContain('Hash_SHA256');

    // The export itself must have been appended as an immutable audit record!
    expect(auditStore.entries.length).toBe(preCount + 1);
    const lastLog = auditStore.entries[auditStore.entries.length - 1];
    expect(lastLog.action).toBe('EXPORTATION_JOURNAL_AUDIT');
    expect(lastLog.actor).toBe('auditor@transnumerica.cd');

    // Test JSON export
    const jsonResult = exportAuditLogs(
      {},
      'json',
      'auditor@transnumerica.cd',
      'Extraction technique format JSON'
    );
    expect(jsonResult.mimeType).toBe('application/json');
    const parsed = JSON.parse(jsonResult.content);
    expect(parsed.meta.hashAlgorithm).toBe('SHA-256');
    expect(Array.isArray(parsed.entries)).toBe(true);
  });
});

