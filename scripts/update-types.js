const fs = require('fs');

let content = fs.readFileSync('src/types/index.ts', 'utf8');

// Update UserRole
content = content.replace(
  /export type UserRole =\r?\n\s*\| 'PASSENGER'\r?\n\s*\| 'DRIVER'/,
  `export type UserRole =\n  | 'PASSENGER'\n  | 'DRIVER'\n  | 'DRIVER_MOTO'\n  | 'DRIVER_CAR'\n  | 'SHUTTLE_OPERATOR'\n  | 'SHUTTLE_STAFF'`
);

const newTypes = `
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
`;

content += '\n' + newTypes;
fs.writeFileSync('src/types/index.ts', content, 'utf8');
console.log('src/types/index.ts updated successfully');

