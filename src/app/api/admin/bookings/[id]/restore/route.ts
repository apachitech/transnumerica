import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bookingsStore } from '@/lib/server/bookings-store';

const RestoreSchema = z.object({
  reason: z.string().min(3, 'Le motif de restauration est obligatoire'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'bookings.restore' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = RestoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Motif de restauration invalide', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = bookingsStore.restore(id, parsed.data.reason, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Réservation restaurée avec succès depuis la corbeille.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

