import { CityServiceConfig, ServiceType } from '@/types';

// Initial city configurations
export const DEFAULT_CITY_CONFIGS: CityServiceConfig[] = [
  // Kinshasa (All services enabled, Moto restricted in Gombe business center)
  {
    cityId: 'kinshasa',
    cityName: 'Kinshasa',
    service: 'bus',
    enabled: true,
  },
  {
    cityId: 'kinshasa',
    cityName: 'Kinshasa',
    service: 'taxi',
    enabled: true,
    nightSurchargePercent: 20,
  },
  {
    cityId: 'kinshasa',
    cityName: 'Kinshasa',
    service: 'moto',
    enabled: true,
    activeFrom: '05:30',
    activeTo: '21:30',
    restrictedZones: ['Gombe - Boulevard du 30 Juin', 'Zone Présidentielle'],
    nightSurchargePercent: 15,
  },
  {
    cityId: 'kinshasa',
    cityName: 'Kinshasa',
    service: 'delivery',
    enabled: true,
  },
  {
    cityId: 'kinshasa',
    cityName: 'Kinshasa',
    service: 'flights',
    enabled: true,
  },
  {
    cityId: 'kinshasa',
    cityName: 'Kinshasa',
    service: 'hotels',
    enabled: true,
  },
  {
    cityId: 'kinshasa',
    cityName: 'Kinshasa',
    service: 'train',
    enabled: true,
  },

  // Matadi
  {
    cityId: 'matadi',
    cityName: 'Matadi',
    service: 'bus',
    enabled: true,
  },
  {
    cityId: 'matadi',
    cityName: 'Matadi',
    service: 'taxi',
    enabled: true,
  },
  {
    cityId: 'matadi',
    cityName: 'Matadi',
    service: 'moto',
    enabled: true,
  },
  {
    cityId: 'matadi',
    cityName: 'Matadi',
    service: 'delivery',
    enabled: true,
  },

  // Lubumbashi
  {
    cityId: 'lubumbashi',
    cityName: 'Lubumbashi',
    service: 'bus',
    enabled: true,
  },
  {
    cityId: 'lubumbashi',
    cityName: 'Lubumbashi',
    service: 'taxi',
    enabled: true,
  },
  {
    cityId: 'lubumbashi',
    cityName: 'Lubumbashi',
    service: 'moto',
    enabled: true,
  },
  {
    cityId: 'lubumbashi',
    cityName: 'Lubumbashi',
    service: 'delivery',
    enabled: true,
  },

  // Kolwezi (Moto temporarily suspended due to local municipal road ordinance)
  {
    cityId: 'kolwezi',
    cityName: 'Kolwezi',
    service: 'bus',
    enabled: true,
  },
  {
    cityId: 'kolwezi',
    cityName: 'Kolwezi',
    service: 'taxi',
    enabled: true,
  },
  {
    cityId: 'kolwezi',
    cityName: 'Kolwezi',
    service: 'moto',
    enabled: false,
    reasonDisabled: 'Arrêté municipal n°2026/04 : Circulation des mototaxis temporairement suspendue dans le périmètre urbain.',
  },
  {
    cityId: 'kolwezi',
    cityName: 'Kolwezi',
    service: 'delivery',
    enabled: true,
  },

  // Goma
  {
    cityId: 'goma',
    cityName: 'Goma',
    service: 'bus',
    enabled: true,
  },
  {
    cityId: 'goma',
    cityName: 'Goma',
    service: 'taxi',
    enabled: true,
  },
  {
    cityId: 'goma',
    cityName: 'Goma',
    service: 'moto',
    enabled: true,
    activeFrom: '06:00',
    activeTo: '19:00', // curfew restrictions
    reasonDisabled: 'Circulation des motos limitée à 19h00 selon décision du gouvernorat militaire.',
  },
  {
    cityId: 'goma',
    cityName: 'Goma',
    service: 'delivery',
    enabled: true,
  },
];

class CityConfigStore {
  private configs: CityServiceConfig[] = [...DEFAULT_CITY_CONFIGS];

  public getAll(): CityServiceConfig[] {
    return this.configs;
  }

  public getForCity(cityId: string): CityServiceConfig[] {
    return this.configs.filter(
      (c) => c.cityId.toLowerCase() === cityId.toLowerCase()
    );
  }

  public getConfig(cityId: string, service: ServiceType): CityServiceConfig | undefined {
    return this.configs.find(
      (c) =>
        c.cityId.toLowerCase() === cityId.toLowerCase() &&
        c.service.toLowerCase() === service.toLowerCase()
    );
  }

  public isServiceAvailable(cityId: string, service: ServiceType): {
    available: boolean;
    reason?: string;
    config?: CityServiceConfig;
  } {
    const config = this.getConfig(cityId, service);
    if (!config) {
      return { available: false, reason: 'Ce service n\'est pas encore déployé dans cette ville.' };
    }
    if (!config.enabled) {
      return {
        available: false,
        reason: config.reasonDisabled || 'Ce service est temporairement suspendu par les autorités locales.',
        config,
      };
    }
    return { available: true, config };
  }

  public toggleService(cityId: string, service: ServiceType, enabled: boolean, reason?: string) {
    const idx = this.configs.findIndex(
      (c) =>
        c.cityId.toLowerCase() === cityId.toLowerCase() &&
        c.service.toLowerCase() === service.toLowerCase()
    );
    if (idx !== -1) {
      this.configs[idx] = {
        ...this.configs[idx],
        enabled,
        reasonDisabled: enabled ? undefined : (reason || 'Service désactivé par l\'administrateur.'),
      };
    } else {
      this.configs.push({
        cityId,
        cityName: cityId.charAt(0).toUpperCase() + cityId.slice(1),
        service,
        enabled,
        reasonDisabled: reason,
      });
    }
  }
}

export const cityConfigService = new CityConfigStore();
