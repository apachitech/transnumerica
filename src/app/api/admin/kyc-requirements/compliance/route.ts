import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getKycComplianceMetrics } from '@/lib/server/kyc-requirements-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.read' });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city') || 'Kinshasa';
  const providerType = searchParams.get('type') || 'ALL';

  const metrics = getKycComplianceMetrics(city, providerType);
  return NextResponse.json({ success: true, metrics });
}

