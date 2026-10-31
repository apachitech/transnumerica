import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getVerificationQueue, processKycReview } from '@/lib/server/drivers-store';
import { KycReviewActionSchema } from '@/lib/validations/drivers';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.verify' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const queue = getVerificationQueue();
  return NextResponse.json({ queue });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.verify' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = KycReviewActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de révision KYC invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { kycId, action, reason, resubmissionGuidance, notifyDriver } = parsed.data;

    const result = processKycReview(
      kycId,
      action,
      reason || (action === 'APPROVE' ? 'Dossier vérifié et validé par la commission' : 'Demande administrative'),
      resubmissionGuidance,
      auth.session.name,
      notifyDriver
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      item: result.item,
      driver: result.driver,
      message:
        action === 'APPROVE'
          ? 'Dossier approuvé et chauffeur notifié par SMS et WhatsApp.'
          : action === 'REJECT'
          ? 'Dossier rejeté avec notification du motif au chauffeur.'
          : 'Demande de resoumission envoyée au chauffeur par SMS et WhatsApp.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors du traitement du dossier' }, { status: 500 });
  }
}
