import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { impersonatePassengerSnapshot } from '@/lib/server/passengers-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.impersonate' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  let reason = 'Inspection de compte passager en direct (Support / Dépannage)';
  try {
    const body = await req.json();
    if (body.reason) reason = body.reason;
  } catch {
    // Optional
  }

  const result = impersonatePassengerSnapshot(id, reason, auth.session.name);
  if (!result.success || !result.snapshot) {
    return NextResponse.json({ error: result.error || 'Passager introuvable' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    mode: 'READ_ONLY_AUDITED_VIEW',
    auditedBy: auth.session.name,
    timestamp: new Date().toISOString(),
    snapshot: result.snapshot,
  });
}

