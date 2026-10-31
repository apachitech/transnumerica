import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCmsReviews, moderateCmsReview } from '@/lib/server/cms-store';
import { CmsReviewModerationSchema } from '@/lib/validations/cms';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const reviews = await getCmsReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'reviews.moderate' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = CmsReviewModerationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de modération invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await moderateCmsReview({
      reviewId: parsed.data.reviewId,
      action: parsed.data.action,
      authorEmail: auth.session.email || auth.session.name,
      reason: parsed.data.reason,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la modération';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

