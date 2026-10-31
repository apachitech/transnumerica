import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getScheduledReports, createScheduledReport } from '@/lib/server/analytics-store';
import { scheduledReportInputSchema } from '@/lib/validations/analytics';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'analytics.view' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const reports = getScheduledReports();
    return NextResponse.json(reports);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'analytics.reports.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = scheduledReportInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de rapport programmé invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const created = createScheduledReport(
      parsed.data,
      auth.session.email || auth.session.name
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

