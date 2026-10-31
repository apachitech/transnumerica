import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCmsMedia, uploadCmsMedia } from '@/lib/server/cms-store';
import { CmsMediaUploadSchema } from '@/lib/validations/cms';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  try {
    const items = await getCmsMedia(includeDeleted);
    return NextResponse.json(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'media.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = CmsMediaUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données du média invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const uploaded = await uploadCmsMedia(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors du téléversement du média';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

