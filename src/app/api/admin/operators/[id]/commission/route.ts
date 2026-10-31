import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { updateOperatorCommission } from '@/lib/server/operators-store';
import { OperatorCommissionSchema } from '@/lib/validations/operators';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.commission' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = OperatorCommissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de commission invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { commissionRate, reason } = parsed.data;
    const result = updateOperatorCommission(id, commissionRate, reason, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operator: result.operator,
      message: `Taux de commission mis à jour avec succès : ${commissionRate}%`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la commission' }, { status: 500 });
  }
}

