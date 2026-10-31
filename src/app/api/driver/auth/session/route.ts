import { NextRequest, NextResponse } from 'next/server';
import {
  DRIVER_SESSION_COOKIE_NAME,
  validateDriverSession,
  getDriverActiveSessions,
} from '@/lib/server/driver-auth';
import { getProviderById } from '@/lib/server/provider-store';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(DRIVER_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = validateDriverSession(token);
  if (!session) {
    return NextResponse.json({ authenticated: false, error: 'Session expirée' }, { status: 401 });
  }

  const provider = getProviderById(session.providerId);
  const activeSessions = getDriverActiveSessions(session.providerId);

  return NextResponse.json({
    authenticated: true,
    session,
    provider,
    activeSessions,
  });
}

