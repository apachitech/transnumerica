import {
  NotificationTemplate,
  NotificationBroadcast,
  NotificationDeliveryLog,
  NotificationOptOut,
  NotificationStats,
  NotificationChannel,
  NotificationEvent,
  BroadcastSegment,
  SupportedLanguage,
} from '@/types';
import {
  NotificationTemplateInput,
  NotificationBroadcastInput,
  TestSendInput,
} from '@/lib/validations/notifications';
import { logAdminAction } from './admin-store';

// In-memory databases
let templatesDb: NotificationTemplate[] = [];
let broadcastsDb: NotificationBroadcast[] = [];
let logsDb: NotificationDeliveryLog[] = [];
let optOutsDb: NotificationOptOut[] = [];

export function getInitialNotificationTemplates(): NotificationTemplate[] {
  return [
    {
      id: 'tpl-booking-confirmed',
      event: 'BOOKING_CONFIRMED',
      name: 'Confirmation de Réservation de Billet Bus',
      description: 'Envoyé au passager dès validation du paiement Mobile Money avec référence QR.',
      category: 'BOOKINGS',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP', 'PUSH', 'EMAIL'],
      variables: [
        'passenger_name',
        'ticket_ref',
        'departure_station',
        'arrival_station',
        'departure_time',
        'seat_number',
        'amount',
        'currency',
        'operator_name',
        'tracking_url',
      ],
      content: {
        fr: {
          SMS: {
            body: 'Transnumerica: Bonjour {{passenger_name}}, votre billet {{ticket_ref}} ({{departure_station}}->{{arrival_station}}) est confirmé. Départ le {{departure_time}}, siège {{seat_number}}. Billet QR: {{tracking_url}}',
          },
          WHATSAPP: {
            subject: 'Confirmation de Réservation — Transnumerica RDC',
            body: `🎟️ *Confirmation de Voyage Transnumerica*
Bonjour {{passenger_name}},

Votre réservation sur la ligne *{{departure_station}} → {{arrival_station}}* est confirmée.
- Réf billet : *{{ticket_ref}}*
- Opérateur : {{operator_name}}
- Départ : *{{departure_time}}*
- Siège : *N° {{seat_number}}*
- Montant réglé : {{amount}} {{currency}}

Présentez votre QR code en gare 30 minutes avant le départ.
🔗 Voir mon billet hors-ligne : {{tracking_url}}`,
          },
          PUSH: {
            subject: 'Billet confirmé ! 🚌',
            body: 'Votre voyage vers {{arrival_station}} est confirmé. Siège {{seat_number}} attribué.',
          },
          EMAIL: {
            subject: 'Votre Billet Transnumerica : {{ticket_ref}} ({{departure_station}} - {{arrival_station}})',
            body: '<p>Bonjour {{passenger_name}},</p><p>Votre réservation est confirmée pour le départ du {{departure_time}}.</p>',
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica: Hello {{passenger_name}}, your ticket {{ticket_ref}} ({{departure_station}}->{{arrival_station}}) is confirmed. Departure {{departure_time}}, seat {{seat_number}}. QR: {{tracking_url}}',
          },
          WHATSAPP: {
            subject: 'Booking Confirmation — Transnumerica DRC',
            body: `🎟️ *Transnumerica Trip Confirmation*
Hello {{passenger_name}},
Your seat {{seat_number}} on {{operator_name}} to {{arrival_station}} is confirmed. Departure at {{departure_time}}. QR: {{tracking_url}}`,
          },
          PUSH: {
            subject: 'Booking Confirmed! 🚌',
            body: 'Your trip to {{arrival_station}} is ready. Seat {{seat_number}} reserved.',
          },
          EMAIL: {
            subject: 'Your Transnumerica Ticket: {{ticket_ref}}',
            body: '<p>Hello {{passenger_name}}, your trip is confirmed.</p>',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica: Mbote {{passenger_name}}, tiketi na yo {{ticket_ref}} ({{departure_station}}->{{arrival_station}}) eza ndima. Departure: {{departure_time}}, kiti {{seat_number}}. QR: {{tracking_url}}',
          },
          WHATSAPP: {
            subject: 'Kondima ya Mobembo — Transnumerica',
            body: `🎟️ *Kondima ya Mobembo Transnumerica*
Mbote {{passenger_name}},
Mobembo na yo wuta *{{departure_station}} kino {{arrival_station}}* eza ndima.
- Nimero ya tiketi : *{{ticket_ref}}*
- Ntango ya kokende : *{{departure_time}}*
- Kiti : *{{seat_number}}*
Tiketi QR : {{tracking_url}}`,
          },
          PUSH: {
            subject: 'Tiketi endimami ! 🚌',
            body: 'Mobembo na yo pona {{arrival_station}} eza pamba te. Kiti {{seat_number}}.',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica: Jambo {{passenger_name}}, tiketi yako {{ticket_ref}} ({{departure_station}}->{{arrival_station}}) imethibitishwa. Safari: {{departure_time}}, kiti {{seat_number}}. QR: {{tracking_url}}',
          },
          WHATSAPP: {
            subject: 'Uthibitisho wa Safari — Transnumerica',
            body: `🎟️ *Uthibitisho wa Safari Transnumerica*
Jambo {{passenger_name}},
Safari yako kutoka *{{departure_station}} kuelekea {{arrival_station}}* imethibitishwa.
- Tiketi : *{{ticket_ref}}*
- Wakati : *{{departure_time}}*
- Kiti : *{{seat_number}}*
QR Tiketi : {{tracking_url}}`,
          },
          PUSH: {
            subject: 'Tiketi Imethibitishwa ! 🚌',
            body: 'Safari yako ya {{arrival_station}} iko tayari. Kiti {{seat_number}}.',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-15T12:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'tpl-trip-reminder-2h',
      event: 'TRIP_REMINDER_2H',
      name: 'Rappel de Départ H-2 (Embarquement)',
      description: 'Alerte automatique transmise 2 heures avant le départ du bus.',
      category: 'TRIPS',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP', 'PUSH'],
      variables: [
        'passenger_name',
        'ticket_ref',
        'departure_station',
        'departure_time',
        'seat_number',
      ],
      content: {
        fr: {
          SMS: {
            body: 'Rappel Transnumerica: Départ dans 2h à la gare de {{departure_station}} pour votre bus de {{departure_time}}. Billet {{ticket_ref}}, siège {{seat_number}}.',
          },
          WHATSAPP: {
            body: `⏰ *Rappel de Départ Bus H-2*
Bonjour {{passenger_name}}, votre autocar quitte la gare de *{{departure_station}}* à *{{departure_time}}*.
Présentez-vous 30 minutes avant pour l'étiquetage des bagages. Bon voyage !`,
          },
          PUSH: {
            subject: 'Départ dans 2 heures ! ⏰',
            body: 'Rendez-vous à {{departure_station}} pour votre départ de {{departure_time}}.',
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica Reminder: 2 hours until departure at {{departure_station}} for your {{departure_time}} bus. Ticket {{ticket_ref}}, seat {{seat_number}}.',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica Bokundoli: Ngonga 2 etikali pona kokende na gare ya {{departure_station}}. Ntango: {{departure_time}}, kiti {{seat_number}}.',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica Kumbukumbu: Masaa 2 yamebaki kwa kuondoka katika kituo cha {{departure_station}}. Wakati: {{departure_time}}, kiti {{seat_number}}.',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-02T00:00:00Z',
      updatedAt: '2026-10-15T12:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'tpl-driver-assigned',
      event: 'DRIVER_ASSIGNED',
      name: 'Chauffeur Taxi / Moto Attribué',
      description: 'Notification immédiate avec nom, téléphone et immatriculation du chauffeur.',
      category: 'TRIPS',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP', 'PUSH'],
      variables: [
        'passenger_name',
        'driver_name',
        'driver_phone',
        'vehicle_plate',
        'eta_minutes',
        'tracking_url',
      ],
      content: {
        fr: {
          SMS: {
            body: 'Transnumerica: Chauffeur {{driver_name}} (Tél: {{driver_phone}}) en route avec {{vehicle_plate}}. Arrivée estimée dans {{eta_minutes}} min.',
          },
          WHATSAPP: {
            body: `🚖 *Votre Chauffeur Transnumerica arrive !*
- Chauffeur : *{{driver_name}}*
- Contact direct : {{driver_phone}}
- Plaque véhicule : *{{vehicle_plate}}*
- Temps d'approche : *{{eta_minutes}} minutes*
Suivre en direct sur la carte : {{tracking_url}}`,
          },
          PUSH: {
            subject: 'Chauffeur en approche 🚗',
            body: '{{driver_name}} arrive dans {{eta_minutes}} min avec le véhicule {{vehicle_plate}}.',
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica: Driver {{driver_name}} ({{driver_phone}}) is arriving with plate {{vehicle_plate}} in {{eta_minutes}} min.',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica: Chauffeur {{driver_name}} ({{driver_phone}}) azali koya na motuka {{vehicle_plate}}. Akozala awa na {{eta_minutes}} min.',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica: Dereva {{driver_name}} ({{driver_phone}}) anakuja na gari {{vehicle_plate}}. Atafika kwa dakika {{eta_minutes}}.',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-05T00:00:00Z',
      updatedAt: '2026-10-18T10:00:00Z',
      updatedBy: 'operations@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'tpl-delivery-picked-up',
      event: 'DELIVERY_PICKED_UP',
      name: 'Colis Express Pris en Charge',
      description: 'Envoyé à l’expéditeur et au destinataire avec le lien de suivi live GPS.',
      category: 'DELIVERY',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP', 'PUSH'],
      variables: [
        'recipient_name',
        'tracking_number',
        'courier_name',
        'courier_phone',
        'tracking_url',
      ],
      content: {
        fr: {
          SMS: {
            body: 'Transnumerica Express: Votre colis {{tracking_number}} a été pris en charge par {{courier_name}} ({{courier_phone}}). Suivi: {{tracking_url}}',
          },
          WHATSAPP: {
            body: `📦 *Colis Express en Cours d'Acheminement*
Bonjour {{recipient_name}},
Votre envoi *N° {{tracking_number}}* a été réceptionné par notre coursier certifié {{courier_name}}.
🔗 Suivez la livraison en temps réel : {{tracking_url}}`,
          },
          PUSH: {
            subject: 'Colis pris en charge 📦',
            body: 'Le coursier {{courier_name}} est en route pour la livraison de {{tracking_number}}.',
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica Express: Parcel {{tracking_number}} picked up by {{courier_name}}. Track: {{tracking_url}}',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica Express: Mokano na yo {{tracking_number}} ekamatami na {{courier_name}}. Kolandela: {{tracking_url}}',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica Express: Mzigo wako {{tracking_number}} umechukuliwa na {{courier_name}}. Fuatilia: {{tracking_url}}',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-08T00:00:00Z',
      updatedAt: '2026-10-18T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'tpl-payout-sent',
      event: 'PAYOUT_SENT',
      name: 'Virement de Commission Chauffeur / Partenaire',
      description: 'Avis de versement direct vers le compte Mobile Money du bénéficiaire.',
      category: 'PAYMENTS',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP'],
      variables: [
        'partner_name',
        'amount',
        'currency',
        'momo_provider',
        'transaction_ref',
        'batch_id',
      ],
      content: {
        fr: {
          SMS: {
            body: 'Transnumerica Finance: Virement de {{amount}} {{currency}} effectué avec succès sur votre compte {{momo_provider}}. Réf: {{transaction_ref}}.',
          },
          WHATSAPP: {
            body: `💰 *Avis de Règlement Partenaire Transnumerica*
Cher(e) {{partner_name}},
Votre commission d'un montant net de *{{amount}} {{currency}}* a été créditée sur votre portefeuille *{{momo_provider}}*.
- Réf Transaction : *{{transaction_ref}}*
- Lot de versement : {{batch_id}}
Merci pour votre dévouement sur le réseau Transnumerica.`,
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica Finance: Payout of {{amount}} {{currency}} completed to your {{momo_provider}} account. Ref: {{transaction_ref}}.',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica Mbongo: Kotinda ya {{amount}} {{currency}} esalemi malamu na compte na yo {{momo_provider}}. Ref: {{transaction_ref}}.',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica Fedha: Malipo ya {{amount}} {{currency}} yametumwa kwenye akaunti yako ya {{momo_provider}}. Kumbukumbu: {{transaction_ref}}.',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-20T14:00:00Z',
      updatedBy: 'finance@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'tpl-security-alert',
      event: 'SECURITY_ALERT',
      name: 'Alerte Sécurité & Connexion Inhabituelle',
      description: 'Notification immédiate en cas de tentative suspecte ou verrouillage de compte.',
      category: 'SECURITY',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP', 'PUSH', 'EMAIL'],
      variables: [
        'user_name',
        'device_info',
        'ip_address',
        'city_location',
        'timestamp',
      ],
      content: {
        fr: {
          SMS: {
            body: 'Transnumerica Sécurité: Nouvelle connexion détectée depuis {{city_location}} ({{device_info}}) le {{timestamp}}. Si ce n’est pas vous, contactez d’urgence le support.',
          },
          WHATSAPP: {
            body: `🛡️ *Alerte de Sécurité Compte Transnumerica*
Bonjour {{user_name}},
Une tentative de connexion a été enregistrée :
- Lieu : {{city_location}}
- Appareil : {{device_info}}
- IP : {{ip_address}}
- Date : {{timestamp}}
Si vous n’êtes pas à l’origine de cette action, modifiez immédiatement votre mot de passe.`,
          },
          PUSH: {
            subject: 'Alerte de sécurité 🛡️',
            body: 'Nouvelle connexion enregistrée à {{city_location}}. Vérifiez vos sessions actives.',
          },
          EMAIL: {
            subject: 'Alerte Sécurité Transnumerica : Connexion à {{city_location}}',
            body: '<p>Une connexion inhabituelle a été enregistrée sur votre compte.</p>',
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica Security: Login detected from {{city_location}} ({{device_info}}) at {{timestamp}}. If not you, contact support.',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica Bokengi: Bokoti ya sika emonani na {{city_location}} ({{device_info}}). Soki eza yo te, benga support mbala moko.',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica Usalama: Kuingia kumeripotiwa kutoka {{city_location}} ({{device_info}}). Ikiwa si wewe, wasiliana na huduma kwa wateja.',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-12T00:00:00Z',
      updatedAt: '2026-10-20T14:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'tpl-refund-processed',
      event: 'REFUND_PROCESSED',
      name: 'Remboursement Traité avec Succès',
      description: 'Envoyé au voyageur suite à une annulation de billet conforme aux CGU.',
      category: 'PAYMENTS',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP'],
      variables: [
        'passenger_name',
        'ticket_ref',
        'amount',
        'currency',
        'refund_reason',
      ],
      content: {
        fr: {
          SMS: {
            body: 'Transnumerica: Votre remboursement de {{amount}} {{currency}} pour le billet {{ticket_ref}} a été versé par Mobile Money. Motif: {{refund_reason}}.',
          },
          WHATSAPP: {
            body: `✅ *Remboursement Validé Transnumerica*
Bonjour {{passenger_name}},
Votre demande d'annulation pour le billet *{{ticket_ref}}* a été validée.
Montant remboursé : *{{amount}} {{currency}}* reversé directement sur votre compte Mobile Money.`,
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica: Your refund of {{amount}} {{currency}} for ticket {{ticket_ref}} was credited via Mobile Money.',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica: Kozongisa mbongo na yo ya {{amount}} {{currency}} pona tiketi {{ticket_ref}} esalemi malamu na Mobile Money.',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica: Pesa zako {{amount}} {{currency}} za tiketi {{ticket_ref}} zimerejeshwa kupitia Mobile Money.',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-14T00:00:00Z',
      updatedAt: '2026-10-22T08:00:00Z',
      updatedBy: 'finance@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'tpl-ticket-canceled',
      event: 'TICKET_CANCELED',
      name: 'Annulation de Billet ou Trajet',
      description: 'Notification en cas de voyage annulé par le transporteur ou par le passager.',
      category: 'BOOKINGS',
      isEnabled: true,
      channels: ['SMS', 'WHATSAPP'],
      variables: ['passenger_name', 'ticket_ref', 'cancellation_reason'],
      content: {
        fr: {
          SMS: {
            body: 'Transnumerica: Votre billet {{ticket_ref}} a été annulé. Motif: {{cancellation_reason}}. Consultez l’application pour le remboursement.',
          },
          WHATSAPP: {
            body: `⚠️ *Annulation de Billet Transnumerica*
Bonjour {{passenger_name}},
Le billet *{{ticket_ref}}* a été annulé.
Motif : {{cancellation_reason}}.
Notre service client est à votre disposition sur WhatsApp pour tout reclassement ou remboursement.`,
          },
        },
        en: {
          SMS: {
            body: 'Transnumerica: Ticket {{ticket_ref}} has been canceled. Reason: {{cancellation_reason}}.',
          },
        },
        ln: {
          SMS: {
            body: 'Transnumerica: Tiketi na yo {{ticket_ref}} elongolami. Ntina: {{cancellation_reason}}.',
          },
        },
        sw: {
          SMS: {
            body: 'Transnumerica: Tiketi yako {{ticket_ref}} imeghairiwa. Sababu: {{cancellation_reason}}.',
          },
        },
      },
      version: 1,
      createdAt: '2026-10-15T00:00:00Z',
      updatedAt: '2026-10-22T08:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
      deletedAt: null,
    },
  ];
}

export function getInitialBroadcasts(): NotificationBroadcast[] {
  return [
    {
      id: 'bc-promo-matadi',
      title: 'Campagne Vacances — Réduction 15% Corridor Kinshasa-Matadi',
      targetSegment: 'CITY_KINSHASA',
      targetFilter: { city: 'kinshasa', routeId: 'cor-kin-matadi' },
      channels: ['SMS', 'WHATSAPP'],
      messages: {
        fr: {
          subject: 'Promo Spéciale Kinshasa-Matadi',
          body: 'Transnumerica: Voyagez ce week-end vers Matadi avec 15% de réduction ! Réservez votre billet bus climatisé sur transnumerica.cd avec le code MATADI15.',
        },
        en: {
          subject: 'Special Offer Kinshasa-Matadi',
          body: 'Transnumerica: Enjoy 15% off your bus ticket to Matadi this weekend with code MATADI15 on transnumerica.cd.',
        },
        ln: {
          subject: 'Matabisi Kinshasa-Matadi',
          body: 'Transnumerica: Kende Matadi na wekend oyo na kokita ya 15% ! Somba tiketi na transnumerica.cd na code MATADI15.',
        },
        sw: {
          subject: 'Punguzo Maalum Kinshasa-Matadi',
          body: 'Transnumerica: Safiri wikendi hii kuelekea Matadi na punguzo la 15%! Tumia msimbo MATADI15 kwenye transnumerica.cd.',
        },
      },
      scheduledAt: null,
      status: 'COMPLETED',
      costEstimate: {
        recipientCount: 1850,
        smsCount: 1850,
        costPerSmsUsd: 0.025,
        costPerWaUsd: 0.035,
        totalCostUsd: 111.0,
        totalCostCdf: 310800,
      },
      deliveryStats: {
        totalTargets: 1850,
        optOutExcluded: 32,
        sentCount: 1818,
        deliveredCount: 1795,
        failedCount: 23,
        readCount: 1420,
      },
      safeguardApproval: {
        approvedBy: 'superadmin@transnumerica.cd',
        approvedAt: '2026-10-24T10:00:00Z',
        reason: 'Campagne promotionnelle officielle validée par la direction commerciale.',
      },
      version: 1,
      createdAt: '2026-10-24T09:30:00Z',
      updatedAt: '2026-10-24T10:05:00Z',
      createdBy: 'marketing@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'bc-driver-safety-kinshasa',
      title: 'Consignes de Sécurité — Port du Casque & Vitesse Pluvieuse',
      targetSegment: 'DRIVERS_ONLY',
      targetFilter: { userRole: 'DRIVER' },
      channels: ['WHATSAPP', 'SMS'],
      messages: {
        fr: {
          subject: 'Alerte Sécurité Chauffeurs',
          body: 'Transnumerica Sécurité: Alerte pluies intenses à Kinshasa. Réduisez votre vitesse et portez impérativement le casque certifié. Contrôles stricts en cours.',
        },
        en: {
          subject: 'Driver Safety Alert',
          body: 'Transnumerica Safety: Heavy rains in Kinshasa. Reduce speed and always wear your helmet.',
        },
        ln: {
          subject: 'Bokengi ya bamikumbi',
          body: 'Transnumerica Bokengi: Mvula makasi ezali kobeta na Kinshasa. Kitisa vitesi mpe lata casque ya bokengi.',
        },
        sw: {
          subject: 'Usalama wa Madereva',
          body: 'Transnumerica Usalama: Mvua kubwa inanyesha Kinshasa. Punguza mwendo na vaa kofia ngumu ya usalama.',
        },
      },
      scheduledAt: null,
      status: 'COMPLETED',
      costEstimate: {
        recipientCount: 420,
        smsCount: 420,
        costPerSmsUsd: 0.025,
        costPerWaUsd: 0.035,
        totalCostUsd: 25.2,
        totalCostCdf: 70560,
      },
      deliveryStats: {
        totalTargets: 420,
        optOutExcluded: 0,
        sentCount: 420,
        deliveredCount: 418,
        failedCount: 2,
        readCount: 395,
      },
      safeguardApproval: {
        approvedBy: 'superadmin@transnumerica.cd',
        approvedAt: '2026-10-26T07:45:00Z',
        reason: 'Alerte météo d’urgence pour la protection physique des mototaxis et passagers.',
      },
      version: 1,
      createdAt: '2026-10-26T07:30:00Z',
      updatedAt: '2026-10-26T07:46:00Z',
      createdBy: 'safety@transnumerica.cd',
      deletedAt: null,
    },
    {
      id: 'bc-goma-maintenance',
      title: 'Information Voyageurs — Travaux Gare Routière Goma Birere',
      targetSegment: 'CITY_GOMA',
      targetFilter: { city: 'goma' },
      channels: ['SMS', 'WHATSAPP'],
      messages: {
        fr: {
          subject: 'Info Travaux Gare de Goma',
          body: 'Transnumerica Info: En raison de travaux sur la chaussée à Birere (Goma), les départs vers Bukavu s’effectueront temporairement depuis la gare de Katindo dès lundi.',
        },
        en: {
          subject: 'Goma Station Works Info',
          body: 'Transnumerica Info: Due to roadworks in Birere (Goma), buses to Bukavu will depart from Katindo station starting Monday.',
        },
        ln: {
          subject: 'Sango ya Gare ya Goma',
          body: 'Transnumerica Sango: Pona misala ya babalabala na Birere, mituka ya kokende Bukavu ekobima na gare ya Katindo wuta lobi.',
        },
        sw: {
          subject: 'Taarifa ya Kituo cha Goma',
          body: 'Transnumerica Taarifa: Kutokana na ujenzi wa barabara Birere (Goma), mabasi ya Bukavu yataondoka kituo cha Katindo kuanzia Jumatatu.',
        },
      },
      scheduledAt: '2026-11-02T06:00:00Z',
      status: 'SCHEDULED',
      costEstimate: {
        recipientCount: 650,
        smsCount: 650,
        costPerSmsUsd: 0.025,
        costPerWaUsd: 0.035,
        totalCostUsd: 39.0,
        totalCostCdf: 109200,
      },
      deliveryStats: {
        totalTargets: 650,
        optOutExcluded: 12,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        readCount: 0,
      },
      safeguardApproval: {
        approvedBy: 'superadmin@transnumerica.cd',
        approvedAt: '2026-10-28T14:10:00Z',
        reason: 'Information d’exploitation publique pour les passagers de l’Est.',
      },
      version: 1,
      createdAt: '2026-10-28T14:00:00Z',
      updatedAt: '2026-10-28T14:10:00Z',
      createdBy: 'superadmin@transnumerica.cd',
      deletedAt: null,
    },
  ];
}

export function getInitialDeliveryLogs(): NotificationDeliveryLog[] {
  return [
    {
      id: 'log-001',
      recipient: {
        id: 'usr-101',
        name: 'Jean-Baptiste Mupangila',
        phone: '+243812345678',
        email: 'jb.mupangila@gmail.com',
        language: 'fr',
      },
      event: 'BOOKING_CONFIRMED',
      channel: 'SMS',
      provider: 'ORANGE_SMS',
      messageContent:
        'Transnumerica: Bonjour Jean-Baptiste, votre billet TN-2026-90412 est confirmé. Départ Kinshasa le 31/10 à 07:00, siège 14A.',
      status: 'DELIVERED',
      failureReason: null,
      retryCount: 0,
      maxRetries: 3,
      sentAt: '2026-10-30T14:20:10Z',
      deliveredAt: '2026-10-30T14:20:14Z',
      costUsd: 0.025,
    },
    {
      id: 'log-002',
      recipient: {
        id: 'usr-102',
        name: 'Fidèle Kazadi',
        phone: '+243998765432',
        language: 'ln',
      },
      event: 'DRIVER_ASSIGNED',
      channel: 'WHATSAPP',
      provider: 'WHATSAPP_BUSINESS',
      messageContent:
        'Mbote Fidèle, Chauffeur Dieudonné Ilunga (0810001122) azali koya na motuka 4321AB01. Akozala awa na 8 min.',
      status: 'DELIVERED',
      failureReason: null,
      retryCount: 0,
      maxRetries: 3,
      sentAt: '2026-10-30T15:10:00Z',
      deliveredAt: '2026-10-30T15:10:02Z',
      costUsd: 0.035,
    },
    {
      id: 'log-003',
      recipient: {
        id: 'usr-103',
        name: 'Anicet Tshilombo',
        phone: '+243820999888',
        language: 'fr',
      },
      event: 'TRIP_REMINDER_2H',
      channel: 'SMS',
      provider: 'AIRTEL_SMS',
      messageContent:
        'Rappel Transnumerica: Départ dans 2h à la gare de Lubumbashi pour votre bus vers Kolwezi. Billet TN-LSH-098.',
      status: 'FAILED',
      failureReason: 'Airtel DRC Error 30008: Terminal hors réseau ou combiné éteint',
      retryCount: 2,
      maxRetries: 3,
      sentAt: '2026-10-30T16:00:00Z',
      deliveredAt: null,
      costUsd: 0.025,
    },
    {
      id: 'log-004',
      recipient: {
        id: 'usr-104',
        name: 'Marie-Claire Nyembo',
        phone: '+243890123456',
        language: 'sw',
      },
      event: 'PAYOUT_SENT',
      channel: 'SMS',
      provider: 'VODACOM_SMS',
      messageContent:
        'Transnumerica Fedha: Malipo ya 450.00 USD yametumwa kwenye M-Pesa yako. Réf: PAY-2026-8874.',
      status: 'DELIVERED',
      failureReason: null,
      retryCount: 0,
      maxRetries: 3,
      sentAt: '2026-10-30T16:30:00Z',
      deliveredAt: '2026-10-30T16:30:05Z',
      costUsd: 0.025,
    },
    {
      id: 'log-005',
      recipient: {
        id: 'usr-105',
        name: 'Mireille Boketshu',
        phone: '+243815554433',
        language: 'fr',
      },
      event: 'PROMOTIONAL_OFFER',
      channel: 'SMS',
      provider: 'ORANGE_SMS',
      messageContent:
        'Transnumerica: Profitez de 15% de réduction ce week-end sur vos trajets Kinshasa-Matadi avec le code PROMO.',
      status: 'OPT_OUT_SKIPPED',
      failureReason: 'Refus légal respecté : Numéro inscrit sur la liste STOP SMS',
      retryCount: 0,
      maxRetries: 0,
      sentAt: '2026-10-30T17:00:00Z',
      deliveredAt: null,
      costUsd: 0.0,
    },
  ];
}

export function getInitialOptOuts(): NotificationOptOut[] {
  return [
    {
      id: 'opt-001',
      userId: 'usr-105',
      identifier: '+243815554433',
      channels: ['SMS', 'WHATSAPP'],
      categories: ['ALL', 'MARKETING', 'PROMOTIONS', 'BOOKINGS'],
      optedOutAt: '2026-10-18T11:20:00Z',
      source: 'SMS_STOP',
    },
    {
      id: 'opt-002',
      userId: 'usr-202',
      identifier: '+243990001122',
      channels: ['SMS'],
      categories: ['MARKETING'],
      optedOutAt: '2026-10-20T16:45:00Z',
      source: 'USER_SETTINGS',
    },
    {
      id: 'opt-003',
      userId: 'usr-303',
      identifier: 'client.vip@gmail.com',
      channels: ['EMAIL'],
      categories: ['MARKETING'],
      optedOutAt: '2026-10-22T09:00:00Z',
      source: 'ADMIN_OVERRIDE',
    },
  ];
}

// Memory database initialization
function ensureInitialized() {
  if (templatesDb.length === 0) {
    templatesDb = getInitialNotificationTemplates();
  }
  if (broadcastsDb.length === 0) {
    broadcastsDb = getInitialBroadcasts();
  }
  if (logsDb.length === 0) {
    logsDb = getInitialDeliveryLogs();
  }
  if (optOutsDb.length === 0) {
    optOutsDb = getInitialOptOuts();
  }
}

// -------------------------------------------------------------
// VARIABLE RENDERING ENGINE
// -------------------------------------------------------------
export function renderNotificationVariables(
  templateText: string,
  variables: Record<string, string | number>
): string {
  if (!templateText) return '';
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, varName) => {
    if (varName in variables && variables[varName] !== undefined && variables[varName] !== null) {
      return String(variables[varName]);
    }
    return match; // Keep unresolved variables visible for debugging
  });
}

// -------------------------------------------------------------
// COST & TARGETS ESTIMATION ENGINE (RDC RATES)
// -------------------------------------------------------------
export function calculateBroadcastCost(
  segment: BroadcastSegment,
  channels: NotificationChannel[],
  targetFilter?: { city?: string; routeId?: string; userRole?: string }
) {
  let recipientCount = 1000;
  switch (segment) {
    case 'ALL_USERS':
      recipientCount = 5400;
      break;
    case 'CITY_KINSHASA':
      recipientCount = 2850;
      break;
    case 'CITY_LUBUMBASHI':
      recipientCount = 1450;
      break;
    case 'CITY_MATADI':
      recipientCount = 780;
      break;
    case 'CITY_GOMA':
      recipientCount = 650;
      break;
    case 'DRIVERS_ONLY':
      recipientCount = 420;
      break;
    case 'BOOKED_ROUTE_USERS':
      recipientCount = 380;
      break;
  }

  if (targetFilter?.city && segment !== 'CITY_KINSHASA' && segment !== 'CITY_LUBUMBASHI') {
    recipientCount = Math.round(recipientCount * 0.4);
  }

  const costPerSmsUsd = 0.025; // 70 CDF / SMS en RDC
  const costPerWaUsd = 0.035; // ~98 CDF / message WhatsApp Business
  const rateCdf = 2800; // 1 USD = 2800 CDF

  let totalCostUsd = 0;
  if (channels.includes('SMS')) {
    totalCostUsd += recipientCount * costPerSmsUsd;
  }
  if (channels.includes('WHATSAPP')) {
    totalCostUsd += recipientCount * costPerWaUsd;
  }

  const totalCostCdf = Math.round(totalCostUsd * rateCdf);

  return {
    recipientCount,
    smsCount: channels.includes('SMS') ? recipientCount : 0,
    costPerSmsUsd,
    costPerWaUsd,
    totalCostUsd: Number(totalCostUsd.toFixed(2)),
    totalCostCdf,
  };
}

// -------------------------------------------------------------
// OPT-OUT VERIFICATION
// -------------------------------------------------------------
export function isUserOptedOut(
  identifier: string,
  channel: NotificationChannel,
  category: string = 'MARKETING'
): boolean {
  ensureInitialized();
  const cleanId = identifier.trim().toLowerCase();
  return optOutsDb.some(
    (o) =>
      o.identifier.toLowerCase() === cleanId &&
      o.channels.includes(channel) &&
      (o.categories.includes(category) || o.categories.includes('ALL'))
  );
}

// -------------------------------------------------------------
// TEMPLATES MANAGEMENT (CRUD)
// -------------------------------------------------------------
export function getNotificationTemplates(search?: string, category?: string): NotificationTemplate[] {
  ensureInitialized();
  return templatesDb
    .filter((t) => t.deletedAt === null)
    .filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.event.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !category || category === 'ALL' || t.category === category;
      return matchesSearch && matchesCat;
    });
}

export function getNotificationTemplateById(id: string): NotificationTemplate | null {
  ensureInitialized();
  const item = templatesDb.find((t) => t.id === id && t.deletedAt === null);
  return item ? { ...item } : null;
}

export function saveNotificationTemplate(
  id: string | null,
  input: NotificationTemplateInput,
  authorEmail: string
): NotificationTemplate {
  ensureInitialized();

  if (id) {
    const idx = templatesDb.findIndex((t) => t.id === id && t.deletedAt === null);
    if (idx === -1) {
      throw new Error(`Modèle de notification introuvable avec l'ID ${id}`);
    }

    const existing = templatesDb[idx];

    // Optimistic locking
    if (input.version && existing.version !== input.version) {
      throw new Error(
        `Conflit d’édition détecté : ce modèle a été modifié par un autre administrateur (v${existing.version} vs v${input.version}). Veuillez actualiser.`
      );
    }

    const updated: NotificationTemplate = {
      ...existing,
      name: input.name,
      description: input.description,
      category: input.category,
      isEnabled: input.isEnabled,
      channels: input.channels,
      variables: input.variables || existing.variables,
      content: {
        ...existing.content,
        ...input.content,
      },
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: authorEmail,
    };

    templatesDb[idx] = updated;

    logAdminAction({
      adminUser: authorEmail,
      action: 'UPDATE_NOTIFICATION_TEMPLATE',
      target: updated.id,
      previousState: JSON.stringify(existing),
      newState: JSON.stringify(updated),
      reason: `Mise à jour du modèle de notification : ${updated.name}`,
    });

    return { ...updated };
  } else {
    const newId = `tpl-${Date.now()}`;
    const created: NotificationTemplate = {
      id: newId,
      event: (input as any).event || 'BOOKING_CONFIRMED',
      name: input.name,
      description: input.description,
      category: input.category,
      isEnabled: input.isEnabled,
      channels: input.channels,
      variables: input.variables || [],
      content: input.content as any,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: authorEmail,
      deletedAt: null,
    };

    templatesDb.unshift(created);

    logAdminAction({
      adminUser: authorEmail,
      action: 'CREATE_NOTIFICATION_TEMPLATE',
      target: created.id,
      previousState: '',
      newState: JSON.stringify(created),
      reason: `Création d'un nouveau modèle de notification : ${created.name}`,
    });

    return { ...created };
  }
}

export function toggleNotificationTemplate(
  id: string,
  isEnabled: boolean,
  authorEmail: string
): NotificationTemplate {
  ensureInitialized();
  const idx = templatesDb.findIndex((t) => t.id === id && t.deletedAt === null);
  if (idx === -1) {
    throw new Error('Modèle de notification introuvable');
  }

  const existing = templatesDb[idx];
  const updated: NotificationTemplate = {
    ...existing,
    isEnabled,
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: authorEmail,
  };

  templatesDb[idx] = updated;

  logAdminAction({
    adminUser: authorEmail,
    action: isEnabled ? 'ENABLE_NOTIFICATION_TEMPLATE' : 'DISABLE_NOTIFICATION_TEMPLATE',
    target: updated.id,
    previousState: JSON.stringify({ isEnabled: existing.isEnabled }),
    newState: JSON.stringify({ isEnabled: updated.isEnabled }),
    reason: `${isEnabled ? 'Activation' : 'Désactivation'} du modèle ${updated.name}`,
  });

  return { ...updated };
}

export function deleteNotificationTemplate(id: string, authorEmail: string, reason: string): boolean {
  ensureInitialized();
  const idx = templatesDb.findIndex((t) => t.id === id && t.deletedAt === null);
  if (idx === -1) return false;

  const existing = templatesDb[idx];
  templatesDb[idx] = {
    ...existing,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: authorEmail,
  };

  logAdminAction({
    adminUser: authorEmail,
    action: 'DELETE_NOTIFICATION_TEMPLATE',
    target: id,
    previousState: JSON.stringify(existing),
    newState: '',
    reason: `Suppression logique du modèle de notification : ${reason}`,
  });

  return true;
}

// -------------------------------------------------------------
// TEST-SEND ENGINE
// -------------------------------------------------------------
export function sendTestNotification(input: TestSendInput, authorEmail: string) {
  ensureInitialized();
  const template = getNotificationTemplateById(input.templateId);
  if (!template) {
    throw new Error(`Modèle de notification ${input.templateId} introuvable`);
  }

  if (!template.isEnabled) {
    throw new Error(`Le modèle "${template.name}" est actuellement désactivé.`);
  }

  const langContent = template.content[input.language] || template.content['fr'];
  if (!langContent || !langContent[input.channel]) {
    throw new Error(
      `Aucun contenu n’est configuré pour le canal ${input.channel} en langue ${input.language.toUpperCase()}`
    );
  }

  const channelData = langContent[input.channel]!;

  // Default sample variables for realistic simulation
  const defaultSampleData: Record<string, string | number> = {
    passenger_name: 'Dieudonné Kasavubu',
    ticket_ref: 'TN-TEST-9921',
    departure_station: 'Kinshasa Gare Centrale',
    arrival_station: 'Matadi Port',
    departure_time: '14:30',
    seat_number: '12B',
    amount: '45 000',
    currency: 'CDF',
    operator_name: 'Transco SARL',
    tracking_url: 'https://transnumerica.cd/tickets/TN-TEST-9921',
    driver_name: 'Patrice Lumumba (Chauffeur)',
    driver_phone: '+243810001122',
    vehicle_plate: '9845AB01',
    eta_minutes: '7',
    recipient_name: 'Merveille Mbuji',
    tracking_number: 'COLIS-RDC-7741',
    courier_name: 'Express Moto Kin',
    courier_phone: '+243990008899',
    momo_provider: 'Vodacom M-Pesa',
    transaction_ref: 'MPESA-99041288',
    batch_id: 'LOT-S43',
    city_location: 'Kinshasa (Gombe)',
    device_info: 'Chrome Android 14',
    ip_address: '197.234.218.42',
    timestamp: new Date().toLocaleTimeString('fr-FR'),
    refund_reason: 'Annulation demandée > 6h avant départ',
    cancellation_reason: 'Incident technique sur la rame',
    ...input.sampleData,
  };

  const renderedBody = renderNotificationVariables(channelData.body, defaultSampleData);
  const renderedSubject = channelData.subject
    ? renderNotificationVariables(channelData.subject, defaultSampleData)
    : undefined;

  // Check opt-out
  const optedOut = isUserOptedOut(input.recipient, input.channel, template.category);

  // Add delivery log entry
  const newLog: NotificationDeliveryLog = {
    id: `log-test-${Date.now()}`,
    recipient: {
      id: 'test-user',
      name: 'Destinataire Test',
      phone: input.recipient,
      email: input.recipient.includes('@') ? input.recipient : undefined,
      language: input.language,
    },
    event: template.event,
    channel: input.channel,
    provider:
      input.channel === 'SMS'
        ? 'ORANGE_SMS'
        : input.channel === 'WHATSAPP'
        ? 'WHATSAPP_BUSINESS'
        : input.channel === 'EMAIL'
        ? 'SENDGRID_EMAIL'
        : 'FIREBASE_PUSH',
    messageContent: renderedBody,
    status: optedOut ? 'OPT_OUT_SKIPPED' : 'DELIVERED',
    failureReason: optedOut ? 'Destinataire désinscrit (Opt-Out actif)' : null,
    retryCount: 0,
    maxRetries: 3,
    sentAt: new Date().toISOString(),
    deliveredAt: optedOut ? null : new Date().toISOString(),
    costUsd: input.channel === 'SMS' ? 0.025 : input.channel === 'WHATSAPP' ? 0.035 : 0.0,
  };

  logsDb.unshift(newLog);

  logAdminAction({
    adminUser: authorEmail,
    action: 'TEST_SEND_NOTIFICATION',
    target: template.id,
    previousState: '',
    newState: JSON.stringify({ recipient: input.recipient, channel: input.channel, status: newLog.status }),
    reason: `Envoi de test unitaire (${input.channel}) vers ${input.recipient}`,
  });

  return {
    success: true,
    renderedSubject,
    renderedBody,
    status: newLog.status,
    recipient: input.recipient,
    channel: input.channel,
    isOptedOut: optedOut,
  };
}

// -------------------------------------------------------------
// BROADCAST CAMPAIGNS & SAFEGUARD ENGINE
// -------------------------------------------------------------
export function getNotificationBroadcasts(): NotificationBroadcast[] {
  ensureInitialized();
  return broadcastsDb
    .filter((b) => b.deletedAt === null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getNotificationBroadcastById(id: string): NotificationBroadcast | null {
  ensureInitialized();
  const b = broadcastsDb.find((x) => x.id === id && x.deletedAt === null);
  return b ? { ...b } : null;
}

export function saveNotificationBroadcast(
  id: string | null,
  input: NotificationBroadcastInput,
  authorEmail: string
): NotificationBroadcast {
  ensureInitialized();

  const cost = calculateBroadcastCost(input.targetSegment, input.channels, input.targetFilter);

  if (id) {
    const idx = broadcastsDb.findIndex((b) => b.id === id && b.deletedAt === null);
    if (idx === -1) throw new Error('Campagne introuvable');

    const existing = broadcastsDb[idx];
    if (existing.status === 'COMPLETED' || existing.status === 'PROCESSING') {
      throw new Error('Une campagne déjà envoyée ou en cours ne peut pas être modifiée');
    }

    const updated: NotificationBroadcast = {
      ...existing,
      title: input.title,
      targetSegment: input.targetSegment,
      targetFilter: input.targetFilter,
      channels: input.channels,
      messages: input.messages,
      scheduledAt: input.scheduledAt || null,
      status: input.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      costEstimate: cost,
      deliveryStats: {
        ...existing.deliveryStats,
        totalTargets: cost.recipientCount,
      },
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    broadcastsDb[idx] = updated;

    logAdminAction({
      adminUser: authorEmail,
      action: 'UPDATE_BROADCAST_CAMPAIGN',
      target: updated.id,
      previousState: JSON.stringify(existing),
      newState: JSON.stringify(updated),
      reason: `Mise à jour de la campagne de diffusion : ${updated.title}`,
    });

    return { ...updated };
  } else {
    const newId = `bc-${Date.now()}`;
    const created: NotificationBroadcast = {
      id: newId,
      title: input.title,
      targetSegment: input.targetSegment,
      targetFilter: input.targetFilter,
      channels: input.channels,
      messages: input.messages,
      scheduledAt: input.scheduledAt || null,
      status: input.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      costEstimate: cost,
      deliveryStats: {
        totalTargets: cost.recipientCount,
        optOutExcluded: 0,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        readCount: 0,
      },
      safeguardApproval: null,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: authorEmail,
      deletedAt: null,
    };

    broadcastsDb.unshift(created);

    logAdminAction({
      adminUser: authorEmail,
      action: 'CREATE_BROADCAST_CAMPAIGN',
      target: created.id,
      previousState: '',
      newState: JSON.stringify(created),
      reason: `Création du brouillon de campagne : ${created.title}`,
    });

    return { ...created };
  }
}

/**
 * High-Risk Action: Approve and Trigger Broadcast
 * Requires re-authentication password and explicit reason.
 * Enforces safeguards against accidental mass sends.
 */
export function approveAndSendBroadcast(
  broadcastId: string,
  password: string,
  reason: string,
  authorEmail: string
): NotificationBroadcast {
  ensureInitialized();

  // 1. Password verification safeguard
  const validAdminPasswords = ['Transnumerica@RDC2026!', 'SuperAdmin2026!', 'AdminPass2026!'];
  if (!password || !validAdminPasswords.includes(password)) {
    throw new Error(
      'Échec de la re-authentification : mot de passe administrateur incorrect. Action de diffusion de masse bloquée.'
    );
  }

  // 2. Reason verification safeguard
  if (!reason || reason.trim().length < 5) {
    throw new Error(
      'Un motif explicite et documenté d’au moins 5 caractères est strictement requis pour déclencher un envoi de masse.'
    );
  }

  const idx = broadcastsDb.findIndex((b) => b.id === broadcastId && b.deletedAt === null);
  if (idx === -1) {
    throw new Error('Campagne introuvable');
  }

  const broadcast = broadcastsDb[idx];

  // 3. Respect user opt-outs during mass sending
  const totalTargets = broadcast.costEstimate.recipientCount;
  // Compute realistic opt-outs
  const optOutCount = Math.max(1, Math.round(totalTargets * 0.02)); // ~2% opt-outs
  const eligibleTargets = totalTargets - optOutCount;
  const simulatedDelivered = Math.round(eligibleTargets * 0.98);
  const simulatedFailed = eligibleTargets - simulatedDelivered;

  const updated: NotificationBroadcast = {
    ...broadcast,
    status: 'COMPLETED',
    deliveryStats: {
      totalTargets,
      optOutExcluded: optOutCount,
      sentCount: eligibleTargets,
      deliveredCount: simulatedDelivered,
      failedCount: simulatedFailed,
      readCount: Math.round(simulatedDelivered * 0.75),
    },
    safeguardApproval: {
      approvedBy: authorEmail,
      approvedAt: new Date().toISOString(),
      reason: reason.trim(),
    },
    version: broadcast.version + 1,
    updatedAt: new Date().toISOString(),
  };

  broadcastsDb[idx] = updated;

  // Insert broadcast delivery log summary
  logsDb.unshift({
    id: `log-bc-${Date.now()}`,
    recipient: {
      id: 'segment-targets',
      name: `Segment : ${broadcast.targetSegment}`,
      phone: `${eligibleTargets} destinataires`,
      language: 'fr',
    },
    event: `BROADCAST:${broadcast.id}`,
    channel: broadcast.channels[0] || 'SMS',
    provider: broadcast.channels.includes('WHATSAPP') ? 'WHATSAPP_BUSINESS' : 'ORANGE_SMS',
    messageContent: broadcast.messages['fr']?.body || broadcast.title,
    status: 'DELIVERED',
    failureReason: null,
    retryCount: 0,
    maxRetries: 3,
    sentAt: new Date().toISOString(),
    deliveredAt: new Date().toISOString(),
    costUsd: broadcast.costEstimate.totalCostUsd,
  });

  // Log to immutable audit trail
  logAdminAction({
    adminUser: authorEmail,
    action: 'APPROVE_AND_EXECUTE_BROADCAST',
    target: broadcast.id,
    previousState: JSON.stringify({ status: broadcast.status }),
    newState: JSON.stringify({
      status: updated.status,
      deliveryStats: updated.deliveryStats,
      approval: updated.safeguardApproval,
    }),
    reason: `Déclenchement sécurisé de diffusion vers ${totalTargets} cibles (${optOutCount} opt-outs exclus). Motif : ${reason}`,
  });

  return { ...updated };
}

export function cancelBroadcast(broadcastId: string, authorEmail: string, reason: string): boolean {
  ensureInitialized();
  const idx = broadcastsDb.findIndex((b) => b.id === broadcastId && b.deletedAt === null);
  if (idx === -1) return false;

  const existing = broadcastsDb[idx];
  if (existing.status === 'COMPLETED') {
    throw new Error('Une campagne déjà envoyée ne peut pas être annulée');
  }

  broadcastsDb[idx] = {
    ...existing,
    status: 'CANCELLED',
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  };

  logAdminAction({
    adminUser: authorEmail,
    action: 'CANCEL_BROADCAST_CAMPAIGN',
    target: broadcastId,
    previousState: JSON.stringify({ status: existing.status }),
    newState: JSON.stringify({ status: 'CANCELLED' }),
    reason: `Annulation de la campagne programmée : ${reason}`,
  });

  return true;
}

// -------------------------------------------------------------
// DELIVERY LOGS & RETRIES
// -------------------------------------------------------------
export function getNotificationDeliveryLogs(
  channel?: string,
  status?: string,
  search?: string
): NotificationDeliveryLog[] {
  ensureInitialized();
  return logsDb.filter((l) => {
    const matchesChan = !channel || channel === 'ALL' || l.channel === channel;
    const matchesStatus = !status || status === 'ALL' || l.status === status;
    const matchesSearch =
      !search ||
      l.recipient.name.toLowerCase().includes(search.toLowerCase()) ||
      l.recipient.phone.toLowerCase().includes(search.toLowerCase()) ||
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      l.messageContent.toLowerCase().includes(search.toLowerCase());
    return matchesChan && matchesStatus && matchesSearch;
  });
}

export function retryFailedDelivery(logId: string, authorEmail: string): NotificationDeliveryLog {
  ensureInitialized();
  const idx = logsDb.findIndex((l) => l.id === logId);
  if (idx === -1) {
    throw new Error(`Log d'acheminement introuvable (${logId})`);
  }

  const existing = logsDb[idx];
  if (existing.status === 'DELIVERED') {
    throw new Error('Cette notification a déjà été acheminée avec succès.');
  }

  if (existing.retryCount >= existing.maxRetries) {
    throw new Error(`Nombre maximal de tentatives atteint (${existing.maxRetries}). Contactez le support télécom.`);
  }

  // Simulate retry success on second attempt
  const updated: NotificationDeliveryLog = {
    ...existing,
    status: 'DELIVERED',
    failureReason: null,
    retryCount: existing.retryCount + 1,
    deliveredAt: new Date().toISOString(),
  };

  logsDb[idx] = updated;

  logAdminAction({
    adminUser: authorEmail,
    action: 'RETRY_NOTIFICATION_DELIVERY',
    target: logId,
    previousState: JSON.stringify({ status: existing.status, retryCount: existing.retryCount }),
    newState: JSON.stringify({ status: updated.status, retryCount: updated.retryCount }),
    reason: `Tentative manuelle de réacheminement de la notification ${logId} vers ${existing.recipient.phone}`,
  });

  return { ...updated };
}

// -------------------------------------------------------------
// OPT-OUTS MANAGEMENT
// -------------------------------------------------------------
export function getNotificationOptOuts(): NotificationOptOut[] {
  ensureInitialized();
  return [...optOutsDb];
}

export function addNotificationOptOut(
  optOut: Omit<NotificationOptOut, 'id' | 'optedOutAt'>,
  authorEmail: string
): NotificationOptOut {
  ensureInitialized();
  const newId = `opt-${Date.now()}`;
  const created: NotificationOptOut = {
    ...optOut,
    id: newId,
    optedOutAt: new Date().toISOString(),
  };

  optOutsDb.unshift(created);

  logAdminAction({
    adminUser: authorEmail,
    action: 'ADD_NOTIFICATION_OPT_OUT',
    target: created.identifier,
    previousState: '',
    newState: JSON.stringify(created),
    reason: `Enregistrement d'un refus de notification pour ${created.identifier}`,
  });

  return created;
}

export function removeNotificationOptOut(id: string, authorEmail: string): boolean {
  ensureInitialized();
  const idx = optOutsDb.findIndex((o) => o.id === id);
  if (idx === -1) return false;

  const removed = optOutsDb[idx];
  optOutsDb.splice(idx, 1);

  logAdminAction({
    adminUser: authorEmail,
    action: 'REMOVE_NOTIFICATION_OPT_OUT',
    target: removed.identifier,
    previousState: JSON.stringify(removed),
    newState: '',
    reason: `Suppression de la désinscription pour ${removed.identifier}`,
  });

  return true;
}

// -------------------------------------------------------------
// KPI METRICS & STATS
// -------------------------------------------------------------
export function getNotificationStats(): NotificationStats {
  ensureInitialized();

  const totalLogs = logsDb.length;
  const deliveredLogs = logsDb.filter((l) => l.status === 'DELIVERED').length;
  const failureLogs = logsDb.filter((l) => l.status === 'FAILED').length;
  const deliveryRate = totalLogs > 0 ? Math.round((deliveredLogs / totalLogs) * 100) : 100;

  const activeTemplates = templatesDb.filter((t) => t.isEnabled && t.deletedAt === null).length;
  const scheduledBroadcasts = broadcastsDb.filter(
    (b) => (b.status === 'SCHEDULED' || b.status === 'DRAFT') && b.deletedAt === null
  ).length;

  const totalCost = logsDb.reduce((acc, curr) => acc + (curr.costUsd || 0), 0) + 136.2;

  return {
    totalSent24h: 2240,
    deliveryRatePercent: deliveryRate,
    failureCount: failureLogs,
    totalMonthlyCostUsd: Number(totalCost.toFixed(2)),
    activeTemplatesCount: activeTemplates,
    scheduledBroadcastsCount: scheduledBroadcasts,
    totalOptOutsCount: optOutsDb.length,
  };
}

// Helper for test cleanup
export function resetNotificationsStore() {
  templatesDb = getInitialNotificationTemplates();
  broadcastsDb = getInitialBroadcasts();
  logsDb = getInitialDeliveryLogs();
  optOutsDb = getInitialOptOuts();
}
