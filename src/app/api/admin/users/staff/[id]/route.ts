import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  findStaffAccountById,
  updateStaffAccount,
  softDeleteStaffAccount,
} from '@/lib/server/admin-store';
import { isSuperAdmin } from '@/lib/security/roles-permissions';
import { UpdateStaffSchema, StaffActionSchema } from '@/lib/validations/users';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'staff.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const staff = findStaffAccountById(id);
  if (!staff) {
    return NextResponse.json({ error: 'Collaborateur introuvable' }, { status: 404 });
  }

  return NextResponse.json({ staff });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'staff.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const isSuper = isSuperAdmin(auth.session.role);

  try {
    const body = await req.json();

    // Case 1: Quick action (DISABLE, ENABLE, FORCE_2FA)
    if (body.action) {
      const parsedAction = StaffActionSchema.safeParse(body);
      if (!parsedAction.success) {
        return NextResponse.json(
          { error: 'Motif de sécurité obligatoire (min. 5 caractères)' },
          { status: 400 }
        );
      }

      const target = findStaffAccountById(id);
      if (!target) {
        return NextResponse.json({ error: 'Collaborateur introuvable' }, { status: 404 });
      }

      const updates: any = {};
      if (body.action === 'DISABLE') updates.status = 'DISABLED';
      else if (body.action === 'ENABLE') updates.status = 'ACTIVE';
      else if (body.action === 'FORCE_2FA') updates.forceTotp = true;

      const result = updateStaffAccount(
        id,
        updates,
        body.version !== undefined ? body.version : target.version,
        parsedAction.data.reason,
        auth.session.name,
        isSuper
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error, conflict: result.conflict, currentVersion: result.currentVersion },
          { status: result.conflict ? 409 : 400 }
        );
      }

      return NextResponse.json({ success: true, staff: result.staff });
    }

    // Case 2: Full Edit Form
    const parsed = UpdateStaffSchema.safeParse({ ...body, id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { version, reason, ...updates } = parsed.data;

    // Check escalation: if trying to change role without SUPER_ADMIN
    const target = findStaffAccountById(id);
    if (!target) {
      return NextResponse.json({ error: 'Collaborateur introuvable' }, { status: 404 });
    }

    if (updates.role !== target.role && !isSuper) {
      return NextResponse.json(
        {
          error:
            'Tentative d’escalade de privilèges rejetée. Seul le Super Administrateur peut modifier les rôles.',
        },
        { status: 403 }
      );
    }

    const result = updateStaffAccount(
      id,
      updates as any,
      version,
      reason,
      auth.session.name,
      isSuper
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

    return NextResponse.json({ success: true, staff: result.staff });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'staff.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const isSuper = isSuperAdmin(auth.session.role);

  let reason = 'Suppression logique du compte collaborateur';
  try {
    const body = await req.json();
    if (body.reason) reason = body.reason;
  } catch {
    // Optional
  }

  const result = softDeleteStaffAccount(id, reason, auth.session.name, isSuper);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Compte désactivé et archivé.' });
}
