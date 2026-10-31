import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { supportStore } from '@/lib/server/support-store';
import { SupportResolveDisputeSchema } from '@/lib/validations/support';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const parseResult = SupportResolveDisputeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Paramètres de résolution invalides', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { resolutionCode, note, refundAmountMinor, compensationCreditMinor, version, adminPassword } =
      parseResult.data;

    // Check specific permission: refunding requires support.refund
    const requiredPerm =
      resolutionCode === 'REFUND_ISSUED' || resolutionCode === 'COMPENSATION_CREDIT'
        ? 'support.refund'
        : 'support.manage';

    const auth = verifyApiAdminAuth(req, { permission: requiredPerm });
    if (!auth.authorized || !auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    // Dangerous financial action: check password re-authentication if refund is requested
    if (resolutionCode === 'REFUND_ISSUED' && refundAmountMinor && refundAmountMinor > 0) {
      if (!adminPassword || adminPassword !== 'Transnumerica@RDC2026!') {
        return NextResponse.json(
          { error: 'Mot de passe administrateur erroné. Ré-authentification requise pour validation du remboursement.' },
          { status: 403 }
        );
      }
    }

    const updated = supportStore.resolveDispute(
      id,
      {
        resolutionCode,
        note,
        refundAmountMinor,
        compensationCreditMinor,
        version,
      },
      auth.session.name || auth.session.email
    );

    return NextResponse.json({
      success: true,
      ticket: updated,
      message:
        resolutionCode === 'REFUND_ISSUED'
          ? `Litige résolu : Remboursement de ${(refundAmountMinor || 0) / 100} CDF validé (Réf: ${updated.resolution?.refundReference}).`
          : resolutionCode === 'REJECTED_UNFOUNDED'
            ? 'Dossier rejeté suite à vérification des éléments.'
            : 'Dossier de support clôturé avec succès.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Erreur lors de la résolution du litige' },
      { status: 400 }
    );
  }
}
