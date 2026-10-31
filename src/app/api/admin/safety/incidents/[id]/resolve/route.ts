import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsStore } from '@/lib/server/rides-store';
import { SafetyIncidentResolveSchema } from '@/lib/validations/rides';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'safety.resolve' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = SafetyIncidentResolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Compte-rendu de résolution requis', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = rideOperationsStore.resolveIncident(
      id,
      parsed.data.resolutionSummary,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      incident: result.incident,
      message: 'Incident de sécurité clôturé avec succès.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

