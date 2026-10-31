import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { corridorsRepository } from '@/lib/server/corridors-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'corridors.restore' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const { ip } = getClientIpAndUa(req);
    const restored = await corridorsRepository.restore(id, auth.session, ip);
    return NextResponse.json({ success: true, item: restored });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

