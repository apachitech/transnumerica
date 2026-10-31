import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { reconcileStatement } from '@/lib/server/payments-store';
import { ReconciliationImportSchema } from '@/lib/validations/payments';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'payments.reconcile' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parseResult = ReconciliationImportSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Données d’import de relevé invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const report = reconcileStatement(
      parseResult.data.provider,
      parseResult.data.csvData,
      auth.session.name
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'IMPORT_RAPPROCHEMENT_BANCAIRE',
      target: `Relevé opérateur ${parseResult.data.provider}`,
      previousState: '-',
      newState: `Batch ${report.batchId}: ${report.matchedCount} rapprochés, ${report.discrepanciesCount} anomalies`,
      reason: parseResult.data.notes || `Rapprochement automatique de ${report.importedRowsCount} lignes du relevé`,
    });

    return NextResponse.json({
      success: true,
      message: `Rapprochement terminé: ${report.matchedCount} transactions rapprochées, ${report.discrepanciesCount} anomalies détectées.`,
      report,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du rapprochement du relevé';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

