import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getBusLayouts, createBusLayout } from '@/lib/server/catalog-store';
import { BusLayoutSchema } from '@/lib/validations/catalog';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const layouts = getBusLayouts();
  return NextResponse.json({ success: true, data: layouts });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.layouts' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = BusLayoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Configuration de cabine invalide', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const layout = createBusLayout(
      {
        ...parsed.data,
        vehicleTypeName: 'Autocar Interurbain',
      } as any,
      auth.session.name
    );

    return NextResponse.json({ success: true, layout }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}

