import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { suspendOperator } from '@/lib/server/operators-store';
import { OperatorSuspendActionSchema } from '@/lib/validations/operators';

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
    const parsed = OperatorSuspendActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de suspension invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { reason, policy } = parsed.data;
    const result = suspendOperator(id, reason, policy, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operator: result.operator,
      message: 'Opérateur suspendu avec succès. Les départs futurs ont été gelés.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suspension de l’opérateur' }, { status: 500 });
  }
}

