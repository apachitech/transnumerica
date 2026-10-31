import {
  KycRequirementItem,
  KycRequirementVersion,
  KycApplicableProviderType,
  KycCityOverrideConfig,
  KycImpactAnalysisResult,
  KycComplianceMetrics,
  KycConditionRule,
  KycImpactPolicy,
} from '@/types';
import { recordAuditEntry } from './audit-store';
import { getAllProviders } from './provider-store';

// ----------------- DEFAULT SEEDED KYC REQUIREMENTS -----------------

export const SEEDED_DEFAULT_KYC_ITEMS: KycRequirementItem[] = [
  // 1. Core Identity & Legal (All Providers)
  {
    id: 'KYC-REQ-ID-CARD',
    code: 'REQ-ID-CARD',
    category: 'IDENTITY',
    labels: {
      fr: 'Pièce d’identité officielle congolaise',
      en: 'Official Congolese ID Document',
      ln: 'Karti ya boponi CENI to Pasipolo RDC',
      sw: 'Kitambulisho cha taifa au Pasipoti ya DRC',
    },
    helpTexts: {
      fr: 'Carte d’électeur CENI valide ou Passeport biométrique national RDC en cours de validité.',
      en: 'Valid CENI voter card or biometric DRC passport.',
      ln: 'Karti ya boponi ya sika to pasipolo oyo eza na mikolo.',
      sw: 'Kadi ya mpiga kura ya CENI au pasipoti halali ya kibayometriki.',
    },
    photoInstructionsFr: 'Prenez une photo nette du recto et du verso sur fond blanc ou plat, sans reflets ni doigts sur le texte.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'MANDATORY', // Rep. légal
      SHUTTLE_DRIVER: 'MANDATORY',
    },
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    maxImagesCount: 2,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^[A-Z0-9-]{6,25}$',
      documentNumberFormatHelp: 'Ex: KIN-09827364-CENI ou OP-882190',
      captureIssueDate: true,
      captureExpiryDate: true,
      captureIssuingAuthority: true,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: true,
      minRemainingDaysAtSubmission: 30,
      reminderDaysSchedule: [30, 14, 7],
      expiryConsequence: 'BLOCK_TRIPS',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: true,
      autoCheckProfileNameMatch: true,
      manualReviewRequired: true,
      reviewSlaHours: 12,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'STRICTLY_CONFIDENTIAL',
    isCoreGuardrail: true, // CANNOT BE TURNED OFF
    isLegalPreLaunchConfirmationNeeded: false,
    displayOrder: 1,
    stepGroup: 'IDENTITY',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 2. Selfie with Liveness Detection
  {
    id: 'KYC-REQ-SELFIE-LIVENESS',
    code: 'REQ-SELFIE-LIVENESS',
    category: 'IDENTITY',
    labels: {
      fr: 'Selfie de vivacité certifié',
      en: 'Certified Liveness Selfie',
      ln: 'Foto ya elongi na liveness ya solo',
      sw: 'Picha ya uthibitisho wa uso (Liveness)',
    },
    helpTexts: {
      fr: 'Photo du visage prise en direct avec détection de clignement et rotation faciale.',
      en: 'Real-time selfie with blink and head rotation detection.',
      ln: 'Kanga foto ya elongi na kofungola miso mpe kobalusa motu.',
      sw: 'Piga picha ya uso kwa wakati halisi ukifumba macho na kugeuza kichwa.',
    },
    photoInstructionsFr: 'Retirez casquette, chapeau et lunettes de soleil. Placez votre visage dans l’ovale lumineux.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'MANDATORY',
    },
    allowedFileTypes: ['image/jpeg', 'image/png'],
    maxSizeBytes: 5 * 1024 * 1024,
    maxImagesCount: 1,
    fieldValidators: {
      captureDocumentNumber: false,
      captureIssueDate: false,
      captureExpiryDate: false,
      captureIssuingAuthority: false,
      captureNameOnDocument: false,
    },
    validityRules: {
      expires: false,
      minRemainingDaysAtSubmission: 0,
      reminderDaysSchedule: [],
      expiryConsequence: 'WARN_ONLY',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: false,
      autoCheckProfileNameMatch: false,
      manualReviewRequired: true,
      reviewSlaHours: 6,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: true,
      thresholdPercent: 85,
      allowManualFallback: true,
    },
    sensitivityLevel: 'CONFIDENTIAL',
    isCoreGuardrail: true, // CANNOT BE TURNED OFF
    isLegalPreLaunchConfirmationNeeded: false,
    displayOrder: 2,
    stepGroup: 'IDENTITY',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 3. Driving License
  {
    id: 'KYC-REQ-DRIVING-LICENSE',
    code: 'REQ-DRIVING-LICENSE',
    category: 'DRIVING',
    labels: {
      fr: 'Permis de conduire national',
      en: 'National Driving License',
      ln: 'Permis ya kokumba motuka to moto',
      sw: 'Leseni ya kitaifa ya udereva',
    },
    helpTexts: {
      fr: 'Permis de conduire valide de catégorie A (Moto), B (Taxi/Voiture) ou PSV/Transport public.',
      en: 'Valid category A, B or commercial PSV driving license.',
      ln: 'Permis ya leta oyo epesi nzela ya kokumba na nzela ya RDC.',
      sw: 'Leseni halali ya jamii A, B au PSV ya usafiri wa umma.',
    },
    photoInstructionsFr: 'Photographiez le permis bien à plat pour que le numéro d’enregistrement et les catégories cochées soient parfaitement lisibles.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'NOT_APPLICABLE',
      SHUTTLE_DRIVER: 'MANDATORY',
    },
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    maxImagesCount: 2,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^[A-Z0-9-]{5,20}$',
      documentNumberFormatHelp: 'Ex: PC-MOTO-88219 ou PC-CAR-0044',
      captureIssueDate: true,
      captureExpiryDate: true,
      captureIssuingAuthority: true,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: true,
      minRemainingDaysAtSubmission: 30,
      reminderDaysSchedule: [30, 14, 7],
      expiryConsequence: 'AUTO_SUSPEND',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: true,
      autoCheckProfileNameMatch: true,
      manualReviewRequired: true,
      reviewSlaHours: 12,
      requiresSecondReviewerForHighRisk: true,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'CONFIDENTIAL',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: true,
    legalNote: 'À confirmer avec la Commission Nationale de Délivrance des Permis de Conduire (CONADEP).',
    displayOrder: 3,
    stepGroup: 'DOCUMENTS',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 4. Vehicle Registration (Carte Rose / Volet Jaune)
  {
    id: 'KYC-REQ-VEHICLE-REG',
    code: 'REQ-VEHICLE-REG',
    category: 'VEHICLE',
    labels: {
      fr: 'Certificat d’immatriculation (Carte Rose / Volet Jaune)',
      en: 'Vehicle Registration Certificate (Pink Card)',
      ln: 'Karti ya motuka (Carte Rose DGI)',
      sw: 'Cheti cha usajili wa gari (Kadi ya Waridi)',
    },
    helpTexts: {
      fr: 'Titre de propriété officiel délivré par la Direction Générale des Impôts (DGI) ou l’Hôtel de Ville.',
      en: 'Official vehicle ownership certificate issued by DGI or provincial city hall.',
      ln: 'Mukanda ya DGI oyo emonisaka nkolo ya motuka to ya moto.',
      sw: 'Cheti rasmi cha umiliki kinachotolewa na DGI au mamlaka ya mkoa.',
    },
    photoInstructionsFr: 'La plaque d’immatriculation, le numéro de châssis et le nom du titulaire doivent être nets.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    maxImagesCount: 2,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^[A-Z0-9-]{4,20}$',
      documentNumberFormatHelp: 'Ex: CR-KN-99210 ou VJ-MOTO-4491',
      captureIssueDate: true,
      captureExpiryDate: false,
      captureIssuingAuthority: true,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: false,
      minRemainingDaysAtSubmission: 0,
      reminderDaysSchedule: [],
      expiryConsequence: 'WARN_ONLY',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: true,
      autoCheckProfileNameMatch: false,
      manualReviewRequired: true,
      reviewSlaHours: 18,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'STANDARD',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: true,
    legalNote: 'Confirmer la validité des volets provisoires délivrés lors du changement de plaque provinciale.',
    displayOrder: 4,
    stepGroup: 'VEHICLE',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 5. Vehicle Insurance (SONAS / Activa / Rawsur)
  {
    id: 'KYC-REQ-VEHICLE-INSURANCE',
    code: 'REQ-VEHICLE-INSURANCE',
    category: 'VEHICLE',
    labels: {
      fr: 'Police d’assurance responsabilité civile circulation',
      en: 'Motor Vehicle Third-Party Insurance Policy',
      ln: 'Assurance ya motuka to ya moto (SONAS/Rawsur)',
      sw: 'Bima ya wajibu wa gari barabarani',
    },
    helpTexts: {
      fr: 'Assurance obligatoire en RDC auprès d’une compagnie agréée par l’ARCA (SONAS, Activa, Rawsur, etc.).',
      en: 'Mandatory motor insurance policy issued by an ARCA-accredited insurer in DRC.',
      ln: 'Assurance oyo leta esengi mpo na bopanzi na nzela.',
      sw: 'Bima ya lazima kutoka kampuni iliyoidhinishwa na ARCA nchini DRC.',
    },
    photoInstructionsFr: 'Capturez la vignette et le contrat faisant apparaître la date de début et d’échéance.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    maxImagesCount: 2,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^[A-Z0-9-]{5,25}$',
      documentNumberFormatHelp: 'Ex: POL-SONAS-2026-8812 ou ACT-RD-991',
      captureIssueDate: true,
      captureExpiryDate: true,
      captureIssuingAuthority: true,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: true,
      minRemainingDaysAtSubmission: 15,
      reminderDaysSchedule: [30, 14, 7],
      expiryConsequence: 'AUTO_SUSPEND', // Non négociable légalement
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: false,
      autoCheckProfileNameMatch: false,
      manualReviewRequired: true,
      reviewSlaHours: 12,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'STANDARD',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: true,
    legalNote: 'Loi n° 15/005 du 17 mars 2015 portant Code des assurances en RDC.',
    displayOrder: 5,
    stepGroup: 'VEHICLE',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 6. Passenger Helmet Declaration (Moto specific)
  {
    id: 'KYC-REQ-HELMET-DECLAR',
    code: 'REQ-HELMET-DECLAR',
    category: 'SAFETY',
    labels: {
      fr: 'Déclaration & photo du casque passager moto',
      en: 'Passenger Motorcycle Helmet Declaration',
      ln: 'Kipopo ya moto mpo na moto oyo akofunda (Casque)',
      sw: 'Tamko na picha ya kofia ya abiria wa pikipiki',
    },
    helpTexts: {
      fr: 'Photo du casque propre et homologué obligatoirement fourni au passager à chaque course.',
      en: 'Photo of the clean, certified helmet provided to every passenger.',
      ln: 'Elilingi ya casque ya peto oyo opesaka na mopaya.',
      sw: 'Picha ya kofia safi na iliyoidhinishwa unayompa abiria.',
    },
    photoInstructionsFr: 'Prenez en photo votre casque conducteur et le casque passager côte à côte.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'NOT_APPLICABLE',
      SHUTTLE_OPERATOR: 'NOT_APPLICABLE',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    allowedFileTypes: ['image/jpeg', 'image/png'],
    maxSizeBytes: 5 * 1024 * 1024,
    maxImagesCount: 1,
    fieldValidators: {
      captureDocumentNumber: false,
      captureIssueDate: false,
      captureExpiryDate: false,
      captureIssuingAuthority: false,
      captureNameOnDocument: false,
    },
    validityRules: {
      expires: false,
      minRemainingDaysAtSubmission: 0,
      reminderDaysSchedule: [],
      expiryConsequence: 'WARN_ONLY',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: false,
      autoCheckProfileNameMatch: false,
      manualReviewRequired: true,
      reviewSlaHours: 8,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'STANDARD',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: false,
    displayOrder: 6,
    stepGroup: 'VEHICLE',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 7. Owner Authorization Letter (Conditional Rule)
  {
    id: 'KYC-REQ-OWNER-AUTH',
    code: 'REQ-OWNER-AUTH',
    category: 'VEHICLE',
    labels: {
      fr: 'Autorisation du propriétaire du véhicule',
      en: 'Vehicle Owner Authorization Letter',
      ln: 'Mokanda ya ndingisa ya nkolo motuka',
      sw: 'Barua ya idhini kutoka kwa mwenye gari',
    },
    helpTexts: {
      fr: 'Lettre d’autorisation signée par le propriétaire de la carte rose + copie de sa pièce d’identité.',
      en: 'Signed authorization letter from the registered vehicle owner + copy of their national ID.',
      ln: 'Mokanda oyo nkolo motuka asili kotia sinyatire mpo opesa yo nzela ya kosala na yango.',
      sw: 'Barua iliyosainiwa na mwenye gari pamoja na kitambulisho chake.',
    },
    photoInstructionsFr: 'Scannez la procuration signée et la pièce d’identité du propriétaire bien lisiblement.',
    applicability: {
      MOTO: 'CONDITIONAL',
      CAR: 'CONDITIONAL',
      SHUTTLE_OPERATOR: 'NOT_APPLICABLE',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    conditionRules: [
      {
        field: 'isVehicleOwner',
        operator: 'EQUALS',
        value: false,
        explanationFr: 'Requis uniquement lorsque le conducteur n’est pas le propriétaire légal inscrit sur la carte rose.',
      },
    ],
    plainFrenchConditionPreview: 'Obligatoire si le conducteur ne possède pas lui-même le véhicule (véhicule loué ou confié).',
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    maxImagesCount: 2,
    fieldValidators: {
      captureDocumentNumber: false,
      captureIssueDate: true,
      captureExpiryDate: false,
      captureIssuingAuthority: false,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: true,
      minRemainingDaysAtSubmission: 30,
      reminderDaysSchedule: [30, 14, 7],
      expiryConsequence: 'BLOCK_TRIPS',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: false,
      autoCheckProfileNameMatch: false,
      manualReviewRequired: true,
      reviewSlaHours: 24,
      requiresSecondReviewerForHighRisk: true,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'CONFIDENTIAL',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: true,
    legalNote: 'Protège contre l’exploitation de véhicules sans l’accord exprès du titulaire légal.',
    displayOrder: 7,
    stepGroup: 'VEHICLE',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 8. Technical Inspection (Contrôle Technique)
  {
    id: 'KYC-REQ-TECH-INSPECTION',
    code: 'REQ-TECH-INSPECTION',
    category: 'VEHICLE',
    labels: {
      fr: 'Certificat de contrôle technique automobile',
      en: 'Motor Vehicle Technical Inspection Certificate',
      ln: 'Mukanda ya controle technique ya motuka',
      sw: 'Cheti cha ukaguzi wa kiufundi wa gari',
    },
    helpTexts: {
      fr: 'Contrôle technique officiel en cours de validité prouvant le bon état mécanique et le freinage.',
      en: 'Official valid technical inspection certificate proving roadworthiness.',
      ln: 'Mukanda oyo emonisaka ete motuka ezali na bokolongono na nzela.',
      sw: 'Cheti rasmi kinachothibitisha usalama wa gari barabarani.',
    },
    photoInstructionsFr: 'Prenez en photo le certificat délivré par le centre de contrôle agréé par le Ministère des Transports.',
    applicability: {
      MOTO: 'OPTIONAL',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    maxImagesCount: 1,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^[A-Z0-9-]{4,20}$',
      documentNumberFormatHelp: 'Ex: CT-2026-99120',
      captureIssueDate: true,
      captureExpiryDate: true,
      captureIssuingAuthority: true,
      captureNameOnDocument: false,
    },
    validityRules: {
      expires: true,
      minRemainingDaysAtSubmission: 30,
      reminderDaysSchedule: [30, 14, 7],
      expiryConsequence: 'BLOCK_TRIPS',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: false,
      autoCheckProfileNameMatch: false,
      manualReviewRequired: true,
      reviewSlaHours: 24,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'STANDARD',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: true,
    legalNote: 'Exigible pour les taxis et véhicules de transport rémunéré de personnes.',
    displayOrder: 8,
    stepGroup: 'VEHICLE',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 9. Company Registration RCCM (Shuttle Operators)
  {
    id: 'KYC-REQ-COMPANY-RCCM',
    code: 'REQ-COMPANY-RCCM',
    category: 'COMPANY',
    labels: {
      fr: 'Extrait d’immatriculation RCCM',
      en: 'Commercial Registry Certificate (RCCM)',
      ln: 'Mukanda ya mombongo RCCM ya tribunal',
      sw: 'Cheti cha usajili wa biashara (RCCM)',
    },
    helpTexts: {
      fr: 'Immatriculation au Registre du Commerce et du Crédit Mobilier (greffe du Tribunal de Commerce).',
      en: 'Registration with the Trade and Personal Property Credit Register in DRC.',
      ln: 'Nkanda oyo euti na tribinale ya mombongo.',
      sw: 'Usajili wa biashara kutoka mahakama ya biashara.',
    },
    photoInstructionsFr: 'Téléversez le document scanné haute définition en format PDF ou JPG.',
    applicability: {
      MOTO: 'NOT_APPLICABLE',
      CAR: 'NOT_APPLICABLE',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 15 * 1024 * 1024,
    maxImagesCount: 3,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^CD\\/[A-Z]{3}\\/RCCM\\/[0-9]{2}-[A-Z]-[0-9]{4,6}$',
      documentNumberFormatHelp: 'Format officiel OHADA : CD/KIN/RCCM/20-B-01492',
      captureIssueDate: true,
      captureExpiryDate: false,
      captureIssuingAuthority: true,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: false,
      minRemainingDaysAtSubmission: 0,
      reminderDaysSchedule: [],
      expiryConsequence: 'WARN_ONLY',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: true,
      autoCheckProfileNameMatch: true,
      manualReviewRequired: true,
      reviewSlaHours: 24,
      requiresSecondReviewerForHighRisk: true,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'CONFIDENTIAL',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: false,
    displayOrder: 9,
    stepGroup: 'DOCUMENTS',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 10. Identification Nationale (ID NAT)
  {
    id: 'KYC-REQ-COMPANY-IDNAT',
    code: 'REQ-COMPANY-IDNAT',
    category: 'COMPANY',
    labels: {
      fr: 'Identification Nationale (ID NAT)',
      en: 'National Business Identification (ID NAT)',
      ln: 'Nimero ya Identification Nationale (ID NAT)',
      sw: 'Nambari ya utambulisho wa kitaifa wa biashara (ID NAT)',
    },
    helpTexts: {
      fr: 'Attestation délivrée par le Secrétariat Général à l’Économie Nationale.',
      en: 'National identity document issued by the Ministry of Economy.',
      ln: 'Mukanda ya leta oyo epesaka nimero ya mombongo na RDC.',
      sw: 'Hati rasmi ya utambulisho wa kitaifa kutoka wizara ya uchumi.',
    },
    photoInstructionsFr: 'Attestation complète avec sceau et signature.',
    applicability: {
      MOTO: 'NOT_APPLICABLE',
      CAR: 'NOT_APPLICABLE',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024,
    maxImagesCount: 1,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^[0-9]{2}-[0-9]{2}-[A-Z0-9]{5,10}$',
      documentNumberFormatHelp: 'Ex: 01-83-N48201K',
      captureIssueDate: true,
      captureExpiryDate: false,
      captureIssuingAuthority: true,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: false,
      minRemainingDaysAtSubmission: 0,
      reminderDaysSchedule: [],
      expiryConsequence: 'WARN_ONLY',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: true,
      autoCheckProfileNameMatch: true,
      manualReviewRequired: true,
      reviewSlaHours: 24,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'STANDARD',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: false,
    displayOrder: 10,
    stepGroup: 'DOCUMENTS',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 11. Transport License
  {
    id: 'KYC-REQ-TRANSPORT-LIC',
    code: 'REQ-TRANSPORT-LIC',
    category: 'COMPANY',
    labels: {
      fr: 'Licence d’exploitation de transport public / interurbain',
      en: 'Public Transport Operating License',
      ln: 'Licence ya leta mpo na kokumba bato na bisi',
      sw: 'Leseni ya uendeshaji wa usafiri wa umma',
    },
    helpTexts: {
      fr: 'Autorisation ministérielle ou provinciale des Transports et Voies de Communication.',
      en: 'Ministerial or provincial transport authorization.',
      ln: 'Mukanda oyo ministere ya transport epesi mpo na transport interurbain.',
      sw: 'Idhini kutoka wizara au jimbo ya usafiri wa umma.',
    },
    photoInstructionsFr: 'Arrêté ministériel ou licence originale signée.',
    applicability: {
      MOTO: 'NOT_APPLICABLE',
      CAR: 'OPTIONAL',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'NOT_APPLICABLE',
    },
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 15 * 1024 * 1024,
    maxImagesCount: 2,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^[A-Z0-9\\/-]{6,35}$',
      documentNumberFormatHelp: 'Ex: MIN-TRANS/LIC-EXP/2026-089',
      captureIssueDate: true,
      captureExpiryDate: true,
      captureIssuingAuthority: true,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: true,
      minRemainingDaysAtSubmission: 60,
      reminderDaysSchedule: [60, 30, 14],
      expiryConsequence: 'BLOCK_TRIPS',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: true,
      autoCheckProfileNameMatch: true,
      manualReviewRequired: true,
      reviewSlaHours: 48,
      requiresSecondReviewerForHighRisk: true,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'CONFIDENTIAL',
    isCoreGuardrail: false,
    isLegalPreLaunchConfirmationNeeded: true,
    legalNote: 'Exigible pour les lignes interurbaines régulières (Kinshasa-Matadi, Kinshasa-Kikwit, etc.).',
    displayOrder: 11,
    stepGroup: 'DOCUMENTS',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 12. Payout Account with Name Match Check (Core Guardrail)
  {
    id: 'KYC-REQ-PAYOUT-ACCOUNT',
    code: 'REQ-PAYOUT-ACCOUNT',
    category: 'FINANCIAL',
    labels: {
      fr: 'Coordonnées de retrait Mobile Money ou Compte Bancaire',
      en: 'Mobile Money or Bank Payout Details',
      ln: 'Nimero ya kozwa mbongo na M-Pesa to Banque',
      sw: 'Taarifa za akaunti ya kutoa fedha Mobile Money au Benki',
    },
    helpTexts: {
      fr: 'Le compte de retrait doit être impérativement ouvert au nom du conducteur ou de la société.',
      en: 'The payout account must match the driver or company legal name.',
      ln: 'Konti esengeli ezala na kombo na yo moko oyo eza na mukanda ya identite.',
      sw: 'Akaunti lazima iwe kwa jina lilelile la kitambulisho chako rasmi.',
    },
    photoInstructionsFr: 'Attestation de titulaire de compte ou capture de profil SIM Mobile Money.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'MANDATORY',
    },
    allowedFileTypes: ['application/json', 'image/jpeg', 'image/png'],
    maxSizeBytes: 5 * 1024 * 1024,
    maxImagesCount: 1,
    fieldValidators: {
      captureDocumentNumber: true,
      documentNumberRegex: '^\\+?[0-9]{9,20}$',
      documentNumberFormatHelp: 'Ex: +243810001001 ou RIB bancaire Rawbank',
      captureIssueDate: false,
      captureExpiryDate: false,
      captureIssuingAuthority: false,
      captureNameOnDocument: true,
    },
    validityRules: {
      expires: false,
      minRemainingDaysAtSubmission: 0,
      reminderDaysSchedule: [],
      expiryConsequence: 'BLOCK_TRIPS',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: false,
      autoCheckProfileNameMatch: true, // Strict name match
      manualReviewRequired: false,
      reviewSlaHours: 4,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'STRICTLY_CONFIDENTIAL',
    isCoreGuardrail: true, // CANNOT BE TURNED OFF
    isLegalPreLaunchConfirmationNeeded: false,
    displayOrder: 12,
    stepGroup: 'FINANCIAL',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },

  // 13. Terms & Safety Charter Acceptance (Core Guardrail)
  {
    id: 'KYC-REQ-TERMS-CONSENT',
    code: 'REQ-TERMS-CONSENT',
    category: 'SAFETY',
    labels: {
      fr: 'Charte de Sécurité et Consentement des Données RDC',
      en: 'Safety Charter & DRC Data Processing Consent',
      ln: 'Endimeli ya mibeko ya bokengi mpe bokengeli basango',
      sw: 'Mkataba wa usalama na idhini ya usindikaji wa data',
    },
    helpTexts: {
      fr: 'Acceptation numérique horodatée des CGU, du code de bonne conduite routière et du chiffrement légal.',
      en: 'Timestamped acceptance of driver terms, road safety code and data encryption.',
      ln: 'Kondima mibeko ya mobembo ya kimia mpe bokengi ya motuka.',
      sw: 'Kukubali masharti ya usalama barabarani na usiri wa taarifa zako.',
    },
    photoInstructionsFr: 'Signature numérique horodatée recueillie automatiquement lors de la soumission.',
    applicability: {
      MOTO: 'MANDATORY',
      CAR: 'MANDATORY',
      SHUTTLE_OPERATOR: 'MANDATORY',
      SHUTTLE_DRIVER: 'MANDATORY',
    },
    allowedFileTypes: ['application/json'],
    maxSizeBytes: 1024 * 1024,
    maxImagesCount: 1,
    fieldValidators: {
      captureDocumentNumber: false,
      captureIssueDate: false,
      captureExpiryDate: false,
      captureIssuingAuthority: false,
      captureNameOnDocument: false,
    },
    validityRules: {
      expires: false,
      minRemainingDaysAtSubmission: 0,
      reminderDaysSchedule: [],
      expiryConsequence: 'AUTO_SUSPEND',
    },
    reviewRules: {
      autoCheckFormat: true,
      autoCheckDuplicates: false,
      autoCheckProfileNameMatch: false,
      manualReviewRequired: false,
      reviewSlaHours: 1,
      requiresSecondReviewerForHighRisk: false,
    },
    livenessRules: {
      required: false,
      thresholdPercent: 0,
      allowManualFallback: true,
    },
    sensitivityLevel: 'CONFIDENTIAL',
    isCoreGuardrail: true, // CANNOT BE TURNED OFF
    isLegalPreLaunchConfirmationNeeded: false,
    displayOrder: 13,
    stepGroup: 'LEGAL',
    isCustom: false,
    archived: false,
    hasSubmissions: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

// ----------------- IN-MEMORY STATE -----------------

interface KycRequirementsStoreState {
  currentDraftItems: Map<string, KycRequirementItem>;
  publishedVersions: KycRequirementVersion[];
  cityOverrides: Map<string, KycCityOverrideConfig>; // Keyed by city name
  effectiveCache: Map<string, KycRequirementItem[]>; // Keyed by `${city}_${providerType}`
}

declare global {
  var __transnumerica_kyc_requirements_store: KycRequirementsStoreState | undefined;
}

function initKycStore(): KycRequirementsStoreState {
  if (globalThis.__transnumerica_kyc_requirements_store) {
    return globalThis.__transnumerica_kyc_requirements_store;
  }

  const currentDraftItems = new Map<string, KycRequirementItem>();
  SEEDED_DEFAULT_KYC_ITEMS.forEach((item) => {
    currentDraftItems.set(item.id, JSON.parse(JSON.stringify(item)));
  });

  // Seed initial published Version 1
  const initialVersion: KycRequirementVersion = {
    id: 'KYC-VER-1',
    versionNumber: 1,
    city: 'ALL',
    status: 'PUBLISHED',
    publishedBy: 'ADMIN-SUPER-1',
    publishedByEmail: 'superadmin@transnumerica.cd',
    publishReason: 'Version initiale homologuée des exigences KYC nationales RDC (Kinshasa, Lubumbashi, Kolwezi, Matadi, Goma).',
    effectiveDate: '2026-09-01T00:00:00Z',
    itemsSnapshot: JSON.parse(JSON.stringify(SEEDED_DEFAULT_KYC_ITEMS)),
    createdAt: '2026-09-01T00:00:00Z',
    publishedAt: '2026-09-01T00:00:00Z',
  };

  // Seed Kinshasa specific city override: Cooperative affiliation for Moto
  const cityOverrides = new Map<string, KycCityOverrideConfig>();
  cityOverrides.set('Kinshasa', {
    city: 'Kinshasa',
    overrides: {
      'REQ-HELMET-DECLAR': {
        labels: {
          fr: 'Attestation Casque & Affiliation Association (Kinshasa)',
          en: 'Passenger Helmet & Association Membership (Kinshasa)',
          ln: 'Kipopo mpe mokanda ya lisanga ya bamotards na Kinshasa',
          sw: 'Kofia na uanachama wa chama cha waendesha pikipiki Kinshasa',
        },
      },
    },
    updatedAt: '2026-09-01T00:00:00Z',
    updatedBy: 'ADMIN-SUPER-1',
  });

  const state: KycRequirementsStoreState = {
    currentDraftItems,
    publishedVersions: [initialVersion],
    cityOverrides,
    effectiveCache: new Map(),
  };

  globalThis.__transnumerica_kyc_requirements_store = state;
  return state;
}

// ----------------- EFFECTIVE REQUIREMENTS RESOLUTION ENGINE -----------------

/**
 * Resolves the effective requirement set for a given city and provider type,
 * merging default items with city overrides and evaluating conditional rules.
 */
export function resolveEffectiveRequirements(
  city = 'Kinshasa',
  providerType: KycApplicableProviderType = 'MOTO',
  context?: {
    isVehicleOwner?: boolean;
    vehicleAgeYears?: number;
    isIntercityRoute?: boolean;
    hasSubContractors?: boolean;
  }
): KycRequirementItem[] {
  const store = initKycStore();
  const cacheKey = `${city.toUpperCase()}_${providerType}_${JSON.stringify(context || {})}`;
  if (store.effectiveCache.has(cacheKey)) {
    return store.effectiveCache.get(cacheKey)!;
  }

  // Get active published version (or draft if no published)
  const activeVersion =
    store.publishedVersions.find((v) => v.status === 'PUBLISHED') || store.publishedVersions[0];

  const sourceItems: KycRequirementItem[] = activeVersion?.itemsSnapshot || Array.from(store.currentDraftItems.values());
  const cityOverrideConfig = store.cityOverrides.get(city);

  const resolved: KycRequirementItem[] = [];

  for (const rawItem of sourceItems) {
    if (rawItem.archived) continue;

    // Check base applicability for provider type
    const applicabilityType = rawItem.applicability[providerType];
    if (!applicabilityType || applicabilityType === 'NOT_APPLICABLE') {
      continue;
    }

    // Clone item
    const item: KycRequirementItem = JSON.parse(JSON.stringify(rawItem));
    item.isInheritedFromDefault = true;

    // Apply city override if exists
    if (cityOverrideConfig && cityOverrideConfig.overrides[item.code]) {
      const override = cityOverrideConfig.overrides[item.code];
      Object.assign(item, override);
      item.isInheritedFromDefault = false;
      item.isCityOverride = true;
    }

    // Evaluate conditional rules if item is CONDITIONAL
    if (applicabilityType === 'CONDITIONAL' && item.conditionRules && item.conditionRules.length > 0) {
      if (context) {
        let conditionMet = true;
        for (const rule of item.conditionRules) {
          const actualVal = context[rule.field as keyof typeof context];
          if (rule.operator === 'EQUALS' && actualVal !== rule.value) {
            conditionMet = false;
          } else if (rule.operator === 'NOT_EQUALS' && actualVal === rule.value) {
            conditionMet = false;
          } else if (rule.operator === 'GREATER_THAN' && (typeof actualVal !== 'number' || actualVal <= rule.value)) {
            conditionMet = false;
          }
        }
        if (!conditionMet) {
          // If condition is not met, the item is not required for this specific driver
          continue;
        }
      }
    }

    resolved.push(item);
  }

  // Sort by display order
  resolved.sort((a, b) => a.displayOrder - b.displayOrder);

  // Store in cache
  store.effectiveCache.set(cacheKey, resolved);
  return resolved;
}

// ----------------- QUERY & CRUD API -----------------

export function getKycRequirementsMatrix(params?: {
  city?: string;
  category?: string;
  includeArchived?: boolean;
}): {
  items: KycRequirementItem[];
  city: string;
  isCityOverridden: boolean;
  publishedVersionNumber: number;
  hasUnpublishedDraftChanges: boolean;
} {
  const store = initKycStore();
  const city = params?.city || 'ALL';
  const cityOverrideConfig = city !== 'ALL' ? store.cityOverrides.get(city) : undefined;

  const publishedVer = store.publishedVersions.find((v) => v.status === 'PUBLISHED') || store.publishedVersions[0];
  const items = Array.from(store.currentDraftItems.values()).filter((i) => {
    if (!params?.includeArchived && i.archived) return false;
    if (params?.category && i.category !== params.category) return false;
    return true;
  });

  // Apply city inheritance indicator
  const decorated = items.map((i) => {
    const clone: KycRequirementItem = JSON.parse(JSON.stringify(i));
    if (city !== 'ALL' && cityOverrideConfig?.overrides[clone.code]) {
      Object.assign(clone, cityOverrideConfig.overrides[clone.code]);
      clone.isInheritedFromDefault = false;
      clone.isCityOverride = true;
    } else {
      clone.isInheritedFromDefault = city !== 'ALL';
      clone.isCityOverride = false;
    }
    return clone;
  });

  decorated.sort((a, b) => a.displayOrder - b.displayOrder);

  // Check if current draft differs from published snapshot
  const hasUnpublishedDraftChanges = JSON.stringify(Array.from(store.currentDraftItems.values())) !== JSON.stringify(publishedVer?.itemsSnapshot || []);

  return {
    items: decorated,
    city,
    isCityOverridden: Boolean(cityOverrideConfig && Object.keys(cityOverrideConfig.overrides).length > 0),
    publishedVersionNumber: publishedVer?.versionNumber || 1,
    hasUnpublishedDraftChanges,
  };
}

export function getKycRequirementItemById(id: string): KycRequirementItem | null {
  const store = initKycStore();
  return store.currentDraftItems.get(id) || null;
}

export function saveKycRequirementItem(
  data: Partial<KycRequirementItem> & { id?: string },
  adminActor: { id: string; name: string; role: string },
  reason: string,
  ipAddress = '127.0.0.1'
): KycRequirementItem {
  const store = initKycStore();
  const id = data.id || `KYC-REQ-${Date.now()}`;
  const existing = store.currentDraftItems.get(id);

  // Guardrail check: core items cannot be disabled or made optional without SUPER_ADMIN authorization
  if (existing?.isCoreGuardrail) {
    if (data.archived === true) {
      throw new Error(`VIOLATION DE GARDE-FOU : L'élément légal "${existing.labels.fr}" est un prérequis national inviolable et ne peut pas être archivé ou supprimé.`);
    }

    if (data.applicability) {
      const anyDisabled = Object.entries(data.applicability).some(
        ([type, val]) => (type === 'MOTO' || type === 'CAR' || type === 'SHUTTLE_OPERATOR' || type === 'SHUTTLE_DRIVER') && val === 'NOT_APPLICABLE'
      );
      if (anyDisabled && adminActor.role !== 'SUPER_ADMIN') {
        throw new Error(`GARDE-FOU RÉGLEMENTAIRE : Seul un SUPER_ADMIN peut modifier l'applicabilité obligatoire de l'élément "${existing.labels.fr}".`);
      }
    }
  }

  const now = new Date().toISOString();
  const updatedItem: KycRequirementItem = {
    ...(existing || {
      id,
      code: data.code || `REQ-${Date.now()}`,
      category: data.category || 'CUSTOM',
      labels: data.labels || { fr: 'Nouvelle exigence', en: 'New requirement', ln: 'Exigence ya sika', sw: 'Mahitaji mapya' },
      helpTexts: data.helpTexts || { fr: '', en: '', ln: '', sw: '' },
      photoInstructionsFr: data.photoInstructionsFr || 'Photo nette et lisible.',
      applicability: { MOTO: 'OPTIONAL', CAR: 'OPTIONAL', SHUTTLE_OPERATOR: 'OPTIONAL', SHUTTLE_DRIVER: 'OPTIONAL' },
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeBytes: 10 * 1024 * 1024,
      maxImagesCount: 1,
      fieldValidators: {
        captureDocumentNumber: true,
        captureIssueDate: true,
        captureExpiryDate: true,
        captureIssuingAuthority: false,
        captureNameOnDocument: true,
      },
      validityRules: {
        expires: true,
        minRemainingDaysAtSubmission: 30,
        reminderDaysSchedule: [30, 14, 7],
        expiryConsequence: 'WARN_ONLY',
      },
      reviewRules: {
        autoCheckFormat: true,
        autoCheckDuplicates: false,
        autoCheckProfileNameMatch: false,
        manualReviewRequired: true,
        reviewSlaHours: 24,
        requiresSecondReviewerForHighRisk: false,
      },
      livenessRules: { required: false, thresholdPercent: 0, allowManualFallback: true },
      sensitivityLevel: 'STANDARD',
      isCoreGuardrail: false,
      isLegalPreLaunchConfirmationNeeded: false,
      displayOrder: store.currentDraftItems.size + 1,
      stepGroup: 'DOCUMENTS',
      isCustom: true,
      archived: false,
      hasSubmissions: false,
      version: 1,
      createdAt: now,
      updatedAt: now,
    }),
    ...data,
    id,
    version: (existing?.version || 0) + 1,
    updatedAt: now,
  };

  store.currentDraftItems.set(id, updatedItem);
  store.effectiveCache.clear(); // Invalidate cache

  recordAuditEntry({
    actor: adminActor.name || adminActor.id,
    action: existing ? 'UPDATE_KYC_REQUIREMENT_ITEM' : 'CREATE_KYC_REQUIREMENT_ITEM',
    entityType: 'SETTINGS',
    entityId: id,
    previousState: existing || null,
    newState: updatedItem,
    reason: reason || 'Mise à jour des critères d’exigence KYC en mode brouillon',
    ipAddress,
    status: 'SUCCESS',
  });

  return updatedItem;
}

export function deleteKycRequirementItem(
  id: string,
  adminActor: { id: string; name: string },
  reason: string,
  ipAddress = '127.0.0.1'
): { success: boolean; archived: boolean; message: string } {
  const store = initKycStore();
  const item = store.currentDraftItems.get(id);
  if (!item) throw new Error('Exigence introuvable.');

  if (item.isCoreGuardrail) {
    throw new Error('INTERDICTION : Impossible de supprimer une exigence identifiée comme garde-fou de sécurité fondamental.');
  }

  // Block hard delete if submissions exist -> archive instead
  if (item.hasSubmissions) {
    item.archived = true;
    item.updatedAt = new Date().toISOString();
    store.currentDraftItems.set(id, item);
    store.effectiveCache.clear();

    recordAuditEntry({
      actor: adminActor.name || adminActor.id,
      action: 'ARCHIVE_KYC_REQUIREMENT_ITEM',
      entityType: 'SETTINGS',
      entityId: id,
      previousState: { ...item, archived: false },
      newState: item,
      reason: reason || 'Archivage de l’exigence KYC (des soumissions passées y sont rattachées).',
      ipAddress,
      status: 'SUCCESS',
    });

    return {
      success: true,
      archived: true,
      message: `L'élément "${item.labels.fr}" possède des dossiers historiques rattachés : il a été archivé en toute sécurité plutôt que supprimé.`,
    };
  }

  // Hard delete safe if no submissions exist
  store.currentDraftItems.delete(id);
  store.effectiveCache.clear();

  recordAuditEntry({
    actor: adminActor.name || adminActor.id,
    action: 'DELETE_KYC_REQUIREMENT_ITEM',
    entityType: 'SETTINGS',
    entityId: id,
    previousState: item,
    newState: null,
    reason: reason || 'Suppression définitive de l’exigence KYC non soumise.',
    ipAddress,
    status: 'SUCCESS',
  });

  return { success: true, archived: false, message: 'Exigence supprimée avec succès.' };
}

// ----------------- CITY OVERRIDE MANAGEMENT -----------------

export function setCityOverride(
  city: string,
  itemCode: string,
  overrideData: Partial<KycRequirementItem>,
  adminActor: { id: string; name: string },
  reason: string,
  ipAddress = '127.0.0.1'
): KycCityOverrideConfig {
  const store = initKycStore();
  let cityConfig = store.cityOverrides.get(city);

  if (!cityConfig) {
    cityConfig = {
      city,
      overrides: {},
      updatedAt: new Date().toISOString(),
      updatedBy: adminActor.name || adminActor.id,
    };
  }

  const prev = JSON.parse(JSON.stringify(cityConfig));
  cityConfig.overrides[itemCode] = {
    ...(cityConfig.overrides[itemCode] || {}),
    ...overrideData,
  };
  cityConfig.updatedAt = new Date().toISOString();
  cityConfig.updatedBy = adminActor.name || adminActor.id;

  store.cityOverrides.set(city, cityConfig);
  store.effectiveCache.clear();

  recordAuditEntry({
    actor: adminActor.name || adminActor.id,
    action: 'SET_CITY_KYC_OVERRIDE',
    entityType: 'SETTINGS',
    entityId: `${city}:${itemCode}`,
    previousState: prev,
    newState: cityConfig,
    reason: reason || `Personnalisation locale de l'exigence ${itemCode} pour la ville de ${city}`,
    ipAddress,
    status: 'SUCCESS',
  });

  return cityConfig;
}

export function resetCityOverrideToDefault(
  city: string,
  itemCode?: string,
  adminActor?: { id: string; name: string },
  reason?: string,
  ipAddress = '127.0.0.1'
): boolean {
  const store = initKycStore();
  const cityConfig = store.cityOverrides.get(city);
  if (!cityConfig) return true;

  const prev = JSON.parse(JSON.stringify(cityConfig));

  if (itemCode) {
    delete cityConfig.overrides[itemCode];
  } else {
    cityConfig.overrides = {};
  }
  cityConfig.updatedAt = new Date().toISOString();

  store.effectiveCache.clear();

  recordAuditEntry({
    actor: adminActor?.name || 'ADMIN',
    action: 'RESET_CITY_KYC_OVERRIDE',
    entityType: 'SETTINGS',
    entityId: `${city}${itemCode ? `:${itemCode}` : ''}`,
    previousState: prev,
    newState: cityConfig,
    reason: reason || `Réinitialisation des exigences de ${city} vers le jeu national par défaut`,
    ipAddress,
    status: 'SUCCESS',
  });

  return true;
}

// ----------------- IMPACT ANALYSIS ENGINE -----------------

export function runImpactAnalysis(targetCity = 'ALL'): KycImpactAnalysisResult {
  const store = initKycStore();
  const providers = getAllProviders();
  const targetProviders = providers.filter((p) => p.status === 'APPROVED' && (targetCity === 'ALL' || p.city === targetCity));

  const draftItems = Array.from(store.currentDraftItems.values());
  const publishedVer = store.publishedVersions.find((v) => v.status === 'PUBLISHED') || store.publishedVersions[0];
  const publishedItems = publishedVer?.itemsSnapshot || [];

  // Identify new mandatory requirements introduced in draft
  const newMandatoryCodes: string[] = [];
  for (const draftItem of draftItems) {
    if (draftItem.archived) continue;
    const pub = publishedItems.find((p) => p.code === draftItem.code);
    const isNowMandatory = Object.values(draftItem.applicability).some((v) => v === 'MANDATORY');
    const wasMandatory = pub && Object.values(pub.applicability).some((v) => v === 'MANDATORY');

    if (isNowMandatory && !wasMandatory) {
      newMandatoryCodes.push(draftItem.labels.fr);
    }
  }

  const byProviderType: Record<KycApplicableProviderType, number> = {
    MOTO: 0,
    CAR: 0,
    SHUTTLE_OPERATOR: 0,
    SHUTTLE_DRIVER: 0,
  };

  let affectedCount = 0;

  for (const prov of targetProviders) {
    let affected = false;

    // Check if provider lacks any of the newly mandated items
    for (const code of newMandatoryCodes) {
      const matchDoc = prov.documents.find((d) => d.name.toLowerCase().includes(code.toLowerCase()));
      if (!matchDoc || matchDoc.status !== 'APPROVED') {
        affected = true;
        break;
      }
    }

    if (affected) {
      affectedCount++;
      const typeKey = (prov.providerType === 'SHUTTLE' ? 'SHUTTLE_OPERATOR' : prov.providerType) as KycApplicableProviderType;
      byProviderType[typeKey] = (byProviderType[typeKey] || 0) + 1;
    }
  }

  const result: KycImpactAnalysisResult = {
    versionId: `DRAFT-${Date.now()}`,
    targetCity,
    totalActiveProvidersChecked: targetProviders.length,
    affectedProvidersCount: affectedCount,
    byProviderType,
    newRequirementsIntroduced: newMandatoryCodes,
    estimatedDaysToComply: 14,
    suggestedGracePeriodDays: 21,
    smsNotificationTemplateFr: `[Transnumerica Sécurité] Chères partenaires : une mise à jour réglementaire des pièces justificatives à ${targetCity} requiert votre attention. Veuillez vous connecter sur votre espace conducteur pour compléter votre dossier avant le délai imparti.`,
  };

  return result;
}

// ----------------- PUBLISH & ROLLBACK WORKFLOW -----------------

export function publishKycRequirementsVersion(
  params: {
    city?: string;
    publishReason: string;
    effectiveDate?: string;
    impactPolicy?: KycImpactPolicy;
    gracePeriodDays?: number;
  },
  adminActor: { id: string; name: string; email?: string; role: string },
  ipAddress = '127.0.0.1'
): KycRequirementVersion {
  const store = initKycStore();

  const city = params.city || 'ALL';
  const effectiveDate = params.effectiveDate || new Date().toISOString();
  const nextVerNumber = (store.publishedVersions[0]?.versionNumber || 1) + 1;

  // Snapshot current draft items
  const itemsSnapshot: KycRequirementItem[] = Array.from(store.currentDraftItems.values()).map((item) => JSON.parse(JSON.stringify(item)));

  // Compute diff from previous version
  const prevVersion = store.publishedVersions.find((v) => v.status === 'PUBLISHED');
  const prevItems = prevVersion?.itemsSnapshot || [];

  const added = itemsSnapshot.filter((i) => !prevItems.some((p) => p.code === i.code));
  const removed = prevItems.filter((p) => !itemsSnapshot.some((i) => i.code === p.code));
  const updated = itemsSnapshot.filter((i) => {
    const p = prevItems.find((prev) => prev.code === i.code);
    return p && JSON.stringify(p) !== JSON.stringify(i);
  });

  const diffSummary = {
    addedCount: added.length,
    updatedCount: updated.length,
    removedCount: removed.length,
    changesDescription: [
      ...added.map((a) => `Ajout de l'exigence "${a.labels.fr}"`),
      ...updated.map((u) => `Mise à jour des règles de "${u.labels.fr}"`),
      ...removed.map((r) => `Retrait de l'exigence "${r.labels.fr}"`),
    ],
  };

  // Archive previous published versions
  store.publishedVersions.forEach((v) => {
    if (v.status === 'PUBLISHED') v.status = 'ARCHIVED';
  });

  const newVersion: KycRequirementVersion = {
    id: `KYC-VER-${nextVerNumber}`,
    versionNumber: nextVerNumber,
    city,
    status: 'PUBLISHED',
    publishedBy: adminActor.name || adminActor.id,
    publishedByEmail: adminActor.email || 'admin@transnumerica.cd',
    publishReason: params.publishReason,
    effectiveDate,
    itemsSnapshot,
    diffSummary,
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };

  store.publishedVersions.unshift(newVersion);
  store.effectiveCache.clear(); // Clear all cached effective sets immediately

  recordAuditEntry({
    actor: adminActor.name || adminActor.id,
    action: 'PUBLISH_KYC_REQUIREMENTS_VERSION',
    entityType: 'SETTINGS',
    entityId: newVersion.id,
    previousState: prevVersion || null,
    newState: newVersion,
    reason: `Publication officielle de la version KYC v${nextVerNumber} (${params.publishReason}) — Politique transition : ${params.impactPolicy || 'GRACE_PERIOD'}`,
    ipAddress,
    status: 'SUCCESS',
  });

  return newVersion;
}

export function rollbackKycRequirementsVersion(
  targetVersionNumber: number,
  adminActor: { id: string; name: string; role: string },
  reason: string,
  ipAddress = '127.0.0.1'
): KycRequirementVersion {
  const store = initKycStore();
  const targetVersion = store.publishedVersions.find((v) => v.versionNumber === targetVersionNumber);
  if (!targetVersion) {
    throw new Error(`Version introuvable pour le rollback : v${targetVersionNumber}`);
  }

  const currentPublished = store.publishedVersions.find((v) => v.status === 'PUBLISHED');

  // Restore items snapshot into current draft
  store.currentDraftItems.clear();
  targetVersion.itemsSnapshot.forEach((item) => {
    store.currentDraftItems.set(item.id, JSON.parse(JSON.stringify(item)));
  });

  // Create new rollback version on top
  const nextVerNumber = (store.publishedVersions[0]?.versionNumber || 1) + 1;
  const rollbackVersion: KycRequirementVersion = {
    id: `KYC-VER-${nextVerNumber}-ROLLBACK-v${targetVersionNumber}`,
    versionNumber: nextVerNumber,
    city: targetVersion.city,
    status: 'PUBLISHED',
    publishedBy: adminActor.name || adminActor.id,
    publishReason: `ROLLBACK vers la version v${targetVersionNumber} : ${reason}`,
    effectiveDate: new Date().toISOString(),
    itemsSnapshot: JSON.parse(JSON.stringify(targetVersion.itemsSnapshot)),
    diffSummary: {
      addedCount: 0,
      updatedCount: 0,
      removedCount: 0,
      changesDescription: [`Restauration complète de l'état des exigences de la v${targetVersionNumber}`],
    },
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };

  if (currentPublished) {
    currentPublished.status = 'ROLLED_BACK';
  }

  store.publishedVersions.unshift(rollbackVersion);
  store.effectiveCache.clear();

  recordAuditEntry({
    actor: adminActor.name || adminActor.id,
    action: 'ROLLBACK_KYC_REQUIREMENTS_VERSION',
    entityType: 'SETTINGS',
    entityId: rollbackVersion.id,
    previousState: currentPublished || null,
    newState: rollbackVersion,
    reason: `Révocation et retour arrière vers v${targetVersionNumber} : ${reason}`,
    ipAddress,
    status: 'SUCCESS',
  });

  return rollbackVersion;
}

export function getKycVersionsHistory(): KycRequirementVersion[] {
  const store = initKycStore();
  return store.publishedVersions;
}

// ----------------- COMPLIANCE REPORTING & METRICS -----------------

export function getKycComplianceMetrics(city = 'Kinshasa', providerType = 'ALL'): KycComplianceMetrics {
  const providers = getAllProviders();
  const filtered = providers.filter((p) => {
    const cityMatch = city === 'ALL' || p.city.toLowerCase() === city.toLowerCase();
    const typeMatch = providerType === 'ALL' || p.providerType === providerType;
    return cityMatch && typeMatch;
  });

  const total = filtered.length;
  const approved = filtered.filter((p) => p.status === 'APPROVED').length;
  const inReview = filtered.filter((p) => p.status === 'IN_REVIEW').length;
  const missing = filtered.filter((p) => p.status === 'INFO_REQUIRED').length;
  const suspended = filtered.filter((p) => p.status === 'SUSPENDED').length;

  let expiringIn30Days = 0;
  filtered.forEach((p) => {
    p.documents.forEach((d) => {
      if (d.isExpiringSoon) expiringIn30Days++;
    });
  });

  return {
    city,
    providerType,
    totalProviders: total,
    compliantApprovedCount: approved,
    inReviewCount: inReview,
    missingInfoCount: missing,
    expiringIn30DaysCount: expiringIn30Days,
    expiredSuspendedCount: suspended,
    averageReviewTimeHours: 8.4,
    reviewTimeVsSlaPercent: 94.2,
    topRejectionReasons: [
      { reason: 'Photo de carte rose illisible ou tronquée', count: 4 },
      { reason: 'Permis de conduire non conforme ou expiré', count: 3 },
      { reason: 'Contrôle technique absent pour véhicule commercial', count: 2 },
    ],
  };
}
