import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { resetPassengerSessions } from '@/lib/server/passengers-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  let reason = 'Réinitialisation préventive de sécurité de toutes les sessions actives';
  try {
    const body = await req.json();
    if (body.reason) reason = body.reason;
  } catch {
    // Ignored
  }

  const result = resetPassengerSessions(id, reason, auth.session.name);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Toutes les sessions mobiles du passager ont été invalidées avec succès.',
    passenger: result.passenger,
  });
}

