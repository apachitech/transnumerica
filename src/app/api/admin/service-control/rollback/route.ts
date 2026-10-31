import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { serviceControlStore } from '@/lib/server/service-control-store';
import { RollbackSchema } from '@/lib/validations/service-control';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.rollback' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = RollbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de restauration invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = serviceControlStore.rollbackToSnapshot(
      parsed.data.snapshotId,
      parsed.data.reason,
      auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      snapshot: result.snapshot,
      message: 'Restauration vers l’instantané antérieur effectuée avec succès.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

