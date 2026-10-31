import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  return NextResponse.json({
    adminId: auth.session.adminId,
    name: auth.session.name,
    email: auth.session.email,
    role: auth.session.role,
    permissions: auth.session.permissions,
    expiresAt: auth.session.expiresAt,
  });
}

