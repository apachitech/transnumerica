import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getAuditDiff } from '@/lib/server/audit-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'audit.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { id } = await context.params;
    const diff = getAuditDiff(id);
    if (!diff) {
      return NextResponse.json(
        { error: `Entrée d’audit #${id} introuvable.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ diff });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

