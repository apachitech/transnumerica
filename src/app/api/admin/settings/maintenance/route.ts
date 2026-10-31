import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { toggleMaintenanceMode } from '@/lib/server/settings-store';
import { maintenanceToggleSchema } from '@/lib/validations/settings';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'maintenance.toggle' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = maintenanceToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de mode maintenance invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updatedSettings = toggleMaintenanceMode(
      parsed.data,
      auth.session.email || auth.session.name
    );

    return NextResponse.json(updatedSettings);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

