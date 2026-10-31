import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getAdminDisputes, resolveAdminDispute } from '@/lib/server/admin-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'disputes.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const disputes = getAdminDisputes();
  return NextResponse.json({ disputes });
}

const ResolveDisputeSchema = z.object({
  disputeId: z.string().min(1),
  resolutionNote: z.string().min(3),
});

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'disputes.resolve' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = ResolveDisputeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }

    const { disputeId, resolutionNote } = parsed.data;
    const resolved = resolveAdminDispute(disputeId, resolutionNote, auth.session.name);

    if (!resolved) {
      return NextResponse.json({ error: 'Litige introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, dispute: resolved });
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

