import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsStore } from '@/lib/server/rides-store';
import { RideContactLogSchema } from '@/lib/validations/rides';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'rides.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = RideContactLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de contact invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = rideOperationsStore.logContact(
      id,
      parsed.data.target,
      parsed.data.channel,
      parsed.data.note,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Échec de journalisation du contact' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ride: result.ride,
      message: `Contact régulateur avec ${parsed.data.target === 'RIDER' ? 'le passager' : 'le chauffeur'} consigné avec succès.`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

