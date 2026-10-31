import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { listAdminSessions, revokeAdminSession } from '@/lib/server/admin-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'settings.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const sessions = listAdminSessions();
  return NextResponse.json({ sessions });
}

const RevokeSessionSchema = z.object({
  sessionId: z.string().min(1),
});

export async function DELETE(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { requireSuperAdmin: true });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = RevokeSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const ok = revokeAdminSession(parsed.data.sessionId, auth.session.name);
    return NextResponse.json({ success: ok });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

