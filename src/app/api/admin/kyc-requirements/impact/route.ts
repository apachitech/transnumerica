import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { runImpactAnalysis } from '@/lib/server/kyc-requirements-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.read' });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city') || 'ALL';

  const impact = runImpactAnalysis(city);
  return NextResponse.json({ success: true, impact });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.read' });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  let city = 'ALL';
  try {
    const body = await req.json();
    if (body.city) city = body.city;
  } catch {}

  const impact = runImpactAnalysis(city);
  return NextResponse.json({ success: true, impact });
}

