import { describe, it, expect, beforeEach } from 'vitest';
import { bookingsStore } from './bookings-store';

describe('BookingsStore', () => {
  beforeEach(() => {
    bookingsStore.reset();
  });

  it('queries bookings with filters and returns pagination stats', () => {
    const result = bookingsStore.queryBookings({ page: 1, limit: 10 });
    expect(result.data.length).toBeGreaterThanOrEqual(4);
    expect(result.pagination.total).toBeGreaterThanOrEqual(4);
    expect(result.stats?.totalActive).toBeGreaterThanOrEqual(4);

    // Search by passenger name
    const searchResult = bookingsStore.queryBookings({ search: 'Tshimanga' });
    expect(searchResult.data.length).toBe(1);
    expect(searchResult.data[0].bookingRef).toBe('TN-BKG-849204');

    // Filter by route
    const routeResult = bookingsStore.queryBookings({ route: 'LUB-KOL' });
    expect(routeResult.data.length).toBe(1);
    expect(routeResult.data[0].destinationCity).toBe('Kolwezi');
  });

  it('detects seat conflicts on the same departure date and bus', () => {
    // b-1 has bus KN 8842 BG on 2026-11-05 with seats 1A and 1B
    const conflict1A = bookingsStore.checkSeatConflict('2026-11-05', 'KN 8842 BG', '1A');
    expect(conflict1A.hasConflict).toBe(true);
    expect(conflict1A.conflictingBooking?.bookingRef).toBe('TN-BKG-849204');
    expect(conflict1A.conflictingPassenger?.fullName).toBe('Merveille Tshimanga');

    // Seat 3C on that bus is free
    const freeCheck = bookingsStore.checkSeatConflict('2026-11-05', 'KN 8842 BG', '3C');
    expect(freeCheck.hasConflict).toBe(false);

    // Seat 1A on a DIFFERENT date is free
    const differentDateCheck = bookingsStore.checkSeatConflict('2026-11-20', 'KN 8842 BG', '1A');
    expect(differentDateCheck.hasConflict).toBe(false);
  });

  it('prevents manual booking creation when seat conflict occurs', () => {
    // Try to book seat 1A on 2026-11-05 for KN 8842 BG
    const conflictBooking = bookingsStore.createBooking(
      {
        customerName: 'Kabila Tshisekedi',
        customerPhone: '+243811223344',
        routeId: 'route_kin_mat_vip',
        corridorCode: 'KIN-MAT',
        originCity: 'Kinshasa',
        destinationCity: 'Matadi',
        boardingStation: 'Gare Centrale',
        departureDate: '2026-11-05',
        departureTime: '06:30',
        operatorId: 'op_matadi_express',
        operatorName: 'Matadi Express VIP',
        busPlateNumber: 'KN 8842 BG',
        comfortClass: 'VIP',
        passengers: [
          {
            fullName: 'Kabila Tshisekedi',
            phone: '+243811223344',
            seatNumber: '1A', // Already taken by Merveille!
            fareMinor: 3500000,
          },
        ],
        currency: 'CDF',
        paymentMethod: 'Espèces (Guichet)',
      },
      'Guichetier Test'
    );

    expect(conflictBooking.success).toBe(false);
    expect(conflictBooking.status).toBe(409);
    expect(conflictBooking.error).toContain('Conflit de siège');
  });

  it('creates booking successfully on free seats with QR code and tickets', () => {
    const newBooking = bookingsStore.createBooking(
      {
        customerName: 'Guillaume Samba',
        customerPhone: '+243851122334',
        routeId: 'route_kin_mat_vip',
        corridorCode: 'KIN-MAT',
        originCity: 'Kinshasa',
        destinationCity: 'Matadi',
        boardingStation: 'Gare Centrale',
        departureDate: '2026-11-05',
        departureTime: '06:30',
        operatorId: 'op_matadi_express',
        operatorName: 'Matadi Express VIP',
        busPlateNumber: 'KN 8842 BG',
        comfortClass: 'VIP',
        passengers: [
          {
            fullName: 'Guillaume Samba',
            phone: '+243851122334',
            seatNumber: '5D', // Free seat
            fareMinor: 3500000,
          },
        ],
        currency: 'CDF',
        paymentMethod: 'Vodacom M-Pesa',
      },
      'Guichetier Test'
    );

    expect(newBooking.success).toBe(true);
    expect(newBooking.booking?.bookingRef).toMatch(/^TN-BKG-\d+/);
    expect(newBooking.booking?.passengers[0].ticketNumber).toMatch(/^TN-TKT-\d+-01/);
    expect(newBooking.booking?.qrCodeToken).toMatch(/^TN_SECURE_/);
    expect(newBooking.booking?.timeline.length).toBe(1);
  });

  it('moves seat with conflict check and optimistic locking', () => {
    const booking = bookingsStore.getBooking('b-1')!;
    const passenger1 = booking.passengers[0]; // currently in 1A

    // Try moving to 1B (occupied by Dieudonné on same booking) -> 409
    const conflictMove = bookingsStore.moveSeat(
      'b-1',
      passenger1.id,
      '1B',
      'Changement souhaité',
      'Admin Test',
      booking.version
    );
    expect(conflictMove.success).toBe(false);
    expect(conflictMove.status).toBe(409);

    // Move to 7A (free seat) -> success
    const validMove = bookingsStore.moveSeat(
      'b-1',
      passenger1.id,
      '7A',
      'Préférence côté couloir',
      'Admin Test',
      booking.version
    );
    expect(validMove.success).toBe(true);
    expect(validMove.booking?.passengers[0].seatNumber).toBe('7A');
    expect(validMove.booking?.seats).toContain('7A');
    expect(validMove.booking?.seats).not.toContain('1A');

    // Conflict version check
    const wrongVersionMove = bookingsStore.moveSeat(
      'b-1',
      passenger1.id,
      '8A',
      'Test version',
      'Admin Test',
      999
    );
    expect(wrongVersionMove.success).toBe(false);
    expect(wrongVersionMove.status).toBe(409);
  });

  it('performs partial passenger cancellation and frees their seat', () => {
    // b-1 has 2 passengers: Merveille (1A) and Dieudonné (1B)
    const booking = bookingsStore.getBooking('b-1')!;
    expect(booking.passengers.length).toBe(2);
    expect(booking.seats).toEqual(['1A', '1B']);

    const passengerToCancel = booking.passengers[1]; // Dieudonné

    const cancelResult = bookingsStore.cancelBooking(
      'b-1',
      {
        passengerId: passengerToCancel.id,
        reason: 'Empêchement de dernière minute pour le 2ème passager',
        refundMode: 'PARTIAL_REFUND',
        version: booking.version,
      },
      'Admin Test'
    );

    expect(cancelResult.success).toBe(true);
    const updated = cancelResult.booking!;
    expect(updated.bookingStatus).toBe('PARTIALLY_CANCELLED');
    expect(updated.paymentStatus).toBe('PARTIALLY_REFUNDED');
    // Dieudonné is CANCELLED
    expect(updated.passengers[1].status).toBe('CANCELLED');
    // Seat 1B is now freed from active seats!
    expect(updated.seats).toEqual(['1A']);

    // Now seat 1B can be booked by someone else!
    const conflictCheck = bookingsStore.checkSeatConflict('2026-11-05', 'KN 8842 BG', '1B');
    expect(conflictCheck.hasConflict).toBe(false);
  });

  it('handles rescheduling with date change and fare difference', () => {
    const booking = bookingsStore.getBooking('b-2')!;

    const rescheduleResult = bookingsStore.rescheduleBooking(
      'b-2',
      {
        newDepartureDate: '2026-11-12',
        newDepartureTime: '09:00',
        fareDifferenceMinor: 500000, // 5.000 CDF surcharge
        reason: 'Demande client report d’une semaine',
        version: booking.version,
      },
      'Admin Test'
    );

    expect(rescheduleResult.success).toBe(true);
    expect(rescheduleResult.booking?.departureDate).toBe('2026-11-12');
    expect(rescheduleResult.booking?.departureTime).toBe('09:00');
    expect(rescheduleResult.booking?.totalAmountMinor).toBe(5000000); // 4500000 + 500000
    expect(rescheduleResult.booking?.timeline[0].action).toBe('REPORT_DATE_VOYAGE');
  });

  it('verifies tickets by QR code token, booking reference, or ticket number', () => {
    // 1. Valid booking by bookingRef
    const validRefCheck = bookingsStore.verifyTicket('TN-BKG-849204');
    expect(validRefCheck.valid).toBe(true);
    expect(validRefCheck.code).toBe('VALID');
    expect(validRefCheck.booking?.customerName).toBe('Merveille Tshimanga');

    // 2. Individual ticket number
    const ticketCheck = bookingsStore.verifyTicket('TN-TKT-849204-01');
    expect(ticketCheck.valid).toBe(true);
    expect(ticketCheck.code).toBe('VALID');
    expect(ticketCheck.passenger?.fullName).toBe('Merveille Tshimanga');

    // 3. Cancelled booking
    const cancelledCheck = bookingsStore.verifyTicket('TN-BKG-332901');
    expect(cancelledCheck.valid).toBe(false);
    expect(cancelledCheck.code).toBe('CANCELLED');

    // 4. Already used booking
    const usedCheck = bookingsStore.verifyTicket('TN-BKG-554201');
    expect(usedCheck.valid).toBe(false);
    expect(usedCheck.code).toBe('ALREADY_USED');

    // 5. Unknown reference
    const notFoundCheck = bookingsStore.verifyTicket('TN-UNKNOWN-999');
    expect(notFoundCheck.valid).toBe(false);
    expect(notFoundCheck.code).toBe('NOT_FOUND');
  });

  it('regenerates QR code and marks ticket as used', () => {
    const booking = bookingsStore.getBooking('b-1')!;
    const originalQr = booking.qrCodeToken;

    // Regenerate QR
    const regenResult = bookingsStore.regenerateQr('b-1', 'Perte de téléphone', 'Admin Test', booking.version);
    expect(regenResult.success).toBe(true);
    expect(regenResult.booking?.qrCodeToken).not.toBe(originalQr);

    // Mark as used (boarded)
    const usedResult = bookingsStore.markTicketUsed(
      'b-1',
      undefined,
      'Contrôle à l’embarquement',
      'Contrôleur Quai',
      regenResult.booking!.version
    );
    expect(usedResult.success).toBe(true);
    expect(usedResult.booking?.bookingStatus).toBe('USED');
    expect(usedResult.booking?.passengers[0].status).toBe('USED');
  });
});

