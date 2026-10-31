import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { supportStore } from '@/lib/server/support-store';
import { SupportReplySchema } from '@/lib/validations/support';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'support.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parseResult = SupportReplySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const updated = supportStore.addMessage(
      id,
      parseResult.data,
      auth.session.name || auth.session.email
    );

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: parseResult.data.isInternal
        ? 'Note interne ajoutée au dossier.'
        : `Message envoyé avec succès via ${parseResult.data.channel}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Erreur lors de l’envoi de la réponse' },
      { status: 400 }
    );
  }
}
