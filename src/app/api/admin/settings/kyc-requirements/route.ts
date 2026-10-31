import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { getKycRequirements, updateKycRequirement } from '@/lib/server/provider-store';
import { ProviderType } from '@/types';

const updateSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  expires: z.boolean().optional(),
  maxSizeBytes: z.number().optional(),
  active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'settings.manage' });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get('city') || undefined;
  const providerType = (searchParams.get('type') as ProviderType) || undefined;

  const requirements = getKycRequirements(city, providerType);
  return NextResponse.json({ requirements });
}

export async function PUT(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'settings.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;
    const { ip } = getClientIpAndUa(req);

    const updated = updateKycRequirement(
      id,
      updates,
      auth.session.name || auth.session.adminId,
      ip
    );

    return NextResponse.json({ success: true, requirement: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
