import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { verifySignedDocumentUrl, findDriverById } from '@/lib/server/drivers-store';

export async function GET(req: NextRequest) {
  // Layer 1: Admin Authentication Guard
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json(
      { error: 'Accès sécurisé refusé. Authentification requise.' },
      { status: 401 }
    );
  }

  // Layer 2: Signature and Expiry Verification
  const { searchParams } = new URL(req.url);
  const docId = searchParams.get('docId');
  const expires = searchParams.get('expires');
  const token = searchParams.get('token');

  if (!docId || !expires || !token) {
    return NextResponse.json(
      { error: 'Paramètres d’accès signés incomplets ou corrompus.' },
      { status: 400 }
    );
  }

  const isValid = verifySignedDocumentUrl(docId, expires, token);
  if (!isValid) {
    return NextResponse.json(
      {
        error:
          'Lien sécurisé expiré ou signature HMAC invalide. Veuillez recharger la page pour générer un nouveau lien éphémère.',
        expired: true,
      },
      { status: 403 }
    );
  }

  // Return document secure content payload
  return NextResponse.json({
    authorized: true,
    docId,
    expiresAt: new Date(parseInt(expires, 10) * 1000).toISOString(),
    viewedBy: auth.session.name,
    watermark: `TRANSNUMERICA-CONFIDENTIAL-${auth.session.email}-${new Date().toISOString().slice(0, 10)}`,
  });
}

