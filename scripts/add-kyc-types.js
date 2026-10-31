const fs = require('fs');

let typesContent = fs.readFileSync('src/types/index.ts', 'utf8');

// 1. Add kyc_requirements permissions to AdminPermission
const kycPerms = `  | 'kyc_requirements.read'
  | 'kyc_requirements.create'
  | 'kyc_requirements.update'
  | 'kyc_requirements.publish'
  | 'kyc_requirements.rollback'
  | 'kyc_requirements.delete'
`;

typesContent = typesContent.replace(
  "| 'settings.rollback'",
  `| 'settings.rollback'\n${kycPerms}`
);

// 2. Add complete KYC Requirements Domain types
const newKycTypes = `
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
`;

typesContent += '\n' + newKycTypes;
fs.writeFileSync('src/types/index.ts', typesContent, 'utf8');

// 3. Update roles-permissions.ts
let permContent = fs.readFileSync('src/lib/security/roles-permissions.ts', 'utf8');

const permListInsert = `  'kyc_requirements.read',
  'kyc_requirements.create',
  'kyc_requirements.update',
  'kyc_requirements.publish',
  'kyc_requirements.rollback',
  'kyc_requirements.delete',
`;

permContent = permContent.replace(
  "'settings.rollback',",
  `'settings.rollback',\n${permListInsert}`
);

// Add to STANDARD_ADMIN_PERMISSIONS
permContent = permContent.replace(
  "'settings.rollback',\n  'maintenance.toggle',",
  `'settings.rollback',\n  'kyc_requirements.read',\n  'kyc_requirements.create',\n  'kyc_requirements.update',\n  'maintenance.toggle',`
);

// Add to OPERATIONS_PERMISSIONS
permContent = permContent.replace(
  "'settings.read',",
  `'settings.read',\n  'kyc_requirements.read',\n  'kyc_requirements.create',\n  'kyc_requirements.update',`
);

// Add to SUPPORT_PERMISSIONS
permContent = permContent.replace(
  "'audit.alerts.read',",
  `'audit.alerts.read',\n  'kyc_requirements.read',`
);

fs.writeFileSync('src/lib/security/roles-permissions.ts', permContent, 'utf8');
console.log('Types and permissions updated successfully');

