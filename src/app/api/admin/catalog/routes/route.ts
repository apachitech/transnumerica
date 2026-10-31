import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCatalogRoutes, createCatalogRoute } from '@/lib/server/catalog-store';
import { CatalogRouteSchema } from '@/lib/validations/catalog';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const corridor = searchParams.get('corridor') || undefined;
  const includeTrash = searchParams.get('trash') === 'true';

  const routes = getCatalogRoutes({ search, corridor, includeTrash });
  return NextResponse.json({ success: true, data: routes });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.routes' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = CatalogRouteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de ligne invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = createCatalogRoute(parsed.data as any, auth.session.name);
    if (result.duplicateBlocked) {
      return NextResponse.json(
        {
          error: result.warning,
          duplicateBlocked: true,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, route: result.route }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}

