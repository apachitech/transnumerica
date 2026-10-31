import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { findDriverById, updateDriverProfile, softDeleteDriver } from '@/lib/server/drivers-store';
import { UpdateDriverProfileSchema } from '@/lib/validations/drivers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const driver = findDriverById(id);
  if (!driver) {
    return NextResponse.json({ error: 'Chauffeur introuvable' }, { status: 404 });
  }

  return NextResponse.json({ driver });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateDriverProfileSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { version, auditReason, ...updates } = parsed.data;
    const result = updateDriverProfile(
      id,
      updates as any,
      version,
      auditReason || 'Mise à jour du profil chauffeur',
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

    return NextResponse.json({ success: true, driver: result.driver });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  let reason = 'Suppression logique du compte chauffeur demandée par administrateur';
  try {
    const body = await req.json();
    if (body.reason) reason = body.reason;
  } catch {
    // Optional
  }

  const result = softDeleteDriver(id, reason, auth.session.name);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Chauffeur déplacé dans la corbeille.' });
}

