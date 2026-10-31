import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { serviceControlStore } from '@/lib/server/service-control-store';
import { ServiceMatrixServiceId } from '@/types';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const matrix = serviceControlStore.getMatrix();
  const toggles: Record<string, Record<string, boolean>> = {};

  for (const entry of matrix) {
    if (!toggles[entry.cityId]) {
      toggles[entry.cityId] = {};
    }
    toggles[entry.cityId][entry.serviceId] = entry.enabled && !entry.suspension.isSuspended;
  }

  return NextResponse.json({ toggles });
}

const ToggleSchema = z.object({
  city: z.string().min(1),
  service: z.string().min(1),
  enabled: z.boolean(),
  reason: z.string().min(3),
});

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.toggle' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = ToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const { city, service, enabled, reason } = parsed.data;
    const result = serviceControlStore.toggleMatrixEntry(
      city,
      service.toLowerCase() as ServiceMatrixServiceId,
      enabled,
      reason,
      auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({ success: true, city, service, enabled });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
