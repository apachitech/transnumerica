import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rotateIntegrationKey } from '@/lib/server/settings-store';
import { rotateKeyInputSchema } from '@/lib/validations/settings';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = verifyApiAdminAuth(req, { permission: 'integrations.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = rotateKeyInputSchema.safeParse({
      ...body,
      integrationId: id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de rotation invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const rotated = rotateIntegrationKey(
      id,
      parsed.data.reason,
      auth.session.email || auth.session.name,
      parsed.data.newKey
    );

    return NextResponse.json(rotated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

