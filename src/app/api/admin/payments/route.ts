import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { getPayments, resetPaymentsStore } from '@/lib/server/payments-store';
import { PaymentQuerySchema } from '@/lib/validations/payments';
import { recordAuditEntry } from '@/lib/server/audit-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'payments.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);

  if (searchParams.get('reset') === 'true') {
    // Only allow reset in testing or for SUPER_ADMIN with recorded audit
    if (process.env.NODE_ENV !== 'test' && auth.session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Action non autorisée : la réinitialisation des paiements est strictement réservée au Super Administrateur.' },
        { status: 403 }
      );
    }
    resetPaymentsStore();
    return NextResponse.json({ message: 'Données de paiement réinitialisées' });
  }

  const parseResult = PaymentQuerySchema.safeParse({
    search: searchParams.get('search') || undefined,
    provider: searchParams.get('provider') || undefined,
    status: searchParams.get('status') || undefined,
    serviceType: searchParams.get('serviceType') || undefined,
    minAmount: searchParams.get('minAmount') || undefined,
    maxAmount: searchParams.get('maxAmount') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    reconciled: searchParams.get('reconciled') || undefined,
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
    includeDeleted: searchParams.get('includeDeleted') || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de filtre invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const result = getPayments({
    ...parseResult.data,
    includeDeleted: parseResult.data.includeDeleted === 'true',
  });

  return NextResponse.json(result);
}

// ---------------------- FINANCIAL IMMUTABILITY GUARD ----------------------

export async function DELETE(req: NextRequest) {
  const { ip, ua } = getClientIpAndUa(req);
  const auth = verifyApiAdminAuth(req);
  const actor = auth.session ? (auth.session.name || auth.session.email) : 'ANONYMOUS_UNAUTHORIZED';

  // Audit this hostile/forbidden deletion attempt in the immutable audit log
  try {
    recordAuditEntry({
      actor,
      actorRole: auth.session?.role,
      action: 'TENTATIVE_SUPPRESSION_REGISTRE_PAIEMENT (REJETÉE)',
      entityType: 'PAYMENT',
      entityId: 'ledger-payments',
      previousState: { status: 'IMMUTABLE_FINANCIAL_RECORD' },
      newState: { status: 'PRESERVED_405_BLOCKED' },
      diffSummary: 'Tentative de purge ou suppression physique de transactions financières rejetée.',
      reason: 'Violation de conformité comptable : interdiction absolue de suppression physique des paiements',
      ipAddress: ip,
      userAgent: ua,
      status: 'DENIED',
    });
  } catch (err) {
    console.error('Failed to audit payment deletion attempt:', err);
  }

  return NextResponse.json(
    {
      error: 'OPÉRATION STRICTEMENT INTERDITE (405) : Les écritures financières et transactions de paiement sont inaltérables et ne peuvent faire l’objet d’aucune suppression physique.',
      code: 'FINANCIAL_IMMUTABILITY_POLICY',
    },
    { status: 405 }
  );
}
