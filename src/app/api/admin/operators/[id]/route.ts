import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  findOperatorById,
  updateOperatorProfile,
  softDeleteOperator,
} from '@/lib/server/operators-store';
import { UpdateOperatorProfileSchema } from '@/lib/validations/operators';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;
  const operator = findOperatorById(id);
  if (!operator) {
    return NextResponse.json({ error: 'Opérateur introuvable' }, { status: 404 });
  }

  return NextResponse.json({ operator });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = UpdateOperatorProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de mise à jour invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = updateOperatorProfile(id, parsed.data, auth.session.name);
    if (!result.success) {
      const status = result.serverVersion !== undefined ? 409 : 400;
      return NextResponse.json(
        { error: result.error, serverVersion: result.serverVersion },
        { status }
      );
    }

    return NextResponse.json({ success: true, operator: result.operator });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'operators.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const reason = (body?.reason || '').trim();
    if (reason.length < 5) {
      return NextResponse.json(
        { error: 'Un motif d’archivage explicite d’au moins 5 caractères est obligatoire pour l’audit.' },
        { status: 400 }
      );
    }

    const result = softDeleteOperator(id, reason, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, operator: result.operator });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

