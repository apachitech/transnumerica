import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { restorePassenger } from '@/lib/server/passengers-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.restore' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  let reason = 'Restauration administrative du compte passager';
  try {
    const body = await req.json();
    if (body.reason) reason = body.reason;
  } catch {
    // Ignored
  }

  const result = restorePassenger(id, reason, auth.session.name);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, passenger: result.passenger });
}

