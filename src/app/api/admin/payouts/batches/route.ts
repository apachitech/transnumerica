import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getBatches, generatePayoutBatch, resetPayoutsStore } from '@/lib/server/payouts-store';
import { GeneratePayoutBatchSchema } from '@/lib/validations/payouts';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'payouts.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('reset') === 'true') {
    resetPayoutsStore();
    return NextResponse.json({ message: 'Données des règlements réinitialisées avec succès' });
  }

  try {
    const batches = await getBatches();
    return NextResponse.json(batches);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'payouts.execute' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = GeneratePayoutBatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres du lot invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const batch = await generatePayoutBatch(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération du lot';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

