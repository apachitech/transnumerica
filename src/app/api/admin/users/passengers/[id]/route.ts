import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  findPassengerById,
  updatePassenger,
  setPassengerStatus,
  softDeletePassenger,
} from '@/lib/server/passengers-store';
import { UpdatePassengerSchema, PassengerActionSchema } from '@/lib/validations/users';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const passenger = findPassengerById(id);
  if (!passenger) {
    return NextResponse.json({ error: 'Passager introuvable' }, { status: 404 });
  }

  return NextResponse.json({ passenger });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  // Case 1: Status action (SUSPEND, BAN, ACTIVATE)
  if (body.action) {
    const permRequired = body.action === 'BAN' ? 'users.ban' : 'users.suspend';
    const auth = verifyApiAdminAuth(req, { permission: permRequired as any });
    if (!auth.authorized || !auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const parsedAction = PassengerActionSchema.safeParse(body);
    if (!parsedAction.success) {
      return NextResponse.json(
        { error: 'Motif obligatoire ou action invalide', details: parsedAction.error.format() },
        { status: 400 }
      );
    }

    const { action, reason } = parsedAction.data;
    let targetStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED' = 'ACTIVE';
    if (action === 'SUSPEND') targetStatus = 'SUSPENDED';
    else if (action === 'BAN') targetStatus = 'BANNED';
    else if (action === 'ACTIVATE') targetStatus = 'ACTIVE';

    const result = setPassengerStatus(id, targetStatus, reason, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, passenger: result.passenger });
  }

  // Case 2: Profile Update with Optimistic Locking
  const auth = verifyApiAdminAuth(req, { permission: 'users.update' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const parsed = UpdatePassengerSchema.safeParse({ ...body, id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données de mise à jour invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { version, auditReason, ...updates } = parsed.data;
  const result = updatePassenger(
    id,
    updates,
    version,
    auditReason || 'Mise à jour coordonnées',
    auth.session.name
  );

  if (!result.success) {
    if (result.conflict) {
      return NextResponse.json(
        { error: result.error, conflict: true, currentVersion: result.currentVersion },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, passenger: result.passenger });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  let reason = 'Suppression logique du profil passager demandée par administrateur';
  try {
    const body = await req.json();
    if (body.reason && typeof body.reason === 'string') {
      reason = body.reason.trim();
    }
  } catch {
    // Body optional, fallback to default reason
  }

  const result = softDeletePassenger(id, reason, auth.session.name);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Passager déplacé dans la corbeille.' });
}

