import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getRolePermissionsMatrixServer,
  updateRolePermissionsMatrixServer,
} from '@/lib/server/admin-store';
import { ALL_ADMIN_PERMISSIONS, isSuperAdmin } from '@/lib/security/roles-permissions';
import { UserRole } from '@/types';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'roles.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const matrix = getRolePermissionsMatrixServer();
  return NextResponse.json({
    matrix,
    allPermissions: ALL_ADMIN_PERMISSIONS,
  });
}

export async function PUT(req: NextRequest) {
  // Only SUPER_ADMIN can adjust the permissions matrix
  const auth = verifyApiAdminAuth(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  if (!isSuperAdmin(auth.session.role)) {
    return NextResponse.json(
      {
        error:
          'Tentative d’escalade de privilèges rejetée. Seul le Super Administrateur peut modifier la matrice des permissions.',
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { role, permissions, reason } = body;

    if (!role || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Rôle et permissions requis' }, { status: 400 });
    }

    if (role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Le rôle SUPER_ADMIN dispose obligatoirement de toutes les permissions système.' },
        { status: 400 }
      );
    }

    updateRolePermissionsMatrixServer(
      role as UserRole,
      permissions,
      reason || 'Mise à jour de la matrice de permissions par Super Admin',
      auth.session.name
    );

    return NextResponse.json({ success: true, role, permissions });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la matrice' }, { status: 500 });
  }
}

