import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsStore } from '@/lib/server/rides-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'rides.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;
  const ride = rideOperationsStore.getRideById(id);
  if (!ride) {
    return NextResponse.json({ error: 'Course introuvable' }, { status: 404 });
  }

  return NextResponse.json({ ride });
}

