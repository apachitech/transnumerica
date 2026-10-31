import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bulkGenerateTrips } from '@/lib/server/catalog-store';
import { BulkGenerateTripsSchema } from '@/lib/validations/catalog';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.schedules' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = BulkGenerateTripsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de génération invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = bulkGenerateTrips({
      scheduleId: parsed.data.scheduleId,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      skipExistingConflicts: parsed.data.skipExistingConflicts,
      adminUser: auth.session.name,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur lors de la génération' }, { status: 400 });
  }
}

