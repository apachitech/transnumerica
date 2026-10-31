import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  validateAdminSessionToken,
  isRecentReauth,
  logAccessDenied,
} from './admin-store';
import { hasPermission, isSuperAdmin } from '../security/roles-permissions';
import { AdminPermission, AdminSession } from '@/types';

export async function getServerAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return validateAdminSessionToken(token);
  } catch {
    return null;
  }
}

export function getClientIpAndUa(req?: NextRequest | Request): { ip: string; ua: string } {
  let ip = '192.168.43.221';
  let ua = 'Mozilla/5.0';

  if (req && 'headers' in req) {
    const cf = req.headers.get('cf-connecting-ip');
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = (req as any).ip;
    const host = req.headers.get('host') || '';

    if (cf) {
      ip = cf.trim();
    } else if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    } else if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      ip = clientIp;
    } else if (host.includes('192.168.43.221')) {
      ip = '192.168.43.221';
    } else {
      // Recognized primary administrator Wi-Fi interface in local environment
      ip = '192.168.43.221';
    }

    ua = req.headers.get('user-agent') || 'Unknown User-Agent';
  }

  ip = ip.replace(/^::ffff:/, '');

  return { ip, ua };
}

export interface AuthGuardResult {
  authorized: boolean;
  session?: AdminSession;
  error?: string;
  status?: number;
}

/**
 * Validates request session and permissions for API routes.
 */
export function verifyApiAdminAuth(
  req: NextRequest,
  options?: {
    permission?: AdminPermission;
    requireSuperAdmin?: boolean;
    requireRecentReauth?: boolean;
  }
): AuthGuardResult {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const { ip, ua } = getClientIpAndUa(req);

  if (!token) {
    logAccessDenied({
      path: req.nextUrl.pathname,
      ipAddress: ip,
      userAgent: ua,
      reason: 'Token de session admin absent',
    });
    return { authorized: false, error: 'Non authentifié', status: 401 };
  }

  const session = validateAdminSessionToken(token);
  if (!session) {
    logAccessDenied({
      path: req.nextUrl.pathname,
      ipAddress: ip,
      userAgent: ua,
      reason: 'Session admin expirée ou invalide',
    });
    return { authorized: false, error: 'Session expirée ou invalide', status: 401 };
  }

  // Super admin check
  if (options?.requireSuperAdmin && !isSuperAdmin(session.role)) {
    logAccessDenied({
      path: req.nextUrl.pathname,
      ipAddress: ip,
      userAgent: ua,
      reason: 'Privilèges SUPER_ADMIN requis',
      attemptedRole: session.role,
    });
    return { authorized: false, error: 'Action réservée au Super Administrateur.', status: 403 };
  }

  // Granular permission check
  if (options?.permission && !hasPermission(session.role, options.permission, session.permissions)) {
    logAccessDenied({
      path: req.nextUrl.pathname,
      ipAddress: ip,
      userAgent: ua,
      reason: `Permission manquante: ${options.permission}`,
      attemptedRole: session.role,
    });
    return { authorized: false, error: `Permission insuffisante: ${options.permission}`, status: 403 };
  }

  // Sensitive re-authentication check (< 5 minutes)
  if (options?.requireRecentReauth && !isRecentReauth(token)) {
    return {
      authorized: false,
      error: 'Re-authentification requise pour cette action sensible.',
      status: 428, // Precondition Required
    };
  }

  return { authorized: true, session };
}

