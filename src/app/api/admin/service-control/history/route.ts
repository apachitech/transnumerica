import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { serviceControlStore } from '@/lib/server/service-control-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const snapshots = serviceControlStore.getSnapshots();
  return NextResponse.json({
    snapshots,
    total: snapshots.length,
  });
}

