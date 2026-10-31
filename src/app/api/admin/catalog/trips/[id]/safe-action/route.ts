import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { safeHandleTripAction } from '@/lib/server/catalog-store';
import { SafeTripActionSchema } from '@/lib/validations/catalog';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const actionType = body.actionType === 'DELETE' ? 'DELETE' : 'CANCEL';
    const parsed = SafeTripActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres d’action de sécurité invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = safeHandleTripAction({
      tripId: id,
      actionType,
      policy: parsed.data.policy,
      reason: parsed.data.reason,
      targetTripId: parsed.data.targetTripId,
      notifyPassengers: parsed.data.notifyPassengers,
      adminUser: auth.session.name,
    });

    if (result.blocked) {
      return NextResponse.json(
        {
          error: result.message,
          blocked: true,
        },
        { status: 422 }
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}

