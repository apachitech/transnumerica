import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { verifyAuditLogIntegrity } from '@/lib/server/audit-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'audit.verify' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const result = verifyAuditLogIntegrity();
    return NextResponse.json({ verification: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne lors de la vérification cryptographique';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Trigger on-demand verification
  return GET(req);
}

