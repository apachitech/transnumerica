import crypto from 'crypto';
import {
  CityServiceMatrixEntry,
  FeatureFlag,
  ServiceControlSnapshot,
  ServiceMatrixServiceId,
} from '@/types';
import { logAdminAction } from '@/lib/server/admin-store';
import { cityConfigService } from '@/services/city-config';

export const CITIES = [
  { id: 'kinshasa', name: 'Kinshasa' },
  { id: 'lubumbashi', name: 'Lubumbashi' },
  { id: 'kolwezi', name: 'Kolwezi' },
  { id: 'matadi', name: 'Matadi' },
  { id: 'goma', name: 'Goma' },
] as const;

export const SERVICES: { id: ServiceMatrixServiceId; name: string }[] = [
  { id: 'bus', name: 'Bus Interurbain' },
  { id: 'taxi', name: 'Taxi Urbain' },
  { id: 'moto', name: 'Wewa (Moto)' },
  { id: 'delivery', name: 'Moto Express Livraison' },
  { id: 'flights', name: 'Vols Domestiques' },
  { id: 'hotels', name: 'Hôtels & Hébergements' },
  { id: 'train', name: 'Train Urbain & SNCC' },
];

function generateInitialMatrix(): CityServiceMatrixEntry[] {
  const entries: CityServiceMatrixEntry[] = [];
  const now = new Date().toISOString();

  for (const city of CITIES) {
    for (const service of SERVICES) {
      const isKolweziMoto = city.id === 'kolwezi' && service.id === 'moto';
      const isGomaMoto = city.id === 'goma' && service.id === 'moto';
      const isKinshasaMoto = city.id === 'kinshasa' && service.id === 'moto';

      let timeWindow = {
        enabled: false,
        startTime: '05:00',
        endTime: '22:00',
      };

      if (isGomaMoto) {
        timeWindow = {
          enabled: true,
          startTime: '06:00',
          endTime: '19:00', // Couvre-feu militaire à Goma
        };
      }

      let zoneLimits = {
        enabled: false,
        allowedZones: [] as string[],
        restrictedZones: [] as string[],
      };

      if (isKinshasaMoto) {
        zoneLimits = {
          enabled: true,
          allowedZones: ['Kalamu', 'Limete', 'Kasa-Vubu', 'Bandalungwa', 'Ngaliema', 'Kintambo'],
          restrictedZones: ['Gombe - Boulevard du 30 Juin', 'Zone Présidentielle'],
        };
      }

      let suspension = {
        isSuspended: false,
        reason: undefined as string | undefined,
        userMessage: undefined as string | undefined,
        suspendedAt: undefined as string | undefined,
        suspendedBy: undefined as string | undefined,
      };

      if (isKolweziMoto) {
        suspension = {
          isSuspended: true,
          reason: 'Arrêté municipal n°2026/04 : Circulation des mototaxis temporairement suspendue dans le périmètre urbain.',
          userMessage: 'Le service Wewa est temporairement interrompu à Kolwezi en application de l’arrêté municipal n°2026/04. Veuillez privilégier le Taxi Urbain.',
          suspendedAt: '2026-10-01T08:00:00Z',
          suspendedBy: 'Super Admin Transnumerica',
        };
      }

      entries.push({
        id: `${city.id}_${service.id}`,
        cityId: city.id,
        cityName: city.name,
        serviceId: service.id,
        serviceName: service.name,
        enabled: !isKolweziMoto,
        timeWindow,
        zoneLimits,
        suspension,
        version: 1,
        updatedAt: now,
        updatedBy: 'Système Initialisation',
      });
    }
  }

  return entries;
}

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: 'ff_instant_booking',
    key: 'instant_booking',
    name: 'Réservation Instantanée Sans Confirmation Manuelle',
    description: 'Permet aux passagers de confirmer immédiatement un billet d’autocar ou une course sans délai d’attente opérateur.',
    isEnabled: true,
    rolloutPercentage: 100,
    targetCities: [],
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Système Initialisation',
  },
  {
    id: 'ff_cash_on_delivery',
    key: 'cash_on_delivery',
    name: 'Paiement en Espèces au Chauffeur ou au Guichet',
    description: 'Autorise le règlement liquide en Francs Congolais ou USD directement lors de la prise en charge.',
    isEnabled: true,
    rolloutPercentage: 100,
    targetCities: [],
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Système Initialisation',
  },
  {
    id: 'ff_starlink_bus_wifi',
    key: 'starlink_bus_wifi',
    name: 'Option Wi-Fi Starlink Haut Débit à Bord des Autocars',
    description: 'Affichage de l’option passager pour la connexion Internet par satellite Starlink sur les corridors interurbains.',
    isEnabled: true,
    rolloutPercentage: 35,
    targetCities: ['kinshasa', 'matadi'],
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Système Initialisation',
  },
  {
    id: 'ff_sos_emergency_button',
    key: 'sos_emergency_button',
    name: 'Bouton d’Urgence SOS avec Télémétrie Police Nationale',
    description: 'Bouton d’assistance prioritaire 112 dans l’application mobile partageant en direct les coordonnées GPS du véhicule.',
    isEnabled: true,
    rolloutPercentage: 50,
    targetCities: [],
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Système Initialisation',
  },
  {
    id: 'ff_night_rates_multiplier',
    key: 'night_rates_multiplier',
    name: 'Majoration Nocturne Automatique (+20%)',
    description: 'Application d’un supplément tarifaire nocturne pour les courses urbaines entre 22h00 et 05h30.',
    isEnabled: true,
    rolloutPercentage: 100,
    targetCities: ['kinshasa', 'lubumbashi', 'goma'],
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Système Initialisation',
  },
  {
    id: 'ff_driver_tip_momo',
    key: 'driver_tip_momo',
    name: 'Pourboire Chauffeur via Mobile Money',
    description: 'Permet au voyageur d’ajouter un pourboire direct (M-Pesa, Airtel Money, Orange Money) en fin de trajet.',
    isEnabled: true,
    rolloutPercentage: 80,
    targetCities: [],
    version: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Système Initialisation',
  },
];

class ServiceControlStore {
  private matrix: Map<string, CityServiceMatrixEntry> = new Map();
  private flags: Map<string, FeatureFlag> = new Map();
  private snapshots: ServiceControlSnapshot[] = [];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.matrix.clear();
    const initialMatrix = generateInitialMatrix();
    for (const entry of initialMatrix) {
      this.matrix.set(entry.id, entry);
      // Synchronize with cityConfigService
      cityConfigService.toggleService(
        entry.cityId,
        entry.serviceId,
        entry.enabled && !entry.suspension.isSuspended,
        entry.suspension.userMessage || entry.suspension.reason
      );
    }

    this.flags.clear();
    for (const flag of INITIAL_FLAGS) {
      this.flags.set(flag.key, { ...flag });
    }

    this.snapshots = [
      {
        id: `snap_${Date.now()}_initial`,
        timestamp: new Date().toISOString(),
        adminName: 'Système Transnumerica',
        adminEmail: 'superadmin@transnumerica.cd',
        description: 'Instantané de référence initial (configuration par défaut RDC)',
        reason: 'Initialisation automatique du registre de régulation',
        matrix: Array.from(this.matrix.values()).map((m) => ({ ...m })),
        flags: Array.from(this.flags.values()).map((f) => ({ ...f })),
      },
    ];
  }

  private createSnapshot(adminUser: string, description: string, reason: string): ServiceControlSnapshot {
    const snapshot: ServiceControlSnapshot = {
      id: `snap_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
      adminName: adminUser,
      adminEmail: adminUser.includes('@') ? adminUser : `${adminUser.toLowerCase().replace(/\s+/g, '.')}@transnumerica.cd`,
      description,
      reason,
      matrix: Array.from(this.matrix.values()).map((m) => JSON.parse(JSON.stringify(m))),
      flags: Array.from(this.flags.values()).map((f) => JSON.parse(JSON.stringify(f))),
    };

    this.snapshots.unshift(snapshot);
    // Keep last 50 snapshots
    if (this.snapshots.length > 50) {
      this.snapshots = this.snapshots.slice(0, 50);
    }
    return snapshot;
  }

  private syncPublicCityConfig(entry: CityServiceMatrixEntry) {
    const isPubliclyAvailable = entry.enabled && !entry.suspension.isSuspended;
    cityConfigService.toggleService(
      entry.cityId,
      entry.serviceId,
      isPubliclyAvailable,
      entry.suspension.userMessage || entry.suspension.reason
    );
  }

  // ------------------- MATRIX METHODS -------------------

  public getMatrix(): CityServiceMatrixEntry[] {
    return Array.from(this.matrix.values());
  }

  public getMatrixEntry(cityId: string, serviceId: ServiceMatrixServiceId): CityServiceMatrixEntry | undefined {
    return this.matrix.get(`${cityId.toLowerCase()}_${serviceId.toLowerCase()}`);
  }

  public toggleMatrixEntry(
    cityId: string,
    serviceId: ServiceMatrixServiceId,
    enabled: boolean,
    reason: string,
    adminUser: string,
    clientVersion?: number
  ): { success: boolean; entry?: CityServiceMatrixEntry; error?: string; status?: number } {
    const id = `${cityId.toLowerCase()}_${serviceId.toLowerCase()}`;
    const existing = this.matrix.get(id);

    if (!existing) {
      return { success: false, error: 'Combinaison Ville / Service introuvable', status: 404 };
    }

    if (clientVersion !== undefined && existing.version !== clientVersion) {
      return {
        success: false,
        error: `Conflit d’accès concurrent : l'entrée a été modifiée par un autre administrateur (version attendue: ${existing.version}, reçue: ${clientVersion})`,
        status: 409,
      };
    }

    const previousState = existing.enabled ? 'Activé' : 'Désactivé';
    const newState = enabled ? 'Activé' : 'Désactivé';

    const updated: CityServiceMatrixEntry = {
      ...existing,
      enabled,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser,
    };

    this.matrix.set(id, updated);
    this.syncPublicCityConfig(updated);

    const description = `Bascule du service ${updated.serviceName} à ${updated.cityName} : ${previousState} ➔ ${newState}`;
    this.createSnapshot(adminUser, description, reason);

    logAdminAction({
      adminUser,
      action: 'SERVICE_REGULATION_TOGGLE',
      target: `${updated.cityName} - ${updated.serviceName}`,
      previousState,
      newState,
      reason,
    });

    return { success: true, entry: updated };
  }

  public updateMatrixEntry(
    data: {
      cityId: string;
      serviceId: ServiceMatrixServiceId;
      enabled: boolean;
      timeWindow?: { enabled: boolean; startTime: string; endTime: string };
      zoneLimits?: { enabled: boolean; allowedZones: string[]; restrictedZones: string[] };
      reason: string;
      version: number;
    },
    adminUser: string
  ): { success: boolean; entry?: CityServiceMatrixEntry; error?: string; status?: number } {
    const id = `${data.cityId.toLowerCase()}_${data.serviceId.toLowerCase()}`;
    const existing = this.matrix.get(id);

    if (!existing) {
      return { success: false, error: 'Combinaison Ville / Service introuvable', status: 404 };
    }

    if (existing.version !== data.version) {
      return {
        success: false,
        error: `Conflit d’accès concurrent : l'entrée a été modifiée par un autre administrateur (version attendue: ${existing.version}, reçue: ${data.version})`,
        status: 409,
      };
    }

    const previousState = JSON.stringify({
      enabled: existing.enabled,
      timeWindow: existing.timeWindow,
      zoneLimits: existing.zoneLimits,
    });

    const updated: CityServiceMatrixEntry = {
      ...existing,
      enabled: data.enabled,
      timeWindow: data.timeWindow ? { ...data.timeWindow } : existing.timeWindow,
      zoneLimits: data.zoneLimits
        ? {
            enabled: data.zoneLimits.enabled,
            allowedZones: [...data.zoneLimits.allowedZones],
            restrictedZones: [...data.zoneLimits.restrictedZones],
          }
        : existing.zoneLimits,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser,
    };

    this.matrix.set(id, updated);
    this.syncPublicCityConfig(updated);

    const description = `Mise à jour des règles du service ${updated.serviceName} à ${updated.cityName}`;
    this.createSnapshot(adminUser, description, data.reason);

    logAdminAction({
      adminUser,
      action: 'SERVICE_REGULATION_UPDATE',
      target: `${updated.cityName} - ${updated.serviceName}`,
      previousState,
      newState: JSON.stringify({
        enabled: updated.enabled,
        timeWindow: updated.timeWindow,
        zoneLimits: updated.zoneLimits,
      }),
      reason: data.reason,
    });

    return { success: true, entry: updated };
  }

  public suspendService(
    data: {
      cityId: string;
      serviceId: ServiceMatrixServiceId;
      isSuspended: boolean;
      reason: string;
      userMessage: string;
      version: number;
    },
    adminUser: string
  ): { success: boolean; entry?: CityServiceMatrixEntry; error?: string; status?: number } {
    const id = `${data.cityId.toLowerCase()}_${data.serviceId.toLowerCase()}`;
    const existing = this.matrix.get(id);

    if (!existing) {
      return { success: false, error: 'Combinaison Ville / Service introuvable', status: 404 };
    }

    if (existing.version !== data.version) {
      return {
        success: false,
        error: `Conflit d’accès concurrent : version actuelle ${existing.version}, fournie ${data.version}`,
        status: 409,
      };
    }

    const now = new Date().toISOString();
    const updated: CityServiceMatrixEntry = {
      ...existing,
      suspension: {
        isSuspended: data.isSuspended,
        reason: data.isSuspended ? data.reason : undefined,
        userMessage: data.isSuspended ? data.userMessage : undefined,
        suspendedAt: data.isSuspended ? now : undefined,
        suspendedBy: data.isSuspended ? adminUser : undefined,
      },
      version: existing.version + 1,
      updatedAt: now,
      updatedBy: adminUser,
    };

    this.matrix.set(id, updated);
    this.syncPublicCityConfig(updated);

    const action = data.isSuspended ? 'SERVICE_SUSPENSION_URGENCE' : 'SERVICE_LEVEE_SUSPENSION';
    const description = data.isSuspended
      ? `🚨 Suspension d'urgence immédiate du service ${updated.serviceName} à ${updated.cityName}`
      : `✅ Levée de la suspension du service ${updated.serviceName} à ${updated.cityName}`;

    this.createSnapshot(adminUser, description, data.reason);

    logAdminAction({
      adminUser,
      action,
      target: `${updated.cityName} - ${updated.serviceName}`,
      previousState: existing.suspension.isSuspended ? 'Suspendu' : 'Actif',
      newState: data.isSuspended ? `Suspendu: ${data.userMessage}` : 'Actif',
      reason: data.reason,
    });

    return { success: true, entry: updated };
  }

  // ------------------- FEATURE FLAGS METHODS -------------------

  public getFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  public getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  public upsertFlag(
    data: {
      key: string;
      name: string;
      description: string;
      isEnabled: boolean;
      rolloutPercentage: number;
      targetCities: string[];
      version?: number;
      reason: string;
    },
    adminUser: string
  ): { success: boolean; flag?: FeatureFlag; error?: string; status?: number } {
    const existing = this.flags.get(data.key);

    if (existing && data.version !== undefined && existing.version !== data.version) {
      return {
        success: false,
        error: `Conflit de version pour le drapeau ${data.key} (actuelle: ${existing.version}, fournie: ${data.version})`,
        status: 409,
      };
    }

    const now = new Date().toISOString();
    const updated: FeatureFlag = {
      id: existing ? existing.id : `ff_${data.key}`,
      key: data.key,
      name: data.name,
      description: data.description,
      isEnabled: data.isEnabled,
      rolloutPercentage: data.rolloutPercentage,
      targetCities: [...data.targetCities],
      version: existing ? existing.version + 1 : 1,
      updatedAt: now,
      updatedBy: adminUser,
    };

    this.flags.set(data.key, updated);

    const description = existing
      ? `Modification du Feature Flag "${updated.name}" (${updated.rolloutPercentage}%, statut: ${updated.isEnabled ? 'ON' : 'OFF'})`
      : `Création du Feature Flag "${updated.name}"`;

    this.createSnapshot(adminUser, description, data.reason);

    logAdminAction({
      adminUser,
      action: existing ? 'FEATURE_FLAG_UPDATE' : 'FEATURE_FLAG_CREATE',
      target: `Feature Flag: ${updated.key}`,
      previousState: existing ? JSON.stringify(existing) : 'Inexistant',
      newState: JSON.stringify(updated),
      reason: data.reason,
    });

    return { success: true, flag: updated };
  }

  public toggleFlag(
    key: string,
    enabled: boolean,
    reason: string,
    adminUser: string,
    clientVersion?: number
  ): { success: boolean; flag?: FeatureFlag; error?: string; status?: number } {
    const existing = this.flags.get(key);
    if (!existing) {
      return { success: false, error: 'Feature Flag introuvable', status: 404 };
    }

    if (clientVersion !== undefined && existing.version !== clientVersion) {
      return {
        success: false,
        error: `Conflit de version pour le drapeau ${key} (actuelle: ${existing.version}, fournie: ${clientVersion})`,
        status: 409,
      };
    }

    const now = new Date().toISOString();
    const updated: FeatureFlag = {
      ...existing,
      isEnabled: enabled,
      version: existing.version + 1,
      updatedAt: now,
      updatedBy: adminUser,
    };

    this.flags.set(key, updated);

    const description = `Bascule du Feature Flag "${updated.name}" : ${existing.isEnabled ? 'ON' : 'OFF'} ➔ ${enabled ? 'ON' : 'OFF'}`;
    this.createSnapshot(adminUser, description, reason);

    logAdminAction({
      adminUser,
      action: 'FEATURE_FLAG_TOGGLE',
      target: `Feature Flag: ${updated.key}`,
      previousState: existing.isEnabled ? 'Activé' : 'Désactivé',
      newState: enabled ? 'Activé' : 'Désactivé',
      reason,
    });

    return { success: true, flag: updated };
  }

  // ------------------- SNAPSHOTS & ROLLBACK -------------------

  public getSnapshots(): ServiceControlSnapshot[] {
    return [...this.snapshots];
  }

  public rollbackToSnapshot(
    snapshotId: string,
    reason: string,
    adminUser: string
  ): { success: boolean; snapshot?: ServiceControlSnapshot; error?: string; status?: number } {
    const targetSnapshot = this.snapshots.find((s) => s.id === snapshotId);
    if (!targetSnapshot) {
      return { success: false, error: 'Instantané introuvable dans l’historique', status: 404 };
    }

    // Apply matrix from target snapshot
    this.matrix.clear();
    for (const item of targetSnapshot.matrix) {
      const restoredItem = {
        ...item,
        version: item.version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: `${adminUser} (Restauration)`,
      };
      this.matrix.set(restoredItem.id, restoredItem);
      this.syncPublicCityConfig(restoredItem);
    }

    // Apply flags from target snapshot
    this.flags.clear();
    for (const flag of targetSnapshot.flags) {
      const restoredFlag = {
        ...flag,
        version: flag.version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: `${adminUser} (Restauration)`,
      };
      this.flags.set(restoredFlag.key, restoredFlag);
    }

    // Create a new snapshot representing the rollback state
    const rollbackSnapshot = this.createSnapshot(
      adminUser,
      `⏪ Restauration complète vers l'instantané du ${new Date(targetSnapshot.timestamp).toLocaleString('fr-FR')}`,
      reason
    );

    logAdminAction({
      adminUser,
      action: 'SERVICE_CONTROL_ROLLBACK',
      target: `Snapshot: ${snapshotId}`,
      previousState: 'État courant modifié',
      newState: `Restauré depuis l'instantané ${targetSnapshot.id}`,
      reason,
    });

    return { success: true, snapshot: rollbackSnapshot };
  }

  // ------------------- AVAILABILITY & EVALUATION -------------------

  public evaluateServiceStatus(
    cityId: string,
    serviceId: ServiceMatrixServiceId,
    options?: {
      currentTime?: string; // "HH:mm"
      currentZone?: string;
    }
  ): {
    available: boolean;
    reason?: string;
    userMessage?: string;
    code: 'OK' | 'SERVICE_DISABLED' | 'SERVICE_SUSPENDED' | 'OUTSIDE_HOURS' | 'ZONE_RESTRICTED' | 'CITY_NOT_FOUND';
    entry?: CityServiceMatrixEntry;
  } {
    const entry = this.getMatrixEntry(cityId, serviceId);
    if (!entry) {
      return {
        available: false,
        code: 'CITY_NOT_FOUND',
        reason: 'Service non disponible dans cette localité.',
        userMessage: 'Ce service n’est actuellement pas proposé dans cette ville.',
      };
    }

    if (entry.suspension.isSuspended) {
      return {
        available: false,
        code: 'SERVICE_SUSPENDED',
        reason: entry.suspension.reason || 'Service temporairement suspendu par les autorités ou régulateurs.',
        userMessage:
          entry.suspension.userMessage ||
          'Ce service est temporairement suspendu dans votre ville. Nos équipes travaillent pour le rétablir dans les meilleurs délais.',
        entry,
      };
    }

    if (!entry.enabled) {
      return {
        available: false,
        code: 'SERVICE_DISABLED',
        reason: 'Service désactivé dans cette ville.',
        userMessage: `Le service ${entry.serviceName} n'est pas actif pour le moment à ${entry.cityName}.`,
        entry,
      };
    }

    // Check Time Window
    if (entry.timeWindow.enabled) {
      const nowTime =
        options?.currentTime ||
        new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Africa/Kinshasa',
        });

      if (nowTime < entry.timeWindow.startTime || nowTime > entry.timeWindow.endTime) {
        return {
          available: false,
          code: 'OUTSIDE_HOURS',
          reason: `En dehors des plages autorisées (${entry.timeWindow.startTime} - ${entry.timeWindow.endTime})`,
          userMessage: `Ce service fonctionne uniquement entre ${entry.timeWindow.startTime} et ${entry.timeWindow.endTime} à ${entry.cityName}.`,
          entry,
        };
      }
    }

    // Check Zone Limits
    if (entry.zoneLimits.enabled && options?.currentZone) {
      const zone = options.currentZone.toLowerCase();
      const isRestricted = entry.zoneLimits.restrictedZones.some((rz) =>
        rz.toLowerCase().includes(zone) || zone.includes(rz.toLowerCase())
      );
      if (isRestricted) {
        return {
          available: false,
          code: 'ZONE_RESTRICTED',
          reason: `Zone sous restriction (${options.currentZone})`,
          userMessage: `La circulation de ce transport est strictement interdite dans la zone "${options.currentZone}".`,
          entry,
        };
      }

      if (entry.zoneLimits.allowedZones.length > 0) {
        const isAllowed = entry.zoneLimits.allowedZones.some((az) =>
          az.toLowerCase().includes(zone) || zone.includes(az.toLowerCase())
        );
        if (!isAllowed) {
          return {
            available: false,
            code: 'ZONE_RESTRICTED',
            reason: `Zone non autorisée (${options.currentZone})`,
            userMessage: `Ce service n'opère actuellement que dans les périmètres autorisés de ${entry.cityName}.`,
            entry,
          };
        }
      }
    }

    return {
      available: true,
      code: 'OK',
      entry,
    };
  }

  public isFeatureEnabledForUser(
    key: string,
    context?: {
      userId?: string;
      cityId?: string;
    }
  ): boolean {
    const flag = this.flags.get(key);
    if (!flag || !flag.isEnabled) return false;

    // Check target cities if configured
    if (flag.targetCities.length > 0) {
      if (!context?.cityId || !flag.targetCities.map((c) => c.toLowerCase()).includes(context.cityId.toLowerCase())) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;

    // Deterministic hash based on userId or fallback random
    const seed = context?.userId || 'anonymous-guest-user';
    const hash = crypto.createHash('md5').update(`${key}:${seed}`).digest('hex');
    const bucket = parseInt(hash.substring(0, 4), 16) % 100;

    return bucket < flag.rolloutPercentage;
  }
}

export const serviceControlStore = new ServiceControlStore();

