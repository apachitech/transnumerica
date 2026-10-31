import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getAdminKycQueue, updateKycStatus } from '@/lib/server/admin-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.verify' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const queue = getAdminKycQueue();
  return NextResponse.json({ queue });
}

const UpdateKycSchema = z.object({
  kycId: z.string().min(1),
  status: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().min(3),
});

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.verify' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = UpdateKycSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const { kycId, status, reason } = parsed.data;
    const updated = updateKycStatus(kycId, status, reason, auth.session.name);

    if (!updated) {
      return NextResponse.json({ error: 'Dossier KYC introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

