import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { exportAnalyticsData } from '@/lib/server/analytics-store';
import { analyticsExportSchema } from '@/lib/validations/analytics';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'analytics.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = analyticsExportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres d’exportation invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { csvContent, filename } = exportAnalyticsData(
      parsed.data,
      auth.session.email || auth.session.name
    );

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

