import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsStore } from '@/lib/server/rides-store';
import { SafetyIncidentNoteSchema } from '@/lib/validations/rides';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'safety.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = SafetyIncidentNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Contenu invalide', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = rideOperationsStore.addIncidentNote(
      id,
      parsed.data.content,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      incident: result.incident,
      message: 'Note interne ajoutée avec succès.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

