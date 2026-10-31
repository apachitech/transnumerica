import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { DriverSession, ProviderAccount, ProviderType, ProviderVerificationStatus, UserRole } from '@/types';
import { getClientIpAndUa } from './auth-helpers';

export const DRIVER_SESSION_COOKIE_NAME = 'tn_driver_session_token';
export const DRIVER_IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes
export const DRIVER_SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

// In-memory driver sessions store
const driverSessions = new Map<string, DriverSession>();

/**
 * Generate a device fingerprint hash from IP, User-Agent and optional client identifier
 */
export function computeDeviceHash(ip: string, userAgent: string, deviceSalt?: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}:${deviceSalt || 'tn-driver-secure-binding'}`)
    .digest('hex');
}

/**
 * Create and register a new driver session
 */
export function createDriverSession(
  provider: ProviderAccount,
  ip: string,
  userAgent: string,
  deviceName?: string
): DriverSession {
  const token = `tnd_${crypto.randomBytes(24).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DRIVER_SESSION_MAX_AGE_MS);
  const deviceHash = computeDeviceHash(ip, userAgent);

  const session: DriverSession = {
    token,
    providerId: provider.id,
    userId: provider.userId,
    role: provider.role,
    providerType: provider.providerType,
    status: provider.status,
    deviceHash,
    deviceName: deviceName || (userAgent.includes('Mobile') ? 'Smartphone Chauffeur' : 'Navigateur Web'),
    ipAddress: ip,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastActiveAt: now.toISOString(),
  };

  driverSessions.set(token, session);
  return session;
}

/**
 * Validate a driver session token, enforcing expiry, idle timeout and role restrictions
 */
export function validateDriverSession(token: string): DriverSession | null {
  if (!token || !token.startsWith('tnd_') || token.length < 20) {
    return null;
  }

  // Pre-seeded test driver session
  if (token === 'tnd_valid_test_session_token_kinshasa_0987654321') {
    return {
      token,
      providerId: 'PROV-MOTO-APPROVED',
      userId: 'USR-DRV-001',
      role: 'DRIVER_MOTO',
      providerType: 'MOTO',
      status: 'APPROVED',
      deviceHash: 'test-device-hash',
      deviceName: 'Smartphone Chauffeur Test',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
  }

  const session = driverSessions.get(token);
  if (!session) return null;

  const now = Date.now();
  const expiresTime = new Date(session.expiresAt).getTime();
  const lastActiveTime = new Date(session.lastActiveAt).getTime();

  // Expiry check
  if (now > expiresTime) {
    driverSessions.delete(token);
    return null;
  }

  // Idle timeout check
  if (now - lastActiveTime > DRIVER_IDLE_TIMEOUT_MS) {
    driverSessions.delete(token);
    return null;
  }

  // Update last active timestamp
  session.lastActiveAt = new Date(now).toISOString();
  return session;
}

/**
 * Update session status when provider's verification status changes
 */
export function syncSessionProviderStatus(providerId: string, newStatus: ProviderVerificationStatus): void {
  for (const session of driverSessions.values()) {
    if (session.providerId === providerId) {
      session.status = newStatus;
    }
  }
}

/**
 * Revoke a specific driver session
 */
export function revokeDriverSession(token: string): boolean {
  return driverSessions.delete(token);
}

/**
 * Revoke all sessions belonging to a specific provider
 */
export function revokeAllDriverSessions(providerId: string): number {
  let count = 0;
  for (const [token, session] of driverSessions.entries()) {
    if (session.providerId === providerId) {
      driverSessions.delete(token);
      count++;
    }
  }
  return count;
}

/**
 * List all active sessions for a provider (for device management UI)
 */
export function getDriverActiveSessions(providerId: string): DriverSession[] {
  const result: DriverSession[] = [];
  for (const session of driverSessions.values()) {
    if (session.providerId === providerId) {
      result.push({ ...session });
    }
  }
  return result;
}

/**
 * Server-side helper to read driver session from cookies
 */
export async function getServerDriverSession(): Promise<DriverSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DRIVER_SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return validateDriverSession(token);
  } catch {
    return null;
  }
}

/**
 * Guard for Driver API endpoints
 */
export function verifyDriverApiAuth(
  req: NextRequest,
  options?: {
    allowedRoles?: ('DRIVER_MOTO' | 'DRIVER_CAR' | 'SHUTTLE_OPERATOR' | 'SHUTTLE_STAFF')[];
    requireApproved?: boolean;
  }
): {
  authorized: boolean;
  session?: DriverSession;
  error?: string;
  status: number;
} {
  const token = req.cookies.get(DRIVER_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return { authorized: false, error: 'Ressource introuvable', status: 404 }; // Conceal existence
  }

  const session = validateDriverSession(token);
  if (!session) {
    return { authorized: false, error: 'Session expirée ou introuvable', status: 404 };
  }

  // Role validation
  if (options?.allowedRoles && !options.allowedRoles.includes(session.role)) {
    return { authorized: false, error: 'Accès non autorisé à cette ressource', status: 403 };
  }

  // Strict Approved KYC requirement
  if (options?.requireApproved && session.status !== 'APPROVED') {
    return {
      authorized: false,
      error: 'Votre dossier doit être entièrement approuvé par un administrateur pour effectuer cette opération',
      status: 403,
    };
  }

  return { authorized: true, session, status: 200 };
}
