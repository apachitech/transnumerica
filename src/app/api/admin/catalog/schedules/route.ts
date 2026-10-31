import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getRecurringSchedules, createRecurringSchedule } from '@/lib/server/catalog-store';
import { RecurringScheduleSchema } from '@/lib/validations/catalog';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const routeId = searchParams.get('routeId') || undefined;

  const schedules = getRecurringSchedules(routeId);
  return NextResponse.json({ success: true, data: schedules });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.schedules' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = RecurringScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données du planning récurrent invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const schedule = createRecurringSchedule(parsed.data as any, auth.session.name);
    return NextResponse.json({ success: true, schedule }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}

