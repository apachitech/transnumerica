import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { serviceControlStore } from '@/lib/server/service-control-store';
import { InstantSuspensionSchema } from '@/lib/validations/service-control';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.suspend' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = InstantSuspensionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de suspension invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = serviceControlStore.suspendService(parsed.data, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      entry: result.entry,
      message: parsed.data.isSuspended
        ? 'Suspension d’urgence activée avec succès. Les usagers voient immédiatement votre message d’alerte.'
        : 'Suspension levée avec succès. Le service redevient accessible aux usagers.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

