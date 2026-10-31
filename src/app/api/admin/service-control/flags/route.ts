import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { serviceControlStore } from '@/lib/server/service-control-store';
import { FeatureFlagSchema } from '@/lib/validations/service-control';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const flags = serviceControlStore.getFlags();
  return NextResponse.json({
    flags,
    total: flags.length,
    activeCount: flags.filter((f) => f.isEnabled).length,
  });
}

const FlagToggleSchema = z.object({
  key: z.string().min(1),
  isEnabled: z.boolean(),
  reason: z.string().min(3),
  version: z.number().int().nonnegative().optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'services.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();

    // Check if simple toggle
    if (body.rolloutPercentage === undefined && body.name === undefined) {
      const parsed = FlagToggleSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Données de bascule invalides', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const result = serviceControlStore.toggleFlag(
        parsed.data.key,
        parsed.data.isEnabled,
        parsed.data.reason,
        auth.session.name,
        parsed.data.version
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: result.status || 400 });
      }

      return NextResponse.json({ success: true, flag: result.flag });
    }

    // Full upsert
    const parsed = FeatureFlagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de fonctionnalité invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = serviceControlStore.upsertFlag(parsed.data, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({ success: true, flag: result.flag });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PATCH(req);
}

