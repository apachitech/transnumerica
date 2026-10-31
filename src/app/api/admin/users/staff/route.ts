import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getStaffAccountList, createStaffAccount } from '@/lib/server/admin-store';
import { isSuperAdmin } from '@/lib/security/roles-permissions';
import { CreateStaffSchema } from '@/lib/validations/users';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'staff.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeTrash = searchParams.get('trash') === 'true';
  const staff = getStaffAccountList(includeTrash);

  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  // STRICT RULE: Only SUPER_ADMIN may create admins or change roles
  const auth = verifyApiAdminAuth(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  if (!isSuperAdmin(auth.session.role)) {
    return NextResponse.json(
      {
        error:
          'Tentative d’escalade de privilèges rejetée. Seul le Super Administrateur peut créer des comptes administrateurs ou attribuer des rôles.',
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = CreateStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de compte invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = createStaffAccount(
      {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        role: parsed.data.role,
        permissions: parsed.data.permissions as any,
        forceTotp: parsed.data.forceTotp,
        password: parsed.data.password,
      },
      auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, staff: result.staff }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 });
  }
}

