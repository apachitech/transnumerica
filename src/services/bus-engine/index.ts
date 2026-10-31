import {
  BusBooking,
  BusComfortLevel,
  BusOperator,
  BusPassenger,
  BusSeat,
  BusTrip,
  Currency,
  MomoProvider,
} from '@/types';

export const MOCK_BUS_OPERATORS: BusOperator[] = [
  {
    id: 'op-classic',
    name: 'Classic Coach Congo',
    logo: '🚍',
    rating: 4.8,
    reviewCount: 1240,
    verified: true,
    contactPhone: '+243810001122',
  },
  {
    id: 'op-matadi-express',
    name: 'Matadi Express VIP',
    logo: '⚡',
    rating: 4.9,
    reviewCount: 2150,
    verified: true,
    contactPhone: '+243890003344',
  },
  {
    id: 'op-katanga-horizon',
    name: 'Katanga Horizon',
    logo: '🦁',
    rating: 4.7,
    reviewCount: 980,
    verified: true,
    contactPhone: '+243990005566',
  },
  {
    id: 'op-transco',
    name: 'TRANSCO Interurbain',
    logo: '🚌',
    rating: 4.5,
    reviewCount: 3400,
    verified: true,
    contactPhone: '+243820007788',
  },
];

function generateSeats(totalRows: number = 10): BusSeat[] {
  const seats: BusSeat[] = [];
  const occupiedSeed = [2, 5, 8, 11, 14, 19, 23, 27];
  // Designate seats in row 2 as reserved for women
  const womenReservedNumbers = ['2A', '2B'];

  let seatIndex = 1;
  for (let r = 1; r <= totalRows; r++) {
    // 2 seats left, aisle, 2 seats right
    const cols = ['A', 'B', 'C', 'D'];
    cols.forEach((col, cIdx) => {
      const seatNum = `${r}${col}`;
      const isWindow = col === 'A' || col === 'D';
      const isOccupied = occupiedSeed.includes(seatIndex);
      const isWomenReserved = womenReservedNumbers.includes(seatNum) && !isOccupied;

      seats.push({
        id: `seat-${seatNum}`,
        seatNumber: seatNum,
        row: r,
        column: cIdx + 1,
        type: isWindow ? 'WINDOW' : 'AISLE',
        isAvailable: !isOccupied,
        isWomenReserved,
      });
      seatIndex++;
    });
  }
  return seats;
}

export const MOCK_BUS_TRIPS: BusTrip[] = [
  // Kinshasa -> Matadi
  {
    id: 'trip-kin-mat-1',
    operatorId: 'op-matadi-express',
    operator: MOCK_BUS_OPERATORS[1],
    departureCity: 'Kinshasa',
    departureStation: 'Gare Routière UPN / Pompage',
    arrivalCity: 'Matadi',
    arrivalStation: 'Gare Centrale de Matadi (Belvédère)',
    departureTime: '06:30',
    arrivalTime: '12:00',
    durationFormatted: '5h 30min',
    comfort: 'VIP',
    priceMinorCDF: 3500000, // 35,000 CDF
    priceMinorUSD: 1250,     // $12.50
    totalSeats: 40,
    availableSeatsCount: 16,
    amenities: ['Climatisation', 'Wi-Fi 4G', 'Prises USB', 'Siège inclinable'],
    seats: generateSeats(10),
  },
  {
    id: 'trip-kin-mat-2',
    operatorId: 'op-classic',
    operator: MOCK_BUS_OPERATORS[0],
    departureCity: 'Kinshasa',
    departureStation: 'Arrêt Triomphal / Palais du Peuple',
    arrivalCity: 'Matadi',
    arrivalStation: 'Terminus Port de Matadi',
    departureTime: '08:00',
    arrivalTime: '14:00',
    durationFormatted: '6h 00min',
    comfort: 'EXPRESS',
    priceMinorCDF: 3000000, // 30,000 CDF
    priceMinorUSD: 1100,     // $11.00
    totalSeats: 48,
    availableSeatsCount: 22,
    amenities: ['Climatisation', 'Bagages 25kg', 'Bouteille d\'eau'],
    seats: generateSeats(12),
  },
  {
    id: 'trip-kin-mat-3',
    operatorId: 'op-transco',
    operator: MOCK_BUS_OPERATORS[3],
    departureCity: 'Kinshasa',
    departureStation: 'Gare Centrale de Gombe',
    arrivalCity: 'Matadi',
    arrivalStation: 'Place M\'zee Laurent Désiré Kabila',
    departureTime: '13:30',
    arrivalTime: '19:30',
    durationFormatted: '6h 00min',
    comfort: 'STANDARD',
    priceMinorCDF: 2500000, // 25,000 CDF
    priceMinorUSD: 900,      // $9.00
    totalSeats: 52,
    availableSeatsCount: 28,
    amenities: ['Ceintures de sécurité', 'Grand coffre'],
    seats: generateSeats(13),
  },

  // Lubumbashi -> Kolwezi
  {
    id: 'trip-lshi-kol-1',
    operatorId: 'op-katanga-horizon',
    operator: MOCK_BUS_OPERATORS[2],
    departureCity: 'Lubumbashi',
    departureStation: 'Gare SNCC Lubumbashi',
    arrivalCity: 'Kolwezi',
    arrivalStation: 'Rond-point Mwangeji Terminal',
    departureTime: '07:00',
    arrivalTime: '12:30',
    durationFormatted: '5h 30min',
    comfort: 'VIP',
    priceMinorCDF: 4500000, // 45,000 CDF
    priceMinorUSD: 1600,     // $16.00
    totalSeats: 40,
    availableSeatsCount: 14,
    amenities: ['Climatisation renforcée', 'Wi-Fi Starlink', 'Collation offerte'],
    seats: generateSeats(10),
  },
  {
    id: 'trip-lshi-kol-2',
    operatorId: 'op-classic',
    operator: MOCK_BUS_OPERATORS[0],
    departureCity: 'Lubumbashi',
    departureStation: 'Carrefour Kamalondo',
    arrivalCity: 'Kolwezi',
    arrivalStation: 'Centre-ville Kolwezi',
    departureTime: '11:00',
    arrivalTime: '17:00',
    durationFormatted: '6h 00min',
    comfort: 'EXPRESS',
    priceMinorCDF: 3800000, // 38,000 CDF
    priceMinorUSD: 1350,     // $13.50
    totalSeats: 44,
    availableSeatsCount: 19,
    amenities: ['Climatisation', 'Prises USB'],
    seats: generateSeats(11),
  },

  // Matadi -> Kinshasa (Return route)
  {
    id: 'trip-mat-kin-1',
    operatorId: 'op-matadi-express',
    operator: MOCK_BUS_OPERATORS[1],
    departureCity: 'Matadi',
    departureStation: 'Gare Centrale de Matadi',
    arrivalCity: 'Kinshasa',
    arrivalStation: 'Gare Routière UPN',
    departureTime: '06:00',
    arrivalTime: '11:30',
    durationFormatted: '5h 30min',
    comfort: 'VIP',
    priceMinorCDF: 3500000,
    priceMinorUSD: 1250,
    totalSeats: 40,
    availableSeatsCount: 12,
    amenities: ['Climatisation', 'Wi-Fi 4G', 'Prises USB'],
    seats: generateSeats(10),
  },
];

class BusEngine {
  private bookings = new Map<string, BusBooking>();

  searchTrips(fromCity: string, toCity: string, date?: string): BusTrip[] {
    const from = fromCity.trim().toLowerCase();
    const to = toCity.trim().toLowerCase();

    return MOCK_BUS_TRIPS.filter((t) => {
      const matchFrom = !from || t.departureCity.toLowerCase().includes(from);
      const matchTo = !to || t.arrivalCity.toLowerCase().includes(to);
      return matchFrom && matchTo;
    });
  }

  getTripById(id: string): BusTrip | undefined {
    return MOCK_BUS_TRIPS.find((t) => t.id === id);
  }

  createBooking(params: {
    tripId: string;
    passenger: BusPassenger;
    seatNumber: string;
    currency: Currency;
    paymentMethod: 'MOMO' | 'CARD' | 'CASH';
    momoProvider?: MomoProvider;
    momoPhone?: string;
  }): BusBooking {
    const trip = this.getTripById(params.tripId);
    if (!trip) throw new Error('Voyage introuvable');

    const bookingId = `TN-BUS-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const qrToken = `TICKET:TRANSCGC:${bookingId}:${trip.departureCity}-${trip.arrivalCity}:${params.seatNumber}:${params.passenger.phone}`;

    const amountMinor = params.currency === 'USD' ? trip.priceMinorUSD : trip.priceMinorCDF;

    const booking: BusBooking = {
      id: bookingId,
      tripId: trip.id,
      trip,
      passenger: params.passenger,
      seatNumber: params.seatNumber,
      amountMinor,
      currency: params.currency,
      status: 'CONFIRMED',
      paymentMethod: params.paymentMethod,
      momoProvider: params.momoProvider,
      momoPhone: params.momoPhone,
      qrCodeToken: qrToken,
      createdAt: new Date().toISOString(),
    };

    this.bookings.set(bookingId, booking);

    // Mark seat as unavailable
    const seat = trip.seats.find((s) => s.seatNumber === params.seatNumber);
    if (seat) {
      seat.isAvailable = false;
      trip.availableSeatsCount = Math.max(0, trip.availableSeatsCount - 1);
    }

    return booking;
  }

  getBooking(bookingId: string): BusBooking | undefined {
    return this.bookings.get(bookingId);
  }
}

export const busEngine = new BusEngine();
