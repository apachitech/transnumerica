import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getAdminUsersList, updateUserRoleServer, logAdminAction } from '@/lib/server/admin-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const users = getAdminUsersList();
  return NextResponse.json({ users });
}

const RoleUpdateSchema = z.object({
  targetEmail: z.string().email(),
  newRole: z.enum(['ADMIN', 'SUPER_ADMIN']),
});

export async function POST(req: NextRequest) {
  // STRICT SERVER-SIDE ENFORCEMENT: Only SUPER_ADMIN can assign admin roles
  const auth = verifyApiAdminAuth(req, { requireSuperAdmin: true });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json(
      { error: 'Tentative d’escalade de privilèges rejetée. Seul le Super Administrateur peut modifier les rôles.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = RoleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const { targetEmail, newRole } = parsed.data;
    const ok = updateUserRoleServer(targetEmail, newRole, auth.session.name);

    if (!ok) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, targetEmail, newRole });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

const SuspendSchema = z.object({
  userId: z.string().min(1),
  suspended: z.boolean(),
  reason: z.string().min(3),
});

export async function PATCH(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.suspend' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = SuspendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const { userId, suspended, reason } = parsed.data;
    logAdminAction({
      adminUser: auth.session.name,
      action: suspended ? 'SUSPENSION_COMPTE_UTILISATEUR' : 'RÉACTIVATION_COMPTE_UTILISATEUR',
      target: `Utilisateur #${userId}`,
      previousState: suspended ? 'Actif' : 'Suspendu',
      newState: suspended ? 'Suspendu' : 'Actif',
      reason,
    });

    return NextResponse.json({ success: true, userId, suspended });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

