import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { manageOperatorStaff } from '@/lib/server/operators-store';
import { OperatorStaffSchema } from '@/lib/validations/operators';

export async function POST(
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
    const action = body?.action as 'ADD' | 'UPDATE' | 'TOGGLE_STATUS' | 'DELETE';
    if (!['ADD', 'UPDATE', 'TOGGLE_STATUS', 'DELETE'].includes(action)) {
      return NextResponse.json({ error: 'Action employé invalide' }, { status: 400 });
    }

    if (action === 'ADD' || action === 'UPDATE') {
      const parsed = OperatorStaffSchema.safeParse(body?.staff);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Données employé invalides', details: parsed.error.format() },
          { status: 400 }
        );
      }
      const result = manageOperatorStaff(id, parsed.data as any, action, auth.session.name);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ success: true, operator: result.operator });
    }

    const staffId = body?.staffId;
    if (!staffId) {
      return NextResponse.json({ error: 'ID de l’employé requis' }, { status: 400 });
    }

    const result = manageOperatorStaff(id, { id: staffId } as any, action, auth.session.name);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, operator: result.operator });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la gestion du personnel' }, { status: 500 });
  }
}

