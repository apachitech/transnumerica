import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getPlatformSettings,
  updatePlatformSettings,
  resetSettingsStore,
  getSettingsStats,
} from '@/lib/server/settings-store';
import { platformSettingsInputSchema } from '@/lib/validations/settings';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'settings.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('reset') === 'true') {
    if (process.env.NODE_ENV !== 'test' && auth.session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Action non autorisée : la réinitialisation des paramètres requiert le rôle Super Administrateur.' },
        { status: 403 }
      );
    }
    resetSettingsStore();
    return NextResponse.json({ message: 'Paramètres réinitialisés avec succès' });
  }

  try {
    const settings = getPlatformSettings();
    const stats = getSettingsStats();
    return NextResponse.json({ settings, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'settings.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = platformSettingsInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres système invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = updatePlatformSettings(
      parsed.data,
      auth.session.email || auth.session.name,
      body.reason || 'Mise à jour des paramètres'
    );

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
