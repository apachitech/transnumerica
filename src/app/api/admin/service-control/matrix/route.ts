import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { serviceControlStore } from '@/lib/server/service-control-store';
import {
  UpdateCityServiceSchema,
  QuickToggleSchema,
} from '@/lib/validations/service-control';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const matrix = serviceControlStore.getMatrix();
  return NextResponse.json({
    matrix,
    total: matrix.length,
    activeCount: matrix.filter((m) => m.enabled && !m.suspension.isSuspended).length,
    suspendedCount: matrix.filter((m) => m.suspension.isSuspended).length,
    disabledCount: matrix.filter((m) => !m.enabled && !m.suspension.isSuspended).length,
  });
}

export async function PATCH(req: NextRequest) {
  // Allow quick toggle if user has services.toggle; for full update requires services.manage
  const auth = verifyApiAdminAuth(req, { permission: 'services.toggle' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();

    // Check if it's a full update or a quick toggle
    if (body.timeWindow !== undefined || body.zoneLimits !== undefined) {
      // Check for services.manage
      const manageAuth = verifyApiAdminAuth(req, { permission: 'services.manage' });
      if (!manageAuth.authorized || !manageAuth.session) {
        return NextResponse.json({ error: manageAuth.error }, { status: manageAuth.status || 403 });
      }

      const parsed = UpdateCityServiceSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Données invalides', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const result = serviceControlStore.updateMatrixEntry(parsed.data, auth.session.name);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: result.status || 400 });
      }

      return NextResponse.json({ success: true, entry: result.entry });
    }

    // Quick toggle
    const parsed = QuickToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides pour le basculement', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = serviceControlStore.toggleMatrixEntry(
      parsed.data.cityId,
      parsed.data.serviceId,
      parsed.data.enabled,
      parsed.data.reason,
      auth.session.name,
      parsed.data.version
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({ success: true, entry: result.entry });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

