import { NextRequest, NextResponse } from 'next/server';
import {
  DRIVER_SESSION_COOKIE_NAME,
  revokeDriverSession,
} from '@/lib/server/driver-auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(DRIVER_SESSION_COOKIE_NAME)?.value;
  if (token) {
    revokeDriverSession(token);
  }

  const res = NextResponse.json({ success: true, message: 'Déconnexion réussie' });
  res.cookies.delete(DRIVER_SESSION_COOKIE_NAME);
  return res;
}

