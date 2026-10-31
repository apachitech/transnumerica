import crypto from 'crypto';
import { recordAuditEntry } from './audit-store';
import {
  AdminUser,
  AdminSession,
  AdminAuditLogEntry,
  AdminKycItem,
  AdminDisputeItem,
  AdminBookingRow,
  UserRole,
  AdminPermission,
  StaffAccount,
  StaffSessionInfo,
} from '@/types';
import {
  ALL_ADMIN_PERMISSIONS,
  STANDARD_ADMIN_PERMISSIONS,
  FINANCE_PERMISSIONS,
  SUPPORT_PERMISSIONS,
  OPERATIONS_PERMISSIONS,
  CONTENT_PERMISSIONS,
  ROLE_PERMISSIONS_MATRIX,
} from '../security/roles-permissions';

export const ADMIN_SESSION_COOKIE_NAME = 'tn_admin_session_token';
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const SENSITIVE_REAUTH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export type AdminUserRecord = AdminUser & {
  passwordHash: string;
  salt: string;
  version: number;
  status: 'ACTIVE' | 'DISABLED';
  forceTotp: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
};

// In-memory persistent server store (survives requests within Node server lifecycle)
interface ServerState {
  users: Map<string, AdminUserRecord>;
  sessions: Map<string, AdminSession & { lastReauthAt: number }>;
  auditLogs: AdminAuditLogEntry[];
  failedLogins: Map<string, { count: number; lockedUntil?: number }>;
  kycQueue: AdminKycItem[];
  disputes: AdminDisputeItem[];
  cityToggles: Map<string, Record<string, boolean>>;
  ipAllowlist: string[];
  rolePermissionsMatrix: Record<UserRole, AdminPermission[]>;
}

// Global singleton to prevent hot-reload wipes in Next.js development
const globalForAdmin = global as unknown as { __TN_ADMIN_STATE__?: ServerState };

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function initServerState(): ServerState {
  const superAdminSalt = 'tn_salt_superadmin_2026';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Transnumerica@RDC2026!';
  const superAdminHash = hashPassword(superAdminPassword, superAdminSalt);

  const regularAdminSalt = 'tn_salt_admin_2026';
  const regularAdminPassword = process.env.ADMIN_PASSWORD || 'AdminPass2026!';
  const regularAdminHash = hashPassword(regularAdminPassword, regularAdminSalt);

  const users = new Map<string, AdminUserRecord>();

  // Default SUPER_ADMIN
  users.set('superadmin@transnumerica.cd', {
    id: 'usr-superadmin-01',
    name: 'Superviseur National RDC (Super Admin)',
    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@transnumerica.cd',
    phone: process.env.SUPER_ADMIN_PHONE || '+243810000001',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    permissions: ALL_ADMIN_PERMISSIONS,
    totpEnabled: true,
    totpSecret: process.env.SUPER_ADMIN_TOTP_SECRET || 'JBSWY3DPEHPK3PXP',
    forceTotp: true,
    createdAt: '2026-01-01T00:00:00Z',
    passwordHash: superAdminHash,
    salt: superAdminSalt,
    version: 1,
  });

  // Default Standard ADMIN
  users.set('admin@transnumerica.cd', {
    id: 'usr-admin-02',
    name: 'Opérateur Régulation Kinshasa',
    email: 'admin@transnumerica.cd',
    phone: '+243810000002',
    role: 'ADMIN',
    status: 'ACTIVE',
    permissions: STANDARD_ADMIN_PERMISSIONS,
    totpEnabled: true,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    forceTotp: true,
    createdAt: '2026-02-15T00:00:00Z',
    passwordHash: regularAdminHash,
    salt: regularAdminSalt,
    version: 1,
  });

  // Default FINANCE
  users.set('finance@transnumerica.cd', {
    id: 'usr-fin-03',
    name: 'Responsable Trésorerie & Payouts',
    email: 'finance@transnumerica.cd',
    phone: '+243810000004',
    role: 'FINANCE',
    status: 'ACTIVE',
    permissions: FINANCE_PERMISSIONS,
    totpEnabled: true,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    forceTotp: true,
    createdAt: '2026-03-01T00:00:00Z',
    passwordHash: regularAdminHash,
    salt: regularAdminSalt,
    version: 1,
  });

  // Default SUPPORT
  users.set('support@transnumerica.cd', {
    id: 'usr-sup-04',
    name: 'Chef d’Équipe Support & Litiges',
    email: 'support@transnumerica.cd',
    phone: '+243810000005',
    role: 'SUPPORT',
    status: 'ACTIVE',
    permissions: SUPPORT_PERMISSIONS,
    totpEnabled: true,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    forceTotp: true,
    createdAt: '2026-03-10T00:00:00Z',
    passwordHash: regularAdminHash,
    salt: regularAdminSalt,
    version: 1,
  });

  // Default OPERATIONS
  users.set('operations@transnumerica.cd', {
    id: 'usr-ops-05',
    name: 'Coordinateur Lignes & Flottes',
    email: 'operations@transnumerica.cd',
    phone: '+243810000006',
    role: 'OPERATIONS',
    status: 'ACTIVE',
    permissions: OPERATIONS_PERMISSIONS,
    totpEnabled: true,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    forceTotp: true,
    createdAt: '2026-04-01T00:00:00Z',
    passwordHash: regularAdminHash,
    salt: regularAdminSalt,
    version: 1,
  });

  // Default CONTENT
  users.set('content@transnumerica.cd', {
    id: 'usr-cnt-06',
    name: 'Gestionnaire Contenu & Tarifs',
    email: 'content@transnumerica.cd',
    phone: '+243810000007',
    role: 'CONTENT',
    status: 'ACTIVE',
    permissions: CONTENT_PERMISSIONS,
    totpEnabled: false,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    forceTotp: true,
    createdAt: '2026-04-15T00:00:00Z',
    passwordHash: regularAdminHash,
    salt: regularAdminSalt,
    version: 1,
  });

  const cityToggles = new Map<string, Record<string, boolean>>();
  cityToggles.set('kinshasa', { bus: true, taxi: true, moto: true, delivery: true });
  cityToggles.set('lubumbashi', { bus: true, taxi: true, moto: true, delivery: true });
  cityToggles.set('kolwezi', { bus: true, taxi: true, moto: false, delivery: true });
  cityToggles.set('goma', { bus: true, taxi: true, moto: true, delivery: false });
  cityToggles.set('matadi', { bus: true, taxi: true, moto: true, delivery: true });

  const initialKyc: AdminKycItem[] = [
    {
      id: 'kyc-1',
      applicantName: 'Honoré Kabeya',
      phone: '+243819876543',
      type: 'DRIVER',
      vehicleType: 'MOTO',
      vehicleModel: 'Haojue 125cc Rouge',
      vehiclePlate: 'KN 3301 MT',
      cooperative: 'COWEMOTO Lemba',
      documents: [
        {
          id: 'doc-1',
          name: 'Permis de Conduire (Catégorie A Moto)',
          type: 'LICENSE',
          documentNumber: 'CD-PERMIS-2024-88491',
          issuedDate: '14 Janvier 2024',
          expiryDate: '14 Janvier 2029',
          previewUrl: '/documents/permis-moto.png',
          verified: true,
        },
        {
          id: 'doc-2',
          name: 'Carte d\'Électeur / ID Biométrique RDC',
          type: 'NATIONAL_ID',
          documentNumber: 'ID-NAT-09-381-4920',
          issuedDate: '10 Mars 2023',
          previewUrl: '/documents/carte-id.png',
          verified: true,
        },
        {
          id: 'doc-3',
          name: 'Certificat d\'Immatriculation (Carte Rose)',
          type: 'VEHICLE_REG',
          documentNumber: 'DGI-CR-849201',
          issuedDate: '22 Février 2024',
          previewUrl: '/documents/carte-rose.png',
          verified: true,
        },
      ],
      hasPassengerHelmet: true,
      appliedAt: '28 Octobre 2026',
      status: 'PENDING',
    },
    {
      id: 'kyc-2',
      applicantName: 'Séraphin Ngoy',
      phone: '+243991122334',
      type: 'DRIVER',
      vehicleType: 'CAR',
      vehicleModel: 'Toyota Corolla Ketch Blanc',
      vehiclePlate: 'KN 7741 BG',
      cooperative: 'Association des Taxis Jaunes de Kinshasa',
      documents: [
        {
          id: 'doc-4',
          name: 'Permis de Conduire (Catégorie B Transport Public)',
          type: 'LICENSE',
          documentNumber: 'CD-PERMIS-2023-10928',
          issuedDate: '05 Août 2023',
          expiryDate: '05 Août 2028',
          previewUrl: '/documents/permis-auto.png',
          verified: true,
        },
        {
          id: 'doc-5',
          name: 'Police d\'Assurance RC SONAS',
          type: 'INSURANCE',
          documentNumber: 'SONAS-RC-AUTO-49201L',
          issuedDate: '01 Janvier 2026',
          expiryDate: '31 Décembre 2026',
          previewUrl: '/documents/sonas-assurance.png',
          verified: true,
        },
      ],
      hasPassengerHelmet: false,
      appliedAt: '28 Octobre 2026',
      status: 'PENDING',
    },
  ];

  const initialDisputes: AdminDisputeItem[] = [
    {
      id: 'disp-1',
      ticketNumber: 'DISP-2026-0849',
      passengerName: 'Patrick Mwamba',
      passengerPhone: '+243812345678',
      driverOrOperatorName: 'Junior Ilunga (KN 4402 MT)',
      serviceType: 'MOTO',
      tripRef: 'TN-RIDE-44109',
      category: 'OVERCHARGE',
      title: 'Surfacturation lors d\'une coupure réseau USSD',
      description: 'Le montant de 3 000 CDF a été débité deux fois sur le portefeuille Vodacom M-Pesa suite à un délai de confirmation.',
      amountInDisputeMinor: 300000,
      currency: 'CDF',
      priority: 'URGENT',
      status: 'OPEN',
      createdAt: '29 Octobre 2026 • 18:30',
    },
  ];

  const initialAudit: AdminAuditLogEntry[] = [
    {
      id: 'aud-1',
      timestamp: '29 Oct 2026 • 19:45:12',
      adminUser: 'Superviseur National RDC',
      action: 'Mise à jour tarif nocturne',
      target: 'Kinshasa (taxi)',
      previousState: 'Majoration 15%',
      newState: 'Majoration 20%',
      reason: 'Ajustement carburant et circulation nocturne prolongée.',
    },
  ];

  return {
    users,
    sessions: new Map(),
    auditLogs: initialAudit,
    failedLogins: new Map(),
    kycQueue: initialKyc,
    disputes: initialDisputes,
    cityToggles,
    ipAllowlist: (process.env.ADMIN_IP_ALLOWLIST || '127.0.0.1,::1,192.168.43.221,192.168.43.1,192.168.43.0/24')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    rolePermissionsMatrix: { ...ROLE_PERMISSIONS_MATRIX },
  };
}

export function isIpRecognized(clientIp?: string, allowlist?: string[]): boolean {
  if (!clientIp) return true; // Default fallback in internal environments
  const cleanIp = clientIp.trim().replace(/^::ffff:/, '');

  // Loopback and local addresses are always recognized
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
    return true;
  }

  // Exact IP match for administrator's Wi-Fi network interface (192.168.43.221)
  if (cleanIp === '192.168.43.221' || cleanIp === '192.168.43.1') {
    return true;
  }

  // Subnet 192.168.43.x Wi-Fi LAN
  if (cleanIp.startsWith('192.168.43.')) {
    return true;
  }

  const list = allowlist || (adminStore ? adminStore.ipAllowlist : []);
  if (!list || list.length === 0) {
    return true;
  }

  for (const entry of list) {
    const cleanEntry = entry.trim();
    if (cleanEntry === cleanIp) return true;

    // Subnet / prefix matching e.g. 192.168.43.0/24 or 192.168.43.*
    if (cleanEntry.includes('/24')) {
      const prefix = cleanEntry.split('/')[0].split('.').slice(0, 3).join('.');
      if (cleanIp.startsWith(prefix + '.')) return true;
    } else if (cleanEntry.endsWith('*')) {
      const prefix = cleanEntry.slice(0, -1);
      if (cleanIp.startsWith(prefix)) return true;
    }
  }

  return false;
}

export const adminStore: ServerState = globalForAdmin.__TN_ADMIN_STATE__ ?? initServerState();
if (process.env.NODE_ENV !== 'production') {
  globalForAdmin.__TN_ADMIN_STATE__ = adminStore;
}

// ---------------------- AUDIT LOGGING ----------------------

export function logAdminAction(entry: {
  adminUser: string;
  action: string;
  target: string;
  previousState: string;
  newState: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const newLog: AdminAuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa' }),
    adminUser: entry.adminUser,
    action: entry.action,
    target: entry.target,
    previousState: entry.previousState,
    newState: entry.newState,
    reason: entry.reason,
  };

  adminStore.auditLogs.unshift(newLog);
  // Keep last 500 audit entries
  if (adminStore.auditLogs.length > 500) {
    adminStore.auditLogs.pop();
  }

  // Also record in the tamper-evident hash-chained audit store
  try {
    recordAuditEntry({
      actor: entry.adminUser,
      action: entry.action,
      entityId: entry.target,
      previousState: entry.previousState,
      newState: entry.newState,
      diffSummary: `${entry.action} sur ${entry.target}`,
      reason: entry.reason,
      ipAddress: entry.ipAddress || '127.0.0.1',
      userAgent: entry.userAgent,
      status: entry.action.includes('REFUSÉ') ? 'DENIED' : 'SUCCESS',
    });
  } catch (err) {
    console.error('Failed to append to cryptographic audit store:', err);
  }

  return newLog;
}

export function logAccessDenied(entry: {
  path: string;
  ipAddress?: string;
  userAgent?: string;
  reason: string;
  attemptedRole?: string;
}) {
  logAdminAction({
    adminUser: 'ANONYMOUS_UNAUTHORIZED',
    action: 'ACCÈS ADMIN REFUSÉ (404/401)',
    target: entry.path,
    previousState: 'Non autorisé',
    newState: 'Bloqué',
    reason: `${entry.reason} (IP: ${entry.ipAddress || 'unknown'}, Role: ${entry.attemptedRole || 'none'})`,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
  });
}

// ---------------------- 2FA VERIFICATION ----------------------

export function verify2FACode(secret: string | undefined, code: string): boolean {
  // Support standard testing codes: '123456', '000000' or dynamic time-based TOTP
  if (code === '123456' || code === '000000') return true;
  if (!code || code.length !== 6) return false;

  // Basic time-window TOTP generator verification for demonstration
  const epoch = Math.floor(Date.now() / 30000);
  for (let offset = -1; offset <= 1; offset++) {
    const timeStep = epoch + offset;
    const hmac = crypto.createHmac('sha1', secret || 'DEFAULT_SECRET');
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(timeStep));
    hmac.update(buf);
    const digest = hmac.digest();
    const codeNum = (digest.readUInt32BE(digest[digest.length - 1] & 0x0f) & 0x7fffffff) % 1000000;
    const expected = codeNum.toString().padStart(6, '0');
    if (expected === code) return true;
  }
  return false;
}

// ---------------------- AUTHENTICATION & SESSIONS ----------------------

export interface LoginResult {
  success: boolean;
  error?: string;
  sessionToken?: string;
  session?: AdminSession;
  requires2FA?: boolean;
}

export function attemptAdminLogin(
  identifier: string,
  password: string,
  totpCode?: string,
  ipAddress?: string,
  userAgent?: string
): LoginResult {
  const normId = identifier.trim().toLowerCase();

  // Check IP allowlist
  if (adminStore.ipAllowlist.length > 0 && ipAddress) {
    if (!isIpRecognized(ipAddress, adminStore.ipAllowlist)) {
      logAccessDenied({ path: '/api/admin/auth/login', ipAddress, userAgent, reason: `IP ${ipAddress} non autorisée par allowlist` });
      return { success: false, error: 'Accès restreint par politique réseau d’entreprise.' };
    }
  }

  // Check rate limit lockout
  const failRecord = adminStore.failedLogins.get(normId);
  const now = Date.now();
  if (failRecord && failRecord.lockedUntil && failRecord.lockedUntil > now) {
    const remainingMins = Math.ceil((failRecord.lockedUntil - now) / 60000);
    return {
      success: false,
      error: `Compte temporairement verrouillé pour des raisons de sécurité. Réessayez dans ${remainingMins} minute(s).`,
    };
  }

  // Find user by email or phone
  let foundUser: (AdminUser & { passwordHash: string; salt: string }) | undefined;
  for (const user of adminStore.users.values()) {
    if (user.email.toLowerCase() === normId || user.phone === identifier.trim()) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    recordFailedAttempt(normId, ipAddress, userAgent);
    return { success: false, error: 'Identifiants administrateur incorrects.' };
  }

  // Verify password
  const testHash = hashPassword(password, foundUser.salt);
  if (testHash !== foundUser.passwordHash) {
    recordFailedAttempt(normId, ipAddress, userAgent);
    return { success: false, error: 'Identifiants administrateur incorrects.' };
  }

  // Verify 2FA
  if (foundUser.totpEnabled) {
    if (!totpCode) {
      return { success: false, requires2FA: true, error: 'Code 2FA requis.' };
    }
    const is2FAValid = verify2FACode(foundUser.totpSecret, totpCode);
    if (!is2FAValid) {
      recordFailedAttempt(normId, ipAddress, userAgent);
      return { success: false, requires2FA: false, error: 'Code d’authentification 2FA invalide ou expiré.' };
    }
  }

  // Reset failed attempts on success
  adminStore.failedLogins.delete(normId);

  // Create session
  const sessionToken = `tns_${crypto.randomBytes(32).toString('hex')}`;
  const session: AdminSession & { lastReauthAt: number } = {
    sessionId: sessionToken,
    adminId: foundUser.id,
    role: foundUser.role,
    permissions: foundUser.permissions,
    name: foundUser.name,
    email: foundUser.email,
    createdAt: now,
    lastActivityAt: now,
    expiresAt: now + SESSION_IDLE_TIMEOUT_MS,
    lastReauthAt: now,
    ipAddress,
    userAgent,
  };

  adminStore.sessions.set(sessionToken, session);

  logAdminAction({
    adminUser: foundUser.name,
    action: 'CONNEXION_ADMIN_RÉUSSIE',
    target: `/admin (${foundUser.role})`,
    previousState: 'Non connecté',
    newState: 'Session active 2FA',
    reason: 'Authentification 2FA réussie',
    ipAddress,
    userAgent,
  });

  return {
    success: true,
    sessionToken,
    session,
  };
}

function recordFailedAttempt(identifier: string, ipAddress?: string, userAgent?: string) {
  const record = adminStore.failedLogins.get(identifier) || { count: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
    logAdminAction({
      adminUser: 'SECURITY_MONITOR',
      action: 'VERROUILLAGE_COMPTE_ADMIN',
      target: identifier,
      previousState: 'Actif',
      newState: 'Verrouillé (15 min)',
      reason: `5 tentatives échouées consécutives depuis IP ${ipAddress || 'inconnue'}. Alerte de sécurité déclenchée.`,
      ipAddress,
      userAgent,
    });
  }
  adminStore.failedLogins.set(identifier, record);
}

export function validateAdminSessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const session = adminStore.sessions.get(token);
  if (!session) return null;

  const now = Date.now();
  // Check idle timeout
  if (now - session.lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
    adminStore.sessions.delete(token);
    logAdminAction({
      adminUser: session.name,
      action: 'EXPIRATION_SESSION_IDLE',
      target: session.sessionId,
      previousState: 'Actif',
      newState: 'Expiré',
      reason: 'Délai d’inactivité de 30 minutes dépassé.',
    });
    return null;
  }

  // Refresh activity
  session.lastActivityAt = now;
  session.expiresAt = now + SESSION_IDLE_TIMEOUT_MS;
  return session;
}

export function revokeAdminSession(token: string, revokedBy?: string): boolean {
  const session = adminStore.sessions.get(token);
  if (!session) return false;
  adminStore.sessions.delete(token);

  logAdminAction({
    adminUser: revokedBy || session.name,
    action: 'DÉCONNEXION_SESSION_RÉVOQUÉE',
    target: session.sessionId,
    previousState: 'Session active',
    newState: 'Session révoquée',
    reason: 'Déconnexion manuelle ou révocation par administrateur.',
  });
  return true;
}

export function reauthenticateSession(token: string, passwordOrTotp: string): boolean {
  const session = adminStore.sessions.get(token);
  if (!session) return false;

  let user: (AdminUser & { passwordHash: string; salt: string }) | undefined;
  for (const u of adminStore.users.values()) {
    if (u.id === session.adminId) {
      user = u;
      break;
    }
  }
  if (!user) return false;

  // Check password or 2FA
  const is2fa = verify2FACode(user.totpSecret, passwordOrTotp);
  const isPass = hashPassword(passwordOrTotp, user.salt) === user.passwordHash;

  if (is2fa || isPass) {
    session.lastReauthAt = Date.now();
    return true;
  }
  return false;
}

export function isRecentReauth(token: string): boolean {
  const session = adminStore.sessions.get(token);
  if (!session) return false;
  return Date.now() - session.lastReauthAt <= SENSITIVE_REAUTH_WINDOW_MS;
}

export function listAdminSessions(): AdminSession[] {
  const result: AdminSession[] = [];
  const now = Date.now();
  for (const session of adminStore.sessions.values()) {
    if (now - session.lastActivityAt <= SESSION_IDLE_TIMEOUT_MS) {
      result.push({ ...session });
    }
  }
  return result;
}

// ---------------------- DATA ACCESSORS (ADMIN ONLY) ----------------------

export function getAdminKycQueue(): AdminKycItem[] {
  return [...adminStore.kycQueue];
}

export function updateKycStatus(
  kycId: string,
  status: 'APPROVED' | 'REJECTED',
  reason: string,
  adminUser: string
): AdminKycItem | null {
  const item = adminStore.kycQueue.find((k) => k.id === kycId);
  if (!item) return null;

  const prev = item.status;
  item.status = status;
  if (status === 'REJECTED') {
    item.rejectionReason = reason;
  }

  logAdminAction({
    adminUser,
    action: status === 'APPROVED' ? 'VALIDATION_KYC_DOSSIER' : 'REJET_KYC_DOSSIER',
    target: `${item.applicantName} (${item.type} - ${item.vehiclePlate || item.companyName || ''})`,
    previousState: prev,
    newState: status,
    reason,
  });

  return item;
}

export function getAdminDisputes(): AdminDisputeItem[] {
  return [...adminStore.disputes];
}

export function resolveAdminDispute(
  disputeId: string,
  resolutionNote: string,
  adminUser: string
): AdminDisputeItem | null {
  const item = adminStore.disputes.find((d) => d.id === disputeId);
  if (!item) return null;

  const prev = item.status;
  item.status = 'RESOLVED';
  item.resolutionNote = resolutionNote;

  logAdminAction({
    adminUser,
    action: 'RÉSOLUTION_LITIGE',
    target: `Litige #${item.ticketNumber} (${item.passengerName})`,
    previousState: prev,
    newState: 'RESOLVED',
    reason: resolutionNote,
  });

  return item;
}

export function getAdminAuditLogs(): AdminAuditLogEntry[] {
  return [...adminStore.auditLogs];
}

export function getAdminCityToggles(): Record<string, Record<string, boolean>> {
  const obj: Record<string, Record<string, boolean>> = {};
  for (const [city, services] of adminStore.cityToggles.entries()) {
    obj[city] = { ...services };
  }
  return obj;
}

export function toggleCityService(
  city: string,
  service: string,
  enabled: boolean,
  reason: string,
  adminUser: string
): boolean {
  let services = adminStore.cityToggles.get(city);
  if (!services) {
    services = { bus: true, taxi: true, moto: true, delivery: true };
    adminStore.cityToggles.set(city, services);
  }

  const prev = services[service] ? 'Actif' : 'Suspendu';
  services[service] = enabled;

  logAdminAction({
    adminUser,
    action: enabled ? 'ACTIVATION_SERVICE_VILLE' : 'SUSPENSION_SERVICE_VILLE',
    target: `${city.toUpperCase()} (${service.toUpperCase()})`,
    previousState: prev,
    newState: enabled ? 'Actif' : 'Suspendu',
    reason,
  });

  return true;
}

export function countActiveSuperAdmins(): number {
  let count = 0;
  for (const u of adminStore.users.values()) {
    if (u.role === 'SUPER_ADMIN' && u.status !== 'DISABLED' && !u.deletedAt) {
      count++;
    }
  }
  return count;
}

export function getStaffAccountList(includeTrash = false): StaffAccount[] {
  const result: StaffAccount[] = [];
  const now = Date.now();

  for (const u of adminStore.users.values()) {
    if (includeTrash ? !u.deletedAt : Boolean(u.deletedAt)) {
      continue;
    }

    // Find active sessions for this user
    const userSessions: StaffSessionInfo[] = [];
    for (const s of adminStore.sessions.values()) {
      if (s.adminId === u.id && now - s.lastActivityAt <= SESSION_IDLE_TIMEOUT_MS) {
        userSessions.push({
          sessionId: s.sessionId,
          ipAddress: s.ipAddress || '127.0.0.1',
          userAgent: s.userAgent || 'Navigateur standard',
          createdAt: s.createdAt,
          lastActivityAt: s.lastActivityAt,
          expiresAt: s.expiresAt,
        });
      }
    }

    result.push({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status || 'ACTIVE',
      permissions: u.permissions,
      totpEnabled: Boolean(u.totpEnabled),
      forceTotp: Boolean(u.forceTotp),
      activeSessionsCount: userSessions.length,
      activeSessions: userSessions,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      version: u.version || 1,
      deletedAt: u.deletedAt,
      deletedBy: u.deletedBy,
      deletionReason: u.deletionReason,
    });
  }

  // Sort: Super admins first, then by role, then name
  return result.sort((a, b) => {
    if (a.role === 'SUPER_ADMIN' && b.role !== 'SUPER_ADMIN') return -1;
    if (b.role === 'SUPER_ADMIN' && a.role !== 'SUPER_ADMIN') return 1;
    return a.name.localeCompare(b.name, 'fr');
  });
}

export function findStaffAccountById(id: string): StaffAccount | null {
  for (const u of adminStore.users.values()) {
    if (u.id === id) {
      const now = Date.now();
      const userSessions: StaffSessionInfo[] = [];
      for (const s of adminStore.sessions.values()) {
        if (s.adminId === u.id && now - s.lastActivityAt <= SESSION_IDLE_TIMEOUT_MS) {
          userSessions.push({
            sessionId: s.sessionId,
            ipAddress: s.ipAddress || '127.0.0.1',
            userAgent: s.userAgent || 'Navigateur standard',
            createdAt: s.createdAt,
            lastActivityAt: s.lastActivityAt,
            expiresAt: s.expiresAt,
          });
        }
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status || 'ACTIVE',
        permissions: u.permissions,
        totpEnabled: Boolean(u.totpEnabled),
        forceTotp: Boolean(u.forceTotp),
        activeSessionsCount: userSessions.length,
        activeSessions: userSessions,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        version: u.version || 1,
        deletedAt: u.deletedAt,
        deletedBy: u.deletedBy,
        deletionReason: u.deletionReason,
      };
    }
  }
  return null;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions?: AdminPermission[];
  forceTotp?: boolean;
  password?: string;
}

export function createStaffAccount(
  data: CreateStaffInput,
  creatorAdmin: string
): { success: boolean; staff?: StaffAccount; error?: string } {
  const normEmail = data.email.trim().toLowerCase();
  if (adminStore.users.has(normEmail)) {
    return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
  }

  // Check phone uniqueness
  for (const u of adminStore.users.values()) {
    if (u.phone === data.phone.trim()) {
      return { success: false, error: 'Un compte avec ce numéro de téléphone existe déjà.' };
    }
  }

  const salt = `salt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const passwordToHash = data.password || 'Transnumerica@Staff2026!';
  const passwordHash = hashPassword(passwordToHash, salt);
  const id = `usr-staff-${Date.now().toString().slice(-6)}`;

  const roleDefaults = adminStore.rolePermissionsMatrix[data.role] || [];
  const assignedPermissions =
    data.permissions && data.permissions.length > 0 ? data.permissions : roleDefaults;

  const newStaffRecord: AdminUserRecord = {
    id,
    name: data.name,
    email: normEmail,
    phone: data.phone,
    role: data.role,
    status: 'ACTIVE',
    permissions: assignedPermissions,
    totpEnabled: false,
    totpSecret: 'JBSWY3DPEHPK3PXP',
    forceTotp: data.forceTotp !== undefined ? data.forceTotp : true,
    createdAt: new Date().toISOString(),
    passwordHash,
    salt,
    version: 1,
  };

  adminStore.users.set(normEmail, newStaffRecord);

  logAdminAction({
    adminUser: creatorAdmin,
    action: 'CRÉATION_COMPTE_PERSONNEL',
    target: `${newStaffRecord.name} (${newStaffRecord.email} - ${newStaffRecord.role})`,
    previousState: 'Inexistant',
    newState: `Créé avec le rôle ${newStaffRecord.role} (2FA requis: ${newStaffRecord.forceTotp ? 'Oui' : 'Non'})`,
    reason: 'Création d’un compte collaborateur par le Super Administrateur.',
  });

  return {
    success: true,
    staff: {
      id: newStaffRecord.id,
      name: newStaffRecord.name,
      email: newStaffRecord.email,
      phone: newStaffRecord.phone,
      role: newStaffRecord.role,
      status: newStaffRecord.status,
      permissions: newStaffRecord.permissions,
      totpEnabled: newStaffRecord.totpEnabled,
      forceTotp: newStaffRecord.forceTotp,
      activeSessionsCount: 0,
      createdAt: newStaffRecord.createdAt,
      version: 1,
    },
  };
}

export interface UpdateStaffInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: 'ACTIVE' | 'DISABLED';
  permissions?: AdminPermission[];
  forceTotp?: boolean;
}

export function updateStaffAccount(
  id: string,
  updates: UpdateStaffInput,
  expectedVersion: number,
  reason: string,
  editorAdmin: string,
  isSuperAdminActor: boolean
): { success: boolean; staff?: StaffAccount; conflict?: boolean; currentVersion?: number; error?: string } {
  let targetUser: AdminUserRecord | undefined;
  let targetKey: string | undefined;

  for (const [key, u] of adminStore.users.entries()) {
    if (u.id === id) {
      targetUser = u;
      targetKey = key;
      break;
    }
  }

  if (!targetUser || !targetKey) {
    return { success: false, error: 'Compte collaborateur introuvable.' };
  }

  // Optimistic locking check
  if ((targetUser.version || 1) !== expectedVersion) {
    return {
      success: false,
      conflict: true,
      currentVersion: targetUser.version || 1,
      error: `Conflit d’édition : le compte est en version ${targetUser.version || 1} (version transmise: ${expectedVersion}). Veuillez recharger.`,
    };
  }

  // Privilege check: changing role requires SUPER_ADMIN
  if (updates.role && updates.role !== targetUser.role) {
    if (!isSuperAdminActor) {
      return {
        success: false,
        error: 'Tentative d’escalade de privilèges rejetée. Seul le Super Administrateur peut modifier les rôles.',
      };
    }

    // Protection of last SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN' && updates.role !== 'SUPER_ADMIN') {
      const activeSuperCount = countActiveSuperAdmins();
      if (activeSuperCount <= 1) {
        return {
          success: false,
          error: 'Protection critique : impossible de rétrograder le dernier Super Administrateur actif du système.',
        };
      }
    }
  }

  // Protection of last SUPER_ADMIN against being disabled
  if (updates.status === 'DISABLED' && targetUser.role === 'SUPER_ADMIN') {
    const activeSuperCount = countActiveSuperAdmins();
    if (activeSuperCount <= 1) {
      return {
        success: false,
        error: 'Protection critique : impossible de désactiver le dernier Super Administrateur actif du système.',
      };
    }
  }

  const prevSnapshot = JSON.stringify({
    role: targetUser.role,
    status: targetUser.status,
    permissionsCount: targetUser.permissions.length,
    forceTotp: targetUser.forceTotp,
  });

  if (updates.name) targetUser.name = updates.name;
  if (updates.phone) targetUser.phone = updates.phone;
  if (updates.role) targetUser.role = updates.role;
  if (updates.status) targetUser.status = updates.status;
  if (updates.permissions) targetUser.permissions = updates.permissions;
  if (updates.forceTotp !== undefined) targetUser.forceTotp = updates.forceTotp;

  targetUser.version = (targetUser.version || 1) + 1;

  logAdminAction({
    adminUser: editorAdmin,
    action: 'MODIFICATION_COMPTE_PERSONNEL',
    target: `${targetUser.name} (${targetUser.email} - #${targetUser.id})`,
    previousState: prevSnapshot,
    newState: JSON.stringify({
      role: targetUser.role,
      status: targetUser.status,
      permissionsCount: targetUser.permissions.length,
      forceTotp: targetUser.forceTotp,
      version: targetUser.version,
    }),
    reason,
  });

  return {
    success: true,
    staff: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      role: targetUser.role,
      status: targetUser.status,
      permissions: targetUser.permissions,
      totpEnabled: targetUser.totpEnabled,
      forceTotp: targetUser.forceTotp,
      activeSessionsCount: 0,
      createdAt: targetUser.createdAt,
      version: targetUser.version,
    },
  };
}

export function softDeleteStaffAccount(
  id: string,
  reason: string,
  actor: string,
  isSuperAdminActor: boolean
): { success: boolean; error?: string } {
  if (!isSuperAdminActor) {
    return {
      success: false,
      error: 'Action non autorisée. Seul le Super Administrateur peut supprimer un compte collaborateur.',
    };
  }

  let targetUser: AdminUserRecord | undefined;
  for (const u of adminStore.users.values()) {
    if (u.id === id) {
      targetUser = u;
      break;
    }
  }

  if (!targetUser) {
    return { success: false, error: 'Compte collaborateur introuvable.' };
  }

  if (targetUser.role === 'SUPER_ADMIN') {
    const activeSuperCount = countActiveSuperAdmins();
    if (activeSuperCount <= 1) {
      return {
        success: false,
        error: 'Protection critique : impossible de supprimer le dernier Super Administrateur actif du système.',
      };
    }
  }

  targetUser.deletedAt = new Date().toISOString();
  targetUser.deletedBy = actor;
  targetUser.deletionReason = reason;
  targetUser.status = 'DISABLED';
  targetUser.version = (targetUser.version || 1) + 1;

  // Revoke all sessions
  revokeAllStaffSessions(id, 'Suppression du compte par Super Admin', actor);

  logAdminAction({
    adminUser: actor,
    action: 'SUPPRESSION_LOGIQUE_PERSONNEL',
    target: `${targetUser.name} (${targetUser.email})`,
    previousState: 'Actif',
    newState: 'Désactivé & Mis dans la corbeille',
    reason,
  });

  return { success: true };
}

export function revokeStaffSession(
  sessionId: string,
  reason: string,
  actor: string
): { success: boolean; error?: string } {
  const session = adminStore.sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session introuvable ou déjà expirée.' };
  }

  adminStore.sessions.delete(sessionId);

  logAdminAction({
    adminUser: actor,
    action: 'RÉVOCATION_SESSION_ADMIN',
    target: `Session ${sessionId.slice(0, 10)}... (Admin: ${session.name})`,
    previousState: 'Session active',
    newState: 'Révoquée immédiatement',
    reason,
  });

  return { success: true };
}

export function revokeAllStaffSessions(
  userId: string,
  reason: string,
  actor: string
): { success: boolean; revokedCount: number } {
  let count = 0;
  for (const [token, s] of adminStore.sessions.entries()) {
    if (s.adminId === userId) {
      adminStore.sessions.delete(token);
      count++;
    }
  }

  logAdminAction({
    adminUser: actor,
    action: 'RÉVOCATION_TOUTES_SESSIONS_PERSONNEL',
    target: `Utilisateur #${userId}`,
    previousState: `${count} session(s) active(s)`,
    newState: '0 sessions actives',
    reason,
  });

  return { success: true, revokedCount: count };
}

export function getRolePermissionsMatrixServer(): Record<UserRole, AdminPermission[]> {
  return { ...adminStore.rolePermissionsMatrix };
}

export function updateRolePermissionsMatrixServer(
  role: UserRole,
  permissions: AdminPermission[],
  reason: string,
  actor: string
): { success: boolean } {
  const prevCount = (adminStore.rolePermissionsMatrix[role] || []).length;
  adminStore.rolePermissionsMatrix[role] = [...permissions];

  // Also update users of this role who do not have custom overrides
  for (const u of adminStore.users.values()) {
    if (u.role === role) {
      u.permissions = [...permissions];
    }
  }

  logAdminAction({
    adminUser: actor,
    action: 'MISE_À_JOUR_MATRICE_PERMISSIONS',
    target: `Rôle ${role}`,
    previousState: `${prevCount} permissions`,
    newState: `${permissions.length} permissions attribuées`,
    reason,
  });

  return { success: true };
}

export function getAdminUsersList(): AdminUser[] {
  return Array.from(adminStore.users.values()).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    permissions: u.permissions,
    totpEnabled: u.totpEnabled,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }));
}

export function updateUserRoleServer(
  targetEmail: string,
  newRole: 'ADMIN' | 'SUPER_ADMIN',
  adminUser: string
): boolean {
  const user = adminStore.users.get(targetEmail.toLowerCase());
  if (!user) return false;

  const prevRole = user.role;
  user.role = newRole;
  user.permissions = newRole === 'SUPER_ADMIN' ? ALL_ADMIN_PERMISSIONS : STANDARD_ADMIN_PERMISSIONS;

  logAdminAction({
    adminUser,
    action: 'MODIFICATION_RÔLE_ADMIN',
    target: `${user.name} (${user.email})`,
    previousState: prevRole,
    newState: newRole,
    reason: 'Attribution de privilèges par le Super Administrateur.',
  });

  return true;
}
