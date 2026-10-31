import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyDriverApiAuth,
} from '@/lib/server/driver-auth';
import {
  getProviderById,
  setProviderOnlineStatus,
  canProviderOperate,
} from '@/lib/server/provider-store';

const statusSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE', 'BUSY']),
});

export async function POST(req: NextRequest) {
  const auth = verifyDriverApiAuth(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Non autorisé' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Statut invalide', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status } = parsed.data;
    const provider = getProviderById(auth.session.providerId);
    if (!provider) {
      return NextResponse.json({ error: 'Compte prestataire introuvable' }, { status: 404 });
    }

    // Server-enforced check before going online
    if (status === 'ONLINE') {
      const check = canProviderOperate(provider);
      if (!check.allowed) {
        return NextResponse.json(
          {
            error: check.reason || 'Dossier KYC non approuvé ou documents expirés',
            code: check.code,
          },
          { status: 403 }
        );
      }
    }

    const updated = setProviderOnlineStatus(provider.id, status);

    return NextResponse.json({
      success: true,
      currentOnlineStatus: updated.currentOnlineStatus,
      status: updated.status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur lors du changement de statut' },
      { status: 400 }
    );
  }
}

