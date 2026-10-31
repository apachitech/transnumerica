import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deleteCmsMedia } from '@/lib/server/cms-store';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'media.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const reason = searchParams.get('reason') || 'Suppression du fichier média par administrateur';

  try {
    await deleteCmsMedia(id, auth.session.email || auth.session.name, reason);
    return NextResponse.json({ message: 'Fichier média supprimé avec succès' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

