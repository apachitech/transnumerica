import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { recordAuditEntry } from '@/lib/server/audit-store';

const PayoutSchema = z.object({
  batchId: z.string().min(1),
  beneficiaryName: z.string().min(1),
  amountMinor: z.number().positive(),
  currency: z.enum(['CDF', 'USD']),
  provider: z.string().min(1),
  accountNumber: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, {
    permission: 'payouts.execute',
    requireRecentReauth: true,
  });

  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = PayoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
  }

  const { batchId, beneficiaryName, amountMinor, currency, provider, accountNumber } = parsed.data;

  logAdminAction({
    adminUser: auth.session.name,
    action: 'VERSEMENT_COMMISSION_CHAUFFEUR',
    target: `${beneficiaryName} (${provider} - ${accountNumber})`,
    previousState: 'En attente',
    newState: 'Viré',
    reason: `Versement commission lot #${batchId} : ${(amountMinor / 100).toLocaleString('fr-FR')} ${currency}`,
  });

  return NextResponse.json({
    success: true,
    message: `Virement de ${(amountMinor / 100).toLocaleString('fr-FR')} ${currency} vers ${beneficiaryName} validé.`,
  });
}

// ---------------------- FINANCIAL IMMUTABILITY GUARD ----------------------

export async function DELETE(req: NextRequest) {
  const { ip, ua } = getClientIpAndUa(req);
  const auth = verifyApiAdminAuth(req);
  const actor = auth.session ? (auth.session.name || auth.session.email) : 'ANONYMOUS_UNAUTHORIZED';

  try {
    recordAuditEntry({
      actor,
      actorRole: auth.session?.role,
      action: 'TENTATIVE_SUPPRESSION_REGISTRE_REVERSEMENT (REJETÉE)',
      entityType: 'PAYOUT',
      entityId: 'ledger-payouts',
      previousState: { status: 'IMMUTABLE_PAYOUT_RECORD' },
      newState: { status: 'PRESERVED_405_BLOCKED' },
      diffSummary: 'Tentative de purge ou suppression physique d’ordres de reversement rejetée.',
      reason: 'Violation de conformité comptable : interdiction absolue de suppression physique des reversements financiers',
      ipAddress: ip,
      userAgent: ua,
      status: 'DENIED',
    });
  } catch (err) {
    console.error('Failed to audit payout deletion attempt:', err);
  }

  return NextResponse.json(
    {
      error: 'OPÉRATION STRICTEMENT INTERDITE (405) : Les écritures de reversement financier sont inaltérables et ne peuvent faire l’objet d’aucune suppression physique.',
      code: 'FINANCIAL_IMMUTABILITY_POLICY',
    },
    { status: 405 }
  );
}
