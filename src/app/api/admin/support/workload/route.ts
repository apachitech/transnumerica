import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { supportStore } from '@/lib/server/support-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'support.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const workloads = supportStore.getAgentWorkloads();
  return NextResponse.json({ workloads });
}
