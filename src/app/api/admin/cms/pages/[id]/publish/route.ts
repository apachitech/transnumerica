import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { togglePublishCmsPage } from '@/lib/server/cms-store';
import { PublishPageSchema } from '@/lib/validations/cms';
import { reauthenticateSession, ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/admin-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const body = await req.json().catch(() => null);

  const parsed = PublishPageSchema.safeParse({ ...body, pageId: id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres de publication invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  // Attempt re-authentication
  if (token && parsed.data.password) {
    reauthenticateSession(token, parsed.data.password);
  }

  const auth = verifyApiAdminAuth(req, {
    permission: 'cms.publish',
    requireRecentReauth: true,
  });

  if (!auth.authorized || !auth.session) {
    return NextResponse.json(
      { error: auth.error || 'Mot de passe incorrect ou session expirée pour la publication' },
      { status: auth.status || 401 }
    );
  }

  try {
    const updated = await togglePublishCmsPage({
      pageId: id,
      publish: parsed.data.publish,
      authorEmail: auth.session.email || auth.session.name,
      reason: parsed.data.reason,
      version: parsed.data.version,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la publication';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

