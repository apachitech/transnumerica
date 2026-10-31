import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { restoreOperator } from '@/lib/server/operators-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.restore' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const reason = (body?.reason || '').trim() || 'Restauration administrative de l’opérateur';

    const result = restoreOperator(id, reason, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, operator: result.operator });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la restauration' }, { status: 500 });
  }
}

