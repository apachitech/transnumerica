import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { importStationsFromCsv } from '@/lib/server/catalog-store';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const csvContent = body.csvContent;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json(
        { error: 'Contenu CSV manquant ou format invalide' },
        { status: 400 }
      );
    }

    const result = importStationsFromCsv(csvContent, auth.session.name);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur lors de l’importation' }, { status: 500 });
  }
}

