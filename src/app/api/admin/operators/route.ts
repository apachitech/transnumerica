import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { findOperators, createOperator, resetOperatorsStore } from '@/lib/server/operators-store';
import { CreateOperatorSchema } from '@/lib/validations/operators';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || undefined;
  const city = searchParams.get('city') || undefined;
  const includeTrash = searchParams.get('trash') === 'true';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  const result = findOperators({
    page,
    limit,
    search,
    status,
    city,
    includeTrash,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('reset') === 'true') {
    resetOperatorsStore();
    return NextResponse.json({ success: true, message: 'Store réinitialisé' });
  }

  try {
    const body = await req.json();
    const parsed = CreateOperatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de création opérateur invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const operator = createOperator(parsed.data as any, auth.session.name);
    return NextResponse.json({ success: true, operator }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création de l’opérateur' }, { status: 500 });
  }
}

