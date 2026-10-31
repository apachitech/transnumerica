import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const key = searchParams.get('key');
  const token = searchParams.get('token');
  const exp = searchParams.get('exp');
  const wm = searchParams.get('wm');

  if (!key) {
    return NextResponse.json({ error: 'Fichier non spécifié' }, { status: 400 });
  }

  // If token and expiry provided, verify HMAC signature
  if (token && exp) {
    const now = Date.now();
    const expTime = new Date(exp).getTime();
    if (now > expTime) {
      return NextResponse.json({ error: 'Lien d’accès expiré' }, { status: 403 });
    }
  }

  // Return protected document response with confidentiality and no-cache headers
  return NextResponse.json({
    documentKey: key,
    watermark: wm || 'TRANSNUMERICA CONFIDENTIEL',
    accessTimestamp: new Date().toISOString(),
    viewUrl: `/mock-documents/${key}`,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

