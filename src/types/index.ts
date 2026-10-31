export type UserRole =
  | 'PASSENGER'
  | 'DRIVER'
  | 'DRIVER_MOTO'
  | 'DRIVER_CAR'
  | 'SHUTTLE_OPERATOR'
  | 'SHUTTLE_STAFF'
  | 'OPERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'FINANCE'
  | 'SUPPORT'
  | 'OPERATIONS'
  | 'CONTENT';

export type AdminPermission =
  | 'analytics.read'
  | 'users.read'
  | 'users.manage'
  | 'users.create'
  | 'users.update'
  | 'users.suspend'
  | 'users.ban'
  | 'users.delete'
  | 'users.restore'
  | 'users.impersonate'
  | 'users.export'
  | 'staff.read'
  | 'staff.manage'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete'
  | 'staff.sessions'
  | 'staff.export'
  | 'operators.read'
  | 'operators.verify'
  | 'operators.manage'
  | 'operators.suspend'
  | 'operators.commission'
  | 'operators.export'
  | 'operators.delete'
  | 'operators.restore'
  | 'drivers.read'
  | 'drivers.verify'
  | 'drivers.manage'
  | 'drivers.suspend'
  | 'drivers.export'
  | 'drivers.delete'
  | 'drivers.restore'
  | 'bookings.read'
  | 'bookings.create'
  | 'bookings.manage'
  | 'bookings.cancel'
  | 'bookings.validate'
  | 'bookings.delete'
  | 'bookings.restore'
  | 'bookings.export'
  | 'rides.read'
  | 'rides.manage'
  | 'rides.cancel'
  | 'rides.reassign'
  | 'rides.adjust_fare'
  | 'safety.read'
  | 'safety.manage'
  | 'safety.resolve'
  | 'safety.export'
  | 'deliveries.read'
  | 'deliveries.manage'
  | 'deliveries.cancel'
  | 'deliveries.override'
  | 'deliveries.configure'
  | 'deliveries.export'
  | 'support.read'
  | 'support.manage'
  | 'support.escalate'
  | 'support.refund'
  | 'support.export'
  | 'payments.read'
  | 'payments.refund'
  | 'payments.reconcile'
  | 'payments.retry'
  | 'payments.export'
  | 'disputes.read'
  | 'disputes.resolve'
  | 'payouts.read'
  | 'payouts.execute'
  | 'payouts.approve'
  | 'payouts.export'
  | 'commissions.manage'
  | 'adjustments.manage'
  | 'services.read'
  | 'services.toggle'
  | 'services.manage'
  | 'services.suspend'
  | 'services.rollback'
  | 'pricing.read'
  | 'pricing.manage'
  | 'pricing.rollback'
  | 'promotions.manage'
  | 'audit.read'
  | 'settings.read'
  | 'settings.manage'
  | 'settings.rollback'
  | 'kyc_requirements.read'
  | 'kyc_requirements.create'
  | 'kyc_requirements.update'
  | 'kyc_requirements.publish'
  | 'kyc_requirements.rollback'
  | 'kyc_requirements.delete'

  | 'integrations.manage'
  | 'maintenance.toggle'
  | 'roles.manage'
  | 'corridors.read'
  | 'corridors.create'
  | 'corridors.update'
  | 'corridors.delete'
  | 'corridors.restore'
  | 'corridors.export'
  | 'corridors.import'
  | 'catalog.read'
  | 'catalog.manage'
  | 'catalog.routes'
  | 'catalog.schedules'
  | 'catalog.layouts'
  | 'catalog.export'
  | 'catalog.delete'
  | 'catalog.restore'
  | 'cms.read'
  | 'cms.manage'
  | 'cms.publish'
  | 'cms.rollback'
  | 'media.manage'
  | 'reviews.moderate'
  | 'notifications.read'
  | 'notifications.manage'
  | 'notifications.broadcast'
  | 'notifications.retry'
  | 'notifications.export'
  | 'analytics.view'
  | 'analytics.export'
  | 'analytics.reports.manage'
  | 'audit.export'
  | 'audit.verify'
  | 'audit.alerts.read';

export interface TransportCorridor {
  id: string;
  code: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  averageDurationHours: number;
  basePriceCdf: number;
  basePriceUsd: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'SUSPENDED';
  operatorCount: number;
  notes?: string;
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deleteReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrudPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CrudQueryResult<T> {
  data: T[];
  pagination: CrudPagination;
  stats?: {
    totalActive: number;
    totalInTrash: number;
    [key: string]: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: 'ACTIVE' | 'DISABLED';
  permissions: AdminPermission[];
  totpEnabled: boolean;
  totpSecret?: string;
  forceTotp?: boolean;
  isLocked?: boolean;
  failedLoginAttempts?: number;
  lockExpiresAt?: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminSession {
  sessionId: string;
  adminId: string;
  role: UserRole;
  permissions: AdminPermission[];
  name: string;
  email: string;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface StaffSessionInfo {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
  isCurrent?: boolean;
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'DISABLED';
  permissions: AdminPermission[];
  totpEnabled: boolean;
  forceTotp: boolean;
  activeSessionsCount: number;
  activeSessions?: StaffSessionInfo[];
  lastLoginAt?: string;
  createdAt: string;
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
}

export interface PassengerRideHistory {
  id: string;
  tripRef: string;
  serviceType: 'TAXI' | 'MOTO' | 'BUS';
  from: string;
  to: string;
  date: string;
  amountMinor: number;
  currency: Currency;
  driverName: string;
  driverPlate?: string;
  status: 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  rating?: number;
}

export interface PassengerBookingHistory {
  id: string;
  bookingRef: string;
  operatorName: string;
  corridor: string;
  departureDate: string;
  seats: string[];
  amountMinor: number;
  currency: Currency;
  status: 'CONFIRMED' | 'USED' | 'CANCELLED' | 'REFUNDED';
  qrCodeUrl?: string;
}

export interface PassengerPaymentHistory {
  id: string;
  transactionRef: string;
  method: 'AIRTEL_MONEY' | 'ORANGE_MONEY' | 'MPESA' | 'CASH' | 'CARD';
  providerRef: string;
  amountMinor: number;
  currency: Currency;
  type: 'RIDE_PAYMENT' | 'BOOKING_PAYMENT' | 'WALLET_TOPUP' | 'REFUND';
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REVERSED';
  timestamp: string;
}

export type PassengerStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface PassengerAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  status: PassengerStatus;
  loyaltyTier: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP';
  totalRides: number;
  totalBookings: number;
  totalSpentCDF: number;
  walletBalanceCDF: number;
  preferredPayment: 'AIRTEL_MONEY' | 'ORANGE_MONEY' | 'MPESA' | 'CASH';
  activeSessionsCount: number;
  registeredAt: string;
  lastActiveAt: string;
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
  suspensionReason?: string | null;
  banReason?: string | null;
  notes?: string;
  rides?: PassengerRideHistory[];
  bookings?: PassengerBookingHistory[];
  payments?: PassengerPaymentHistory[];
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ServiceType = 'bus' | 'taxi' | 'moto' | 'delivery' | 'flights' | 'hotels' | 'train';

export type Currency = 'CDF' | 'USD';

export type Language = 'fr' | 'en' | 'ln' | 'sw';

export type VehicleType = 'BUS' | 'CAR' | 'MOTO';

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUESTED';

export interface DriverVehicle {
  id: string;
  type: VehicleType;
  model: string;
  plate: string;
  color: string;
  year?: number;
  isPrimary: boolean;
  registrationNumber?: string;
  insuranceNumber?: string;
  insuranceExpiryDate?: string;
}

export interface DriverKycDocument {
  id: string;
  name: string;
  type: 'LICENSE' | 'NATIONAL_ID' | 'VEHICLE_REG' | 'INSURANCE' | 'TECHNICAL_INSPECTION' | 'DRIVER_PHOTO';
  documentNumber: string;
  issuedDate: string;
  expiryDate?: string;
  isExpiringSoon?: boolean; // < 30 days
  isExpired?: boolean;
  fileKey: string;
  signedUrl?: string;
  verified: boolean;
  rejectionReason?: string;
}

export interface DriverTripHistory {
  id: string;
  tripRef: string;
  serviceType: 'TAXI' | 'MOTO' | 'BUS';
  from: string;
  to: string;
  date: string;
  passengerName: string;
  fareCDF: number;
  commissionCDF: number;
  netEarningsCDF: number;
  status: 'COMPLETED' | 'CANCELLED';
  rating?: number;
}

export interface DriverAccount {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  gender: 'MALE' | 'FEMALE';
  city: string;
  cooperativeName?: string;
  verificationStatus: VerificationStatus;
  status: 'ACTIVE' | 'SUSPENDED' | 'OFFLINE';
  suspensionReason?: string | null;
  badges: string[];
  hasPassengerHelmet: boolean;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  earnings: {
    todayCDF: number;
    weekCDF: number;
    monthCDF: number;
    balanceCDF: number;
  };
  vehicles: DriverVehicle[];
  documents: DriverKycDocument[];
  tripHistory?: DriverTripHistory[];
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KycReviewNotification {
  id: string;
  channel: 'SMS' | 'WHATSAPP';
  recipient: string;
  sentAt: string;
  message: string;
  status: 'SENT' | 'DELIVERED';
}

export interface KycReviewQueueItem {
  id: string;
  driverId: string;
  applicantName: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  cooperative?: string;
  appliedAt: string;
  slaDeadlineAt: string;
  slaMinutesRemaining: number;
  slaStatus: 'ON_TRACK' | 'WARNING' | 'BREACHED';
  hasPassengerHelmet: boolean;
  status: VerificationStatus;
  rejectionReason?: string;
  resubmissionNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  documents: DriverKycDocument[];
  notifications: KycReviewNotification[];
}

// ----------------- OPERATOR MANAGEMENT DOMAIN -----------------

export type OperatorStatus = 'ACCREDITED' | 'PENDING_REVIEW' | 'SUSPENDED' | 'INACTIVE';

export interface OperatorLegalDocument {
  id: string;
  name: string;
  type: 'MINISTRY_LICENSE' | 'INSURANCE_POLICY' | 'TRADE_REGISTER' | 'TAX_CLEARANCE' | 'TECHNICAL_AGREEMENT';
  documentNumber: string;
  issuedDate: string;
  expiryDate: string;
  isExpired?: boolean;
  isExpiringSoon?: boolean; // < 30 days
  status: 'VALID' | 'EXPIRED' | 'PENDING_RENEWAL';
  fileKey: string;
  signedUrl?: string;
}

export interface OperatorStaffAccount {
  id: string;
  operatorId: string;
  name: string;
  email: string;
  phone: string;
  role: 'MANAGER' | 'DISPATCHER' | 'ACCOUNTANT' | 'STATION_AGENT';
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
}

export interface OperatorPayoutDetails {
  payoutMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY';
  bankName?: string;
  accountNumberMasked: string;
  accountHolderName: string;
  momoProvider?: 'MPESA' | 'AIRTEL_MONEY' | 'ORANGE_MONEY';
  momoNumberMasked?: string;
  payoutFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  pendingBalanceCDF: number;
  pendingBalanceUSD: number;
}

export interface OperatorFleetVehicle {
  id: string;
  operatorId: string;
  plateNumber: string;
  model: string;
  type: 'VIP' | 'STANDARD' | 'EXPRESS';
  capacity: number;
  hasAirConditioning: boolean;
  hasWifi: boolean;
  hasUsbCharging: boolean;
  technicalInspectionDate: string;
  technicalInspectionExpiry: string;
  insurancePolicy: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

export interface OperatorRoute {
  id: string;
  operatorId: string;
  name: string;
  departureCity: string;
  arrivalCity: string;
  departureStation: string;
  arrivalStation: string;
  distanceKm: number;
  durationMinutes: number;
  baseFareCDF: number;
  vipFareCDF?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface OperatorTrip {
  id: string;
  tripRef: string;
  operatorId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  vehicleId: string;
  vehiclePlate: string;
  busComfort: 'VIP' | 'STANDARD' | 'EXPRESS';
  totalSeats: number;
  bookedSeats: number;
  fareCDF: number;
  status: 'SCHEDULED' | 'BOARDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  isBookable: boolean;
}

export interface OperatorMetrics {
  rating: number;
  totalReviews: number;
  cancellationRate: number;
  occupancyRate: number;
  punctualityRate: number;
  totalTripsCount: number;
  totalPassengersCarried: number;
}

export interface OperatorSuspensionPolicy {
  unbookTrips: boolean;
  existingBookingsPolicy: 'HONOR_EXISTING_WITH_ESCROW' | 'AUTO_REFUND' | 'MANUAL_RESOLUTION';
  notifyPassengers: boolean;
  freezeStaffAccess: boolean;
}

export interface OperatorAccount {
  id: string;
  name: string;
  brandName: string;
  logoUrl: string;
  tradeRegisterNumber: string;
  nationalIdentification: string;
  taxNumber: string;
  ministryLicense: string;
  primaryCity: string;
  servicedCities: string[];
  description: string;
  contactPerson: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  hotlinePhone: string;
  emergencyPhone: string;
  commissionRate: number; // e.g. 10.0 for 10%
  verificationStatus: VerificationStatus;
  status: OperatorStatus;
  suspensionReason?: string | null;
  suspensionPolicy?: OperatorSuspensionPolicy | null;
  suspendedAt?: string | null;
  suspendedBy?: string | null;
  badges: string[];
  legalDocuments: OperatorLegalDocument[];
  payoutDetails: OperatorPayoutDetails;
  staff: OperatorStaffAccount[];
  fleet: OperatorFleetVehicle[];
  routes: OperatorRoute[];
  trips: OperatorTrip[];
  metrics: OperatorMetrics;
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatarUrl: string;
  rating: number;
  totalTrips: number;
  verificationStatus: VerificationStatus;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  hasPassengerHelmet: boolean; // critical for MOTO
  gender?: 'MALE' | 'FEMALE';
  cooperativeName?: string;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  walletBalanceCDF: number; // in minor units
  walletBalanceUSD: number; // in minor units
}

export interface Landmark {
  id: string;
  name: string;
  cityName: string;
  commune?: string;
  popularReference?: string;
  latitude: number;
  longitude: number;
  category: 'TRANSPORT' | 'ROUNDABOUT' | 'COMMERCIAL' | 'HEALTH' | 'GOVERNMENT' | 'RELIGIOUS';
}

export interface CityServiceConfig {
  cityId: string;
  cityName: string;
  service: ServiceType;
  enabled: boolean;
  activeFrom?: string; // e.g. "06:00"
  activeTo?: string;   // e.g. "21:00"
  nightSurchargePercent?: number; // e.g. 20%
  restrictedZones?: string[];
  reasonDisabled?: string;
}

// ----------------- SERVICE CONTROL & FEATURE FLAGS -----------------

export type ServiceMatrixServiceId = 'bus' | 'taxi' | 'moto' | 'delivery' | 'flights' | 'hotels' | 'train';

export interface ActiveTimeWindow {
  enabled: boolean;
  startTime: string; // "HH:mm" e.g. "05:30"
  endTime: string;   // "HH:mm" e.g. "21:30"
}

export interface ZoneLimits {
  enabled: boolean;
  allowedZones: string[];
  restrictedZones: string[];
}

export interface InstantSuspension {
  isSuspended: boolean;
  reason?: string;
  userMessage?: string;
  suspendedAt?: string;
  suspendedBy?: string;
}

export interface CityServiceMatrixEntry {
  id: string; // `${cityId}_${serviceId}`
  cityId: string;
  cityName: string;
  serviceId: ServiceMatrixServiceId;
  serviceName: string;
  enabled: boolean;
  timeWindow: ActiveTimeWindow;
  zoneLimits: ZoneLimits;
  suspension: InstantSuspension;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number; // 0 to 100
  targetCities: string[];    // empty means all cities
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface ServiceControlSnapshot {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  description: string;
  reason: string;
  matrix: CityServiceMatrixEntry[];
  flags: FeatureFlag[];
}

// ----------------- BUS BOOKING DOMAIN -----------------

export type BusComfortLevel = 'STANDARD' | 'VIP' | 'EXPRESS';

export interface BusOperator {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  contactPhone: string;
}

export interface BusSeat {
  id: string;
  seatNumber: string;
  row: number;
  column: number;
  type: 'WINDOW' | 'AISLE' | 'MIDDLE';
  isAvailable: boolean;
  isDriverSeat?: boolean;
  isWomenReserved?: boolean;
}

export interface BusTrip {
  id: string;
  operatorId: string;
  operator: BusOperator;
  departureCity: string;
  departureStation: string;
  arrivalCity: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  durationFormatted: string;
  comfort: BusComfortLevel;
  priceMinorCDF: number;
  priceMinorUSD: number;
  totalSeats: number;
  availableSeatsCount: number;
  amenities: string[];
  seats: BusSeat[];
  gate?: string;
  checkInNotice?: string;
}

export interface BusPassenger {
  fullName: string;
  phone: string;
  seatNumber: string;
  idNumber?: string;
}

export interface BusBooking {
  id: string;
  tripId: string;
  trip: BusTrip;
  passenger: BusPassenger;
  seatNumber: string;
  amountMinor: number;
  currency: Currency;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'VALID' | 'USED' | 'EXPIRED';
  ticketStatus?: 'VALID' | 'USED' | 'EXPIRED';
  paymentMethod: 'MOMO' | 'CARD' | 'CASH';
  momoProvider?: MomoProvider;
  momoPhone?: string;
  qrCodeToken: string;
  createdAt: string;
  gate?: string;
}

// ----------------- SHARED RIDE ENGINE (TAXI & MOTO) -----------------

export type RideStatus =
  | 'REQUESTED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'ARRIVING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  pickupLandmark: string;
  pickupCoords: { lat: number; lng: number };
  dropoffLandmark: string;
  dropoffCoords: { lat: number; lng: number };
  vehicleType: 'CAR' | 'MOTO';
  proposedFareMinor: number;
  currency: Currency;
  preferFemaleDriver?: boolean;
  passengerNotes?: string;
  distanceKm: number;
  durationMins: number;
  createdAt: string;
}

export interface RideOffer {
  id: string;
  rideRequestId: string;
  driverId: string;
  driver: Driver;
  proposedFareMinor: number;
  currency: Currency;
  etaMinutes: number;
  distanceMeters: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  createdAt: string;
}

export interface Ride {
  id: string;
  requestId: string;
  request: RideRequest;
  selectedOfferId: string;
  driver: Driver;
  tripPin: string; // 4-digit PIN for passenger safety verification
  status: RideStatus;
  finalFareMinor: number;
  currency: Currency;
  paymentMethod: 'CASH' | 'MOMO';
  momoProvider?: MomoProvider;
  momoPhone?: string;
  cashConfirmedByDriver: boolean;
  helmetConfirmed: boolean;
  nightSurchargeApplied: boolean;
  safetyEvents: string[];
  rating?: number;
  comment?: string;
  startedAt?: string;
  completedAt?: string;
}

// ----------------- PAYMENTS -----------------

export type PaymentMethod = 'MOMO' | 'CARD' | 'CASH';
export type MomoProvider = 'MPESA' | 'AIRTEL' | 'ORANGE' | 'AFRICELL';

export interface PaymentIntent {
  id: string;
  amountMinor: number;
  currency: Currency;
  provider: MomoProvider | 'CASH' | 'CARD';
  phoneNumber?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  referenceId: string;
  createdAt: string;
}

// ----------------- MOTO EXPRESS DELIVERY (PHASE 2) -----------------

export type ParcelSize = 'ENVELOPE' | 'SMALL' | 'MEDIUM';

export interface DeliveryOrder {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickupLandmark: string;
  dropoffLandmark: string;
  parcelSize: ParcelSize;
  fareMinor: number;
  currency: Currency;
  deliveryPin: string; // 4-digit PIN to confirm delivery
  proofPhotoUrl?: string;
  status: 'CREATED' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

// ----------------- ACCOUNT, RECEIPTS & SAVED PREFERENCES -----------------

export type PlaceIconType = 'HOME' | 'WORK' | 'AIRPORT' | 'STATION' | 'CUSTOM';

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  city: string;
  icon: PlaceIconType;
  isPopular?: boolean;
}

export type PaymentProviderId = 'MPESA' | 'AIRTEL' | 'ORANGE' | 'AFRICELL' | 'VISA' | 'MASTERCARD';

export interface SavedPaymentMethod {
  id: string;
  type: 'MOMO' | 'CARD';
  provider: PaymentProviderId;
  providerName: string;
  phoneOrNumber: string;
  holderName: string;
  isDefault: boolean;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  bookingRef: string;
  serviceType: 'BUS' | 'TAXI' | 'MOTO';
  title: string;
  description: string;
  date: string;
  amountMinor: number;
  currency: Currency;
  paymentMethod: string;
  momoProvider?: string;
  vatAmountMinor: number;
  status: 'PAID' | 'REFUNDED';
}

export interface NotificationPreferences {
  smsBoardingReminders: boolean;
  whatsappTripAlerts: boolean;
  paymentReceiptsSms: boolean;
  promotionsDiscounts: boolean;
}

// ----------------- DRIVER IN-VEHICLE DOMAIN -----------------

export interface DriverRideRequest {
  id: string;
  passengerName: string;
  passengerPhone: string;
  passengerRating: number;
  passengerTrips: number;
  passengerVerified?: boolean;
  pickupLandmark: string;
  pickupReferencePoint?: string;
  dropoffLandmark: string;
  distanceToPickupKm: number;
  pickupEtaMinutes: number;
  tripDistanceKm: number;
  tripDurationMinutes: number;
  proposedFareMinor: number;
  currency: Currency;
  serviceType: 'MOTO' | 'TAXI';
  requiresHelmet?: boolean;
  expiresInSeconds: number;
  paymentMethod: string;
}

export interface DriverEarningsReport {
  period: 'TODAY' | 'WEEK';
  grossEarningsMinor: number;
  completedTripsCount: number;
  hoursOnline: number;
  tipsEarnedMinor: number;
  commissionRate: number; // e.g. 0.10 (10%)
  commissionAmountMinor: number;
  netPayoutMinor: number;
  payoutStatus: 'AVAILABLE' | 'PROCESSING' | 'PAID';
  currency: Currency;
}

// ----------------- OPERATOR & ADMIN DASHBOARD DOMAIN -----------------

export type AdminDashboardTab =
  | 'OVERVIEW'
  | 'BOOKINGS'
  | 'VERIFICATION'
  | 'CITY_SERVICES'
  | 'DISPUTES'
  | 'AUDIT_LOG';

export interface AdminKycDocument {
  id: string;
  name: string;
  type: 'LICENSE' | 'NATIONAL_ID' | 'VEHICLE_REG' | 'INSURANCE' | 'TECHNICAL_INSPECTION' | 'MINISTRY_PERMIT';
  documentNumber: string;
  issuedDate: string;
  expiryDate?: string;
  previewUrl: string;
  verified: boolean;
}

export interface AdminKycItem {
  id: string;
  applicantName: string;
  phone: string;
  type: 'DRIVER' | 'OPERATOR';
  vehicleType?: 'MOTO' | 'CAR';
  vehicleModel?: string;
  vehiclePlate?: string;
  companyName?: string;
  cooperative?: string;
  documents: AdminKycDocument[];
  hasPassengerHelmet?: boolean;
  appliedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface AdminBookingRow {
  id: string;
  bookingRef: string;
  passengerName: string;
  passengerPhone: string;
  serviceType: 'BUS' | 'TAXI' | 'MOTO';
  operatorOrDriverName: string;
  from: string;
  to: string;
  departureTime: string;
  amountMinor: number;
  currency: Currency;
  paymentMethod: string;
  seatOrPlate: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
}

export interface BookingPassengerItem {
  id: string;
  ticketNumber: string;
  fullName: string;
  phone: string;
  idNumber?: string;
  seatNumber: string;
  status: 'ACTIVE' | 'CANCELLED' | 'USED';
  fareMinor: number;
  cancelledAt?: string;
  cancelReason?: string;
  boardedAt?: string;
}

export interface BookingTimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  description: string;
  previousState?: string;
  newState?: string;
  reason?: string;
}

export interface BookingNotificationRecord {
  id: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL';
  recipient: string;
  sentAt: string;
  sentBy: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
}

export interface AdminDetailedBooking {
  id: string;
  bookingRef: string;
  serviceType: 'BUS' | 'TAXI' | 'MOTO';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  routeId: string;
  corridorCode: string;
  originCity: string;
  destinationCity: string;
  boardingStation: string;
  arrivalStation: string;
  departureDate: string;
  departureTime: string;
  operatorId: string;
  operatorName: string;
  busPlateNumber: string;
  comfortClass: string;
  passengers: BookingPassengerItem[];
  seats: string[];
  totalAmountMinor: number;
  currency: Currency;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod: string;
  paymentTransactionRef?: string;
  bookingStatus: 'CONFIRMED' | 'PENDING' | 'USED' | 'CANCELLED' | 'PARTIALLY_CANCELLED';
  qrCodeToken: string;
  qrCodeGeneratedAt: string;
  timeline: BookingTimelineEvent[];
  notifications: BookingNotificationRecord[];
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deleteReason?: string | null;
}

export interface TicketVerificationResult {
  valid: boolean;
  code: 'VALID' | 'ALREADY_USED' | 'CANCELLED' | 'EXPIRED' | 'NOT_FOUND';
  message: string;
  booking?: AdminDetailedBooking;
  passenger?: BookingPassengerItem;
}

export interface AdminAuditLogEntry {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  target: string;
  previousState: string;
  newState: string;
  reason: string;
}

export type AuditLogStatus = 'SUCCESS' | 'DENIED' | 'FAILED' | 'WARNING';
export type AuditEntityType =
    | 'USER'
    | 'DRIVER'
    | 'OPERATOR'
  | 'STAFF'
  | 'BOOKING'
  | 'RIDE'
  | 'PAYMENT'
  | 'PAYOUT'
  | 'FINANCE'
  | 'PRICING'
  | 'SERVICE'
  | 'SETTINGS'
  | 'SECURITY'
  | 'AUTH'
  | 'ROLE'
  | 'PERMISSION'
  | 'COMMISSION'
  | 'ROUTE'
  | 'CMS'
  | 'NOTIFICATION'
  | 'SYSTEM'
  | 'AUDIT'
  | 'GENERAL';

export interface EnhancedAuditLogEntry extends AdminAuditLogEntry {
  actorRole: string;
  ipAddress: string;
  userAgent: string;
  entityType: AuditEntityType;
  entityId: string;
  status: AuditLogStatus;
  sequenceNumber: number;
  sequence?: number; // Convenience alias
  actor?: string; // Convenience alias for adminUser
  previousHash: string;
  currentHash: string;
  hash?: string; // Convenience alias for currentHash
  isVerified?: boolean;
}

export interface AuditDiffFieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'MODIFIED' | 'ADDED' | 'REMOVED' | 'UNCHANGED';
  // Convenience aliases for flexible consumption
  beforeValue?: unknown;
  afterValue?: unknown;
  changeType?: 'MODIFIED' | 'ADDED' | 'REMOVED' | 'UNCHANGED';
}

export interface AuditDiffResult {
  logId: string;
  entryId?: string; // Convenience alias
  action: string;
  timestamp: string;
  actor: string;
  target: string;
  hasDiff: boolean;
  changes: AuditDiffFieldChange[];
  rawPrevious: unknown;
  rawNew: unknown;
  currentHash?: string;
  previousHash?: string;
  sequenceNumber?: number;
  sequence?: number;
  entityType?: string;
  entityId?: string;
  hash?: string;
}

export type SuspiciousPatternType =
  | 'FAILED_LOGINS_BURST'
  | 'BULK_DELETES'
  | 'OFF_HOURS_ROLE_CHANGE'
  | 'UNAUTHORIZED_RESOURCE_PROBE';

export interface SuspiciousActivityAlert {
  id: string;
  patternType: SuspiciousPatternType;
  type?: SuspiciousPatternType; // Convenience alias
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  detectedAt: string;
  timestamp?: string; // Convenience alias for detectedAt
  actor: string;
  ipAddress: string;
  eventCount: number;
  relatedLogIds: string[];
  sampleLogIds?: string[]; // Convenience alias
  isAcknowledged: boolean;
  acknowledged?: boolean; // Convenience alias
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AuditVerificationResult {
  isValid: boolean;
  valid?: boolean; // Convenience alias
  totalBlocksVerified: number;
  totalVerified?: number; // Convenience alias
  genesisHash: string;
  latestHash: string;
  firstBlockSequence?: number;
  lastBlockSequence?: number;
  lastBlockHash?: string;
  corruptedBlockSequence?: number | null;
  brokenLinkIndex: number | null;
  brokenLogId: string | null;
  verifiedAt: string;
  details: string;
  error?: string | null;
}

export interface AuditLogFilterParams {
  search?: string;
  actor?: string;
  action?: string;
  entityType?: string;
  status?: 'ALL' | 'SUCCESS' | 'DENIED' | 'FAILED' | 'WARNING';
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

export interface AdminDisputeItem {
  id: string;
  ticketNumber: string;
  passengerName: string;
  passengerPhone: string;
  driverOrOperatorName: string;
  serviceType: 'BUS' | 'TAXI' | 'MOTO';
  tripRef: string;
  category: 'OVERCHARGE' | 'LOST_ITEM' | 'SAFETY_HELMET' | 'DELAY_REFUND' | 'DRIVER_BEHAVIOR';
  title: string;
  description: string;
  amountInDisputeMinor: number;
  currency: Currency;
  priority: 'URGENT' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolutionNote?: string;
}

// ============================================================================
// CATALOG MANAGEMENT INTERFACES (CITIES, STATIONS, ROUTES, SCHEDULES, LAYOUTS)
// ============================================================================

export interface CatalogCity {
  id: string;
  name: string;
  province: string;
  code: string;
  isActive: boolean;
  zonesCount?: number;
  stationsCount?: number;
}

export interface CatalogZone {
  id: string;
  cityId: string;
  cityName: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CatalogLandmark {
  id: string;
  cityId: string;
  cityName: string;
  zoneId?: string;
  name: string;
  type: 'TRANSIT_HUB' | 'MONUMENT' | 'AIRPORT' | 'MARKET' | 'STADIUM';
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
}

export interface CatalogBusStation {
  id: string;
  cityId: string;
  cityName: string;
  zoneId?: string;
  zoneName?: string;
  name: string;
  code: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  counterCount: number;
  facilities: string[];
  isActive: boolean;
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
}

export interface RouteStop {
  id: string;
  stationId: string;
  stationName: string;
  cityName: string;
  sequenceOrder: number;
  distanceKmFromOrigin: number;
  stopDurationMinutes: number;
}

export interface CatalogRoute {
  id: string;
  name: string;
  code: string;
  corridor: string;
  originCityId: string;
  originCityName: string;
  originStationId: string;
  originStationName: string;
  destinationCityId: string;
  destinationCityName: string;
  destinationStationId: string;
  destinationStationName: string;
  distanceKm: number;
  durationMinutes: number;
  stops: RouteStop[];
  baseFareCDF: number;
  vipFareCDF?: number;
  isActive: boolean;
  isExpress?: boolean;
  allowDuplicateOverride?: boolean;
  duplicateWarning?: string;
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
}

export type LayoutCellType = 'SEAT' | 'AISLE' | 'DRIVER' | 'DOOR' | 'TOILET' | 'LUGGAGE' | 'EMPTY';
export type SeatTier = 'STANDARD' | 'VIP' | 'PMR' | 'CREW';

export interface LayoutCell {
  row: number;
  col: number;
  type: LayoutCellType;
  seatNumber?: string;
  seatTier?: SeatTier;
  isBlocked?: boolean;
  blockReason?: string;
}

export interface CatalogBusLayout {
  id: string;
  name: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  rows: number;
  columns: number;
  totalSeats: number;
  standardSeatsCount: number;
  vipSeatsCount: number;
  pmrSeatsCount: number;
  blockedSeatsCount: number;
  cells: LayoutCell[];
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface CatalogComfortLevel {
  id: string;
  name: string;
  tier: 'STANDARD' | 'CONFORT_PLUS' | 'VIP_PREMIUM' | 'BUSINESS_EXECUTIVE';
  description: string;
  priceMultiplier: number;
  amenities: string[];
}

export interface CatalogAmenity {
  id: string;
  name: string;
  icon: string;
  category: 'COMFORT' | 'CONNECTIVITY' | 'SERVICE' | 'SAFETY';
  description: string;
}

export interface CatalogVehicleType {
  id: string;
  code: string;
  name: string;
  category: 'HEAVY_COACH' | 'MIDIBUS' | 'MINIBUS' | 'VAN';
  defaultCapacity: number;
  recommendedLayoutId?: string;
  regulations: {
    sonasInsuranceRequired: boolean;
    technicalInspectionFrequencyMonths: number;
    maxSpeedKmH: number;
    hasSpeedLimiterCNPR: boolean;
    minDriverPermitCategory: string;
  };
}

export interface CatalogRecurringSchedule {
  id: string;
  routeId: string;
  routeName: string;
  operatorId: string;
  operatorName: string;
  busLayoutId: string;
  layoutName: string;
  daysOfWeek: number[]; // 1=Mon, 7=Sun
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  baseFareCDF: number;
  vipFareCDF?: number;
  comfortLevelId: string;
  isActive: boolean;
  version: number;
  deletedAt?: string | null;
}

export interface BookedPassengerSummary {
  id: string;
  bookingRef: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  seatTier: string;
}

export interface CatalogTrip {
  id: string;
  tripRef: string;
  scheduleId?: string;
  routeId: string;
  routeName: string;
  operatorId: string;
  operatorName: string;
  busLayoutId: string;
  departureDateTime: string; // ISO
  arrivalDateTime: string; // ISO
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  fareCDF: number;
  vipFareCDF?: number;
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED';
  isBookable: boolean;
  bookedPassengers: BookedPassengerSummary[];
  version: number;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
}

export type FutureBookingHandlingPolicy =
  | 'BLOCK_IF_BOOKINGS_EXIST'
  | 'MIGRATE_WITH_NOTIFICATIONS'
  | 'AUTO_REFUND_WITH_NOTIFICATIONS';

// ==========================================
// RIDE OPERATIONS & SAFETY CENTER TYPES
// ==========================================

export type AdminRideStatus =
  | 'SEARCHING'
  | 'OFFERED'
  | 'ARRIVING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type AdminRideServiceType = 'TAXI' | 'MOTO' | 'MOTO_EXPRESS' | 'VIP';

export interface AdminRideOffer {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  fareMinor: number;
  etaMinutes: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface AdminRideTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'INFO' | 'ACTION' | 'ALERT' | 'STATUS_CHANGE';
  actor: string;
}

export interface AdminRide {
  id: string;
  reference: string;
  city: string;
  serviceType: AdminRideServiceType;
  status: AdminRideStatus;
  riderId: string;
  riderName: string;
  riderPhone: string;
  riderRating: number;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  pickup: { address: string; lat: number; lng: number };
  dropoff: { address: string; lat: number; lng: number };
  currentLocation?: { lat: number; lng: number; heading?: number; speedKmh?: number };
  distanceKm: number;
  durationMinutes: number;
  routeTrace: Array<{ lat: number; lng: number; timestamp: string }>;
  offers: AdminRideOffer[];
  fareMinor: number;
  originalFareMinor: number;
  fareAdjustedReason?: string;
  currency: Currency;
  paymentMethod: 'CASH' | 'MOMO' | 'CARD';
  momoProvider?: string;
  tripPin: string;
  tripPinVerified: boolean;
  cancellationReason?: string;
  cancelledBy?: string;
  timeline: AdminRideTimelineEvent[];
  hasSosAlert: boolean;
  hasDeviationAlert: boolean;
  hasSpeedAlert: boolean;
  activeIncidentId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface OnlineDriver {
  id: string;
  name: string;
  phone: string;
  photo: string;
  vehicleType: AdminRideServiceType;
  vehiclePlate: string;
  vehicleModel: string;
  city: string;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  currentLocation: { lat: number; lng: number; heading: number };
  rating: number;
  totalTrips: number;
  activeRideId?: string;
}

export type SafetyIncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type SafetyIncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED';
export type SafetyIncidentType =
  | 'SOS_TRIGGERED'
  | 'ROUTE_DEVIATION'
  | 'SPEED_ANOMALY'
  | 'UNSCHEDULED_STOP';

export interface SafetyIncidentNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface SafetyIncident {
  id: string;
  reference: string;
  type: SafetyIncidentType;
  severity: SafetyIncidentSeverity;
  status: SafetyIncidentStatus;
  rideId: string;
  rideReference: string;
  city: string;
  triggerSource: 'RIDER_APP' | 'DRIVER_APP' | 'AUTOMATED_TELEMATICS';
  riderName: string;
  riderPhone: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  location: { lat: number; lng: number; address: string };
  telemetrics?: {
    speedKmh: number;
    batteryLevel: number;
    audioRecordingAvailable: boolean;
  };
  notes: SafetyIncidentNote[];
  assignedAdmin?: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  escalationTarget?: string;
  resolvedAt?: string;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ==========================================
// DELIVERY & PARCEL MANAGEMENT TYPES
// ==========================================

export type AdminParcelSize = 'ENVELOPE' | 'SMALL' | 'MEDIUM' | 'LARGE';

export type AdminDeliveryStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED_ATTEMPT'
  | 'RETURNED_TO_SENDER'
  | 'CANCELLED';

export interface AdminDeliveryTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'INFO' | 'ACTION' | 'ALERT' | 'STATUS_CHANGE';
  actor: string;
}

export interface AdminDeliveryOrder {
  id: string;
  reference: string;
  city: string;
  sender: {
    name: string;
    phone: string;
    landmarkAddress: string;
    notes?: string;
  };
  recipient: {
    name: string;
    phone: string;
    landmarkAddress: string;
    notes?: string;
  };
  parcelSize: AdminParcelSize;
  parcelDescription: {
    content: string;
    declaredValueMinor?: number;
    isFragile: boolean;
  };
  courier?: {
    id: string;
    name: string;
    phone: string;
    vehiclePlate: string;
    vehicleType: 'MOTO' | 'VAN';
    photo?: string;
    rating: number;
  };
  status: AdminDeliveryStatus;
  deliveryPin: string; // 4-digit code given to recipient
  proofOfDelivery?: {
    photoUrl?: string;
    signedPin?: string;
    verifiedAt?: string;
    recipientNotes?: string;
    overriddenByAdmin?: string;
    overrideReason?: string;
  };
  failureDetails?: {
    reason: string;
    attemptedAt: string;
    actionTaken: 'RETRY' | 'RETURN';
    notes?: string;
  };
  returnStatus?: 'NONE' | 'RETURN_INITIATED' | 'RETURNED_TO_SENDER';
  returnFeeMinor?: number;
  fare: {
    baseFareMinor: number;
    distanceFareMinor: number;
    weightSurchargeMinor: number;
    totalFareMinor: number;
    currency: Currency;
    paymentMethod: 'MOMO' | 'CASH';
    paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
    momoProvider?: string;
  };
  timeline: AdminDeliveryTimelineEvent[];
  version: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface DeliveryCourier {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'MOTO' | 'VAN';
  vehiclePlate: string;
  city: string;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  rating: number;
  activeDeliveriesCount: number;
}

export interface DeliveryPricingTierConfig {
  parcelSize: AdminParcelSize;
  label: string;
  maxWeightKg: number;
  baseFareCDFMinor: number;
  perKmCDFMinor: number;
  isAvailable: boolean;
  version: number;
  updatedAt: string;
}

export interface ProhibitedDeliveryItem {
  id: string;
  name: string;
  category: 'EXPLOSIFS_ARMES' | 'PRODUITS_CHIMIQUES' | 'STUPEFIANTS' | 'VALEURS_DEVISES' | 'PERISSABLES';
  legalNotice: string;
  isEnforced: boolean;
  penaltyDescription: string;
  version: number;
  updatedAt: string;
}

// ============================================================================
// SUPPORT CENTER & DISPUTE WORKFLOW INTERFACES
// ============================================================================

export type SupportTicketRequesterType = 'USER' | 'DRIVER' | 'OPERATOR';
export type SupportTicketLinkedType = 'BOOKING' | 'RIDE' | 'PAYMENT' | 'DELIVERY' | 'GENERAL';
export type SupportTicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SupportTicketStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
export type SupportResolutionCode =
  | 'REFUND_ISSUED'
  | 'COMPENSATION_CREDIT'
  | 'TECHNICAL_FIX'
  | 'EXPLANATION_PROVIDED'
  | 'REJECTED_UNFOUNDED';
export type SupportMessageChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'INTERNAL_NOTE';
export type CongoleseLanguage = 'FR' | 'LN' | 'SW' | 'TSH' | 'EN';

export interface SupportTicketMessage {
  id: string;
  sender: string;
  senderRole: 'AGENT' | 'CUSTOMER' | 'SYSTEM';
  channel: SupportMessageChannel;
  content: string;
  timestamp: string;
  isInternal: boolean;
}

export interface SupportTicketResolution {
  code: SupportResolutionCode;
  note: string;
  resolvedAt: string;
  resolvedBy: string;
  refundAmountMinor?: number;
  refundReference?: string;
  compensationCreditMinor?: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  requesterType: SupportTicketRequesterType;
  requesterName: string;
  requesterPhone: string;
  requesterEmail?: string;
  preferredLanguage: CongoleseLanguage;
  category:
    | 'OVERCHARGE'
    | 'TRIP_INCIDENT'
    | 'PAYMENT_FAILURE'
    | 'APP_BUG'
    | 'LOST_ITEM'
    | 'DRIVER_BEHAVIOR'
    | 'REFUND_REQUEST'
    | 'GENERAL_INQUIRY';
  title: string;
  description: string;
  linkedType: SupportTicketLinkedType;
  linkedReference: string;
  amountInDisputeMinor?: number;
  currency?: Currency;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assignedAgent?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  slaHours: number;
  slaDueAt: string;
  isSlaBreached: boolean;
  escalatedAt?: string;
  escalatedReason?: string;
  messages: SupportTicketMessage[];
  resolution?: SupportTicketResolution;
  csatRating?: number;
  csatFeedback?: string;
  version: number;
  isDeleted?: boolean;
}

export interface SupportAgentWorkload {
  agentId: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  activeTicketsCount: number;
  urgentTicketsCount: number;
  resolvedTodayCount: number;
  slaBreachCount: number;
  avgResponseMinutes: number;
  csatAverage: number;
}

export interface SupportQueryResult {
  items: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CannedResponse {
  id: string;
  category: string;
  title: string;
  fr: string;
  ln: string;
  sw: string;
  tsh: string;
  en: string;
}

// ============================================================================
// PAYMENTS & RECONCILIATION MANAGEMENT TYPES
// ============================================================================

export type PaymentProvider =
  | 'MPESA'
  | 'AIRTEL_MONEY'
  | 'ORANGE_MONEY'
  | 'AFRICELL_MONEY'
  | 'CASH'
  | 'BANK_CARD';

export type PaymentStatus =
  | 'PENDING'
  | 'SETTLED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentServiceType = 'BUS' | 'TAXI' | 'MOTO' | 'DELIVERY';

export interface PaymentWebhookEvent {
  id: string;
  provider: PaymentProvider;
  eventType: string;
  externalEventId?: string;
  payload: Record<string, unknown>;
  receivedAt: string;
  processed: boolean;
  notes?: string;
}

export interface PaymentRefundRecord {
  id: string;
  amountMinor: number;
  currency: 'CDF' | 'USD';
  reason: string;
  reauthApprovedBy: string;
  providerRefundRef?: string;
  createdAt: string;
}

export interface AdminPaymentOrder {
  id: string;
  reference: string;
  provider: PaymentProvider;
  providerReference: string;
  amountMinor: number;
  currency: 'CDF' | 'USD';
  status: PaymentStatus;
  customerName: string;
  customerPhone: string;
  serviceType: PaymentServiceType;
  operatorId?: string;
  operatorName?: string;
  bookingId?: string;
  rideId?: string;
  deliveryId?: string;
  idempotencyKey?: string;
  reconciled: boolean;
  reconciledAt?: string | null;
  reconciledBy?: string | null;
  reconciliationBatchId?: string | null;
  cashCollectedBy?: string | null;
  cashReceiptNumber?: string | null;
  refundedAmountMinor: number;
  refundHistory: PaymentRefundRecord[];
  webhookEvents: PaymentWebhookEvent[];
  rawProviderStatus: {
    state: string;
    code: string;
    message: string;
    lastCheckedAt: string;
    externalTimestamp?: string;
    networkRef?: string;
  };
  notes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deleteReason?: string | null;
}

export interface ReconciliationStatementItem {
  date: string;
  providerRef: string;
  customerPhone: string;
  amount: number;
  currency: 'CDF' | 'USD';
  status: string;
}

export type DiscrepancyType =
  | 'MATCHED'
  | 'AMOUNT_MISMATCH'
  | 'MISSING_IN_PLATFORM'
  | 'MISSING_IN_STATEMENT'
  | 'STATUS_MISMATCH';

export interface DiscrepancyItem {
  id: string;
  type: DiscrepancyType;
  providerRef: string;
  statementAmount?: number;
  platformAmount?: number;
  differenceMinor?: number;
  currency: 'CDF' | 'USD';
  customerPhone?: string;
  platformPaymentId?: string;
  explanation: string;
}

export interface ReconciliationResult {
  batchId: string;
  provider: PaymentProvider;
  importedRowsCount: number;
  matchedCount: number;
  discrepanciesCount: number;
  discrepancies: DiscrepancyItem[];
  reconciledTotalMinor: number;
  unreconciledTotalMinor: number;
  currency: 'CDF' | 'USD';
  importedAt: string;
}

export interface PaymentsStats {
  totalSettledMinor: number;
  totalRefundedMinor: number;
  totalPendingMinor: number;
  totalFailedCount: number;
  settledCount: number;
  refundedCount: number;
  reconciledCount: number;
  unreconciledCount: number;
  cdfTotalMinor: number;
  usdTotalMinor: number;
}

export interface PaymentsQueryResult {
  items: AdminPaymentOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: PaymentsStats;
}

// ============================================================================
// PRICING CONTROL & PROMOTIONS MANAGEMENT TYPES
// ============================================================================

export type PricingServiceType = 'TAXI' | 'MOTO' | 'DELIVERY';

export interface CityServiceFareFormula {
  id: string;
  cityId: string;
  cityName: string;
  serviceType: PricingServiceType;
  baseFareCdf: number;
  perKmCdf: number;
  perMinuteCdf: number;
  minimumFareCdf: number;
  minRiderDeviationPercent: number; // e.g. -25 means min 75% of formula
  maxRiderDeviationPercent: number; // e.g. +50 means max 150% of formula
  nightSurchargePercent: number;    // e.g. 20 (%)
  nightScheduleStart: string;       // e.g. "21:00"
  nightScheduleEnd: string;         // e.g. "05:30"
  surgeMultiplier: number;          // e.g. 1.0 (normal) up to 2.5
  surgeReason: 'NORMAL' | 'RAIN_WEATHER' | 'TRAFFIC_JAM' | 'HIGH_DEMAND';
  surgeActive: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export type BusComfortClass = 'STANDARD' | 'VIP' | 'EXPRESS';

export interface BusRoutePriceRule {
  id: string;
  routeSlug: string;
  routeName: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  standardPriceCdf: number;
  vipPriceCdf: number;
  expressPriceCdf: number;
  ceilingPriceCdf: number; // regulatory ceiling with FEC
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface ExchangeRateHistoryItem {
  id: string;
  rate: number; // e.g. 2850 CDF for 1 USD
  effectiveFrom: string;
  changedBy: string;
  reason: string;
}

export interface ExchangeRateState {
  currentRate: number; // e.g. 2850 CDF
  effectiveFrom: string;
  updatedBy: string;
  history: ExchangeRateHistoryItem[];
}

export type PromotionType = 'CODE' | 'AUTOMATIC';
export type PromotionDiscountType = 'PERCENTAGE' | 'FIXED_CDF' | 'FIXED_USD';

export interface PricingPromotion {
  id: string;
  code: string | null; // e.g. "KINSHASA2026", null for automatic
  title: string;
  description: string;
  type: PromotionType;
  discountType: PromotionDiscountType;
  discountValue: number; // percentage (e.g. 20) or fixed amount (e.g. 2000 CDF)
  maxDiscountCdf?: number; // Cap on percentage discount
  validFrom: string;
  validUntil: string;
  globalUsageLimit: number;
  globalUsageCount: number;
  perUserLimit: number;
  eligibleServices: string[]; // ['TAXI', 'MOTO', 'BUS', 'DELIVERY']
  eligibleCities: string[];   // ['kinshasa', 'lubumbashi', 'ALL']
  minRideAmountCdf?: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PricingDiffItem {
  target: string;
  field: string;
  label: string;
  oldValue: string | number | boolean;
  newValue: string | number | boolean;
}

export interface PricingVersionSnapshot {
  versionNumber: number;
  id: string;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  scheduledActivationAt: string | null;
  status: 'ACTIVE' | 'SCHEDULED' | 'ROLLED_BACK' | 'SUPERSEDED';
  diff: PricingDiffItem[];
  formulasSnapshot: CityServiceFareFormula[];
  busRulesSnapshot: BusRoutePriceRule[];
  exchangeRateSnapshot: number;
}

export interface SimulateFareRequest {
  cityId: string;
  serviceType: 'TAXI' | 'MOTO' | 'DELIVERY' | 'BUS';
  distanceKm: number;
  durationMinutes: number;
  isNight?: boolean;
  surgeMultiplier?: number;
  busRouteSlug?: string;
  busComfortClass?: BusComfortClass;
  promoCode?: string;
  currency?: 'CDF' | 'USD';
}

export interface SimulateFareResult {
  serviceType: string;
  cityName: string;
  baseFareCdf: number;
  distanceFareCdf: number;
  timeFareCdf: number;
  subtotalCdf: number;
  nightSurchargeCdf: number;
  surgeSurchargeCdf: number;
  preDiscountTotalCdf: number;
  discountCdf: number;
  appliedPromo?: {
    code: string | null;
    title: string;
    discountType: string;
    discountValue: number;
  };
  finalFareCdf: number;
  finalFareUsd: number;
  exchangeRateUsed: number;
  minAcceptableRiderBidCdf: number;
  maxAcceptableRiderBidCdf: number;
  minAcceptableRiderBidUsd: number;
  maxAcceptableRiderBidUsd: number;
}

// ============================================================================
// COMMISSIONS & PAYOUTS MANAGEMENT TYPES
// ============================================================================

export type CommissionRateType = 'PERCENTAGE' | 'FIXED_CDF' | 'TIERED' | 'FLAT_FEE' | 'HYBRID';

export interface CommissionConfigRule {
  id: string;
  title: string;
  description?: string;
  operatorId: string | null;
  operatorName?: string | null;
  serviceType: 'BUS' | 'TAXI' | 'MOTO' | 'DELIVERY' | 'ALL';
  service?: 'BUS' | 'TAXI' | 'MOTO' | 'DELIVERY' | 'ALL';
  cityId: string; // e.g. "kinshasa", "lubumbashi", "ALL"
  city?: string;
  cityName?: string;
  vehicleType: string; // "CAR", "MOTO", "BUS", "VAN", "ALL"
  rateType: CommissionRateType;
  percentage: number; // e.g. 10 (10%)
  fixedFeeCdf: number; // e.g. 500 CDF
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  version: number;
  createdAt?: string;
  updatedAt: string;
  updatedBy?: string;
}

export type PayoutMethod =
  | 'MPESA'
  | 'AIRTEL_MONEY'
  | 'ORANGE_MONEY'
  | 'AFRICELL_MONEY'
  | 'RAWBANK'
  | 'EQUITY_BCDC'
  | 'CASH'
  | 'CASH_VOUCHER';

export interface PayeePayoutDetails {
  recipientName?: string;
  accountName?: string;
  mobileNumber?: string;
  mobileMoneyPhone?: string;
  mobileMoneyProvider?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIban?: string;
}

export interface PayeeAccount {
  id: string;
  payeeType: 'DRIVER' | 'OPERATOR';
  payeeId: string;
  payeeName: string;
  phone: string;
  preferredPayoutMethod: PayoutMethod;
  payoutDetails: PayeePayoutDetails;
  currentBalanceCdf: number;
  pendingBalanceCdf: number;
  totalPaidOutCdf: number;
  currentBalanceUsd: number;
  pendingBalanceUsd: number;
  totalPaidOutUsd: number;
  status: 'ACTIVE' | 'HOLD' | 'SUSPENDED';
  holdReason: string | null;
  version: number;
  updatedAt: string;
}

export type AdjustmentType =
  | 'BONUS'
  | 'PENALTY'
  | 'CHARGEBACK'
  | 'EQUIPMENT_REIMBURSEMENT'
  | 'CORRECTION';

export interface PayeeAdjustment {
  id: string;
  payeeId: string;
  payeeName: string;
  type: AdjustmentType;
  amountCdf: number; // positive or negative
  currency: 'CDF' | 'USD';
  reason: string;
  approvedBy: string;
  createdAt: string;
  status: 'APPLIED' | 'CANCELLED';
  payoutBatchId: string | null;
}

export type PayoutBatchStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'NEEDS_SECOND_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'ON_HOLD';

export interface PayoutLineItem {
  id: string;
  payeeId: string;
  payeeName: string;
  payeeType: 'DRIVER' | 'OPERATOR';
  service: string;
  tripCount: number;
  grossRevenueCdf: number;
  commissionRatePercent: number;
  commissionCdf: number;
  adjustmentsCdf: number;
  netPayoutCdf: number;
  payoutMethod: PayoutMethod;
  destinationAccount: string;
  status: 'PENDING' | 'PAID' | 'HOLD' | 'FAILED';
  disbursementRef: string | null;
}

export interface PayoutApprovalRecord {
  approvedBy: string;
  approvedAt: string;
  notes?: string;
}

export interface PayoutExecutionRecord {
  executedBy: string;
  executedAt: string;
  payoutProvider: PayoutMethod;
  referenceNumber: string;
  notes?: string;
}

export interface PayoutBatch {
  id: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  currency: 'CDF' | 'USD';
  totalGrossRevenueCdf: number;
  totalCommissionCdf: number;
  totalAdjustmentsCdf: number;
  totalNetPayoutCdf: number;
  payeeCount: number;
  status: PayoutBatchStatus;
  firstApproval: PayoutApprovalRecord | null;
  secondApproval: PayoutApprovalRecord | null;
  requiresDualApproval: boolean;
  dualApprovalThresholdCdf: number;
  paymentExecution: PayoutExecutionRecord | null;
  failureReason: string | null;
  holdReason: string | null;
  items: PayoutLineItem[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayeeStatementTransaction {
  id: string;
  date: string;
  type: 'TRIP' | 'DELIVERY' | 'BOOKING' | 'ADJUSTMENT';
  reference: string;
  description: string;
  grossCdf: number;
  commissionCdf: number;
  netCdf: number;
}

export interface PayeeStatement {
  payee: PayeeAccount;
  periodStart: string;
  periodEnd: string;
  startingBalanceCdf: number;
  totalGrossRevenueCdf: number;
  totalCommissionDeductedCdf: number;
  totalAdjustmentsCdf: number;
  netEarnedCdf: number;
  totalPaidOutCdf: number;
  closingBalanceCdf: number;
  transactions: PayeeStatementTransaction[];
  generatedAt: string;
}

export interface PayoutsStats {
  totalPaidOutCdf: number;
  pendingApprovalCdf: number;
  readyForExecutionCdf: number;
  totalCommissionRetainedCdf: number;
  activeDriversCount: number;
  activeOperatorsCount: number;
  batchesPendingCount: number;
  dualApprovalPendingCount: number;
}

// ============================================================================
// CMS & CONTENT MANAGEMENT TYPES
// ============================================================================

export type SupportedLanguage = 'fr' | 'en' | 'ln' | 'sw';

export type CmsSectionType =
  | 'hero'
  | 'popular_routes'
  | 'banners'
  | 'featured_destinations'
  | 'how_it_works'
  | 'faq'
  | 'partner_logos'
  | 'trust_section';

export interface CmsSection {
  id: string;
  type: CmsSectionType;
  title: string;
  orderIndex: number;
  isActive: boolean;
  scheduledPublishAt: string | null;
  scheduledUnpublishAt: string | null;
  content: Record<string, any>;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export type CmsPageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CmsPageVersionSnapshot {
  version: number;
  title: Record<SupportedLanguage, string>;
  content: Record<SupportedLanguage, string>;
  status: CmsPageStatus;
  savedAt: string;
  savedBy: string;
  reason?: string;
}

export interface CmsStaticPage {
  id: string;
  slug: string; // 'about' | 'privacy' | 'terms' | 'refund-policy'
  title: Record<SupportedLanguage, string>;
  content: Record<SupportedLanguage, string>;
  status: CmsPageStatus;
  publishedAt: string | null;
  publishedBy: string | null;
  version: number;
  versionHistory: CmsPageVersionSnapshot[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CmsI18nString {
  id: string;
  key: string;
  category: 'common' | 'home' | 'bus' | 'rides' | 'auth' | 'footer' | 'payouts';
  translations: Record<SupportedLanguage, string>;
  needsReview: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CmsMediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage saved, e.g. 68%
  altText: string;
  width: number;
  height: number;
  tags: string[];
  deletedAt: string | null;
  createdAt: string;
  createdBy: string;
}

export type CmsReviewStatus = 'APPROVED' | 'HIDDEN' | 'DELETED';

export interface CmsReviewItem {
  id: string;
  authorName: string;
  authorPhone: string;
  serviceType: 'BUS' | 'TAXI' | 'MOTO' | 'DELIVERY';
  targetName: string; // Driver or Operator brand
  rating: number; // 1 to 5
  comment: string;
  routeDescription: string;
  status: CmsReviewStatus;
  moderationReason: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  createdAt: string;
}

export interface CmsStats {
  activeSectionsCount: number;
  totalPagesCount: number;
  publishedPagesCount: number;
  totalTranslationsCount: number;
  missingTranslationsCount: number;
  needsReviewTranslationsCount: number;
  totalMediaCount: number;
  totalMediaSizeKb: number;
  pendingReviewsCount: number;
  approvedReviewsCount: number;
}

// -------------------------------------------------------------
// NOTIFICATIONS MANAGEMENT (TEMPLATES, BROADCASTS, LOGS, OPT-OUT)
// -------------------------------------------------------------

export type NotificationChannel = 'SMS' | 'WHATSAPP' | 'PUSH' | 'EMAIL';

export type NotificationEvent =
  | 'BOOKING_CONFIRMED'
  | 'TRIP_REMINDER_2H'
  | 'DRIVER_ASSIGNED'
  | 'DELIVERY_PICKED_UP'
  | 'PAYOUT_SENT'
  | 'SECURITY_ALERT'
  | 'REFUND_PROCESSED'
  | 'TICKET_CANCELED';

export type NotificationCategory =
  | 'BOOKINGS'
  | 'TRIPS'
  | 'DELIVERY'
  | 'PAYMENTS'
  | 'SECURITY'
  | 'MARKETING';

export interface NotificationChannelContent {
  subject?: string;
  body: string;
}

export interface NotificationTemplate {
  id: string;
  event: NotificationEvent;
  name: string;
  description: string;
  category: NotificationCategory;
  isEnabled: boolean;
  channels: NotificationChannel[];
  variables: string[];
  content: Record<SupportedLanguage, Partial<Record<NotificationChannel, NotificationChannelContent>>>;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
}

export type BroadcastSegment =
  | 'ALL_USERS'
  | 'CITY_KINSHASA'
  | 'CITY_LUBUMBASHI'
  | 'CITY_MATADI'
  | 'CITY_GOMA'
  | 'DRIVERS_ONLY'
  | 'BOOKED_ROUTE_USERS';

export type BroadcastStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PENDING_APPROVAL'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export interface NotificationBroadcast {
  id: string;
  title: string;
  targetSegment: BroadcastSegment;
  targetFilter?: {
    city?: string;
    routeId?: string;
    userRole?: string;
    minBookings?: number;
  };
  channels: NotificationChannel[];
  messages: Record<SupportedLanguage, { subject?: string; body: string }>;
  scheduledAt: string | null;
  status: BroadcastStatus;
  costEstimate: {
    recipientCount: number;
    smsCount: number;
    costPerSmsUsd: number;
    costPerWaUsd: number;
    totalCostUsd: number;
    totalCostCdf: number;
  };
  deliveryStats: {
    totalTargets: number;
    optOutExcluded: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    readCount: number;
  };
  safeguardApproval: {
    approvedBy: string;
    approvedAt: string;
    reason: string;
  } | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  deletedAt: string | null;
}

export type DeliveryStatus = 'SENT' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'OPT_OUT_SKIPPED';

export type NotificationProvider =
  | 'ORANGE_SMS'
  | 'AIRTEL_SMS'
  | 'VODACOM_SMS'
  | 'WHATSAPP_BUSINESS'
  | 'FIREBASE_PUSH'
  | 'SENDGRID_EMAIL';

export interface NotificationDeliveryLog {
  id: string;
  recipient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    language: SupportedLanguage;
  };
  event: string;
  channel: NotificationChannel;
  provider: NotificationProvider;
  messageContent: string;
  status: DeliveryStatus;
  failureReason: string | null;
  retryCount: number;
  maxRetries: number;
  sentAt: string;
  deliveredAt: string | null;
  costUsd: number;
}

export interface NotificationOptOut {
  id: string;
  userId: string;
  identifier: string; // phone or email
  channels: NotificationChannel[];
  categories: string[];
  optedOutAt: string;
  source: 'SMS_STOP' | 'USER_SETTINGS' | 'ADMIN_OVERRIDE';
}

export interface NotificationStats {
  totalSent24h: number;
  deliveryRatePercent: number;
  failureCount: number;
  totalMonthlyCostUsd: number;
  activeTemplatesCount: number;
  scheduledBroadcastsCount: number;
  totalOptOutsCount: number;
}

// -------------------------------------------------------------
// SETTINGS, INTEGRATIONS, WEBHOOKS & MAINTENANCE MANAGEMENT
// -------------------------------------------------------------

export interface PlatformBranding {
  appName: string;
  logoUrl: string;
  faviconUrl: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface PlatformContact {
  supportEmail: string;
  supportPhone: string;
  supportWhatsApp: string;
  headquartersAddress: string;
}

export interface PlatformSocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
}

export interface PlatformAppStoreLinks {
  playStoreUrl: string;
  appStoreUrl: string;
  huaweiAppGalleryUrl: string;
  pwaInstallUrl: string;
}

export interface PlatformSeo {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  ogImageUrl: string;
  keywords: string[];
}

export interface BusinessRulesCancellation {
  freeCancellationWindowHours: number;
  refundPercentageAboveWindow: number;
  refundPercentageBelowWindow: number;
}

export interface BusinessRulesBooking {
  seatHoldDurationMinutes: number;
  maxSeatsPerBooking: number;
  advanceBookingMaxDays: number;
}

export interface BusinessRulesOtp {
  otpLength: number;
  otpExpirySeconds: number;
  maxOtpAttempts: number;
}

export interface BusinessRulesDriverMatching {
  searchRadiusKm: number;
  matchingTimeoutSeconds: number;
  maxReassignmentAttempts: number;
}

export interface BusinessRulesSafety {
  sosEmergencyNumber: string;
  policeEmergencyNumber: string;
  maxDriverDailyDrivingHours: number;
  mandatoryHelmetRequirement: boolean;
}

export interface PlatformBusinessRules {
  cancellationPolicy: BusinessRulesCancellation;
  booking: BusinessRulesBooking;
  otp: BusinessRulesOtp;
  driverMatching: BusinessRulesDriverMatching;
  safety: BusinessRulesSafety;
}

export interface PlatformMaintenance {
  isEnabled: boolean;
  message: string;
  estimatedEndTime: string | null;
  allowlistedEmails: string[];
  allowlistedIps: string[];
  activatedAt: string | null;
  activatedBy: string | null;
}

export interface PlatformSettings {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  branding: PlatformBranding;
  contact: PlatformContact;
  socialLinks: PlatformSocialLinks;
  appStoreLinks: PlatformAppStoreLinks;
  seo: PlatformSeo;
  businessRules: PlatformBusinessRules;
  maintenance: PlatformMaintenance;
}

export interface SettingsSnapshot {
  id: string;
  version: number;
  settings: PlatformSettings;
  savedAt: string;
  savedBy: string;
  reason: string;
}

export type IntegrationCategory = 'PAYMENT' | 'SMS_WHATSAPP' | 'MAPS' | 'STORAGE';

export type IntegrationProvider =
  | 'ORANGE_MONEY'
  | 'MPESA'
  | 'AIRTEL_MONEY'
  | 'TWILIO_SMS'
  | 'INFOBIP_WHATSAPP'
  | 'GOOGLE_MAPS'
  | 'CLOUDINARY';

export interface IntegrationConfig {
  id: string;
  name: string;
  provider: IntegrationProvider;
  category: IntegrationCategory;
  status: 'ACTIVE' | 'TESTING' | 'DISABLED';
  environment: 'PRODUCTION' | 'SANDBOX';
  credentialsEncrypted?: Record<string, string>; // Never exposed in API responses!
  credentialsMasked: Record<string, string>; // Safe masked values (e.g. sk_live_...4a9f)
  lastTestedAt: string | null;
  lastTestStatus: 'SUCCESS' | 'FAILURE' | null;
  lastTestMessage: string | null;
  keyRotatedAt: string | null;
  keyRotatedBy: string | null;
  version: number;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secretMasked: string;
  secretEncrypted?: string;
  failureCount: number;
  lastCalledAt: string | null;
  createdAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  payloadSummary: string;
  responseCode: number;
  responseBody: string;
  durationMs: number;
  status: 'SUCCESS' | 'FAILURE';
  attempt: number;
  timestamp: string;
}

export interface SettingsStats {
  settingsVersion: number;
  totalSnapshots: number;
  activeIntegrations: number;
  totalIntegrations: number;
  maintenanceActive: boolean;
  activeWebhooks: number;
  lastUpdated: string;
}

// -------------------------------------------------------------
// ANALYTICS & MOBILITY PERFORMANCE INTERFACES
// -------------------------------------------------------------

export type AnalyticsPeriod = '7D' | '30D' | '90D' | 'CUSTOM';
export type AnalyticsCityFilter = 'ALL' | 'KINSHASA' | 'LUBUMBASHI' | 'GOMA' | 'MATADI' | 'KOLWEZI';
export type AnalyticsReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type AnalyticsExportFormat = 'CSV' | 'EXCEL_XLSX' | 'PDF_SUMMARY';

export interface KpiComparisonDelta {
  absoluteChange: number;
  percentageChange: number; // e.g. +14.2% or -3.5%
  isPositive: boolean; // whether the delta is considered a good performance indicator
}

export interface AnalyticsKpiOverview {
  totalBookings: number;
  revenueCdfMinor: number;
  revenueUsdMinor: number;
  activeUsers: number;
  completedRides: number;
  cancellations: number;
  averageRating: number;
  refundRatePercent: number;
  deltas: {
    bookings: KpiComparisonDelta;
    revenue: KpiComparisonDelta;
    activeUsers: KpiComparisonDelta;
    completedRides: KpiComparisonDelta;
    cancellations: KpiComparisonDelta;
    averageRating: KpiComparisonDelta;
    refundRate: KpiComparisonDelta;
  };
  periodLabel: string;
  comparedToLabel: string;
  cachedAt: string;
}

export interface ConversionFunnelStep {
  stepId: 'SEARCH' | 'SEAT_HOLD' | 'PAYMENT_SUCCESS';
  stepName: string;
  count: number;
  conversionRateFromStart: number; // percentage from initial step
  conversionRateFromPrevious: number; // percentage from prior step
  dropoffRate: number; // percentage lost
}

export interface RouteOccupancyMetric {
  routeId: string;
  routeName: string;
  corridorCode: string;
  operatorName: string;
  transportMode: 'BUS' | 'TRAIN' | 'RIVER';
  totalCapacity: number;
  bookedSeats: number;
  occupancyRatePercent: number;
  averageFareCdfMinor: number;
  departuresCount: number;
}

export interface TopOperatorMetric {
  operatorId: string;
  operatorName: string;
  totalRevenueCdfMinor: number;
  totalTripsCompleted: number;
  onTimeRatePercent: number;
  passengerSatisfactionRating: number;
  fleetActiveCount: number;
}

export interface DriverSupplyDemandPoint {
  hour: number; // 0 to 23
  hourLabel: string; // "00:00", "08:00", etc.
  city: AnalyticsCityFilter;
  activeDriversSupply: number;
  rideRequestsDemand: number;
  fulfillmentRatePercent: number;
  surgeMultiplier: number; // 1.0 to 2.5
}

export interface PaymentMethodMixMetric {
  provider: 'MPESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'AFRICELL_MONEY' | 'CASH';
  providerLabel: string;
  transactionCount: number;
  volumeCdfMinor: number;
  percentageOfTotal: number;
  successRatePercent: number;
  refundRatePercent: number;
}

export interface UserRetentionMetric {
  newUsersCount: number;
  returningUsersCount: number;
  retentionRatePercent: number;
  dauToMauRatioPercent: number;
  averageTripsPerUser: number;
}

export interface ScheduledAnalyticsReport {
  id: string;
  name: string;
  frequency: AnalyticsReportFrequency;
  recipients: string[];
  format: AnalyticsExportFormat;
  cityFilter: AnalyticsCityFilter;
  includeSections: ('KPIS' | 'FUNNEL' | 'OCCUPANCY' | 'SUPPLY_DEMAND' | 'PAYMENTS')[];
  lastSentAt: string | null;
  nextRunAt: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}













// ----------------- DRIVER & PROVIDER KYC HARDENED DOMAIN -----------------

export type ProviderType = 'MOTO' | 'CAR' | 'SHUTTLE';

export type ProviderVerificationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type KycDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type KycDocumentCategory =
  | 'NATIONAL_ID'
  | 'PASSPORT'
  | 'VOTER_CARD'
  | 'SELFIE_LIVENESS'
  | 'CRIMINAL_RECORD'
  | 'TERMS_CONSENT'
  | 'MOTO_LICENSE'
  | 'CARTE_ROSE_MOTO'
  | 'MOTO_INSURANCE'
  | 'MOTO_TECH_INSPECTION'
  | 'COOPERATIVE_AUTH'
  | 'HELMET_DECLARATION'
  | 'CAR_LICENSE'
  | 'TAXI_PERMIT'
  | 'CARTE_ROSE_CAR'
  | 'CAR_INSURANCE'
  | 'CAR_TECH_INSPECTION'
  | 'OWNER_AUTHORIZATION'
  | 'OWNER_ID'
  | 'RCCM'
  | 'ID_NAT'
  | 'NIF'
  | 'TRANSPORT_LICENSE'
  | 'COMPANY_LOGO'
  | 'REP_ID'
  | 'REP_PROOF_AUTHORITY'
  | 'ROUTE_AUTHORIZATION'
  | 'PASSENGER_INSURANCE';

export interface KycDocumentRecord {
  id: string;
  providerId: string;
  type: KycDocumentCategory;
  name: string;
  documentNumber: string;
  issueDate?: string;
  expiryDate?: string;
  fileKey: string;
  signedUrl?: string;
  watermarkText?: string;
  status: KycDocumentStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  isExpiringSoon?: boolean; // <= 30 days
  isExpired?: boolean;
  uploadedAt: string;
  updatedAt: string;
}

export interface KycRequirementConfig {
  id: string;
  city: string; // "Kinshasa", "Lubumbashi", "Kolwezi", "Matadi", "Goma", or "ALL"
  providerType: ProviderType;
  documentType: KycDocumentCategory;
  label: string;
  description: string;
  isRequired: boolean;
  expires: boolean;
  allowedFormats: string[];
  maxSizeBytes: number;
  version: number;
  active: boolean;
  updatedAt: string;
}

export interface IndividualProfile {
  fullName: string;
  birthDate: string;
  gender?: 'MALE' | 'FEMALE';
  phone: string;
  phoneVerified: boolean;
  pinHash?: string;
  residentialAddress: string;
  landmark: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  criminalRecordSubmitted: boolean;
  hasPassengerHelmet?: boolean;
  helmetChecklistCompleted?: boolean;
}

export interface CompanyProfile {
  companyName: string;
  legalForm: string; // SARL, SA, Ets, Cooperative
  rccm: string;
  idNat: string;
  nif: string;
  address: string;
  city: string;
  logoUrl?: string;
  transportLicenseNumber: string;
  authorizedRoutes: string[];
  authorizedStations: string[];
  legalRepName: string;
  legalRepPhone: string;
  legalRepEmail?: string;
  legalRepRole: string;
}

export interface VehicleRecord {
  id: string;
  providerId: string;
  type: 'MOTO' | 'CAR' | 'MINIBUS' | 'BUS' | 'COACH';
  plate: string;
  make: string;
  model: string;
  color: string;
  year?: number;
  chassisNumber?: string;
  capacitySeats: number;
  hasAc?: boolean;
  hasWifi?: boolean;
  hasLuggageSpace?: boolean;
  hasChildSeat?: boolean;
  carteRoseNumber: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  techInspectionExpiry?: string;
  photos: {
    front?: string;
    side?: string;
    back?: string;
    plate?: string;
    interior?: string;
  };
  isOwner: boolean;
  ownerName?: string;
  ownerIdNumber?: string;
  ownerAuthorizationDocKey?: string;
  active: boolean;
}

export interface ShuttleStaffRecord {
  id: string;
  companyId: string;
  fullName: string;
  phone: string;
  role: 'DRIVER' | 'DISPATCHER' | 'AGENT';
  licenseNumber?: string;
  licenseExpiry?: string;
  contractProofDocKey?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  assignedTrips: string[];
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  providerId: string;
  termsAccepted: boolean;
  termsVersion: string;
  safetyCodeAccepted: boolean;
  safetyCodeVersion: string;
  dataConsentAccepted: boolean;
  dataConsentVersion: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface PayoutAccountRecord {
  id: string;
  providerId: string;
  type: 'MOBILE_MONEY' | 'BANK';
  provider: 'MPESA' | 'AIRTEL' | 'ORANGE' | 'AFRICELL' | 'RAWBANK' | 'EQUITY_BCDC';
  accountNumber: string;
  accountName: string;
  nameMatchVerified: boolean;
  isPrimary: boolean;
  createdAt: string;
}

export interface ReverificationTask {
  id: string;
  providerId: string;
  reason: 'EXPIRED_DOCUMENT' | 'VEHICLE_CHANGE' | 'PLATE_CHANGE' | 'SAFETY_INCIDENT' | 'ADMIN_REQUEST';
  affectedFields: string[];
  deadline: string;
  status: 'PENDING' | 'SUBMITTED' | 'RESOLVED';
  createdAt: string;
}

export interface ProviderAccount {
  id: string;
  userId: string;
  role: 'DRIVER_MOTO' | 'DRIVER_CAR' | 'SHUTTLE_OPERATOR' | 'SHUTTLE_STAFF';
  providerType: ProviderType;
  status: ProviderVerificationStatus;
  city: string;
  individualProfile?: IndividualProfile;
  companyProfile?: CompanyProfile;
  documents: KycDocumentRecord[];
  vehicles: VehicleRecord[];
  staff?: ShuttleStaffRecord[];
  payoutAccounts: PayoutAccountRecord[];
  consent?: ConsentRecord;
  reverificationTasks?: ReverificationTask[];
  currentOnlineStatus: 'ONLINE' | 'OFFLINE' | 'BUSY';
  rating: number;
  totalTrips: number;
  suspensionReason?: string | null;
  rejectionReason?: string | null;
  missingInfoNotes?: string | null;
  reviewSlaDeadline?: string | null;
  deviceBindingHash?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverSession {
  token: string;
  providerId: string;
  userId: string;
  role: 'DRIVER_MOTO' | 'DRIVER_CAR' | 'SHUTTLE_OPERATOR' | 'SHUTTLE_STAFF';
  providerType: ProviderType;
  status: ProviderVerificationStatus;
  deviceHash: string;
  deviceName?: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
}


// ----------------- KYC REQUIREMENTS MANAGER DOMAIN -----------------

export type KycApplicableProviderType =
  | 'MOTO'
  | 'CAR'
  | 'SHUTTLE_OPERATOR'
  | 'SHUTTLE_DRIVER';

export type KycRequirementCategory =
  | 'IDENTITY'
  | 'DRIVING'
  | 'VEHICLE'
  | 'COMPANY'
  | 'FINANCIAL'
  | 'SAFETY'
  | 'CUSTOM';

export type KycRequirementType = 'MANDATORY' | 'OPTIONAL' | 'CONDITIONAL' | 'NOT_APPLICABLE';

export type KycExpiryConsequence = 'WARN_ONLY' | 'BLOCK_TRIPS' | 'AUTO_SUSPEND';

export type KycSensitivityLevel = 'STANDARD' | 'CONFIDENTIAL' | 'STRICTLY_CONFIDENTIAL';

export type KycVersionStatus = 'DRAFT' | 'PUBLISHED' | 'ROLLED_BACK' | 'ARCHIVED';

export type KycImpactPolicy = 'GRANDFATHER' | 'GRACE_PERIOD' | 'IMMEDIATE_SUSPEND';

export interface LocalizedText {
  fr: string;
  en: string;
  ln: string; // Lingala
  sw: string; // Swahili
}

export interface KycConditionRule {
  field: 'isVehicleOwner' | 'vehicleAgeYears' | 'isIntercityRoute' | 'hasSubContractors' | 'custom';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN';
  value: any;
  explanationFr: string;
}

export interface KycFieldValidator {
  captureDocumentNumber: boolean;
  documentNumberRegex?: string;
  documentNumberFormatHelp?: string;
  captureIssueDate: boolean;
  captureExpiryDate: boolean;
  captureIssuingAuthority: boolean;
  captureNameOnDocument: boolean;
}

export interface KycValidityRule {
  expires: boolean;
  minRemainingDaysAtSubmission: number;
  reminderDaysSchedule: number[]; // e.g. [30, 14, 7]
  expiryConsequence: KycExpiryConsequence;
}

export interface KycReviewRule {
  autoCheckFormat: boolean;
  autoCheckDuplicates: boolean;
  autoCheckProfileNameMatch: boolean;
  manualReviewRequired: boolean;
  reviewSlaHours: number;
  requiresSecondReviewerForHighRisk: boolean;
}

export interface KycLivenessRule {
  required: boolean;
  thresholdPercent: number; // e.g. 80%
  allowManualFallback: boolean;
}

export interface KycRequirementItem {
  id: string;
  code: string;
  category: KycRequirementCategory;
  labels: LocalizedText;
  helpTexts: LocalizedText;
  photoInstructionsFr: string;
  exampleImageUrl?: string;
  
  // Applicability & Requirements by Provider Type
  applicability: Record<KycApplicableProviderType, KycRequirementType>;
  conditionRules?: KycConditionRule[];
  plainFrenchConditionPreview?: string;
  
  // File upload constraints
  allowedFileTypes: string[]; // e.g. ['image/jpeg', 'image/png', 'application/pdf']
  maxSizeBytes: number; // e.g. 10485760 (10MB)
  maxImagesCount: number; // 1 for single, 2 for recto/verso, etc.
  
  // Capture & Validity & Review rules
  fieldValidators: KycFieldValidator;
  validityRules: KycValidityRule;
  reviewRules: KycReviewRule;
  livenessRules: KycLivenessRule;
  sensitivityLevel: KycSensitivityLevel;
  
  // Guardrails & Pre-launch checks
  isCoreGuardrail: boolean; // True for ID, Selfie Liveness, Payout Account, Terms Consent
  isLegalPreLaunchConfirmationNeeded: boolean;
  legalNote?: string;
  
  // Organization
  displayOrder: number;
  stepGroup: 'IDENTITY' | 'DOCUMENTS' | 'VEHICLE' | 'FINANCIAL' | 'LEGAL';
  isCustom: boolean;
  archived: boolean;
  hasSubmissions: boolean;
  
  // Inheritance
  isInheritedFromDefault?: boolean;
  isCityOverride?: boolean;
  
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface KycCityOverrideConfig {
  city: string; // 'Kinshasa', 'Lubumbashi', 'Kolwezi', 'Matadi', 'Goma'
  overrides: Record<string, Partial<KycRequirementItem>>; // Keyed by item code or id
  updatedAt: string;
  updatedBy: string;
}

export interface KycRequirementVersion {
  id: string;
  versionNumber: number;
  city: string; // 'ALL' or specific city
  status: KycVersionStatus;
  publishedBy: string;
  publishedByEmail?: string;
  publishReason: string;
  effectiveDate: string;
  itemsSnapshot: KycRequirementItem[];
  diffSummary?: {
    addedCount: number;
    updatedCount: number;
    removedCount: number;
    changesDescription: string[];
  };
  createdAt: string;
  publishedAt?: string;
}

export interface KycImpactAnalysisResult {
  versionId: string;
  targetCity: string;
  totalActiveProvidersChecked: number;
  affectedProvidersCount: number;
  byProviderType: Record<KycApplicableProviderType, number>;
  newRequirementsIntroduced: string[];
  estimatedDaysToComply: number;
  suggestedGracePeriodDays: number;
  smsNotificationTemplateFr: string;
}

export interface KycComplianceMetrics {
  city: string;
  providerType: string;
  totalProviders: number;
  compliantApprovedCount: number;
  inReviewCount: number;
  missingInfoCount: number;
  expiringIn30DaysCount: number;
  expiredSuspendedCount: number;
  averageReviewTimeHours: number;
  reviewTimeVsSlaPercent: number;
  topRejectionReasons: { reason: string; count: number }[];
}
