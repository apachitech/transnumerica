import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getCmsSections,
  saveCmsSection,
  reorderCmsSections,
  resetCmsStore,
} from '@/lib/server/cms-store';
import { CmsSectionSchema, ReorderSectionsSchema } from '@/lib/validations/cms';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('reset') === 'true') {
    resetCmsStore();
    return NextResponse.json({ message: 'Données du CMS réinitialisées' });
  }

  try {
    const sections = await getCmsSections();
    return NextResponse.json(sections);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();

    // Check if reordering request
    if (body.orderedIds && Array.isArray(body.orderedIds)) {
      const parsedReorder = ReorderSectionsSchema.safeParse(body);
      if (!parsedReorder.success) {
        return NextResponse.json(
          { error: 'Format de réordonnancement invalide', details: parsedReorder.error.format() },
          { status: 400 }
        );
      }
      const reordered = await reorderCmsSections(
        parsedReorder.data.orderedIds,
        auth.session.email || auth.session.name
      );
      return NextResponse.json(reordered);
    }

    // Standard section create/update
    const parsed = CmsSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de la section invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await saveCmsSection(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l’enregistrement de la section';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

