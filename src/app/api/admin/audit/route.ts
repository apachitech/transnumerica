import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getEnhancedAuditLogs } from '@/lib/server/audit-store';
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
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      status: searchParams.get('status') || undefined,
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

    const result = getEnhancedAuditLogs(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------- IMMUTABILITY GUARDS (405 METHOD NOT ALLOWED) ----------------------

export async function PUT() {
  return NextResponse.json(
    {
      error: 'OPÉRATION INTERDITE (405) : Le journal d’audit est strictement en écriture seule (append-only / WORM). Aucune modification n’est permise.',
      code: 'IMMUTABLE_AUDIT_LOG',
    },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: 'OPÉRATION INTERDITE (405) : Le journal d’audit est strictement en écriture seule (append-only / WORM). Aucune altération n’est permise.',
      code: 'IMMUTABLE_AUDIT_LOG',
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: 'OPÉRATION INTERDITE (405) : Le journal d’audit est strictement en écriture seule (append-only / WORM). La purge ou suppression de blocs est interdite.',
      code: 'IMMUTABLE_AUDIT_LOG',
    },
    { status: 405 }
  );
}
