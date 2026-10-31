import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsStore } from '@/lib/server/rides-store';
import { RideAdjustFareSchema } from '@/lib/validations/rides';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'rides.adjust_fare' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = RideAdjustFareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données tarifaires invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = rideOperationsStore.adjustFare(
      id,
      parsed.data.newFareMinor,
      parsed.data.currency,
      parsed.data.reason,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ride: result.ride,
      message: 'Tarif de la course réajusté avec succès.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

