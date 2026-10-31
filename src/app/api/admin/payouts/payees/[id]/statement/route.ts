import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getPayeeStatement } from '@/lib/server/payouts-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'payouts.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const periodStart = searchParams.get('periodStart') || undefined;
  const periodEnd = searchParams.get('periodEnd') || undefined;

  try {
    const statement = await getPayeeStatement(id, periodStart, periodEnd);
    return NextResponse.json(statement);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la génération du relevé';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

