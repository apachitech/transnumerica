import { describe, it, expect, beforeEach } from 'vitest';
import {
  supportStore,
  getSlaHoursForPriority,
  computeSlaDueAt,
  isTicketSlaBreached,
  DEFAULT_SUPPORT_AGENTS,
} from './support-store';

describe('Support Center & Dispute Store', () => {
  beforeEach(() => {
    supportStore.reset();
  });

  it('1. Retrieves initial tickets with proper filters and pagination', () => {
    const res = supportStore.getTickets({ page: 1, limit: 10 });
    expect(res.total).toBe(5);
    expect(res.items.length).toBe(5);

    // Filter by requester type DRIVER
    const drivers = supportStore.getTickets({ requesterType: 'DRIVER' });
    expect(drivers.total).toBe(1);
    expect(drivers.items[0].requesterName).toBe('Junior Ilunga');

    // Filter by language LN (Lingala)
    const lingala = supportStore.getTickets({ language: 'LN' });
    expect(lingala.total).toBe(1);
    expect(lingala.items[0].ticketNumber).toBe('SUP-2026-9041');
  });

  it('2. Correctly calculates SLA hours and breach flags', () => {
    expect(getSlaHoursForPriority('CRITICAL')).toBe(1);
    expect(getSlaHoursForPriority('HIGH')).toBe(4);
    expect(getSlaHoursForPriority('MEDIUM')).toBe(12);
    expect(getSlaHoursForPriority('LOW')).toBe(24);

    const nowIso = new Date().toISOString();
    const dueAt = computeSlaDueAt(nowIso, 4);
    expect(new Date(dueAt).getTime()).toBeGreaterThan(new Date(nowIso).getTime());

    // Past due ticket should be breached
    const breached = isTicketSlaBreached({
      slaDueAt: '2026-01-01T00:00:00Z',
      status: 'OPEN',
    });
    expect(breached).toBe(true);

    // Resolved ticket should NOT be marked breached even if past due
    const resolvedBreached = isTicketSlaBreached({
      slaDueAt: '2026-01-01T00:00:00Z',
      status: 'RESOLVED',
    });
    expect(resolvedBreached).toBe(false);
  });

  it('3. Assigns support agent and logs internal audit note', () => {
    const updated = supportStore.assignTicket(
      'ticket_01',
      'agent_sarah_01',
      'Assignation au superviseur senior pour arbitrage',
      'superadmin@transnumerica.cd'
    );

    expect(updated.assignedAgent?.id).toBe('agent_sarah_01');
    expect(updated.assignedAgent?.name).toBe('Sarah Mutombo');
    expect(updated.status).toBe('INVESTIGATING'); // Was OPEN, moves to INVESTIGATING
    expect(updated.version).toBe(2);

    const lastMsg = updated.messages[updated.messages.length - 1];
    expect(lastMsg.isInternal).toBe(true);
    expect(lastMsg.channel).toBe('INTERNAL_NOTE');
    expect(lastMsg.content).toContain('Sarah Mutombo');
  });

  it('4. Adds multichannel message replies and internal notes', () => {
    const ticketWithReply = supportStore.addMessage(
      'ticket_01',
      {
        channel: 'WHATSAPP',
        content: 'Mbote M. Patrick, tozo tala likambo na yo ya M-Pesa.',
        isInternal: false,
      },
      'Alain Kazadi'
    );

    const whatsappMsg = ticketWithReply.messages[ticketWithReply.messages.length - 1];
    expect(whatsappMsg.channel).toBe('WHATSAPP');
    expect(whatsappMsg.isInternal).toBe(false);
    expect(whatsappMsg.sender).toBe('Alain Kazadi');

    // Add internal note
    const ticketWithNote = supportStore.addMessage(
      'ticket_01',
      {
        channel: 'INTERNAL_NOTE',
        content: 'Contact pris avec le support technique Vodacom M-Pesa.',
        isInternal: true,
      },
      'Alain Kazadi'
    );

    const internalMsg = ticketWithNote.messages[ticketWithNote.messages.length - 1];
    expect(internalMsg.channel).toBe('INTERNAL_NOTE');
    expect(internalMsg.isInternal).toBe(true);
  });

  it('5. Escalates ticket to Level 2 supervisor and updates priority to CRITICAL', () => {
    const escalated = supportStore.escalateTicket(
      'ticket_02',
      'Chauffeur réclamant un blocage de compte et risque de grève',
      'superadmin@transnumerica.cd'
    );

    expect(escalated.priority).toBe('CRITICAL');
    expect(escalated.slaHours).toBe(1);
    expect(escalated.assignedAgent?.id).toBe('agent_sarah_01');
    expect(escalated.escalatedReason).toContain('risque de grève');
  });

  it('6. Resolves dispute with linked refund and optimistic locking', () => {
    const ticket = supportStore.getTicketById('ticket_01');
    expect(ticket).not.toBeNull();

    const resolved = supportStore.resolveDispute(
      'ticket_01',
      {
        resolutionCode: 'REFUND_ISSUED',
        note: 'Double débit avéré par la réconciliation bancaire. Remboursement de 3 000 CDF initié.',
        refundAmountMinor: 300000,
        version: ticket!.version,
      },
      'superadmin@transnumerica.cd'
    );

    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolution?.code).toBe('REFUND_ISSUED');
    expect(resolved.resolution?.refundAmountMinor).toBe(300000);
    expect(resolved.resolution?.refundReference).toMatch(/^REF-2026-\d{4}$/);
    expect(resolved.version).toBe(ticket!.version + 1);

    // Optimistic locking conflict test
    expect(() => {
      supportStore.resolveDispute(
        'ticket_01',
        {
          resolutionCode: 'TECHNICAL_FIX',
          note: 'Tentative concurrente avec ancienne version',
          version: ticket!.version, // Outdated version
        },
        'other_admin@transnumerica.cd'
      );
    }).toThrow(/Conflit de modification/);
  });

  it('7. Aggregates daily workload per agent with CSAT and SLA stats', () => {
    const workloads = supportStore.getAgentWorkloads();
    expect(workloads.length).toBe(DEFAULT_SUPPORT_AGENTS.length);

    const sarah = workloads.find((w) => w.agentId === 'agent_sarah_01');
    expect(sarah).toBeDefined();
    expect(sarah?.role).toBe('Superviseur Senior N2');

    const alain = workloads.find((w) => w.agentId === 'agent_alain_02');
    expect(alain).toBeDefined();
    expect(alain?.activeTicketsCount).toBeGreaterThanOrEqual(1);
  });

  it('8. Retrieves canned responses in French and Congolese languages (Lingala, Swahili, Tshiluba)', () => {
    const canned = supportStore.getCannedResponses();
    expect(canned.length).toBeGreaterThanOrEqual(4);

    const ack = canned.find((c) => c.id === 'canned_ack_investigation');
    expect(ack).toBeDefined();
    expect(ack?.fr).toContain('Votre requête a été prise en charge');
    expect(ack?.ln).toContain('Mbote na yo');
    expect(ack?.sw).toContain('Jambo sana');
    expect(ack?.tsh).toContain('Moyo webe');
    expect(ack?.en).toContain('Hello. Your inquiry');
  });

  it('9. Exports UTF-8 BOM compliant CSV with all support attributes', () => {
    const csv = supportStore.exportTicketsCsv();
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Ticket_Number;Date_Creation;Demandeur_Nom');
    expect(csv).toContain('SUP-2026-9041');
    expect(csv).toContain('Patrick Mwamba');
    expect(csv).toContain('PAY-99102-MPESA');
  });
});

