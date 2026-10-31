import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { exportAuditLogs } from '@/lib/server/audit-store';
import { auditExportSchema } from '@/lib/validations/audit';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'audit.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = auditExportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres d’exportation invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { format, filters, reason } = parsed.data;
    const actor = auth.session.name || auth.session.email;

    const result = exportAuditLogs(filters || {}, format, actor, reason);

    return new NextResponse(result.content, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'X-Exported-By': encodeURIComponent(actor),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l’exportation du journal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

