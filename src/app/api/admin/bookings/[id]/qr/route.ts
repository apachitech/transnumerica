import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bookingsStore } from '@/lib/server/bookings-store';

const QrSchema = z.object({
  reason: z.string().min(3, 'Le motif de régénération est requis'),
  version: z.number().int().nonnegative('Version invalide'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'bookings.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = QrSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = bookingsStore.regenerateQr(id, parsed.data.reason, auth.session.name, parsed.data.version);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: 'Nouveau QR Code cryptographique généré avec succès. L’ancien jeton a été révoqué.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

