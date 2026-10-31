import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  toggleDriverSuspension,
  setDriverHelmetAvailability,
  assignDriverCooperative,
  manageDriverBadges,
  softDeleteDriver,
  restoreDriver,
} from '@/lib/server/drivers-store';
import { DriverQuickActionSchema } from '@/lib/validations/drivers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = DriverQuickActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données d’action invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { action, reason, hasPassengerHelmet, cooperativeName, badges } = parsed.data;

    // Check specific permissions
    let requiredPerm: any = 'drivers.manage';
    if (action === 'SUSPEND') requiredPerm = 'drivers.suspend';
    if (action === 'DELETE') requiredPerm = 'drivers.delete';
    if (action === 'RESTORE') requiredPerm = 'drivers.restore';

    const auth = verifyApiAdminAuth(req, { permission: requiredPerm });
    if (!auth.authorized || !auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    let result;
    if (action === 'SUSPEND') {
      result = toggleDriverSuspension(id, true, reason, auth.session.name);
    } else if (action === 'REINSTATE') {
      result = toggleDriverSuspension(id, false, reason, auth.session.name);
    } else if (action === 'SET_HELMET') {
      result = setDriverHelmetAvailability(id, Boolean(hasPassengerHelmet), reason, auth.session.name);
    } else if (action === 'ASSIGN_COOPERATIVE') {
      result = assignDriverCooperative(id, cooperativeName || 'Indépendant', reason, auth.session.name);
    } else if (action === 'UPDATE_BADGES') {
      result = manageDriverBadges(id, badges || [], reason, auth.session.name);
    } else if (action === 'DELETE') {
      result = softDeleteDriver(id, reason, auth.session.name);
    } else if (action === 'RESTORE') {
      result = restoreDriver(id, reason, auth.session.name);
    } else {
      return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, driver: result.driver });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

