import {
  SupportTicket,
  SupportAgentWorkload,
  CannedResponse,
  SupportResolutionCode,
  SupportMessageChannel,
  SupportTicketMessage,
  SupportTicketPriority,
  SupportQueryResult,
} from '@/types';
import { logAdminAction } from '@/lib/server/admin-store';

export const DEFAULT_SUPPORT_AGENTS = [
  {
    agentId: 'agent_sarah_01',
    name: 'Sarah Mutombo',
    email: 'sarah.mutombo@transnumerica.cd',
    avatar: 'SM',
    role: 'Superviseur Senior N2',
  },
  {
    agentId: 'agent_alain_02',
    name: 'Alain Kazadi',
    email: 'alain.kazadi@transnumerica.cd',
    avatar: 'AK',
    role: 'Agent Litiges & Chauffeurs',
  },
  {
    agentId: 'agent_clarisse_03',
    name: 'Clarisse Kapinga',
    email: 'clarisse.kapinga@transnumerica.cd',
    avatar: 'CK',
    role: 'Agent Support Passagers & MOMO',
  },
  {
    agentId: 'agent_david_04',
    name: 'David Boketshu',
    email: 'david.boketshu@transnumerica.cd',
    avatar: 'DB',
    role: 'Agent Flottes & Opérateurs',
  },
];

export const DEFAULT_CANNED_RESPONSES: CannedResponse[] = [
  {
    id: 'canned_ack_investigation',
    category: 'PRISE_EN_CHARGE',
    title: 'Prise en charge & analyse en cours',
    fr: "Bonjour. Votre requête a été prise en charge par notre service d'assistance Trans-Numérica. Nous analysons actuellement les journaux de course et les transactions bancaires associées.",
    ln: "Mbote na yo. Likambo na yo ekomi na maboko ya ba équipes na biso ya Trans-Numérica. Tozo tala ba détails ya mobembo na makuta na yo sika oyo.",
    sw: "Jambo sana. Ombi lako limepokelewa na timu yetu ya msaada wa Trans-Numérica. Tunachunguza taarifa za safari na malipo yaliyofanyika mara moja.",
    tsh: "Moyo webe. Bualu buebe budi mu bianza bia bena mudimu wetu ba Trans-Numérica. Tudi tulondolola luendu ne makuta ebe ne lutulu.",
    en: 'Hello. Your inquiry has been received by Trans-Numerica customer support. We are actively reviewing your ride logs and associated transactions.',
  },
  {
    id: 'canned_refund_approved',
    category: 'REMBOURSEMENT',
    title: 'Remboursement Mobile Money validé',
    fr: "Votre demande de remboursement a été approuvée par la régulation financière. Le montant convenu est recrédité immédiatement sur votre compte Mobile Money (M-Pesa / Airtel Money / Orange Money).",
    ln: "Kosenga na yo ya kozongisama mbongo endimami. Mbongo na yo eko zonga na portefeuille Mobile Money na yo na mwa mikolo moke.",
    sw: "Ombi lako la kurejeshewa fedha limeidhinishwa. Pesa zako zitarudishwa moja kwa moja kwenye akaunti yako ya Mobile Money sasa hivi.",
    tsh: "Dilomba diebe dia kualuija makuta dianyishibue. Makuta neapingane mu Mobile Money webe mutshitupa tshipi.",
    en: 'Your refund request has been officially approved. The refund amount has been credited directly to your registered Mobile Money wallet.',
  },
  {
    id: 'canned_driver_behavior',
    category: 'COMPORTEMENT',
    title: 'Enquête de sécurité sur le chauffeur',
    fr: "Nous prenons les signalements de conduite et d'attitude avec la plus haute rigueur. Un dossier de rappel à l'ordre a été ouvert auprès de notre cellule d'inspection et de sécurité routière.",
    ln: "Toyoki malamu likambo ya ezaleli ya motoki. Tofungoli dossier ya bokengi mpo na kopesa ye etumbu soki ateki mobeko.",
    sw: "Tunachukua ripoti za tabia ya dereva kwa uzito mkubwa. Uchunguzi wa idara ya usalama barabarani umeanza na hatua kali zitachukuliwa.",
    tsh: "Tudi bumvue tshilumbu tshia ngikadilu wa muendeshi. Tudi bangate mapangadika a bupole bua kumunyoka ne kumupetesha disipline.",
    en: 'We take conduct and safety reports very seriously. An official investigation has been initiated with our road safety compliance unit.',
  },
  {
    id: 'canned_traffic_delay',
    category: 'RETARD',
    title: 'Excuses pour retard de circulation',
    fr: "Trans-Numérica vous présente ses sincères excuses pour le retard subi. Les embouteillages exceptionnels sur les artères urbaines ont ralenti l'approche de votre véhicule.",
    ln: "Bolimbisi mingi mpo na retard oyo ekoti na nzela mpo na embouteillage makasi na engumba.",
    sw: "Tunaomba radhi sana kwa kuchelewa kwa gari lako kulikosababishwa na msongamano mkubwa wa magari mjini.",
    tsh: "Tuakulomba luse bua lutulu lua kale lua buledi bua mikuna mu nshila ya tshimenga.",
    en: 'Trans-Numerica sincerely apologizes for the delay experienced, caused by severe traffic congestion on major urban corridors.',
  },
];

export function getSlaHoursForPriority(priority: SupportTicketPriority): number {
  switch (priority) {
    case 'CRITICAL':
      return 1;
    case 'HIGH':
      return 4;
    case 'MEDIUM':
      return 12;
    case 'LOW':
      return 24;
  }
}

export function computeSlaDueAt(createdAtIso: string, slaHours: number): string {
  const created = new Date(createdAtIso).getTime();
  const due = new Date(created + slaHours * 60 * 60 * 1000);
  return due.toISOString();
}

export function isTicketSlaBreached(ticket: { slaDueAt: string; status: string }): boolean {
  if (ticket.status === 'RESOLVED' || ticket.status === 'REJECTED') {
    return false;
  }
  return new Date().getTime() > new Date(ticket.slaDueAt).getTime();
}

const SEED_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket_01',
    ticketNumber: 'SUP-2026-9041',
    requesterType: 'USER',
    requesterName: 'Patrick Mwamba',
    requesterPhone: '+243812345678',
    requesterEmail: 'p.mwamba@gmail.cd',
    preferredLanguage: 'LN',
    category: 'OVERCHARGE',
    title: 'Double débit USSD lors du paiement de course express',
    description: 'Lors de la commande du taxi à Bandalungwa, une coupure de réseau a provoqué un double prélèvement de 3 000 CDF sur mon compte Vodacom M-Pesa.',
    linkedType: 'PAYMENT',
    linkedReference: 'PAY-99102-MPESA',
    amountInDisputeMinor: 300000,
    currency: 'CDF',
    priority: 'HIGH',
    status: 'OPEN',
    assignedAgent: {
      id: 'agent_alain_02',
      name: 'Alain Kazadi',
      email: 'alain.kazadi@transnumerica.cd',
    },
    createdAt: '2026-10-30T09:00:00Z',
    updatedAt: '2026-10-30T09:00:00Z',
    slaHours: 4,
    slaDueAt: '2026-10-30T13:00:00Z', // Breached relative to current time
    isSlaBreached: true,
    messages: [
      {
        id: 'msg_01_1',
        sender: 'Patrick Mwamba',
        senderRole: 'CUSTOMER',
        channel: 'WHATSAPP',
        content: 'Mbote! Nazwi confirmation ya M-Pesa mbala mibale mpo na course moko ya 3000 FC. Botala yango noki svp.',
        timestamp: '2026-10-30T09:00:00Z',
        isInternal: false,
      },
    ],
    version: 1,
    isDeleted: false,
  },
  {
    id: 'ticket_02',
    ticketNumber: 'SUP-2026-9042',
    requesterType: 'DRIVER',
    requesterName: 'Junior Ilunga',
    requesterPhone: '+243891122334',
    preferredLanguage: 'FR',
    category: 'APP_BUG',
    title: 'Course terminée non créditée sur solde chauffeur',
    description: 'La course TN-RIDE-99410 effectuée entre Gombe et Victoire s’est clôturée avec succès mais le montant net de 12 000 CDF n’apparaît pas dans mes gains du jour.',
    linkedType: 'RIDE',
    linkedReference: 'TN-RIDE-99410',
    amountInDisputeMinor: 1200000,
    currency: 'CDF',
    priority: 'MEDIUM',
    status: 'INVESTIGATING',
    assignedAgent: {
      id: 'agent_clarisse_03',
      name: 'Clarisse Kapinga',
      email: 'clarisse.kapinga@transnumerica.cd',
    },
    createdAt: '2026-10-30T15:30:00Z',
    updatedAt: '2026-10-30T16:10:00Z',
    slaHours: 12,
    slaDueAt: '2026-10-31T03:30:00Z',
    isSlaBreached: false,
    messages: [
      {
        id: 'msg_02_1',
        sender: 'Junior Ilunga',
        senderRole: 'CUSTOMER',
        channel: 'SMS',
        content: 'Bonjour service régulation, ma course TN-RIDE-99410 vers Victoire ne figure pas sur mon relevé instantané.',
        timestamp: '2026-10-30T15:30:00Z',
        isInternal: false,
      },
      {
        id: 'msg_02_2',
        sender: 'Clarisse Kapinga',
        senderRole: 'AGENT',
        channel: 'INTERNAL_NOTE',
        content: 'Vérification en cours auprès de la passerelle de paiement et du ride-engine. Le statut du trajet est bien COMPLETED.',
        timestamp: '2026-10-30T16:10:00Z',
        isInternal: true,
      },
    ],
    version: 2,
    isDeleted: false,
  },
  {
    id: 'ticket_03',
    ticketNumber: 'SUP-2026-9043',
    requesterType: 'OPERATOR',
    requesterName: 'Matadi Express VIP (Bureau Central)',
    requesterPhone: '+243818811223',
    requesterEmail: 'direction@matadiexpress.cd',
    preferredLanguage: 'FR',
    category: 'REFUND_REQUEST',
    title: 'Demande de compensation suite à interruption de corridor',
    description: 'Interruption inattendue du corridor Kinshasa-Matadi suite à un éboulement au péage de Kasangulu. 15 passagers du car TN-BUS-849204 sollicitent un avoir.',
    linkedType: 'BOOKING',
    linkedReference: 'TN-BUS-849204',
    amountInDisputeMinor: 4500000,
    currency: 'CDF',
    priority: 'CRITICAL',
    status: 'OPEN',
    assignedAgent: {
      id: 'agent_sarah_01',
      name: 'Sarah Mutombo',
      email: 'sarah.mutombo@transnumerica.cd',
    },
    createdAt: '2026-10-30T12:00:00Z',
    updatedAt: '2026-10-30T12:00:00Z',
    slaHours: 1,
    slaDueAt: '2026-10-30T13:00:00Z',
    isSlaBreached: true,
    messages: [
      {
        id: 'msg_03_1',
        sender: 'Matadi Express VIP',
        senderRole: 'CUSTOMER',
        channel: 'EMAIL',
        content: 'Monsieur le Régulateur, nous vous transmettons la liste des 15 réservations à basculer en coupon de crédit de transport.',
        timestamp: '2026-10-30T12:00:00Z',
        isInternal: false,
      },
    ],
    version: 1,
    isDeleted: false,
  },
  {
    id: 'ticket_04',
    ticketNumber: 'SUP-2026-9044',
    requesterType: 'USER',
    requesterName: 'Mireille Kalala',
    requesterPhone: '+243990011223',
    preferredLanguage: 'FR',
    category: 'LOST_ITEM',
    title: 'Sacoche avec pièces d’identité oubliée dans le véhicule',
    description: 'J’ai oublié une sacoche en cuir noir contenant ma carte d’électeur et mes clés à l’arrière du taxi sur le trajet Rond-point Ngaba - UPN.',
    linkedType: 'RIDE',
    linkedReference: 'TN-RIDE-44109',
    priority: 'LOW',
    status: 'RESOLVED',
    assignedAgent: {
      id: 'agent_alain_02',
      name: 'Alain Kazadi',
      email: 'alain.kazadi@transnumerica.cd',
    },
    createdAt: '2026-10-29T10:00:00Z',
    updatedAt: '2026-10-29T16:00:00Z',
    slaHours: 24,
    slaDueAt: '2026-10-30T10:00:00Z',
    isSlaBreached: false,
    resolution: {
      code: 'EXPLANATION_PROVIDED',
      note: 'Objet retrouvé par le chauffeur et déposé au point relais Trans-Numérica Victoire. La passagère a accusé bonne réception.',
      resolvedAt: '2026-10-29T16:00:00Z',
      resolvedBy: 'Alain Kazadi',
    },
    csatRating: 5,
    csatFeedback: 'Excellente assistance, le chauffeur a été honnête et le service client très réactif !',
    messages: [
      {
        id: 'msg_04_1',
        sender: 'Mireille Kalala',
        senderRole: 'CUSTOMER',
        channel: 'WHATSAPP',
        content: 'Bonjour, j’ai laissé ma sacoche sur le siège arrière svp contactez le chauffeur.',
        timestamp: '2026-10-29T10:00:00Z',
        isInternal: false,
      },
      {
        id: 'msg_04_2',
        sender: 'Alain Kazadi',
        senderRole: 'AGENT',
        channel: 'WHATSAPP',
        content: 'Bonjour Madame. Le chauffeur Christian a sécurisé votre sacoche. Elle est disponible au guichet Victoire.',
        timestamp: '2026-10-29T15:45:00Z',
        isInternal: false,
      },
    ],
    version: 3,
    isDeleted: false,
  },
  {
    id: 'ticket_05',
    ticketNumber: 'SUP-2026-9045',
    requesterType: 'USER',
    requesterName: 'Dieudonné Ilunga',
    requesterPhone: '+243825544332',
    preferredLanguage: 'SW',
    category: 'OVERCHARGE',
    title: 'Remboursement trajet annulé après débit Airtel Money',
    description: 'Course annulée par le système suite à l’indisponibilité du coursier moto mais les 15 000 CDF avaient été déduits de mon solde.',
    linkedType: 'PAYMENT',
    linkedReference: 'TX-AIRTEL-4419',
    amountInDisputeMinor: 1500000,
    currency: 'CDF',
    priority: 'HIGH',
    status: 'RESOLVED',
    assignedAgent: {
      id: 'agent_clarisse_03',
      name: 'Clarisse Kapinga',
      email: 'clarisse.kapinga@transnumerica.cd',
    },
    createdAt: '2026-10-29T14:00:00Z',
    updatedAt: '2026-10-29T15:30:00Z',
    slaHours: 4,
    slaDueAt: '2026-10-29T18:00:00Z',
    isSlaBreached: false,
    resolution: {
      code: 'REFUND_ISSUED',
      note: 'Remboursement intégral effectué via passerelle Airtel Money suite à confirmation de non-prise en charge.',
      resolvedAt: '2026-10-29T15:30:00Z',
      resolvedBy: 'Clarisse Kapinga',
      refundAmountMinor: 1500000,
      refundReference: 'REF-2026-8819',
    },
    csatRating: 4,
    csatFeedback: 'Pesa zimerudi haraka kwenye simu yangu, asante sana.',
    messages: [
      {
        id: 'msg_05_1',
        sender: 'Dieudonné Ilunga',
        senderRole: 'CUSTOMER',
        channel: 'SMS',
        content: 'Jambo, safari yangu ilikataliwa lakini pesa ilikatwa kwenye Airtel Money yangu.',
        timestamp: '2026-10-29T14:00:00Z',
        isInternal: false,
      },
    ],
    version: 2,
    isDeleted: false,
  },
];

class SupportStore {
  private tickets: SupportTicket[] = [];
  private cannedResponses: CannedResponse[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.tickets = JSON.parse(JSON.stringify(SEED_SUPPORT_TICKETS));
    this.cannedResponses = JSON.parse(JSON.stringify(DEFAULT_CANNED_RESPONSES));
    this.updateSlaBreachFlags();
  }

  private updateSlaBreachFlags() {
    for (const ticket of this.tickets) {
      ticket.isSlaBreached = isTicketSlaBreached(ticket);
    }
  }

  getCannedResponses(): CannedResponse[] {
    return [...this.cannedResponses];
  }

  getTickets(query: {
    page?: number;
    limit?: number;
    query?: string;
    status?: string;
    priority?: string;
    requesterType?: string;
    linkedType?: string;
    assignedAgentId?: string;
    slaStatus?: string;
    language?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): SupportQueryResult {
    this.updateSlaBreachFlags();

    const page = query.page || 1;
    const limit = query.limit || 20;
    const search = (query.query || '').trim().toLowerCase();
    const status = query.status || 'ALL';
    const priority = query.priority || 'ALL';
    const requesterType = query.requesterType || 'ALL';
    const linkedType = query.linkedType || 'ALL';
    const assignedAgentId = query.assignedAgentId || 'ALL';
    const slaStatus = query.slaStatus || 'ALL';
    const language = query.language || 'ALL';

    let filtered = this.tickets.filter((t) => !t.isDeleted);

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(search) ||
          t.requesterName.toLowerCase().includes(search) ||
          t.requesterPhone.toLowerCase().includes(search) ||
          t.title.toLowerCase().includes(search) ||
          t.linkedReference.toLowerCase().includes(search) ||
          (t.assignedAgent?.name || '').toLowerCase().includes(search)
      );
    }

    if (status !== 'ALL') {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (priority !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    if (requesterType !== 'ALL') {
      filtered = filtered.filter((t) => t.requesterType === requesterType);
    }

    if (linkedType !== 'ALL') {
      filtered = filtered.filter((t) => t.linkedType === linkedType);
    }

    if (assignedAgentId !== 'ALL') {
      if (assignedAgentId === 'UNASSIGNED') {
        filtered = filtered.filter((t) => !t.assignedAgent);
      } else {
        filtered = filtered.filter((t) => t.assignedAgent?.id === assignedAgentId);
      }
    }

    if (slaStatus !== 'ALL') {
      if (slaStatus === 'BREACHED') {
        filtered = filtered.filter((t) => t.isSlaBreached);
      } else if (slaStatus === 'ACTIVE') {
        filtered = filtered.filter((t) => !t.isSlaBreached && t.status !== 'RESOLVED' && t.status !== 'REJECTED');
      }
    }

    if (language !== 'ALL') {
      filtered = filtered.filter((t) => t.preferredLanguage === language);
    }

    // Sort
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return ((pOrder[a.priority] || 0) - (pOrder[b.priority] || 0)) * sortOrder;
      }
      if (sortBy === 'slaDueAt') {
        return (new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime()) * sortOrder;
      }
      if (sortBy === 'updatedAt') {
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * sortOrder;
      }
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortOrder;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  getTicketById(id: string): SupportTicket | null {
    this.updateSlaBreachFlags();
    const ticket = this.tickets.find((t) => t.id === id || t.ticketNumber === id);
    return ticket && !ticket.isDeleted ? { ...ticket } : null;
  }

  createTicket(
    data: {
      requesterType: 'USER' | 'DRIVER' | 'OPERATOR';
      requesterName: string;
      requesterPhone: string;
      requesterEmail?: string;
      preferredLanguage: 'FR' | 'LN' | 'SW' | 'TSH' | 'EN';
      category: any;
      title: string;
      description: string;
      linkedType: 'BOOKING' | 'RIDE' | 'PAYMENT' | 'DELIVERY' | 'GENERAL';
      linkedReference: string;
      amountInDisputeMinor?: number;
      priority: SupportTicketPriority;
    },
    adminUser: string
  ): SupportTicket {
    const now = new Date().toISOString();
    const nextNum = 9040 + this.tickets.length + 1;
    const ticketNumber = `SUP-2026-${nextNum}`;
    const slaHours = getSlaHoursForPriority(data.priority);
    const slaDueAt = computeSlaDueAt(now, slaHours);

    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      ticketNumber,
      requesterType: data.requesterType,
      requesterName: data.requesterName,
      requesterPhone: data.requesterPhone,
      requesterEmail: data.requesterEmail,
      preferredLanguage: data.preferredLanguage,
      category: data.category,
      title: data.title,
      description: data.description,
      linkedType: data.linkedType,
      linkedReference: data.linkedReference,
      amountInDisputeMinor: data.amountInDisputeMinor || 0,
      currency: 'CDF',
      priority: data.priority,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
      slaHours,
      slaDueAt,
      isSlaBreached: false,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          sender: data.requesterName,
          senderRole: 'CUSTOMER',
          channel: 'WHATSAPP',
          content: data.description,
          timestamp: now,
          isInternal: false,
        },
      ],
      version: 1,
      isDeleted: false,
    };

    this.tickets.unshift(newTicket);

    logAdminAction({
      adminUser,
      action: 'CRÉATION_TICKET_SUPPORT',
      target: `Ticket #${ticketNumber} (${data.requesterName} - ${data.linkedReference})`,
      previousState: '-',
      newState: newTicket.status,
      reason: `Création administrative d'un ticket de support pour ${data.requesterName}.`,
    });

    return { ...newTicket };
  }

  assignTicket(
    ticketId: string,
    agentId: string,
    reason: string,
    adminUser: string
  ): SupportTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) {
      throw new Error(`Ticket introuvable : ${ticketId}`);
    }

    const agent = DEFAULT_SUPPORT_AGENTS.find((a) => a.agentId === agentId);
    if (!agent) {
      throw new Error(`Agent de support introuvable : ${agentId}`);
    }

    const previousAgent = ticket.assignedAgent?.name || 'Non assigné';
    ticket.assignedAgent = {
      id: agent.agentId,
      name: agent.name,
      email: agent.email,
    };
    if (ticket.status === 'OPEN') {
      ticket.status = 'INVESTIGATING';
    }
    ticket.updatedAt = new Date().toISOString();
    ticket.version += 1;

    // Add internal note recording assignment
    ticket.messages.push({
      id: `msg_assign_${Date.now()}`,
      sender: adminUser,
      senderRole: 'SYSTEM',
      channel: 'INTERNAL_NOTE',
      content: `Ticket assigné à ${agent.name} (${agent.role}). Motif : ${reason}`,
      timestamp: ticket.updatedAt,
      isInternal: true,
    });

    logAdminAction({
      adminUser,
      action: 'ASSIGNATION_TICKET_SUPPORT',
      target: `Ticket #${ticket.ticketNumber} -> ${agent.name}`,
      previousState: previousAgent,
      newState: agent.name,
      reason,
    });

    return { ...ticket };
  }

  addMessage(
    ticketId: string,
    params: {
      channel: SupportMessageChannel;
      content: string;
      isInternal: boolean;
      cannedResponseId?: string;
    },
    adminUser: string
  ): SupportTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) {
      throw new Error(`Ticket introuvable : ${ticketId}`);
    }

    const now = new Date().toISOString();
    const newMessage: SupportTicketMessage = {
      id: `msg_${Date.now()}`,
      sender: adminUser,
      senderRole: params.isInternal ? 'SYSTEM' : 'AGENT',
      channel: params.channel,
      content: params.content,
      timestamp: now,
      isInternal: params.isInternal,
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = now;
    ticket.version += 1;

    if (!params.isInternal && ticket.status === 'OPEN') {
      ticket.status = 'INVESTIGATING';
    }

    logAdminAction({
      adminUser,
      action: params.isInternal ? 'NOTE_INTERNE_SUPPORT' : `RÉPONSE_SUPPORT_${params.channel}`,
      target: `Ticket #${ticket.ticketNumber} (${ticket.requesterName})`,
      previousState: '-',
      newState: params.channel,
      reason: params.content.slice(0, 120),
    });

    return { ...ticket };
  }

  escalateTicket(
    ticketId: string,
    reason: string,
    adminUser: string
  ): SupportTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) {
      throw new Error(`Ticket introuvable : ${ticketId}`);
    }

    const prevPriority = ticket.priority;
    const now = new Date().toISOString();

    ticket.priority = 'CRITICAL';
    ticket.slaHours = 1;
    ticket.slaDueAt = computeSlaDueAt(now, 1);
    ticket.isSlaBreached = false;
    ticket.escalatedAt = now;
    ticket.escalatedReason = reason;

    // Escalate to Senior Support Lead
    const seniorLead = DEFAULT_SUPPORT_AGENTS[0];
    ticket.assignedAgent = {
      id: seniorLead.agentId,
      name: seniorLead.name,
      email: seniorLead.email,
    };
    ticket.status = 'INVESTIGATING';
    ticket.updatedAt = now;
    ticket.version += 1;

    ticket.messages.push({
      id: `msg_esc_${Date.now()}`,
      sender: adminUser,
      senderRole: 'SYSTEM',
      channel: 'INTERNAL_NOTE',
      content: `🚨 ESCALADE DE NIVEAU 2 : Passé en priorité CRITIQUE et réassigné à ${seniorLead.name}. Motif : ${reason}`,
      timestamp: now,
      isInternal: true,
    });

    logAdminAction({
      adminUser,
      action: 'ESCALADE_TICKET_SUPPORT',
      target: `Ticket #${ticket.ticketNumber} -> ${seniorLead.name}`,
      previousState: prevPriority,
      newState: 'CRITICAL',
      reason,
    });

    return { ...ticket };
  }

  resolveDispute(
    ticketId: string,
    params: {
      resolutionCode: SupportResolutionCode;
      note: string;
      refundAmountMinor?: number;
      compensationCreditMinor?: number;
      version: number;
    },
    adminUser: string
  ): SupportTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) {
      throw new Error(`Ticket introuvable : ${ticketId}`);
    }

    // Optimistic locking
    if (ticket.version !== params.version) {
      throw new Error(
        `Conflit de modification (Verrouillage Optimiste) : le ticket a été modifié par un autre gestionnaire (version actuelle : ${ticket.version}, attendue : ${params.version}). Veuillez rafraîchir la page.`
      );
    }

    const now = new Date().toISOString();
    const prevStatus = ticket.status;

    let refundRef: string | undefined;
    if (params.resolutionCode === 'REFUND_ISSUED') {
      const refNum = Math.floor(1000 + Math.random() * 9000);
      refundRef = `REF-2026-${refNum}`;
    }

    ticket.status = params.resolutionCode === 'REJECTED_UNFOUNDED' ? 'REJECTED' : 'RESOLVED';
    ticket.resolution = {
      code: params.resolutionCode,
      note: params.note,
      resolvedAt: now,
      resolvedBy: adminUser,
      refundAmountMinor: params.refundAmountMinor,
      refundReference: refundRef,
      compensationCreditMinor: params.compensationCreditMinor,
    };
    ticket.isSlaBreached = false;
    ticket.updatedAt = now;
    ticket.version += 1;

    // Add resolution system message
    const resolutionLabels: Record<SupportResolutionCode, string> = {
      REFUND_ISSUED: `Remboursement validé de ${(params.refundAmountMinor || 0) / 100} CDF (Réf: ${refundRef})`,
      COMPENSATION_CREDIT: `Avoir / compensation crédité de ${(params.compensationCreditMinor || 0) / 100} CDF`,
      TECHNICAL_FIX: 'Résolu par correction technique / resynchronisation',
      EXPLANATION_PROVIDED: 'Résolu suite à explications fournies au client',
      REJECTED_UNFOUNDED: 'Litige rejeté (demande non fondée)',
    };

    ticket.messages.push({
      id: `msg_res_${Date.now()}`,
      sender: adminUser,
      senderRole: 'SYSTEM',
      channel: 'INTERNAL_NOTE',
      content: `Dossier clôturé avec le code [${params.resolutionCode}] : ${resolutionLabels[params.resolutionCode]}. Note : ${params.note}`,
      timestamp: now,
      isInternal: true,
    });

    logAdminAction({
      adminUser,
      action: params.resolutionCode === 'REFUND_ISSUED' ? 'REMBOURSEMENT_LITIGE' : 'CLÔTURE_LITIGE_SUPPORT',
      target: `Ticket #${ticket.ticketNumber} (${ticket.requesterName} - ${ticket.linkedReference})`,
      previousState: prevStatus,
      newState: ticket.status,
      reason: `${params.resolutionCode} : ${params.note}`,
    });

    return { ...ticket };
  }

  getAgentWorkloads(): SupportAgentWorkload[] {
    this.updateSlaBreachFlags();

    return DEFAULT_SUPPORT_AGENTS.map((agent) => {
      const assignedTickets = this.tickets.filter(
        (t) => !t.isDeleted && t.assignedAgent?.id === agent.agentId
      );

      const activeTickets = assignedTickets.filter(
        (t) => t.status === 'OPEN' || t.status === 'INVESTIGATING'
      );

      const urgentTickets = activeTickets.filter(
        (t) => t.priority === 'CRITICAL' || t.priority === 'HIGH'
      );

      const resolvedToday = assignedTickets.filter(
        (t) => t.status === 'RESOLVED' || t.status === 'REJECTED'
      );

      const breachedCount = activeTickets.filter((t) => t.isSlaBreached).length;

      const ratedTickets = assignedTickets.filter((t) => typeof t.csatRating === 'number');
      const csatAverage =
        ratedTickets.length > 0
          ? Number(
              (
                ratedTickets.reduce((acc, t) => acc + (t.csatRating || 0), 0) /
                ratedTickets.length
              ).toFixed(1)
            )
          : 4.8;

      return {
        agentId: agent.agentId,
        name: agent.name,
        email: agent.email,
        avatar: agent.avatar,
        role: agent.role,
        activeTicketsCount: activeTickets.length,
        urgentTicketsCount: urgentTickets.length,
        resolvedTodayCount: resolvedToday.length,
        slaBreachCount: breachedCount,
        avgResponseMinutes: agent.agentId === 'agent_sarah_01' ? 18 : 25,
        csatAverage,
      };
    });
  }

  exportTicketsCsv(): string {
    const BOM = '\uFEFF';
    const headers = [
      'Ticket_Number',
      'Date_Creation',
      'Demandeur_Nom',
      'Demandeur_Telephone',
      'Type_Demandeur',
      'Langue',
      'Categorie',
      'Titre',
      'Type_Lien',
      'Reference_Liee',
      'Montant_Conteste_CDF',
      'Priorite',
      'Statut',
      'Agent_Assigne',
      'Delai_SLA_Heures',
      'Echeance_SLA',
      'SLA_Depasse',
      'Code_Resolution',
      'Ref_Remboursement',
      'Note_CSAT',
    ];

    const rows = this.tickets
      .filter((t) => !t.isDeleted)
      .map((t) => [
        `"${t.ticketNumber}"`,
        `"${t.createdAt}"`,
        `"${t.requesterName.replace(/"/g, '""')}"`,
        `"${t.requesterPhone}"`,
        `"${t.requesterType}"`,
        `"${t.preferredLanguage}"`,
        `"${t.category}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.linkedType}"`,
        `"${t.linkedReference}"`,
        `${(t.amountInDisputeMinor || 0) / 100}`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${(t.assignedAgent?.name || 'Non assigné').replace(/"/g, '""')}"`,
        `${t.slaHours}`,
        `"${t.slaDueAt}"`,
        t.isSlaBreached ? '"OUI"' : '"NON"',
        `"${t.resolution?.code || 'N/A'}"`,
        `"${t.resolution?.refundReference || 'N/A'}"`,
        `${t.csatRating || 'N/A'}`,
      ]);

    return BOM + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  }
}

export const supportStore = new SupportStore();
