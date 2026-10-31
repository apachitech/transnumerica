import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  findStaffAccountById,
  revokeStaffSession,
  revokeAllStaffSessions,
} from '@/lib/server/admin-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'staff.sessions' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const staff = findStaffAccountById(id);
  if (!staff) {
    return NextResponse.json({ error: 'Collaborateur introuvable' }, { status: 404 });
  }

  return NextResponse.json({ sessions: staff.activeSessions || [] });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'staff.sessions' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  let reason = 'Révocation administrative de session';
  try {
    const body = await req.json();
    if (body.reason) reason = body.reason;
  } catch {
    // Optional
  }

  if (sessionId) {
    const result = revokeStaffSession(sessionId, reason, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Session révoquée avec succès.' });
  } else {
    const result = revokeAllStaffSessions(id, reason, auth.session.name);
    return NextResponse.json({
      success: true,
      message: `${result.revokedCount} session(s) révoquée(s) avec succès.`,
    });
  }
}

