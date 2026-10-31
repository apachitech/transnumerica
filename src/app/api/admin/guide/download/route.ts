import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { recordAuditEntry } from '@/lib/server/audit-store';

export async function GET(req: NextRequest) {
  // 1. Strict Server-Side Admin Authentication Check
  const auth = verifyApiAdminAuth(req);
  if (!auth.authorized || !auth.session) {
    // Cloaking: return 404 instead of 401/403
    return NextResponse.json({ error: 'Endpoint introuvable' }, { status: 404 });
  }

  const filePath = path.resolve(process.cwd(), 'src/lib/server/secure-docs/TRANSNUMERICA_MANUEL_ADMINISTRATION.pdf');

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Document confidentiel introuvable' }, { status: 404 });
  }

  const { ip, ua } = getClientIpAndUa(req);

  // 2. Audit Trail of Confidential Manual Download
  recordAuditEntry({
    actor: auth.session.name || auth.session.email,
    actorId: auth.session.adminId,
    actorRole: auth.session.role,
    action: 'DOWNLOAD_CONFIDENTIAL_ADMIN_MANUAL',
    entityType: 'SETTINGS',
    entityId: 'DOC-ADMIN-MANUAL-2026',
    reason: 'Consultation du Manuel Officiel d\'Exploitation & d\'Administration',
    ipAddress: ip,
    userAgent: ua,
    status: 'SUCCESS',
  });

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="TRANSNUMERICA_MANUEL_ADMINISTRATION.pdf"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
