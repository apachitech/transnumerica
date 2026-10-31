import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import {
  setCityOverride,
  resetCityOverrideToDefault,
} from '@/lib/server/kyc-requirements-store';

const overrideSchema = z.object({
  city: z.string().min(2),
  itemCode: z.string().min(2),
  overrideData: z.record(z.string(), z.any()),
  reason: z.string().min(3),
});

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.update' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = overrideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.format() }, { status: 400 });
    }

    const { city, itemCode, overrideData, reason } = parsed.data;
    const { ip } = getClientIpAndUa(req);

    const config = setCityOverride(
      city,
      itemCode,
      overrideData,
      { id: auth.session.adminId, name: auth.session.name },
      reason,
      ip
    );

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la personnalisation' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.update' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city');
  const itemCode = searchParams.get('itemCode') || undefined;
  const reason = searchParams.get('reason') || 'Réinitialisation vers défaut';

  if (!city) {
    return NextResponse.json({ error: 'Paramètre city obligatoire' }, { status: 400 });
  }

  const { ip } = getClientIpAndUa(req);
  resetCityOverrideToDefault(
    city,
    itemCode,
    { id: auth.session.adminId, name: auth.session.name },
    reason,
    ip
  );

  return NextResponse.json({ success: true, message: `Exigences de ${city} réinitialisées vers les valeurs par défaut nationales.` });
}

