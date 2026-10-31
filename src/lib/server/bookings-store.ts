import crypto from 'crypto';
import {
  AdminDetailedBooking,
  BookingPassengerItem,
  BookingTimelineEvent,
  BookingNotificationRecord,
  CrudQueryResult,
  TicketVerificationResult,
} from '@/types';
import { logAdminAction } from '@/lib/server/admin-store';

function generateQrToken(bookingRef: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  return `TN_SECURE_${crypto.createHash('sha256').update(`${bookingRef}_${salt}_${Date.now()}`).digest('hex').substring(0, 32)}`;
}

const DEFAULT_BOOKINGS: AdminDetailedBooking[] = [
  {
    id: 'b-1',
    bookingRef: 'TN-BKG-849204',
    serviceType: 'BUS',
    customerName: 'Merveille Tshimanga',
    customerPhone: '+243821122334',
    customerEmail: 'm.tshimanga@gmail.com',
    routeId: 'route_kin_mat_vip',
    corridorCode: 'KIN-MAT',
    originCity: 'Kinshasa',
    destinationCity: 'Matadi',
    boardingStation: 'Terminal Gare Centrale Kinshasa',
    arrivalStation: 'Gare Routière Mpozo Matadi',
    departureDate: '2026-11-05',
    departureTime: '06:30',
    operatorId: 'op_matadi_express',
    operatorName: 'Matadi Express VIP',
    busPlateNumber: 'KN 8842 BG',
    comfortClass: 'VIP',
    passengers: [
      {
        id: 'p-1',
        ticketNumber: 'TN-TKT-849204-01',
        fullName: 'Merveille Tshimanga',
        phone: '+243821122334',
        idNumber: 'ID-KIN-2022-8812',
        seatNumber: '1A',
        status: 'ACTIVE',
        fareMinor: 3500000,
      },
      {
        id: 'p-2',
        ticketNumber: 'TN-TKT-849204-02',
        fullName: 'Dieudonné Tshimanga',
        phone: '+243821122335',
        seatNumber: '1B',
        status: 'ACTIVE',
        fareMinor: 3500000,
      },
    ],
    seats: ['1A', '1B'],
    totalAmountMinor: 7000000,
    currency: 'CDF',
    paymentStatus: 'PAID',
    paymentMethod: 'Vodacom M-Pesa',
    paymentTransactionRef: 'MPESA-TX-994821',
    bookingStatus: 'CONFIRMED',
    qrCodeToken: generateQrToken('TN-BKG-849204'),
    qrCodeGeneratedAt: '2026-10-29T06:12:00Z',
    timeline: [
      {
        id: 'evt-1',
        timestamp: '2026-10-29T06:12:00Z',
        author: 'Guichetier Kinshasa (Albert)',
        action: 'CREATION_RESERVATION',
        description: 'Réservation créée pour 2 passagers Kinshasa -> Matadi (Sièges 1A, 1B).',
      },
      {
        id: 'evt-2',
        timestamp: '2026-10-29T06:13:00Z',
        author: 'Passerelle M-Pesa',
        action: 'PAIEMENT_CONFIRME',
        description: 'Règlement de 70.000 CDF validé via Vodacom M-Pesa.',
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        channel: 'SMS',
        recipient: '+243821122334',
        sentAt: '2026-10-29T06:13:30Z',
        sentBy: 'Système Automatique',
        status: 'DELIVERED',
      },
    ],
    version: 1,
    createdAt: '2026-10-29T06:12:00Z',
    updatedAt: '2026-10-29T06:13:00Z',
  },
  {
    id: 'b-2',
    bookingRef: 'TN-BKG-739112',
    serviceType: 'BUS',
    customerName: 'Honoré Kabeya',
    customerPhone: '+243815554433',
    customerEmail: 'honore.kabeya@katanga-mining.cd',
    routeId: 'route_lub_kol_vip',
    corridorCode: 'LUB-KOL',
    originCity: 'Lubumbashi',
    destinationCity: 'Kolwezi',
    boardingStation: 'Gare Routière Kenya Lubumbashi',
    arrivalStation: 'Terminal Mwangeji Kolwezi',
    departureDate: '2026-11-06',
    departureTime: '07:00',
    operatorId: 'op_katanga_horizon',
    operatorName: 'Katanga Horizon VIP',
    busPlateNumber: 'LSH 4491 AA',
    comfortClass: 'VIP',
    passengers: [
      {
        id: 'p-3',
        ticketNumber: 'TN-TKT-739112-01',
        fullName: 'Honoré Kabeya',
        phone: '+243815554433',
        seatNumber: '4C',
        status: 'ACTIVE',
        fareMinor: 4500000,
      },
    ],
    seats: ['4C'],
    totalAmountMinor: 4500000,
    currency: 'CDF',
    paymentStatus: 'PAID',
    paymentMethod: 'Orange Money',
    paymentTransactionRef: 'OM-TX-338192',
    bookingStatus: 'CONFIRMED',
    qrCodeToken: generateQrToken('TN-BKG-739112'),
    qrCodeGeneratedAt: '2026-10-28T14:30:00Z',
    timeline: [
      {
        id: 'evt-3',
        timestamp: '2026-10-28T14:30:00Z',
        author: 'Client Mobile App',
        action: 'CREATION_RESERVATION',
        description: 'Billet Lubumbashi -> Kolwezi réservé en direct.',
      },
    ],
    notifications: [],
    version: 1,
    createdAt: '2026-10-28T14:30:00Z',
    updatedAt: '2026-10-28T14:30:00Z',
  },
  {
    id: 'b-3',
    bookingRef: 'TN-BKG-554201',
    serviceType: 'BUS',
    customerName: 'Espérance Furaha',
    customerPhone: '+243970112233',
    routeId: 'route_goma_buk_exp',
    corridorCode: 'GOM-BUK',
    originCity: 'Goma',
    destinationCity: 'Bukavu',
    boardingStation: 'Port Public de Goma',
    arrivalStation: 'Port Ihusi Bukavu',
    departureDate: '2026-10-25',
    departureTime: '08:30',
    operatorId: 'op_kivu_safari',
    operatorName: 'Kivu Safari Express',
    busPlateNumber: 'GOM 1209 BB',
    comfortClass: 'EXPRESS',
    passengers: [
      {
        id: 'p-4',
        ticketNumber: 'TN-TKT-554201-01',
        fullName: 'Espérance Furaha',
        phone: '+243970112233',
        seatNumber: '2A',
        status: 'USED',
        fareMinor: 2800000,
        boardedAt: '2026-10-25T08:15:00Z',
      },
    ],
    seats: ['2A'],
    totalAmountMinor: 2800000,
    currency: 'CDF',
    paymentStatus: 'PAID',
    paymentMethod: 'Airtel Money',
    bookingStatus: 'USED',
    qrCodeToken: generateQrToken('TN-BKG-554201'),
    qrCodeGeneratedAt: '2026-10-24T18:00:00Z',
    timeline: [
      {
        id: 'evt-4',
        timestamp: '2026-10-24T18:00:00Z',
        author: 'Agence Goma',
        action: 'CREATION_RESERVATION',
        description: 'Réservation créée avec succès.',
      },
      {
        id: 'evt-5',
        timestamp: '2026-10-25T08:15:00Z',
        author: 'Contrôleur Quai Goma (Jean)',
        action: 'EMBARQUEMENT_VALIDE',
        description: 'Billet validé au contrôle d’embarquement.',
      },
    ],
    notifications: [],
    version: 1,
    createdAt: '2026-10-24T18:00:00Z',
    updatedAt: '2026-10-25T08:15:00Z',
  },
  {
    id: 'b-4',
    bookingRef: 'TN-BKG-332901',
    serviceType: 'BUS',
    customerName: 'Placide Ilunga',
    customerPhone: '+243899443322',
    routeId: 'route_kin_kik_std',
    corridorCode: 'KIN-KIK',
    originCity: 'Kinshasa',
    destinationCity: 'Kikwit',
    boardingStation: 'Gare de Limete Échangeur',
    arrivalStation: 'Gare Centrale de Kikwit',
    departureDate: '2026-11-08',
    departureTime: '05:30',
    operatorId: 'op_congo_fleuve',
    operatorName: 'Congo Fleuve Coach',
    busPlateNumber: 'KN 6120 DD',
    comfortClass: 'STANDARD',
    passengers: [
      {
        id: 'p-5',
        ticketNumber: 'TN-TKT-332901-01',
        fullName: 'Placide Ilunga',
        phone: '+243899443322',
        seatNumber: '5A',
        status: 'CANCELLED',
        fareMinor: 3000000,
        cancelledAt: '2026-10-28T10:00:00Z',
        cancelReason: 'Annulation client pour impératif familial',
      },
    ],
    seats: [],
    totalAmountMinor: 3000000,
    currency: 'CDF',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'Espèces (Guichet)',
    bookingStatus: 'CANCELLED',
    qrCodeToken: generateQrToken('TN-BKG-332901'),
    qrCodeGeneratedAt: '2026-10-27T10:00:00Z',
    timeline: [
      {
        id: 'evt-6',
        timestamp: '2026-10-27T10:00:00Z',
        author: 'Guichetier Limete',
        action: 'CREATION_RESERVATION',
        description: 'Réservation au guichet réglée en espèces.',
      },
      {
        id: 'evt-7',
        timestamp: '2026-10-28T10:00:00Z',
        author: 'Super Admin',
        action: 'ANNULATION_COMPLETE',
        description: 'Annulation totale et remboursement espèces au guichet.',
        reason: 'Annulation client pour impératif familial',
      },
    ],
    notifications: [],
    version: 2,
    createdAt: '2026-10-27T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
];

class BookingsStore {
  private bookings: Map<string, AdminDetailedBooking> = new Map();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.bookings.clear();
    for (const b of DEFAULT_BOOKINGS) {
      this.bookings.set(b.id, JSON.parse(JSON.stringify(b)));
    }
  }

  public queryBookings(params: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    route?: string;
    operator?: string;
    date?: string;
    page?: number;
    limit?: number;
    includeTrash?: boolean;
  }): CrudQueryResult<AdminDetailedBooking> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const includeTrash = params.includeTrash || false;

    let all = Array.from(this.bookings.values());

    // Trash filter
    if (includeTrash) {
      all = all.filter((b) => b.deletedAt !== null && b.deletedAt !== undefined);
    } else {
      all = all.filter((b) => !b.deletedAt);
    }

    // Search filter: bookingRef, customerName, phone, ticketNumber, busPlate
    if (params.search?.trim()) {
      const q = params.search.toLowerCase().trim();
      all = all.filter(
        (b) =>
          b.bookingRef.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.originCity.toLowerCase().includes(q) ||
          b.destinationCity.toLowerCase().includes(q) ||
          b.operatorName.toLowerCase().includes(q) ||
          b.busPlateNumber.toLowerCase().includes(q) ||
          b.passengers.some((p) => p.fullName.toLowerCase().includes(q) || p.ticketNumber.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (params.status && params.status !== 'ALL') {
      all = all.filter((b) => b.bookingStatus === params.status);
    }

    // Payment status filter
    if (params.paymentStatus && params.paymentStatus !== 'ALL') {
      all = all.filter((b) => b.paymentStatus === params.paymentStatus);
    }

    // Route filter
    if (params.route && params.route !== 'ALL') {
      const r = params.route.toLowerCase();
      all = all.filter(
        (b) =>
          b.corridorCode.toLowerCase() === r ||
          b.originCity.toLowerCase().includes(r) ||
          b.destinationCity.toLowerCase().includes(r)
      );
    }

    // Operator filter
    if (params.operator && params.operator !== 'ALL') {
      const op = params.operator.toLowerCase();
      all = all.filter((b) => b.operatorId === params.operator || b.operatorName.toLowerCase().includes(op));
    }

    // Date filter (departureDate)
    if (params.date) {
      all = all.filter((b) => b.departureDate === params.date);
    }

    // Sort: most recent first
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    const activeList = Array.from(this.bookings.values()).filter((b) => !b.deletedAt);
    const trashList = Array.from(this.bookings.values()).filter((b) => !!b.deletedAt);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats: {
        totalActive: activeList.length,
        totalInTrash: trashList.length,
        confirmed: activeList.filter((b) => b.bookingStatus === 'CONFIRMED').length,
        used: activeList.filter((b) => b.bookingStatus === 'USED').length,
        cancelled: activeList.filter((b) => b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'PARTIALLY_CANCELLED').length,
        pending: activeList.filter((b) => b.bookingStatus === 'PENDING').length,
      },
    };
  }

  public getBooking(id: string): AdminDetailedBooking | undefined {
    return this.bookings.get(id);
  }

  public checkSeatConflict(
    tripDate: string,
    busPlateNumber: string,
    seatNumber: string,
    excludePassengerId?: string
  ): { hasConflict: boolean; conflictingBooking?: AdminDetailedBooking; conflictingPassenger?: BookingPassengerItem } {
    for (const booking of this.bookings.values()) {
      if (booking.deletedAt) continue;
      if (booking.bookingStatus === 'CANCELLED') continue;
      if (booking.departureDate === tripDate && booking.busPlateNumber.toLowerCase() === busPlateNumber.toLowerCase()) {
        for (const passenger of booking.passengers) {
          if (passenger.id === excludePassengerId) continue;
          if (passenger.status === 'CANCELLED') continue;
          if (passenger.seatNumber.toUpperCase() === seatNumber.toUpperCase()) {
            return {
              hasConflict: true,
              conflictingBooking: booking,
              conflictingPassenger: passenger,
            };
          }
        }
      }
    }
    return { hasConflict: false };
  }

  public createBooking(
    data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      routeId: string;
      corridorCode: string;
      originCity: string;
      destinationCity: string;
      boardingStation: string;
      departureDate: string;
      departureTime: string;
      operatorId: string;
      operatorName: string;
      busPlateNumber: string;
      comfortClass: string;
      passengers: { fullName: string; phone: string; idNumber?: string; seatNumber: string; fareMinor: number }[];
      currency: 'CDF' | 'USD';
      paymentMethod: string;
      notes?: string;
    },
    adminUser: string
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    // 1. Verify seat conflicts for all requested seats
    for (const p of data.passengers) {
      const conflict = this.checkSeatConflict(data.departureDate, data.busPlateNumber, p.seatNumber);
      if (conflict.hasConflict) {
        return {
          success: false,
          error: `Conflit de siège : Le siège ${p.seatNumber} est déjà réservé par ${conflict.conflictingPassenger?.fullName} (${conflict.conflictingBooking?.bookingRef}) sur ce trajet.`,
          status: 409,
        };
      }
    }

    const id = `b_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const bookingRef = `TN-BKG-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const passengersWithTickets: BookingPassengerItem[] = data.passengers.map((p, idx) => ({
      id: `p_${Date.now()}_${idx}`,
      ticketNumber: `TN-TKT-${bookingRef.replace('TN-BKG-', '')}-${String(idx + 1).padStart(2, '0')}`,
      fullName: p.fullName,
      phone: p.phone,
      idNumber: p.idNumber,
      seatNumber: p.seatNumber,
      status: 'ACTIVE',
      fareMinor: p.fareMinor,
    }));

    const totalAmountMinor = passengersWithTickets.reduce((sum, p) => sum + p.fareMinor, 0);
    const seats = passengersWithTickets.map((p) => p.seatNumber);

    const booking: AdminDetailedBooking = {
      id,
      bookingRef,
      serviceType: 'BUS',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      routeId: data.routeId,
      corridorCode: data.corridorCode,
      originCity: data.originCity,
      destinationCity: data.destinationCity,
      boardingStation: data.boardingStation,
      arrivalStation: `Gare Principale ${data.destinationCity}`,
      departureDate: data.departureDate,
      departureTime: data.departureTime,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      busPlateNumber: data.busPlateNumber,
      comfortClass: data.comfortClass,
      passengers: passengersWithTickets,
      seats,
      totalAmountMinor,
      currency: data.currency,
      paymentStatus: 'PAID',
      paymentMethod: data.paymentMethod,
      bookingStatus: 'CONFIRMED',
      qrCodeToken: generateQrToken(bookingRef),
      qrCodeGeneratedAt: now,
      timeline: [
        {
          id: `evt_${Date.now()}_1`,
          timestamp: now,
          author: adminUser,
          action: 'CREATION_MANUELLE_GUICHET',
          description: `Réservation manuelle créée pour ${data.customerName} (${passengersWithTickets.length} passagers, Sièges: ${seats.join(', ')}).`,
          reason: data.notes || 'Création au guichet / agence',
        },
      ],
      notifications: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.set(id, booking);

    logAdminAction({
      adminUser,
      action: 'BOOKING_CREATE',
      target: `${bookingRef} (${booking.customerName})`,
      previousState: 'Inexistant',
      newState: `Confirmé - ${seats.join(', ')} - ${data.originCity} -> ${data.destinationCity}`,
      reason: data.notes || 'Création manuelle guichet',
    });

    return { success: true, booking };
  }

  public updatePassenger(
    bookingId: string,
    data: {
      passengerId: string;
      fullName: string;
      phone: string;
      idNumber?: string;
      reason: string;
      version: number;
    },
    adminUser: string
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    if (booking.version !== data.version) {
      return {
        success: false,
        error: `Conflit de version optimiste (version actuelle: ${booking.version}, fournie: ${data.version})`,
        status: 409,
      };
    }

    const passengerIndex = booking.passengers.findIndex((p) => p.id === data.passengerId);
    if (passengerIndex === -1) {
      return { success: false, error: 'Passager introuvable dans cette réservation', status: 404 };
    }

    const prevPassenger = booking.passengers[passengerIndex];
    const prevDesc = `${prevPassenger.fullName} (${prevPassenger.phone})`;
    const newDesc = `${data.fullName} (${data.phone})`;

    const updatedPassenger: BookingPassengerItem = {
      ...prevPassenger,
      fullName: data.fullName,
      phone: data.phone,
      idNumber: data.idNumber,
    };

    booking.passengers[passengerIndex] = updatedPassenger;
    booking.version += 1;
    booking.updatedAt = new Date().toISOString();

    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: booking.updatedAt,
      author: adminUser,
      action: 'MODIFICATION_PASSAGER',
      description: `Données passager modifiées : "${prevDesc}" ➔ "${newDesc}"`,
      previousState: prevDesc,
      newState: newDesc,
      reason: data.reason,
    });

    logAdminAction({
      adminUser,
      action: 'BOOKING_PASSENGER_UPDATE',
      target: `${booking.bookingRef} (Passager ${prevPassenger.ticketNumber})`,
      previousState: prevDesc,
      newState: newDesc,
      reason: data.reason,
    });

    return { success: true, booking };
  }

  public moveSeat(
    bookingId: string,
    passengerId: string,
    newSeatNumber: string,
    reason: string,
    adminUser: string,
    version: number
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    if (booking.version !== version) {
      return {
        success: false,
        error: `Conflit de concurrence optimiste (version actuelle: ${booking.version}, fournie: ${version})`,
        status: 409,
      };
    }

    const passenger = booking.passengers.find((p) => p.id === passengerId);
    if (!passenger) return { success: false, error: 'Passager introuvable', status: 404 };

    const oldSeat = passenger.seatNumber;
    if (oldSeat.toUpperCase() === newSeatNumber.toUpperCase()) {
      return { success: false, error: 'Le passager occupe déjà ce siège.', status: 400 };
    }

    // Check conflict on this bus & departure date
    const conflict = this.checkSeatConflict(booking.departureDate, booking.busPlateNumber, newSeatNumber, passengerId);
    if (conflict.hasConflict) {
      return {
        success: false,
        error: `Conflit de siège : Le siège ${newSeatNumber} est déjà occupé par ${conflict.conflictingPassenger?.fullName} (${conflict.conflictingBooking?.bookingRef}).`,
        status: 409,
      };
    }

    passenger.seatNumber = newSeatNumber.toUpperCase();
    booking.seats = booking.passengers.filter((p) => p.status === 'ACTIVE').map((p) => p.seatNumber);
    booking.version += 1;
    booking.updatedAt = new Date().toISOString();

    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: booking.updatedAt,
      author: adminUser,
      action: 'DEPLACEMENT_SIEGE',
      description: `Siège déplacé pour ${passenger.fullName} : ${oldSeat} ➔ ${newSeatNumber.toUpperCase()}`,
      previousState: `Siège ${oldSeat}`,
      newState: `Siège ${newSeatNumber.toUpperCase()}`,
      reason,
    });

    logAdminAction({
      adminUser,
      action: 'BOOKING_SEAT_MOVE',
      target: `${booking.bookingRef} (${passenger.fullName})`,
      previousState: oldSeat,
      newState: newSeatNumber.toUpperCase(),
      reason,
    });

    return { success: true, booking };
  }

  public rescheduleBooking(
    bookingId: string,
    data: {
      newDepartureDate: string;
      newDepartureTime: string;
      newBusPlateNumber?: string;
      fareDifferenceMinor: number;
      reason: string;
      version: number;
    },
    adminUser: string
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    if (booking.version !== data.version) {
      return {
        success: false,
        error: `Conflit de version optimiste (version actuelle: ${booking.version}, fournie: ${data.version})`,
        status: 409,
      };
    }

    // Check seat availability on the new date
    const targetBus = data.newBusPlateNumber || booking.busPlateNumber;
    for (const p of booking.passengers) {
      if (p.status !== 'ACTIVE') continue;
      const conflict = this.checkSeatConflict(data.newDepartureDate, targetBus, p.seatNumber, p.id);
      if (conflict.hasConflict) {
        return {
          success: false,
          error: `Conflit pour la nouvelle date : Le siège ${p.seatNumber} est déjà pris sur le départ du ${data.newDepartureDate}.`,
          status: 409,
        };
      }
    }

    const prevDateDesc = `${booking.departureDate} à ${booking.departureTime}`;
    const newDateDesc = `${data.newDepartureDate} à ${data.newDepartureTime}`;

    booking.departureDate = data.newDepartureDate;
    booking.departureTime = data.newDepartureTime;
    if (data.newBusPlateNumber) {
      booking.busPlateNumber = data.newBusPlateNumber;
    }

    // Handle fare difference
    if (data.fareDifferenceMinor > 0) {
      booking.totalAmountMinor += data.fareDifferenceMinor;
      booking.timeline.unshift({
        id: `evt_${Date.now()}_diff`,
        timestamp: new Date().toISOString(),
        author: adminUser,
        action: 'SUPPLEMENT_TARIFAIRE',
        description: `Supplément de date de ${data.fareDifferenceMinor / 100} ${booking.currency} appliqué.`,
        reason: data.reason,
      });
    } else if (data.fareDifferenceMinor < 0) {
      const refundAmount = Math.abs(data.fareDifferenceMinor);
      booking.totalAmountMinor -= refundAmount;
      booking.paymentStatus = 'PARTIALLY_REFUNDED';
      booking.timeline.unshift({
        id: `evt_${Date.now()}_diff`,
        timestamp: new Date().toISOString(),
        author: adminUser,
        action: 'AVOIR_DIFFERENTIEL',
        description: `Différentiel crédité/remboursé : ${refundAmount / 100} ${booking.currency}.`,
        reason: data.reason,
      });
    }

    booking.version += 1;
    booking.updatedAt = new Date().toISOString();

    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: booking.updatedAt,
      author: adminUser,
      action: 'REPORT_DATE_VOYAGE',
      description: `Report de voyage : ${prevDateDesc} ➔ ${newDateDesc}`,
      previousState: prevDateDesc,
      newState: newDateDesc,
      reason: data.reason,
    });

    logAdminAction({
      adminUser,
      action: 'BOOKING_RESCHEDULE',
      target: booking.bookingRef,
      previousState: prevDateDesc,
      newState: newDateDesc,
      reason: data.reason,
    });

    return { success: true, booking };
  }

  public cancelBooking(
    bookingId: string,
    data: {
      passengerId?: string; // if set -> partial cancel
      reason: string;
      refundMode: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'NO_REFUND' | 'VOUCHER';
      version: number;
    },
    adminUser: string
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    if (booking.version !== data.version) {
      return {
        success: false,
        error: `Conflit de concurrence optimiste (version actuelle: ${booking.version}, fournie: ${data.version})`,
        status: 409,
      };
    }

    const now = new Date().toISOString();

    if (data.passengerId) {
      // Partial cancellation
      const passenger = booking.passengers.find((p) => p.id === data.passengerId);
      if (!passenger) return { success: false, error: 'Passager introuvable', status: 404 };
      if (passenger.status === 'CANCELLED') {
        return { success: false, error: 'Ce passager est déjà annulé', status: 400 };
      }

      passenger.status = 'CANCELLED';
      passenger.cancelledAt = now;
      passenger.cancelReason = data.reason;

      // Free up the seat
      booking.seats = booking.passengers.filter((p) => p.status === 'ACTIVE').map((p) => p.seatNumber);

      const remainingActive = booking.passengers.filter((p) => p.status === 'ACTIVE');
      if (remainingActive.length === 0) {
        booking.bookingStatus = 'CANCELLED';
        booking.paymentStatus = 'REFUNDED';
      } else {
        booking.bookingStatus = 'PARTIALLY_CANCELLED';
        booking.paymentStatus = 'PARTIALLY_REFUNDED';
      }

      booking.version += 1;
      booking.updatedAt = now;

      booking.timeline.unshift({
        id: `evt_${Date.now()}`,
        timestamp: now,
        author: adminUser,
        action: 'ANNULATION_PARTIELLE',
        description: `Annulation du passager ${passenger.fullName} (Siège ${passenger.seatNumber} libéré). Mode: ${data.refundMode}.`,
        reason: data.reason,
      });

      logAdminAction({
        adminUser,
        action: 'BOOKING_PARTIAL_CANCEL',
        target: `${booking.bookingRef} (${passenger.fullName})`,
        previousState: 'Actif',
        newState: 'Annulé (Siège libéré)',
        reason: data.reason,
      });

      return { success: true, booking };
    }

    // Full cancellation
    for (const p of booking.passengers) {
      p.status = 'CANCELLED';
      p.cancelledAt = now;
      p.cancelReason = data.reason;
    }
    booking.seats = [];
    booking.bookingStatus = 'CANCELLED';
    if (data.refundMode !== 'NO_REFUND') {
      booking.paymentStatus = 'REFUNDED';
    }

    booking.version += 1;
    booking.updatedAt = now;

    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: now,
      author: adminUser,
      action: 'ANNULATION_COMPLETE',
      description: `Annulation complète de la réservation. Tous les sièges ont été libérés. Mode: ${data.refundMode}.`,
      reason: data.reason,
    });

    logAdminAction({
      adminUser,
      action: 'BOOKING_FULL_CANCEL',
      target: booking.bookingRef,
      previousState: 'Confirmé',
      newState: 'Annulé',
      reason: data.reason,
    });

    return { success: true, booking };
  }

  public resendTicket(
    bookingId: string,
    channel: 'SMS' | 'WHATSAPP' | 'EMAIL',
    recipient: string,
    reason: string,
    adminUser: string
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    const now = new Date().toISOString();
    const notif: BookingNotificationRecord = {
      id: `notif_${Date.now()}`,
      channel,
      recipient,
      sentAt: now,
      sentBy: adminUser,
      status: 'DELIVERED',
    };

    booking.notifications.unshift(notif);
    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: now,
      author: adminUser,
      action: `ENVOI_BILLET_${channel}`,
      description: `Billet électronique renvoyé par ${channel} à ${recipient}.`,
      reason,
    });
    booking.updatedAt = now;

    logAdminAction({
      adminUser,
      action: 'BOOKING_RESEND_TICKET',
      target: `${booking.bookingRef} -> ${recipient} (${channel})`,
      previousState: 'Non renvoyé',
      newState: `Envoyé via ${channel}`,
      reason,
    });

    return { success: true, booking };
  }

  public regenerateQr(
    bookingId: string,
    reason: string,
    adminUser: string,
    version: number
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    if (booking.version !== version) {
      return {
        success: false,
        error: `Conflit de concurrence optimiste (version actuelle: ${booking.version}, fournie: ${version})`,
        status: 409,
      };
    }

    const now = new Date().toISOString();
    booking.qrCodeToken = generateQrToken(booking.bookingRef);
    booking.qrCodeGeneratedAt = now;
    booking.version += 1;
    booking.updatedAt = now;

    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: now,
      author: adminUser,
      action: 'REGENERATION_QR_CODE',
      description: 'Nouveau QR Code cryptographique généré. L’ancien jeton est révoqué.',
      reason,
    });

    logAdminAction({
      adminUser,
      action: 'BOOKING_REGENERATE_QR',
      target: booking.bookingRef,
      previousState: 'Ancien QR',
      newState: 'Nouveau QR sécurisé',
      reason,
    });

    return { success: true, booking };
  }

  public markTicketUsed(
    bookingId: string,
    ticketNumber: string | undefined,
    notes: string | undefined,
    adminUser: string,
    version: number
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    if (booking.version !== version) {
      return {
        success: false,
        error: `Conflit de concurrence optimiste (version actuelle: ${booking.version}, fournie: ${version})`,
        status: 409,
      };
    }

    const now = new Date().toISOString();

    if (ticketNumber) {
      const passenger = booking.passengers.find((p) => p.ticketNumber === ticketNumber);
      if (!passenger) return { success: false, error: 'Billet passager introuvable', status: 404 };
      if (passenger.status === 'USED') {
        return { success: false, error: 'Ce billet a déjà été validé et utilisé.', status: 400 };
      }
      if (passenger.status === 'CANCELLED') {
        return { success: false, error: 'Ce billet est annulé.', status: 400 };
      }

      passenger.status = 'USED';
      passenger.boardedAt = now;
    } else {
      // Mark all active passengers as used
      for (const p of booking.passengers) {
        if (p.status === 'ACTIVE') {
          p.status = 'USED';
          p.boardedAt = now;
        }
      }
    }

    const allUsed = booking.passengers.every((p) => p.status === 'USED' || p.status === 'CANCELLED');
    if (allUsed) {
      booking.bookingStatus = 'USED';
    }

    booking.version += 1;
    booking.updatedAt = now;

    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: now,
      author: adminUser,
      action: 'EMBARQUEMENT_VALIDE',
      description: ticketNumber
        ? `Billet ${ticketNumber} marqué comme UTILISÉ (Embarqué).`
        : 'Tous les passagers ont été marqués comme UTILISÉS (Embarqués).',
      reason: notes || 'Contrôle quai / chef de bord',
    });

    logAdminAction({
      adminUser,
      action: 'BOOKING_MARK_USED',
      target: `${booking.bookingRef} (${ticketNumber || 'Tous'})`,
      previousState: 'Non utilisé',
      newState: 'Utilisé / Embarqué',
      reason: notes || 'Validation embarquement',
    });

    return { success: true, booking };
  }

  public triggerRefund(
    bookingId: string,
    amountMinor: number,
    reason: string,
    adminUser: string,
    version: number
  ): { success: boolean; booking?: AdminDetailedBooking; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    if (booking.version !== version) {
      return {
        success: false,
        error: `Conflit de version optimiste (version actuelle: ${booking.version}, fournie: ${version})`,
        status: 409,
      };
    }

    const now = new Date().toISOString();
    const isFull = amountMinor >= booking.totalAmountMinor;
    booking.paymentStatus = isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    booking.version += 1;
    booking.updatedAt = now;

    booking.timeline.unshift({
      id: `evt_${Date.now()}`,
      timestamp: now,
      author: adminUser,
      action: 'REMBOURSEMENT_EXECUTE',
      description: `Remboursement de ${amountMinor / 100} ${booking.currency} exécuté via le module de paiement.`,
      reason,
    });

    logAdminAction({
      adminUser,
      action: 'BOOKING_REFUND',
      target: `${booking.bookingRef} (${amountMinor / 100} ${booking.currency})`,
      previousState: booking.paymentStatus,
      newState: isFull ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      reason,
    });

    return { success: true, booking };
  }

  public verifyTicket(codeOrToken: string): TicketVerificationResult {
    const clean = codeOrToken.trim();

    for (const booking of this.bookings.values()) {
      if (booking.deletedAt) continue;

      // 1. Check QR Token match
      if (booking.qrCodeToken === clean) {
        if (booking.bookingStatus === 'CANCELLED') {
          return {
            valid: false,
            code: 'CANCELLED',
            message: 'Ce billet a été ANNULÉ par le voyageur ou l’opérateur.',
            booking,
          };
        }
        if (booking.bookingStatus === 'USED') {
          return {
            valid: false,
            code: 'ALREADY_USED',
            message: 'Ce billet a DÉJÀ ÉTÉ UTILISÉ pour un embarquement antérieur.',
            booking,
          };
        }
        return {
          valid: true,
          code: 'VALID',
          message: 'Billet conforme et valide pour le voyage.',
          booking,
        };
      }

      // 2. Check Booking Ref match
      if (booking.bookingRef.toUpperCase() === clean.toUpperCase()) {
        if (booking.bookingStatus === 'CANCELLED') {
          return {
            valid: false,
            code: 'CANCELLED',
            message: 'Cette réservation a été annulée.',
            booking,
          };
        }
        if (booking.bookingStatus === 'USED') {
          return {
            valid: false,
            code: 'ALREADY_USED',
            message: 'Cette réservation est déjà marquée comme utilisée.',
            booking,
          };
        }
        return {
          valid: true,
          code: 'VALID',
          message: 'Réservation trouvée et valide.',
          booking,
        };
      }

      // 3. Check individual passenger ticket number match
      for (const p of booking.passengers) {
        if (p.ticketNumber.toUpperCase() === clean.toUpperCase()) {
          if (p.status === 'CANCELLED') {
            return {
              valid: false,
              code: 'CANCELLED',
              message: `Le billet ${p.ticketNumber} au nom de ${p.fullName} est ANNULÉ.`,
              booking,
              passenger: p,
            };
          }
          if (p.status === 'USED') {
            return {
              valid: false,
              code: 'ALREADY_USED',
              message: `Le billet ${p.ticketNumber} a déjà été composté / utilisé.`,
              booking,
              passenger: p,
            };
          }
          return {
            valid: true,
            code: 'VALID',
            message: `Billet valide pour ${p.fullName} (Siège ${p.seatNumber}).`,
            booking,
            passenger: p,
          };
        }
      }
    }

    return {
      valid: false,
      code: 'NOT_FOUND',
      message: 'Aucun billet ou réservation trouvé avec cette référence ou ce QR code.',
    };
  }

  public softDelete(
    bookingId: string,
    reason: string,
    adminUser: string
  ): { success: boolean; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    booking.deletedAt = new Date().toISOString();
    booking.deletedBy = adminUser;
    booking.deleteReason = reason;

    logAdminAction({
      adminUser,
      action: 'BOOKING_SOFT_DELETE',
      target: booking.bookingRef,
      previousState: 'Actif',
      newState: 'Corbeille',
      reason,
    });

    return { success: true };
  }

  public restore(
    bookingId: string,
    reason: string,
    adminUser: string
  ): { success: boolean; error?: string; status?: number } {
    const booking = this.bookings.get(bookingId);
    if (!booking) return { success: false, error: 'Réservation introuvable', status: 404 };

    booking.deletedAt = null;
    booking.deletedBy = null;
    booking.deleteReason = null;

    logAdminAction({
      adminUser,
      action: 'BOOKING_RESTORE',
      target: booking.bookingRef,
      previousState: 'Corbeille',
      newState: 'Restauré actif',
      reason,
    });

    return { success: true };
  }
}

export const bookingsStore = new BookingsStore();
