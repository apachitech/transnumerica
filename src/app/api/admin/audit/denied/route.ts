import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getDeniedAccessLogs } from '@/lib/server/audit-store';
import { auditFilterSchema } from '@/lib/validations/audit';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'audit.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const rawParams = {
      search: searchParams.get('search') || undefined,
      actor: searchParams.get('actor') || undefined,
      ipAddress: searchParams.get('ipAddress') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
    };

    const parsed = auditFilterSchema.safeParse(rawParams);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de filtrage invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = getDeniedAccessLogs(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

