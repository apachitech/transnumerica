import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rollbackPlatformSettings } from '@/lib/server/settings-store';
import { settingsRollbackSchema } from '@/lib/validations/settings';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'settings.rollback' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = settingsRollbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de rollback invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const restored = rollbackPlatformSettings(
      parsed.data.snapshotId,
      parsed.data.password,
      parsed.data.reason,
      auth.session.email || auth.session.name
    );

    return NextResponse.json(restored);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

