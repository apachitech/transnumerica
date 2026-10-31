import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { corridorsRepository } from '@/lib/server/corridors-store';

const BulkActionSchema = z.object({
  action: z.enum(['softDelete', 'restore', 'updateStatus']),
  ids: z.array(z.string()).min(1, 'Au moins un identifiant doit être sélectionné'),
  reason: z.string().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'SUSPENDED']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BulkActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { action, ids, reason, status } = parsed.data;

    const requiredPermission =
      action === 'softDelete'
        ? 'corridors.delete'
        : action === 'restore'
        ? 'corridors.restore'
        : 'corridors.update';

    const auth = verifyApiAdminAuth(req, { permission: requiredPermission });
    if (!auth.authorized || !auth.session) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const { ip } = getClientIpAndUa(req);
    const result = await corridorsRepository.bulkAction(
      action,
      ids,
      { reason, status },
      auth.session,
      ip
    );

    return NextResponse.json({ ...result, success: result.failed === 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
