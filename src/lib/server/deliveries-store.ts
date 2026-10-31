import {
  AdminDeliveryOrder,
  AdminDeliveryTimelineEvent,
  DeliveryCourier,
  DeliveryPricingTierConfig,
  ProhibitedDeliveryItem,
  CrudQueryResult,
} from '@/types';
import { logAdminAction } from '@/lib/server/admin-store';

const DEFAULT_COURIERS: DeliveryCourier[] = [
  {
    id: 'courier_kin_01',
    name: 'Bienvenu Tambwe',
    phone: '+243818811223',
    vehicleType: 'MOTO',
    vehiclePlate: 'KN 8841 MT',
    city: 'Kinshasa',
    status: 'BUSY',
    rating: 4.92,
    activeDeliveriesCount: 1,
  },
  {
    id: 'courier_kin_02',
    name: 'Junior Ilunga',
    phone: '+243891122334',
    vehicleType: 'VAN',
    vehiclePlate: 'KN 3312 BG',
    city: 'Kinshasa',
    status: 'ONLINE',
    rating: 4.85,
    activeDeliveriesCount: 0,
  },
  {
    id: 'courier_kin_03',
    name: 'Serge Kalombo',
    phone: '+243825544332',
    vehicleType: 'MOTO',
    vehiclePlate: 'KN 9021 MT',
    city: 'Kinshasa',
    status: 'ONLINE',
    rating: 4.78,
    activeDeliveriesCount: 0,
  },
  {
    id: 'courier_lub_01',
    name: 'Christian Mwepu',
    phone: '+243851122998',
    vehicleType: 'MOTO',
    vehiclePlate: 'KAT 9102 BC',
    city: 'Lubumbashi',
    status: 'ONLINE',
    rating: 4.88,
    activeDeliveriesCount: 1,
  },
  {
    id: 'courier_gom_01',
    name: 'Kambale Vianney',
    phone: '+243971122889',
    vehicleType: 'MOTO',
    vehiclePlate: 'NK 4410 MZ',
    city: 'Goma',
    status: 'ONLINE',
    rating: 4.9,
    activeDeliveriesCount: 0,
  },
];

const DEFAULT_PRICING: DeliveryPricingTierConfig[] = [
  {
    parcelSize: 'ENVELOPE',
    label: 'Pli / Documents urgents',
    maxWeightKg: 0.5,
    baseFareCDFMinor: 300000, // 3,000 CDF
    perKmCDFMinor: 50000,    // 500 CDF / km
    isAvailable: true,
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    parcelSize: 'SMALL',
    label: 'Petit Colis (< 5 kg)',
    maxWeightKg: 5,
    baseFareCDFMinor: 600000, // 6,000 CDF
    perKmCDFMinor: 100000,   // 1,000 CDF / km
    isAvailable: true,
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    parcelSize: 'MEDIUM',
    label: 'Colis Moyen (5 à 15 kg)',
    maxWeightKg: 15,
    baseFareCDFMinor: 1200000, // 12,000 CDF
    perKmCDFMinor: 180000,    // 1,800 CDF / km
    isAvailable: true,
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    parcelSize: 'LARGE',
    label: 'Grand Colis / Fret Léger (15 à 40 kg)',
    maxWeightKg: 40,
    baseFareCDFMinor: 2500000, // 25,000 CDF
    perKmCDFMinor: 300000,    // 3,000 CDF / km
    isAvailable: true,
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
];

const DEFAULT_PROHIBITED_ITEMS: ProhibitedDeliveryItem[] = [
  {
    id: 'proh_1',
    name: 'Armes à feu, munitions et explosifs pyrotechniques',
    category: 'EXPLOSIFS_ARMES',
    legalNotice: 'Loi n° 04/002 du 15 mars 2004 portant régime des armes et munitions en RDC.',
    isEnforced: true,
    penaltyDescription: 'Saisie immédiate et remise aux autorités judiciaires de la PNC.',
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'proh_2',
    name: 'Stupéfiants, drogues illicites et substances psychotropes',
    category: 'STUPEFIANTS',
    legalNotice: 'Code Pénal Congolais Livre II et convention des Nations Unies de 1988.',
    isEnforced: true,
    penaltyDescription: 'Dénonciation immédiate au parquet et poursuite pénale.',
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'proh_3',
    name: 'Matières corrosives, acides forts et gaz comprimés',
    category: 'PRODUITS_CHIMIQUES',
    legalNotice: 'Arrêté ministériel n°018/CAB/MIN/ENV/2018 relatif aux matières dangereuses.',
    isEnforced: true,
    penaltyDescription: 'Refus de prise en charge et signalement à la direction de la sécurité.',
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'proh_4',
    name: 'Devises physiques non déclarées excédant 10 000 USD ou minerais bruts (Coltan/Or)',
    category: 'VALEURS_DEVISES',
    legalNotice: 'Réglementation du Change de la Banque Centrale du Congo & Traçabilité CEEC.',
    isEnforced: true,
    penaltyDescription: 'Blocage du colis et contrôle par les inspecteurs agréés.',
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
  {
    id: 'proh_5',
    name: 'Espèces de faune sauvage protégées ou trophées d’ivoire',
    category: 'PERISSABLES',
    legalNotice: 'Loi n° 14/003 du 11 février 2014 relative à la conservation de la nature.',
    isEnforced: true,
    penaltyDescription: 'Saisie ICCN et arrestation du détenteur.',
    version: 1,
    updatedAt: '2026-10-30T10:00:00Z',
  },
];

const DEFAULT_DELIVERIES: AdminDeliveryOrder[] = [
  {
    id: 'deliv_1',
    reference: 'TN-DELIV-88201',
    city: 'Kinshasa',
    sender: {
      name: 'Cabinet Maître Kabongo',
      phone: '+243812345678',
      landmarkAddress: 'Immeuble BCDC, Boulevard du 30 Juin, Gombe',
      notes: 'Remettre directement à la réception 2e étage.',
    },
    recipient: {
      name: 'Direction Générale BCC',
      phone: '+243825566778',
      landmarkAddress: 'Banque Centrale du Congo, Boulevard Colonel Tshatshi',
      notes: 'Demander Mme Kalala au service des marchés.',
    },
    parcelSize: 'ENVELOPE',
    parcelDescription: {
      content: 'Dossier contractuel OHADA et copies certifiées conformes',
      declaredValueMinor: 50000000,
      isFragile: false,
    },
    courier: {
      id: 'courier_kin_01',
      name: 'Bienvenu Tambwe',
      phone: '+243818811223',
      vehiclePlate: 'KN 8841 MT',
      vehicleType: 'MOTO',
      rating: 4.92,
    },
    status: 'IN_TRANSIT',
    deliveryPin: '6182',
    fare: {
      baseFareMinor: 300000,
      distanceFareMinor: 250000,
      weightSurchargeMinor: 0,
      totalFareMinor: 550000,
      currency: 'CDF',
      paymentMethod: 'MOMO',
      paymentStatus: 'PAID',
      momoProvider: 'Vodacom M-Pesa',
    },
    timeline: [
      {
        id: 'evt_1',
        timestamp: '2026-10-30T14:30:00Z',
        title: 'Commande de livraison créée',
        description: 'Pli express enregistré par le Cabinet Maître Kabongo.',
        type: 'STATUS_CHANGE',
        actor: 'Expéditeur',
      },
      {
        id: 'evt_2',
        timestamp: '2026-10-30T14:35:00Z',
        title: 'Coursier assigné',
        description: 'Bienvenu Tambwe (Moto KN 8841 MT) a accepté la mission.',
        type: 'ACTION',
        actor: 'Système Dispatch',
      },
      {
        id: 'evt_3',
        timestamp: '2026-10-30T14:48:00Z',
        title: 'Colis récupéré (Picked Up)',
        description: 'Bienvenu Tambwe a pris possession du pli à l’immeuble BCDC.',
        type: 'STATUS_CHANGE',
        actor: 'Bienvenu Tambwe',
      },
    ],
    version: 1,
    createdAt: '2026-10-30T14:30:00Z',
    updatedAt: '2026-10-30T14:48:00Z',
    isDeleted: false,
  },
  {
    id: 'deliv_2',
    reference: 'TN-DELIV-88202',
    city: 'Kinshasa',
    sender: {
      name: 'Laboratoire Biolab Limete',
      phone: '+243998877665',
      landmarkAddress: 'Limete 7ème Rue Résidentiel, n°42',
      notes: 'Colis médical réfrigéré. Ne pas exposer au soleil.',
    },
    recipient: {
      name: 'Clinique Ngaliema',
      phone: '+243817766554',
      landmarkAddress: 'Avenue de la Paix, Ngaliema',
      notes: 'Urgences / Banque de sang.',
    },
    parcelSize: 'SMALL',
    parcelDescription: {
      content: 'Réactifs d’analyses sanguines et flacons sécurisés',
      declaredValueMinor: 18000000,
      isFragile: true,
    },
    courier: {
      id: 'courier_kin_02',
      name: 'Junior Ilunga',
      phone: '+243891122334',
      vehiclePlate: 'KN 3312 BG',
      vehicleType: 'VAN',
      rating: 4.85,
    },
    status: 'ASSIGNED',
    deliveryPin: '9044',
    fare: {
      baseFareMinor: 600000,
      distanceFareMinor: 800000,
      weightSurchargeMinor: 200000,
      totalFareMinor: 1600000,
      currency: 'CDF',
      paymentMethod: 'MOMO',
      paymentStatus: 'PAID',
      momoProvider: 'Airtel Money',
    },
    timeline: [
      {
        id: 'evt_2_1',
        timestamp: '2026-10-30T15:00:00Z',
        title: 'Commande Médicale Créée',
        description: 'Livraison sécurisée avec fourgonnette climatisée demandée.',
        type: 'STATUS_CHANGE',
        actor: 'Expéditeur',
      },
    ],
    version: 1,
    createdAt: '2026-10-30T15:00:00Z',
    updatedAt: '2026-10-30T15:05:00Z',
    isDeleted: false,
  },
  {
    id: 'deliv_3',
    reference: 'TN-DELIV-77102',
    city: 'Lubumbashi',
    sender: {
      name: 'Ateliers Katanga Mining Services',
      phone: '+243851122334',
      landmarkAddress: 'Route Kipushi km 4, Zone Industrielle Lubumbashi',
    },
    recipient: {
      name: 'Société Kamoto Copper (Bureau Liaison)',
      phone: '+243992211001',
      landmarkAddress: 'Avenue Ruwe, Quartier Makomeno, Lubumbashi',
      notes: 'Présenter le bon de livraison n°2026-KMS.',
    },
    parcelSize: 'MEDIUM',
    parcelDescription: {
      content: 'Roulements à billes de précision et joints hydrauliques',
      declaredValueMinor: 75000000,
      isFragile: false,
    },
    courier: {
      id: 'courier_lub_01',
      name: 'Christian Mwepu',
      phone: '+243851122998',
      vehiclePlate: 'KAT 9102 BC',
      vehicleType: 'MOTO',
      rating: 4.88,
    },
    status: 'FAILED_ATTEMPT',
    deliveryPin: '3312',
    failureDetails: {
      reason: 'Destinataire injoignable par téléphone et portail fermé à Makomeno.',
      attemptedAt: '2026-10-30T14:15:00Z',
      actionTaken: 'RETRY',
      notes: 'Second appel prévu après confirmation avec le responsable expéditeur.',
    },
    fare: {
      baseFareMinor: 1200000,
      distanceFareMinor: 600000,
      weightSurchargeMinor: 400000,
      totalFareMinor: 2200000,
      currency: 'CDF',
      paymentMethod: 'CASH',
      paymentStatus: 'PENDING',
    },
    timeline: [
      {
        id: 'evt_3_1',
        timestamp: '2026-10-30T13:30:00Z',
        title: 'Colis en transit',
        description: 'Pris en charge par Christian Mwepu.',
        type: 'STATUS_CHANGE',
        actor: 'Christian Mwepu',
      },
      {
        id: 'evt_3_2',
        timestamp: '2026-10-30T14:15:00Z',
        title: 'Tentative de livraison échouée',
        description: 'Destinataire injoignable par téléphone et portail fermé.',
        type: 'ALERT',
        actor: 'Christian Mwepu',
      },
    ],
    version: 2,
    createdAt: '2026-10-30T13:00:00Z',
    updatedAt: '2026-10-30T14:15:00Z',
    isDeleted: false,
  },
  {
    id: 'deliv_4',
    reference: 'TN-DELIV-66014',
    city: 'Goma',
    sender: {
      name: 'Ets Kivu Tech Solutions',
      phone: '+243971144221',
      landmarkAddress: 'Rond-point Rutshuru, Quartier Les Volcans, Goma',
    },
    recipient: {
      name: 'Mme Esther Bahati',
      phone: '+243990011223',
      landmarkAddress: 'Avenue du Lac, près Hôtel Serena Goma',
    },
    parcelSize: 'SMALL',
    parcelDescription: {
      content: 'Téléphone portable neuf sous scellé et adaptateur',
      declaredValueMinor: 45000000,
      isFragile: true,
    },
    courier: {
      id: 'courier_gom_01',
      name: 'Kambale Vianney',
      phone: '+243971122889',
      vehiclePlate: 'NK 4410 MZ',
      vehicleType: 'MOTO',
      rating: 4.9,
    },
    status: 'DELIVERED',
    deliveryPin: '1109',
    proofOfDelivery: {
      photoUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
      signedPin: '1109',
      verifiedAt: '2026-10-30T12:45:00Z',
      recipientNotes: 'Reçu en main propre en parfait état.',
    },
    fare: {
      baseFareMinor: 600000,
      distanceFareMinor: 300000,
      weightSurchargeMinor: 0,
      totalFareMinor: 900000,
      currency: 'CDF',
      paymentMethod: 'MOMO',
      paymentStatus: 'PAID',
      momoProvider: 'Orange Money',
    },
    timeline: [
      {
        id: 'evt_4_1',
        timestamp: '2026-10-30T12:00:00Z',
        title: 'Commande acceptée',
        description: 'Kambale Vianney a pris en charge le colis.',
        type: 'ACTION',
        actor: 'Système',
      },
      {
        id: 'evt_4_2',
        timestamp: '2026-10-30T12:45:00Z',
        title: 'Colis livré avec succès',
        description: 'Code PIN 1109 validé et photo de réception enregistrée.',
        type: 'STATUS_CHANGE',
        actor: 'Kambale Vianney',
      },
    ],
    version: 2,
    createdAt: '2026-10-30T11:45:00Z',
    updatedAt: '2026-10-30T12:45:00Z',
    isDeleted: false,
  },
];

class DeliveriesStore {
  private deliveries: AdminDeliveryOrder[] = JSON.parse(JSON.stringify(DEFAULT_DELIVERIES));
  private couriers: DeliveryCourier[] = JSON.parse(JSON.stringify(DEFAULT_COURIERS));
  private pricingTiers: DeliveryPricingTierConfig[] = JSON.parse(JSON.stringify(DEFAULT_PRICING));
  private prohibitedItems: ProhibitedDeliveryItem[] = JSON.parse(
    JSON.stringify(DEFAULT_PROHIBITED_ITEMS)
  );

  public reset(): void {
    this.deliveries = JSON.parse(JSON.stringify(DEFAULT_DELIVERIES));
    this.couriers = JSON.parse(JSON.stringify(DEFAULT_COURIERS));
    this.pricingTiers = JSON.parse(JSON.stringify(DEFAULT_PRICING));
    this.prohibitedItems = JSON.parse(JSON.stringify(DEFAULT_PROHIBITED_ITEMS));
  }

  // ==========================================
  // QUERY & CRUD
  // ==========================================

  public queryDeliveries(params: {
    city?: string;
    parcelSize?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeTrash?: boolean;
  }): CrudQueryResult<AdminDeliveryOrder> {
    const {
      city,
      parcelSize,
      status,
      search,
      page = 1,
      limit = 20,
      includeTrash = false,
    } = params;

    let filtered = this.deliveries.filter((d) => (includeTrash ? d.isDeleted : !d.isDeleted));

    if (city && city !== 'ALL') {
      filtered = filtered.filter((d) => d.city.toLowerCase() === city.toLowerCase());
    }

    if (parcelSize && parcelSize !== 'ALL') {
      filtered = filtered.filter((d) => d.parcelSize === parcelSize);
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter((d) => d.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.reference.toLowerCase().includes(q) ||
          d.sender.name.toLowerCase().includes(q) ||
          d.sender.phone.toLowerCase().includes(q) ||
          d.recipient.name.toLowerCase().includes(q) ||
          d.recipient.phone.toLowerCase().includes(q) ||
          (d.courier && d.courier.name.toLowerCase().includes(q)) ||
          (d.courier && d.courier.vehiclePlate.toLowerCase().includes(q)) ||
          d.deliveryPin.includes(q)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public getDeliveryById(id: string): AdminDeliveryOrder | null {
    return this.deliveries.find((d) => d.id === id) || null;
  }

  public getCouriers(city?: string): DeliveryCourier[] {
    let result = this.couriers;
    if (city && city !== 'ALL') {
      result = result.filter((c) => c.city.toLowerCase() === city.toLowerCase());
    }
    return result;
  }

  // ==========================================
  // ACTIONS MÉTIER
  // ==========================================

  public reassignCourier(
    id: string,
    newCourierId: string,
    reason: string,
    adminEmail: string
  ): { success: boolean; delivery?: AdminDeliveryOrder; error?: string } {
    const delivery = this.deliveries.find((d) => d.id === id);
    if (!delivery) {
      return { success: false, error: 'Livraison introuvable.' };
    }

    if (delivery.status === 'DELIVERED' || delivery.status === 'CANCELLED') {
      return {
        success: false,
        error: 'Impossible de réassigner une livraison déjà clôturée ou annulée.',
      };
    }

    const newCourier = this.couriers.find((c) => c.id === newCourierId);
    if (!newCourier) {
      return { success: false, error: 'Nouveau coursier sélectionné introuvable.' };
    }

    const beforeState = JSON.stringify({
      courierId: delivery.courier?.id,
      courierName: delivery.courier?.name,
    });

    // Update old courier count
    if (delivery.courier?.id) {
      const oldCourier = this.couriers.find((c) => c.id === delivery.courier?.id);
      if (oldCourier && oldCourier.activeDeliveriesCount > 0) {
        oldCourier.activeDeliveriesCount -= 1;
      }
    }

    // Assign new courier
    delivery.courier = {
      id: newCourier.id,
      name: newCourier.name,
      phone: newCourier.phone,
      vehiclePlate: newCourier.vehiclePlate,
      vehicleType: newCourier.vehicleType,
      rating: newCourier.rating,
    };
    delivery.status = 'ASSIGNED';
    delivery.version += 1;
    delivery.updatedAt = new Date().toISOString();

    newCourier.activeDeliveriesCount += 1;

    const event: AdminDeliveryTimelineEvent = {
      id: `evt_reassign_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'Réassignation Administrative de Coursier',
      description: `Course de livraison réassignée à ${newCourier.name} (${newCourier.vehiclePlate}). Motif: "${reason}"`,
      type: 'ACTION',
      actor: adminEmail,
    };
    delivery.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'deliveries.reassign',
      target: `Delivery ${delivery.reference}`,
      previousState: beforeState,
      newState: JSON.stringify({
        courierId: newCourier.id,
        courierName: newCourier.name,
        reason,
      }),
      reason,
    });

    return { success: true, delivery };
  }

  public cancelDelivery(
    id: string,
    reason: string,
    adminEmail: string
  ): { success: boolean; delivery?: AdminDeliveryOrder; error?: string } {
    const delivery = this.deliveries.find((d) => d.id === id);
    if (!delivery) {
      return { success: false, error: 'Livraison introuvable.' };
    }

    if (delivery.status === 'DELIVERED') {
      return { success: false, error: 'Impossible d’annuler une livraison déjà livrée.' };
    }

    const beforeState = JSON.stringify({ status: delivery.status });

    delivery.status = 'CANCELLED';
    delivery.version += 1;
    delivery.updatedAt = new Date().toISOString();

    // Release courier
    if (delivery.courier?.id) {
      const courier = this.couriers.find((c) => c.id === delivery.courier?.id);
      if (courier && courier.activeDeliveriesCount > 0) {
        courier.activeDeliveriesCount -= 1;
      }
    }

    const event: AdminDeliveryTimelineEvent = {
      id: `evt_cancel_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'Annulation Administrative',
      description: `Livraison annulée par ${adminEmail}. Motif: "${reason}"`,
      type: 'ALERT',
      actor: adminEmail,
    };
    delivery.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'deliveries.cancel',
      target: `Delivery ${delivery.reference}`,
      previousState: beforeState,
      newState: JSON.stringify({ status: 'CANCELLED', reason }),
      reason,
    });

    return { success: true, delivery };
  }

  public markDelivered(
    id: string,
    reason: string,
    proofPhotoUrl: string | undefined,
    recipientNotes: string | undefined,
    adminEmail: string
  ): { success: boolean; delivery?: AdminDeliveryOrder; error?: string } {
    const delivery = this.deliveries.find((d) => d.id === id);
    if (!delivery) {
      return { success: false, error: 'Livraison introuvable.' };
    }

    if (delivery.status === 'DELIVERED') {
      return { success: false, error: 'Cette livraison est déjà marquée comme livrée.' };
    }

    const beforeState = JSON.stringify({ status: delivery.status });

    delivery.status = 'DELIVERED';
    delivery.proofOfDelivery = {
      photoUrl: proofPhotoUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
      signedPin: delivery.deliveryPin,
      verifiedAt: new Date().toISOString(),
      recipientNotes: recipientNotes || 'Validation manuelle administrative',
      overriddenByAdmin: adminEmail,
      overrideReason: reason,
    };
    delivery.version += 1;
    delivery.updatedAt = new Date().toISOString();

    // Free courier
    if (delivery.courier?.id) {
      const courier = this.couriers.find((c) => c.id === delivery.courier?.id);
      if (courier && courier.activeDeliveriesCount > 0) {
        courier.activeDeliveriesCount -= 1;
      }
    }

    const event: AdminDeliveryTimelineEvent = {
      id: `evt_delivered_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'Clôture Exceptionnelle comme Livré',
      description: `Statut forcé à "DELIVERED" par l’administrateur (${adminEmail}). Motif: "${reason}"`,
      type: 'ACTION',
      actor: adminEmail,
    };
    delivery.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'deliveries.override_delivered',
      target: `Delivery ${delivery.reference}`,
      previousState: beforeState,
      newState: JSON.stringify({ status: 'DELIVERED', reason }),
      reason,
    });

    return { success: true, delivery };
  }

  public handleFailedDelivery(
    id: string,
    failureReason: string,
    action: 'RETRY' | 'RETURN',
    returnFeeMinor: number | undefined,
    notes: string | undefined,
    adminEmail: string
  ): { success: boolean; delivery?: AdminDeliveryOrder; error?: string } {
    const delivery = this.deliveries.find((d) => d.id === id);
    if (!delivery) {
      return { success: false, error: 'Livraison introuvable.' };
    }

    const beforeState = JSON.stringify({
      status: delivery.status,
      returnStatus: delivery.returnStatus,
    });

    delivery.failureDetails = {
      reason: failureReason,
      attemptedAt: new Date().toISOString(),
      actionTaken: action,
      notes,
    };

    if (action === 'RETURN') {
      delivery.status = 'RETURNED_TO_SENDER';
      delivery.returnStatus = 'RETURNED_TO_SENDER';
      delivery.returnFeeMinor = returnFeeMinor || Math.round(delivery.fare.baseFareMinor * 0.5);
    } else {
      delivery.status = 'FAILED_ATTEMPT';
    }

    delivery.version += 1;
    delivery.updatedAt = new Date().toISOString();

    const event: AdminDeliveryTimelineEvent = {
      id: `evt_failed_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: action === 'RETURN' ? 'Colis Retourné à l’Expéditeur' : 'Échec de Livraison Enregistré',
      description: `Motif: "${failureReason}". Décision: ${action === 'RETURN' ? 'Retour expéditeur' : 'Nouvelle tentative programmée'}.${notes ? ` Notes: "${notes}"` : ''}`,
      type: 'ALERT',
      actor: adminEmail,
    };
    delivery.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: action === 'RETURN' ? 'deliveries.return_to_sender' : 'deliveries.fail_attempt',
      target: `Delivery ${delivery.reference}`,
      previousState: beforeState,
      newState: JSON.stringify({
        status: delivery.status,
        action,
        failureReason,
        returnFeeMinor: delivery.returnFeeMinor,
      }),
      reason: failureReason,
    });

    return { success: true, delivery };
  }

  public logContact(
    id: string,
    party: 'SENDER' | 'RECIPIENT' | 'COURIER',
    channel: 'CALL' | 'SMS' | 'WHATSAPP',
    note: string | undefined,
    adminEmail: string
  ): { success: boolean; delivery?: AdminDeliveryOrder } {
    const delivery = this.deliveries.find((d) => d.id === id);
    if (!delivery) {
      return { success: false };
    }

    const partyLabel =
      party === 'SENDER'
        ? 'l’expéditeur'
        : party === 'RECIPIENT'
          ? 'le destinataire'
          : 'le coursier';

    const event: AdminDeliveryTimelineEvent = {
      id: `evt_contact_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: `Contact Régulateur (${party})`,
      description: `Communication ${channel} engagée avec ${partyLabel} par ${adminEmail}.${note ? ` Note: "${note}"` : ''}`,
      type: 'INFO',
      actor: adminEmail,
    };
    delivery.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'deliveries.contact',
      target: `Delivery ${delivery.reference} - ${party}`,
      previousState: '{}',
      newState: JSON.stringify({ channel, note }),
      reason: `Contact avec ${partyLabel} via ${channel}`,
    });

    return { success: true, delivery };
  }

  // ==========================================
  // CONFIGURATION (TARIFS & ARTICLES PROHIBÉS)
  // ==========================================

  public getPricingTiers(): DeliveryPricingTierConfig[] {
    return this.pricingTiers;
  }

  public updatePricingTier(
    data: {
      parcelSize: 'ENVELOPE' | 'SMALL' | 'MEDIUM' | 'LARGE';
      baseFareCDFMinor: number;
      perKmCDFMinor: number;
      maxWeightKg: number;
      isAvailable: boolean;
      reason: string;
    },
    adminEmail: string
  ): { success: boolean; tier?: DeliveryPricingTierConfig; error?: string } {
    const tier = this.pricingTiers.find((t) => t.parcelSize === data.parcelSize);
    if (!tier) {
      return { success: false, error: 'Palier tarifaire introuvable.' };
    }

    const beforeState = JSON.stringify(tier);

    tier.baseFareCDFMinor = data.baseFareCDFMinor;
    tier.perKmCDFMinor = data.perKmCDFMinor;
    tier.maxWeightKg = data.maxWeightKg;
    tier.isAvailable = data.isAvailable;
    tier.version += 1;
    tier.updatedAt = new Date().toISOString();

    logAdminAction({
      adminUser: adminEmail,
      action: 'deliveries.pricing_update',
      target: `Pricing Tier ${data.parcelSize}`,
      previousState: beforeState,
      newState: JSON.stringify(tier),
      reason: data.reason,
    });

    return { success: true, tier };
  }

  public getProhibitedItems(): ProhibitedDeliveryItem[] {
    return this.prohibitedItems;
  }

  public toggleProhibitedItem(
    id: string,
    isEnforced: boolean,
    reason: string,
    adminEmail: string
  ): { success: boolean; item?: ProhibitedDeliveryItem; error?: string } {
    const item = this.prohibitedItems.find((i) => i.id === id);
    if (!item) {
      return { success: false, error: 'Article prohibé introuvable.' };
    }

    const beforeState = JSON.stringify({ isEnforced: item.isEnforced });

    item.isEnforced = isEnforced;
    item.version += 1;
    item.updatedAt = new Date().toISOString();

    logAdminAction({
      adminUser: adminEmail,
      action: 'deliveries.prohibited_toggle',
      target: `Prohibited Item ${item.name}`,
      previousState: beforeState,
      newState: JSON.stringify({ isEnforced }),
      reason,
    });

    return { success: true, item };
  }

  // ==========================================
  // EXPORT CSV
  // ==========================================

  public exportDeliveriesCsv(): string {
    const BOM = '\uFEFF';
    const headers = [
      'Référence',
      'Date Création',
      'Ville',
      'Taille Colis',
      'Description Colis',
      'Expéditeur',
      'Téléphone Expéditeur',
      'Destinataire',
      'Téléphone Destinataire',
      'Coursier',
      'Plaque Coursier',
      'Statut',
      'Code PIN',
      'Tarif Total (CDF)',
      'Mode Paiement',
      'Statut Paiement',
      'Motif Échec / Retour',
    ];

    const rows = this.deliveries.map((d) => [
      `"${d.reference}"`,
      `"${new Date(d.createdAt).toLocaleString('fr-FR')}"`,
      `"${d.city}"`,
      `"${d.parcelSize}"`,
      `"${d.parcelDescription.content.replace(/"/g, '""')}"`,
      `"${d.sender.name.replace(/"/g, '""')}"`,
      `"${d.sender.phone}"`,
      `"${d.recipient.name.replace(/"/g, '""')}"`,
      `"${d.recipient.phone}"`,
      `"${d.courier?.name || 'Non assigné'}"`,
      `"${d.courier?.vehiclePlate || 'N/A'}"`,
      `"${d.status}"`,
      `"${d.deliveryPin}"`,
      `"${(d.fare.totalFareMinor / 100).toLocaleString('fr-FR')}"`,
      `"${d.fare.paymentMethod}"`,
      `"${d.fare.paymentStatus}"`,
      `"${d.failureDetails?.reason || d.returnStatus || 'N/A'}"`,
    ]);

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}

export const deliveriesStore = new DeliveriesStore();

