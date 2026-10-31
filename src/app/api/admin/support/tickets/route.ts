import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { supportStore } from '@/lib/server/support-store';
import { SupportQuerySchema, SupportCreateTicketSchema } from '@/lib/validations/support';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'support.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);

  if (searchParams.get('reset') === 'true') {
    supportStore.reset();
    return NextResponse.json({ message: 'Support store reset' });
  }

  const parseResult = SupportQuerySchema.safeParse({
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
    query: searchParams.get('query') || undefined,
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    requesterType: searchParams.get('requesterType') || undefined,
    linkedType: searchParams.get('linkedType') || undefined,
    assignedAgentId: searchParams.get('assignedAgentId') || undefined,
    slaStatus: searchParams.get('slaStatus') || undefined,
    language: searchParams.get('language') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: searchParams.get('sortOrder') || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de requête invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const result = supportStore.getTickets(parseResult.data);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'support.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parseResult = SupportCreateTicketSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Données de ticket invalides', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const ticket = supportStore.createTicket(
      parseResult.data,
      auth.session.name || auth.session.email
    );

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Erreur lors de la création du ticket' },
      { status: 500 }
    );
  }
}
