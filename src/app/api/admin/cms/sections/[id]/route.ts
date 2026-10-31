import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCmsSectionById, deleteCmsSection } from '@/lib/server/cms-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const section = await getCmsSectionById(id);

  if (!section) {
    return NextResponse.json({ error: `Section ${id} introuvable` }, { status: 404 });
  }

  return NextResponse.json(section);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const reason = searchParams.get('reason') || 'Suppression de la section par administrateur';

  try {
    await deleteCmsSection(id, auth.session.email || auth.session.name, reason);
    return NextResponse.json({ message: 'Section supprimée avec succès' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

