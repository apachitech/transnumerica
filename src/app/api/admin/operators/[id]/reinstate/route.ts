import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { reinstateOperator } from '@/lib/server/operators-store';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.suspend' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const reason = (body?.reason || '').trim();
    if (reason.length < 5) {
      return NextResponse.json(
        { error: 'Un motif de réactivation d’au moins 5 caractères est requis pour l’audit.' },
        { status: 400 }
      );
    }

    const result = reinstateOperator(id, reason, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operator: result.operator,
      message: 'Opérateur réactivé avec succès. Les départs programmés sont de nouveau réservables.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la réactivation de l’opérateur' }, { status: 500 });
  }
}

