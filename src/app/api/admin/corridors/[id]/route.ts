import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { corridorsRepository } from '@/lib/server/corridors-store';
import { OptimisticLockError } from '@/lib/server/crud-repository';

const UpdateCorridorSchema = z.object({
  code: z
    .string()
    .min(3, 'Le code doit comporter au moins 3 caractères')
    .max(20, 'Le code ne peut excéder 20 caractères')
    .optional(),
  originCity: z.string().min(2).optional(),
  destinationCity: z.string().min(2).optional(),
  distanceKm: z.coerce.number().positive().optional(),
  averageDurationHours: z.coerce.number().positive().optional(),
  basePriceCdf: z.coerce.number().positive().optional(),
  basePriceUsd: z.coerce.number().positive().optional(),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'SUSPENDED']).optional(),
  operatorCount: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  expectedVersion: z.coerce.number().int({ message: 'Version attendue requise pour le verrouillage optimiste' }),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'corridors.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const item = await corridorsRepository.findById(id);

  if (!item) {
    return NextResponse.json({ error: 'Ligne / corridor introuvable' }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'corridors.update' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateCorridorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { expectedVersion, ...updates } = parsed.data;
    const { ip } = getClientIpAndUa(req);

    const updated = await corridorsRepository.update(
      id,
      updates,
      expectedVersion,
      auth.session,
      ip
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err instanceof OptimisticLockError) {
      return NextResponse.json(
        {
          error: 'OptimisticLockError',
          message: err.message,
          currentVersion: err.currentVersion,
          expectedVersion: err.expectedVersion,
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'corridors.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    let reason = 'Suppression douce demandée par l’administrateur';
    try {
      const body = await req.json();
      if (body?.reason) reason = body.reason;
    } catch {
      // Reason may come via query param
      const url = new URL(req.url);
      const qReason = url.searchParams.get('reason');
      if (qReason) reason = qReason;
    }

    const { ip } = getClientIpAndUa(req);
    const deleted = await corridorsRepository.softDelete(id, reason, auth.session, ip);

    return NextResponse.json({ success: true, item: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

