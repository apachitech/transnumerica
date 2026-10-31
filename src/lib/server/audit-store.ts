import crypto from 'crypto';
import {
  AuditEntityType,
  AuditLogStatus,
  EnhancedAuditLogEntry,
  AuditDiffResult,
  AuditDiffFieldChange,
  AuditVerificationResult,
  SuspiciousActivityAlert,
  SuspiciousPatternType,
  AuditLogFilterParams,
} from '@/types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export class ImmutableAuditLogError extends Error {
  constructor(message = 'VIOLATION D’INTÉGRITÉ : Le journal d’audit est strictement en écriture seule (append-only). Toute modification ou suppression est interdite.') {
    super(message);
    this.name = 'ImmutableAuditLogError';
  }
}

export function calculateBlockHash(data: {
  sequence: number;
  timestamp: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  previousState: any;
  newState: any;
  reason: string;
  ipAddress: string;
  status: string;
  previousHash: string;
}): string {
  const normPrev = typeof data.previousState === 'string'
    ? data.previousState
    : JSON.stringify(data.previousState ?? null);
  const normNew = typeof data.newState === 'string'
    ? data.newState
    : JSON.stringify(data.newState ?? null);

  const payload = [
    data.sequence,
    data.timestamp,
    data.actor,
    data.action,
    data.entityType,
    data.entityId,
    normPrev,
    normNew,
    data.reason,
    data.ipAddress,
    data.status,
    data.previousHash,
  ].join('|');

  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

export interface AuditStoreState {
  entries: EnhancedAuditLogEntry[];
  nextSequence: number;
  acknowledgedAlertIds: Set<string>;
}

declare global {
  var __transnumerica_audit_store: AuditStoreState | undefined;
}

function initAuditStore(): AuditStoreState {
  if (globalThis.__transnumerica_audit_store) {
    return globalThis.__transnumerica_audit_store;
  }

  const store: AuditStoreState = {
    entries: [],
    nextSequence: 1,
    acknowledgedAlertIds: new Set<string>(),
  };

  // Seed realistic historical audit trail with valid cryptographic chain
  const seedRaw: Array<{
    timestamp: string;
    actor: string;
    actorRole?: string;
    action: string;
    entityType: AuditEntityType;
    entityId: string;
    previousState: any;
    newState: any;
    reason: string;
    ipAddress: string;
    userAgent?: string;
    status: AuditLogStatus;
  }> = [
    {
      timestamp: '2026-10-25T08:00:00.000Z',
      actor: 'system@transnumerica.cd',
      actorRole: 'SUPER_ADMIN',
      action: 'SYSTEM_GENESIS_INITIALIZATION',
      entityType: 'SETTINGS',
      entityId: 'genesis-001',
      previousState: null,
      newState: { status: 'INITIALIZED', environment: 'production', region: 'CD-KIN' },
      reason: 'Démarrage du système de journalisation sécurisé Transnumerica RDC',
      ipAddress: '127.0.0.1',
      userAgent: 'Transnumerica-Genesis/1.0',
      status: 'SUCCESS',
    },
    {
      timestamp: '2026-10-25T08:15:22.000Z',
      actor: 'superadmin@transnumerica.cd',
      actorRole: 'SUPER_ADMIN',
      action: 'CONNEXION_ADMIN_RÉUSSIE',
      entityType: 'AUTH',
      entityId: 'session-super-01',
      previousState: { session: null },
      newState: { session: 'ACTIVE', ip: '197.157.208.45', mfa: 'TOTP_VERIFIED' },
      reason: 'Connexion console centrale depuis Kinshasa Gombe',
      ipAddress: '197.157.208.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
      status: 'SUCCESS',
    },
    {
      timestamp: '2026-10-26T09:30:10.000Z',
      actor: 'admin@transnumerica.cd',
      actorRole: 'ADMIN',
      action: 'MISE_À_JOUR_TARIFICATION',
      entityType: 'ROUTE',
      entityId: 'route-kin-lub-01',
      previousState: {
        routeId: 'route-kin-lub-01',
        origin: 'Kinshasa',
        destination: 'Lubumbashi',
        basePriceCDF: 65000,
        currency: 'CDF',
        active: true,
      },
      newState: {
        routeId: 'route-kin-lub-01',
        origin: 'Kinshasa',
        destination: 'Lubumbashi',
        basePriceCDF: 72000,
        currency: 'CDF',
        active: true,
      },
      reason: 'Ajustement carburant et révision semestrielle des coûts d’exploitation',
      ipAddress: '197.157.208.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
      status: 'SUCCESS',
    },
    {
      timestamp: '2026-10-27T14:12:44.000Z',
      actor: 'ANONYMOUS_UNAUTHORIZED',
      action: 'ACCÈS ADMIN REFUSÉ (403)',
      entityType: 'SECURITY',
      entityId: 'access-probe-01',
      previousState: { access: 'PROHIBITED' },
      newState: { access: 'BLOCKED_403', path: '/api/admin/users/export' },
      reason: 'Jeton absent ou rôle insuffisant détecté par le middleware de sécurité',
      ipAddress: '41.243.10.88',
      userAgent: 'curl/8.4.0',
      status: 'DENIED',
    },
    {
      timestamp: '2026-10-27T14:13:05.000Z',
      actor: 'ANONYMOUS_UNAUTHORIZED',
      action: 'ACCÈS ADMIN REFUSÉ (403)',
      entityType: 'SECURITY',
      entityId: 'access-probe-02',
      previousState: { access: 'PROHIBITED' },
      newState: { access: 'BLOCKED_403', path: '/api/admin/system/keys' },
      reason: 'Tentative d’énumération d’API sensible bloquée automatiquement',
      ipAddress: '41.243.10.88',
      userAgent: 'curl/8.4.0',
      status: 'DENIED',
    },
    {
      timestamp: '2026-10-27T14:13:22.000Z',
      actor: 'ANONYMOUS_UNAUTHORIZED',
      action: 'ACCÈS ADMIN REFUSÉ (403)',
      entityType: 'SECURITY',
      entityId: 'access-probe-03',
      previousState: { access: 'PROHIBITED' },
      newState: { access: 'BLOCKED_403', path: '/api/admin/database/dump' },
      reason: 'Tentative d’exfiltration non autorisée neutralisée',
      ipAddress: '41.243.10.88',
      userAgent: 'curl/8.4.0',
      status: 'DENIED',
    },
    {
      timestamp: '2026-10-28T23:45:10.000Z',
      actor: 'superadmin@transnumerica.cd',
      actorRole: 'SUPER_ADMIN',
      action: 'MODIFICATION_MATRICE_PERMISSIONS',
      entityType: 'PERMISSION',
      entityId: 'role-finance',
      previousState: {
        role: 'FINANCE',
        permissionsCount: 8,
        permissions: ['finance.read', 'finance.reports', 'payouts.manage'],
      },
      newState: {
        role: 'FINANCE',
        permissionsCount: 9,
        permissions: ['finance.read', 'finance.reports', 'payouts.manage', 'refunds.approve'],
      },
      reason: 'Autorisation d’urgence pour débloquer les remboursements de nuit (incident route KIN-MAT)',
      ipAddress: '105.101.44.12',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'WARNING',
    },
    {
      timestamp: '2026-10-29T11:20:00.000Z',
      actor: 'support@transnumerica.cd',
      actorRole: 'SUPPORT',
      action: 'MODÉRATION_AVIS_PASSAGER',
      entityType: 'CMS',
      entityId: 'rev-kin-449',
      previousState: { reviewId: 'rev-kin-449', status: 'PENDING_MODERATION', rating: 1 },
      newState: { reviewId: 'rev-kin-449', status: 'HIDDEN', rating: 1, hiddenBy: 'usr-sup-04' },
      reason: 'Contenu inapproprié non conforme à la charte communautaire Transnumerica',
      ipAddress: '197.157.208.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
      status: 'SUCCESS',
    },
    {
      timestamp: '2026-10-29T15:05:00.000Z',
      actor: 'operations@transnumerica.cd',
      actorRole: 'OPERATIONS',
      action: 'SUPPRESSION_LOGIQUE_ARRÊT',
      entityType: 'ROUTE',
      entityId: 'stop-kin-limete-02',
      previousState: { id: 'stop-kin-limete-02', name: 'Limete Échangeur', isDeleted: false },
      newState: { id: 'stop-kin-limete-02', name: 'Limete Échangeur', isDeleted: true },
      reason: 'Travaux de voirie urbaine sur le boulevard Lumumba déviant la ligne',
      ipAddress: '197.157.208.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
      status: 'SUCCESS',
    },
    {
      timestamp: '2026-10-30T10:00:00.000Z',
      actor: 'admin@transnumerica.cd',
      actorRole: 'ADMIN',
      action: 'MISE_À_JOUR_PARAMÈTRES_SYSTÈME',
      entityType: 'SETTINGS',
      entityId: 'settings-business-rules',
      previousState: {
        seatHoldMinutes: 15,
        maxBookingAdvanceDays: 30,
        cancellationFeePercent: 10,
      },
      newState: {
        seatHoldMinutes: 20,
        maxBookingAdvanceDays: 45,
        cancellationFeePercent: 10,
      },
      reason: 'Amélioration de l’expérience de réservation mobile money Vodacom/Airtel',
      ipAddress: '197.157.208.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
      status: 'SUCCESS',
    },
  ];

  let prevHash = GENESIS_HASH;
  for (let i = 0; i < seedRaw.length; i++) {
    const s = seedRaw[i];
    const seq = store.nextSequence++;
    const hash = calculateBlockHash({
      sequence: seq,
      timestamp: s.timestamp,
      actor: s.actor,
      action: s.action,
      entityType: s.entityType,
      entityId: s.entityId,
      previousState: s.previousState,
      newState: s.newState,
      reason: s.reason,
      ipAddress: s.ipAddress,
      status: s.status,
      previousHash: prevHash,
    });

    const entry: EnhancedAuditLogEntry = {
      id: `aud-${String(seq).padStart(6, '0')}`,
      timestamp: s.timestamp,
      adminUser: s.actor,
      actor: s.actor,
      action: s.action,
      target: s.entityId,
      previousState: typeof s.previousState === 'string' ? s.previousState : JSON.stringify(s.previousState),
      newState: typeof s.newState === 'string' ? s.newState : JSON.stringify(s.newState),
      reason: s.reason,
      actorRole: s.actorRole || 'SUPER_ADMIN',
      ipAddress: s.ipAddress,
      userAgent: s.userAgent || 'Mozilla/5.0',
      entityType: s.entityType,
      entityId: s.entityId,
      status: s.status,
      sequenceNumber: seq,
      sequence: seq,
      currentHash: hash,
      hash,
      previousHash: prevHash,
      isVerified: true,
    };

    store.entries.push(entry);
    prevHash = hash;
  }

  globalThis.__transnumerica_audit_store = store;
  return store;
}

export const auditStore = initAuditStore();

// ---------------------- APPEND-ONLY RECORDING ----------------------

export function recordAuditEntry(input: {
  actor: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType?: AuditEntityType;
  entityId?: string;
  previousState?: any;
  newState?: any;
  diffSummary?: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditLogStatus;
}): EnhancedAuditLogEntry {
  const store = initAuditStore();

  const sequence = store.nextSequence++;
  const timestamp = new Date().toISOString();
  const lastEntry = store.entries[store.entries.length - 1];
  const previousHash = lastEntry ? lastEntry.currentHash : GENESIS_HASH;

  const entityType: AuditEntityType = input.entityType || 'SYSTEM';
  const entityId = input.entityId || `ent-${Date.now()}`;
  const ipAddress = input.ipAddress || '127.0.0.1';
  const status: AuditLogStatus = input.status || 'SUCCESS';

  const hash = calculateBlockHash({
    sequence,
    timestamp,
    actor: input.actor,
    action: input.action,
    entityType,
    entityId,
    previousState: input.previousState,
    newState: input.newState,
    reason: input.reason,
    ipAddress,
    status,
    previousHash,
  });

  const prevStr = typeof input.previousState === 'string'
    ? input.previousState
    : JSON.stringify(input.previousState ?? null);
  const newStr = typeof input.newState === 'string'
    ? input.newState
    : JSON.stringify(input.newState ?? null);

  const entry: EnhancedAuditLogEntry = {
    id: `aud-${String(sequence).padStart(6, '0')}`,
    timestamp,
    adminUser: input.actor,
    actor: input.actor,
    action: input.action,
    target: entityId,
    previousState: prevStr,
    newState: newStr,
    reason: input.reason,
    actorRole: input.actorRole || 'SUPER_ADMIN',
    ipAddress,
    userAgent: input.userAgent || 'Mozilla/5.0',
    entityType,
    entityId,
    status,
    sequenceNumber: sequence,
    sequence,
    currentHash: hash,
    hash,
    previousHash,
    isVerified: true,
  };

  store.entries.push(entry);
  return entry;
}

// ---------------------- STRICT IMMUTABILITY GUARDS ----------------------

export function updateAuditEntry(): never {
  throw new ImmutableAuditLogError('Impossible de mettre à jour un enregistrement d’audit : violation de la politique WORM (Write Once, Read Many).');
}

export function deleteAuditEntry(): never {
  throw new ImmutableAuditLogError('Impossible de supprimer un enregistrement d’audit : la chaîne de blocs cryptographique interdit toute suppression.');
}

// ---------------------- QUERY & FILTER ----------------------

export function getEnhancedAuditLogs(params: AuditLogFilterParams = {}) {
  const store = initAuditStore();
  let filtered = [...store.entries];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        (e.actor && e.actor.toLowerCase().includes(q)) ||
        (e.adminUser && e.adminUser.toLowerCase().includes(q)) ||
        e.entityId.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q) ||
        e.ipAddress.toLowerCase().includes(q) ||
        e.currentHash.toLowerCase().includes(q)
    );
  }

  if (params.actor) {
    const act = params.actor.toLowerCase();
    filtered = filtered.filter(
      (e) => (e.actor && e.actor.toLowerCase().includes(act)) || (e.adminUser && e.adminUser.toLowerCase().includes(act))
    );
  }

  if (params.action) {
    const act = params.action.toLowerCase();
    filtered = filtered.filter((e) => e.action.toLowerCase().includes(act));
  }

  if (params.entityType) {
    filtered = filtered.filter((e) => e.entityType === params.entityType);
  }

  if (params.status && params.status !== 'ALL') {
    filtered = filtered.filter((e) => e.status === params.status);
  }

  if (params.ipAddress) {
    filtered = filtered.filter((e) => e.ipAddress.includes(params.ipAddress!));
  }

  if (params.startDate) {
    const start = new Date(params.startDate).getTime();
    filtered = filtered.filter((e) => new Date(e.timestamp).getTime() >= start);
  }

  if (params.endDate) {
    const end = new Date(params.endDate).getTime();
    filtered = filtered.filter((e) => new Date(e.timestamp).getTime() <= end);
  }

  // Sort descending by sequence (latest first)
  filtered.sort((a, b) => b.sequenceNumber - a.sequenceNumber);

  const total = filtered.length;
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize || params.limit || 20));
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    entries: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export function getDeniedAccessLogs(params: AuditLogFilterParams = {}) {
  return getEnhancedAuditLogs({
    ...params,
    status: 'DENIED',
  });
}

export function getAuditEntryById(id: string): EnhancedAuditLogEntry | undefined {
  const store = initAuditStore();
  return store.entries.find((e) => e.id === id || String(e.sequenceNumber) === id || String(e.sequence) === id);
}

// ---------------------- DIFF ENGINE ----------------------

export function getAuditDiff(entryId: string): AuditDiffResult | null {
  const entry = getAuditEntryById(entryId);
  if (!entry) return null;

  let prevObj: any = entry.previousState;
  let newObj: any = entry.newState;

  if (typeof prevObj === 'string') {
    try {
      prevObj = JSON.parse(prevObj);
    } catch {
      // keep raw string
    }
  }

  if (typeof newObj === 'string') {
    try {
      newObj = JSON.parse(newObj);
    } catch {
      // keep raw string
    }
  }

  const changes: AuditDiffFieldChange[] = [];
  const isObject = (val: any) => val !== null && typeof val === 'object' && !Array.isArray(val);

  if (isObject(prevObj) || isObject(newObj)) {
    const p = isObject(prevObj) ? prevObj : {};
    const n = isObject(newObj) ? newObj : {};

    const allKeys = Array.from(new Set([...Object.keys(p), ...Object.keys(n)])).sort();

    for (const key of allKeys) {
      const hasBefore = Object.prototype.hasOwnProperty.call(p, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(n, key);
      const valBefore = p[key];
      const valAfter = n[key];

      if (!hasBefore && hasAfter) {
        changes.push({
          field: key,
          oldValue: null,
          newValue: valAfter,
          type: 'ADDED',
          beforeValue: null,
          afterValue: valAfter,
          changeType: 'ADDED',
        });
      } else if (hasBefore && !hasAfter) {
        changes.push({
          field: key,
          oldValue: valBefore,
          newValue: null,
          type: 'REMOVED',
          beforeValue: valBefore,
          afterValue: null,
          changeType: 'REMOVED',
        });
      } else if (JSON.stringify(valBefore) !== JSON.stringify(valAfter)) {
        changes.push({
          field: key,
          oldValue: valBefore,
          newValue: valAfter,
          type: 'MODIFIED',
          beforeValue: valBefore,
          afterValue: valAfter,
          changeType: 'MODIFIED',
        });
      } else {
        changes.push({
          field: key,
          oldValue: valBefore,
          newValue: valAfter,
          type: 'UNCHANGED',
          beforeValue: valBefore,
          afterValue: valAfter,
          changeType: 'UNCHANGED',
        });
      }
    }
  } else {
    // Scalar comparison
    if (prevObj === null && newObj !== null) {
      changes.push({
        field: 'valeur',
        oldValue: null,
        newValue: newObj,
        type: 'ADDED',
        beforeValue: null,
        afterValue: newObj,
        changeType: 'ADDED',
      });
    } else if (prevObj !== null && newObj === null) {
      changes.push({
        field: 'valeur',
        oldValue: prevObj,
        newValue: null,
        type: 'REMOVED',
        beforeValue: prevObj,
        afterValue: null,
        changeType: 'REMOVED',
      });
    } else if (JSON.stringify(prevObj) !== JSON.stringify(newObj)) {
      changes.push({
        field: 'valeur',
        oldValue: prevObj,
        newValue: newObj,
        type: 'MODIFIED',
        beforeValue: prevObj,
        afterValue: newObj,
        changeType: 'MODIFIED',
      });
    } else {
      changes.push({
        field: 'valeur',
        oldValue: prevObj,
        newValue: newObj,
        type: 'UNCHANGED',
        beforeValue: prevObj,
        afterValue: newObj,
        changeType: 'UNCHANGED',
      });
    }
  }

  return {
    logId: entry.id,
    entryId: entry.id,
    action: entry.action,
    timestamp: entry.timestamp,
    actor: entry.adminUser || entry.actor || 'system',
    target: entry.target || entry.entityId,
    hasDiff: changes.some((c) => c.type !== 'UNCHANGED'),
    changes,
    rawPrevious: prevObj,
    rawNew: newObj,
    currentHash: entry.currentHash,
    previousHash: entry.previousHash,
    sequenceNumber: entry.sequenceNumber,
    sequence: entry.sequenceNumber,
    entityType: entry.entityType,
    entityId: entry.entityId,
    hash: entry.currentHash,
  };
}

// ---------------------- CRYPTOGRAPHIC VERIFICATION ----------------------

export function verifyAuditLogIntegrity(): AuditVerificationResult {
  const store = initAuditStore();
  const entries = [...store.entries].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  if (entries.length === 0) {
    return {
      isValid: true,
      valid: true,
      totalBlocksVerified: 0,
      totalVerified: 0,
      genesisHash: GENESIS_HASH,
      latestHash: GENESIS_HASH,
      brokenLinkIndex: null,
      brokenLogId: null,
      verifiedAt: new Date().toISOString(),
      details: 'Aucun enregistrement d’audit présent.',
      error: null,
    };
  }

  let isValid = true;
  let corruptedSeq: number | null = null;
  let errorMessage: string | null = null;

  for (let i = 0; i < entries.length; i++) {
    const current = entries[i];
    const expectedPrevHash = i === 0 ? GENESIS_HASH : entries[i - 1].currentHash;

    // 1. Verify previous hash linkage
    if (current.previousHash !== expectedPrevHash) {
      isValid = false;
      corruptedSeq = current.sequenceNumber;
      errorMessage = `Rupture du chaînage au bloc #${current.sequenceNumber} : previousHash (${current.previousHash.slice(0, 12)}...) !== hash #${i === 0 ? 'GENESIS' : entries[i - 1].sequenceNumber} (${expectedPrevHash.slice(0, 12)}...).`;
      break;
    }

    // 2. Verify current block SHA-256 integrity
    const recomputedHash = calculateBlockHash({
      sequence: current.sequenceNumber,
      timestamp: current.timestamp,
      actor: current.adminUser || current.actor || '',
      action: current.action,
      entityType: current.entityType,
      entityId: current.entityId,
      previousState: current.previousState,
      newState: current.newState,
      reason: current.reason,
      ipAddress: current.ipAddress,
      status: current.status,
      previousHash: current.previousHash,
    });

    if (current.currentHash !== recomputedHash) {
      isValid = false;
      corruptedSeq = current.sequenceNumber;
      errorMessage = `Altération de données détectée au bloc #${current.sequenceNumber} : hash calculé (${recomputedHash.slice(0, 12)}...) diffère de la signature stockée (${current.currentHash.slice(0, 12)}...).`;
      break;
    }
  }

  const lastEntry = entries[entries.length - 1];

  return {
    isValid,
    valid: isValid,
    totalBlocksVerified: entries.length,
    totalVerified: entries.length,
    genesisHash: GENESIS_HASH,
    latestHash: lastEntry.currentHash,
    firstBlockSequence: entries[0].sequenceNumber,
    lastBlockSequence: lastEntry.sequenceNumber,
    lastBlockHash: lastEntry.currentHash,
    corruptedBlockSequence: corruptedSeq,
    brokenLinkIndex: corruptedSeq !== null ? corruptedSeq - 1 : null,
    brokenLogId: corruptedSeq !== null ? `aud-${String(corruptedSeq).padStart(6, '0')}` : null,
    error: errorMessage,
    verifiedAt: new Date().toISOString(),
    details: isValid
      ? `Tous les ${entries.length} blocs sont valides et vérifiés avec succès.`
      : (errorMessage || 'Erreur d’intégrité détectée.'),
  };
}

// ---------------------- SUSPICIOUS PATTERN DETECTION ----------------------

export function detectSuspiciousPatterns(): SuspiciousActivityAlert[] {
  const store = initAuditStore();
  const alerts: SuspiciousActivityAlert[] = [];

  const entriesChronological = [...store.entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Pattern 1: FAILED_LOGINS_BURST (>= 3 failed/denied logins from same IP or actor within 15 min)
  const failedLogins = entriesChronological.filter(
    (e) =>
      e.action.includes('CONNEXION_ÉCHOUÉE') ||
      (e.entityType === 'AUTH' && e.status === 'DENIED')
  );

  const ipLoginFails: Record<string, EnhancedAuditLogEntry[]> = {};
  for (const log of failedLogins) {
    if (!ipLoginFails[log.ipAddress]) ipLoginFails[log.ipAddress] = [];
    ipLoginFails[log.ipAddress].push(log);
  }

  for (const [ip, logs] of Object.entries(ipLoginFails)) {
    if (logs.length >= 3) {
      for (let i = 0; i <= logs.length - 3; i++) {
        const windowStart = new Date(logs[i].timestamp).getTime();
        const windowEnd = new Date(logs[i + 2].timestamp).getTime();
        if (windowEnd - windowStart <= 15 * 60 * 1000) {
          const alertId = `alt-fl-${ip}-${logs[i].sequenceNumber}`;
          alerts.push({
            id: alertId,
            patternType: 'FAILED_LOGINS_BURST',
            type: 'FAILED_LOGINS_BURST',
            severity: 'CRITICAL',
            title: `Tentatives répétées de connexion (${logs.length} échecs)`,
            description: `${logs.length} tentatives de connexion infructueuses détectées depuis l'adresse IP ${ip} dans une fenêtre restreinte.`,
            detectedAt: logs[logs.length - 1].timestamp,
            timestamp: logs[logs.length - 1].timestamp,
            actor: logs[0].adminUser || logs[0].actor || 'unknown',
            ipAddress: ip,
            eventCount: logs.length,
            relatedLogIds: logs.map((l) => l.id),
            sampleLogIds: logs.map((l) => l.id),
            isAcknowledged: store.acknowledgedAlertIds.has(alertId),
            acknowledged: store.acknowledgedAlertIds.has(alertId),
          });
          break;
        }
      }
    }
  }

  // Pattern 2: UNAUTHORIZED_RESOURCE_PROBE (>= 3 DENIED access attempts from same IP)
  const deniedLogs = entriesChronological.filter((e) => e.status === 'DENIED');
  const ipDenied: Record<string, EnhancedAuditLogEntry[]> = {};
  for (const d of deniedLogs) {
    if (!ipDenied[d.ipAddress]) ipDenied[d.ipAddress] = [];
    ipDenied[d.ipAddress].push(d);
  }

  for (const [ip, logs] of Object.entries(ipDenied)) {
    if (logs.length >= 3) {
      const alertId = `alt-probe-${ip}-${logs[0].sequenceNumber}`;
      alerts.push({
        id: alertId,
        patternType: 'UNAUTHORIZED_RESOURCE_PROBE',
        type: 'UNAUTHORIZED_RESOURCE_PROBE',
        severity: 'HIGH',
        title: `Sonde d'accès non autorisé répétée (${logs.length} rejets)`,
        description: `L'adresse IP ${ip} a cumulé ${logs.length} accès bloqués (403/401) sur des ressources administratives protégées.`,
        detectedAt: logs[logs.length - 1].timestamp,
        timestamp: logs[logs.length - 1].timestamp,
        actor: logs[0].adminUser || logs[0].actor || 'unknown',
        ipAddress: ip,
        eventCount: logs.length,
        relatedLogIds: logs.map((l) => l.id),
        sampleLogIds: logs.map((l) => l.id),
        isAcknowledged: store.acknowledgedAlertIds.has(alertId),
        acknowledged: store.acknowledgedAlertIds.has(alertId),
      });
    }
  }

  // Pattern 3: OFF_HOURS_ROLE_CHANGE (Role / permission changes between 22h00 and 06h00 UTC+1 Africa/Kinshasa)
  const roleChanges = entriesChronological.filter(
    (e) =>
      e.action.includes('RÔLE') ||
      e.action.includes('ROLE') ||
      e.action.includes('PERMISSION') ||
      e.entityType === 'ROLE' ||
      e.entityType === 'PERMISSION'
  );

  for (const rc of roleChanges) {
    const d = new Date(rc.timestamp);
    const utcHour = d.getUTCHours();
    const kinshasaHour = (utcHour + 1) % 24;

    if (kinshasaHour >= 22 || kinshasaHour < 6) {
      const alertId = `alt-offhours-${rc.sequenceNumber}`;
      alerts.push({
        id: alertId,
        patternType: 'OFF_HOURS_ROLE_CHANGE',
        type: 'OFF_HOURS_ROLE_CHANGE',
        severity: 'MEDIUM',
        title: `Modification de privilèges hors heures ouvrées (${kinshasaHour}h00 Kinshasa)`,
        description: `L'acteur ${rc.adminUser || rc.actor} a modifié des privilèges/rôles (${rc.action}) à ${kinshasaHour}h local (heure de Kinshasa).`,
        detectedAt: rc.timestamp,
        timestamp: rc.timestamp,
        actor: rc.adminUser || rc.actor || 'unknown',
        ipAddress: rc.ipAddress,
        eventCount: 1,
        relatedLogIds: [rc.id],
        sampleLogIds: [rc.id],
        isAcknowledged: store.acknowledgedAlertIds.has(alertId),
        acknowledged: store.acknowledgedAlertIds.has(alertId),
      });
    }
  }

  // Pattern 4: BULK_DELETES (>= 3 deletion actions within 10 minutes by same actor)
  const deleteLogs = entriesChronological.filter(
    (e) =>
      e.action.includes('SUPPRESSION') ||
      e.action.includes('DELETE') ||
      e.action.includes('PURGE')
  );

  const actorDeletes: Record<string, EnhancedAuditLogEntry[]> = {};
  for (const del of deleteLogs) {
    const act = del.adminUser || del.actor || 'unknown';
    if (!actorDeletes[act]) actorDeletes[act] = [];
    actorDeletes[act].push(del);
  }

  for (const [actor, logs] of Object.entries(actorDeletes)) {
    if (logs.length >= 3) {
      for (let i = 0; i <= logs.length - 3; i++) {
        const start = new Date(logs[i].timestamp).getTime();
        const end = new Date(logs[i + 2].timestamp).getTime();
        if (end - start <= 10 * 60 * 1000) {
          const alertId = `alt-bulkdel-${actor}-${logs[i].sequenceNumber}`;
          alerts.push({
            id: alertId,
            patternType: 'BULK_DELETES',
            type: 'BULK_DELETES',
            severity: 'HIGH',
            title: `Suppressions groupées suspectes (${logs.length} entités)`,
            description: `L'administrateur ${actor} a exécuté ${logs.length} suppressions rapprochées dans un intervalle de moins de 10 minutes.`,
            detectedAt: logs[logs.length - 1].timestamp,
            timestamp: logs[logs.length - 1].timestamp,
            actor,
            ipAddress: logs[0].ipAddress,
            eventCount: logs.length,
            relatedLogIds: logs.map((l) => l.id),
            sampleLogIds: logs.map((l) => l.id),
            isAcknowledged: store.acknowledgedAlertIds.has(alertId),
            acknowledged: store.acknowledgedAlertIds.has(alertId),
          });
          break;
        }
      }
    }
  }

  return alerts.sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );
}

export function acknowledgeAlert(alertId: string, actor: string, reason: string): boolean {
  const store = initAuditStore();
  store.acknowledgedAlertIds.add(alertId);

  // Record acknowledgment in audit log itself!
  recordAuditEntry({
    actor,
    action: 'ACQUITTEMENT_ALERTE_SÉCURITÉ',
    entityType: 'SECURITY',
    entityId: alertId,
    previousState: { alertId, status: 'OPEN' },
    newState: { alertId, status: 'ACKNOWLEDGED', acknowledgedBy: actor },
    diffSummary: `Alerte de sécurité ${alertId} acquittée.`,
    reason,
    status: 'SUCCESS',
  });

  return true;
}

// ---------------------- EXPORT ENGINE ----------------------

export function exportAuditLogs(
  params: AuditLogFilterParams,
  format: 'csv' | 'json',
  actor: string,
  exportReason: string
): { content: string; filename: string; mimeType: string } {
  const { entries } = getEnhancedAuditLogs({ ...params, pageSize: 5000 });

  // Record the export action in audit log
  recordAuditEntry({
    actor,
    action: 'EXPORTATION_JOURNAL_AUDIT',
    entityType: 'AUDIT',
    entityId: `exp-${Date.now()}`,
    previousState: null,
    newState: { format, count: entries.length, filterParams: params },
    diffSummary: `Export de ${entries.length} entrées d'audit au format ${format.toUpperCase()}.`,
    reason: exportReason,
    status: 'SUCCESS',
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  if (format === 'json') {
    return {
      content: JSON.stringify(
        {
          meta: {
            title: 'Transnumerica RDC - Registre d’Audit Sécurisé',
            exportedAt: new Date().toISOString(),
            exportedBy: actor,
            reason: exportReason,
            totalRecords: entries.length,
            hashAlgorithm: 'SHA-256',
          },
          entries,
        },
        null,
        2
      ),
      filename: `transnumerica-audit-${timestamp}.json`,
      mimeType: 'application/json',
    };
  }

  // CSV format
  const headers = [
    'Sequence',
    'Date_Heure_ISO',
    'Acteur',
    'Role',
    'Action',
    'Type_Entite',
    'ID_Entite',
    'Statut',
    'Adresse_IP',
    'Justification',
    'Hash_SHA256',
    'PreviousHash_SHA256',
  ];

  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = entries.map((e) => [
    e.sequenceNumber,
    escapeCsv(e.timestamp),
    escapeCsv(e.adminUser || e.actor),
    escapeCsv(e.actorRole || 'N/A'),
    escapeCsv(e.action),
    escapeCsv(e.entityType),
    escapeCsv(e.entityId),
    escapeCsv(e.status),
    escapeCsv(e.ipAddress),
    escapeCsv(e.reason),
    escapeCsv(e.currentHash || e.hash),
    escapeCsv(e.previousHash),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  return {
    content: csvContent,
    filename: `transnumerica-audit-${timestamp}.csv`,
    mimeType: 'text/csv; charset=utf-8',
  };
}

// ---------------------- TEST HELPER FOR TAMPER CORRUPTION ----------------------

export function __corruptAuditLogForTesting(sequence: number, corruptedAction: string): void {
  const store = initAuditStore();
  const target = store.entries.find((e) => e.sequenceNumber === sequence || e.sequence === sequence);
  if (target) {
    target.action = corruptedAction;
  }
}

export function __restoreAuditStoreForTesting(): void {
  globalThis.__transnumerica_audit_store = undefined;
  const newStore = initAuditStore();
  if (auditStore) {
    auditStore.entries = newStore.entries;
    auditStore.nextSequence = newStore.nextSequence;
    auditStore.acknowledgedAlertIds = newStore.acknowledgedAlertIds;
  }
}

export function getAuditStoreState(): AuditStoreState {
  return initAuditStore();
}
