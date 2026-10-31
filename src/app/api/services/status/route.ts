import { NextRequest, NextResponse } from 'next/server';
import { serviceControlStore } from '@/lib/server/service-control-store';
import { ServiceMatrixServiceId } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const service = searchParams.get('service') as ServiceMatrixServiceId | null;
  const zone = searchParams.get('zone') || undefined;

  // Single service evaluation query
  if (city && service) {
    const status = serviceControlStore.evaluateServiceStatus(city, service, {
      currentZone: zone,
    });

    return NextResponse.json(
      {
        city,
        service,
        available: status.available,
        code: status.code,
        reason: status.reason,
        userMessage: status.userMessage,
        entry: status.entry
          ? {
              enabled: status.entry.enabled,
              isSuspended: status.entry.suspension.isSuspended,
              timeWindow: status.entry.timeWindow,
              zoneLimits: status.entry.zoneLimits,
            }
          : undefined,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }

  // Full status query across all cities and services
  const matrix = serviceControlStore.getMatrix();
  const flags = serviceControlStore.getFlags().filter((f) => f.isEnabled);

  const cityMap: Record<
    string,
    Record<
      string,
      {
        available: boolean;
        code: string;
        userMessage?: string;
        timeWindow?: { enabled: boolean; startTime: string; endTime: string };
        zoneLimits?: { enabled: boolean; allowedZones: string[]; restrictedZones: string[] };
      }
    >
  > = {};

  for (const entry of matrix) {
    if (!cityMap[entry.cityId]) {
      cityMap[entry.cityId] = {};
    }

    const evalStatus = serviceControlStore.evaluateServiceStatus(entry.cityId, entry.serviceId);

    cityMap[entry.cityId][entry.serviceId] = {
      available: evalStatus.available,
      code: evalStatus.code,
      userMessage: evalStatus.userMessage,
      timeWindow: entry.timeWindow.enabled ? entry.timeWindow : undefined,
      zoneLimits: entry.zoneLimits.enabled ? entry.zoneLimits : undefined,
    };
  }

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      cities: cityMap,
      flags: flags.map((f) => ({
        key: f.key,
        name: f.name,
        rolloutPercentage: f.rolloutPercentage,
        targetCities: f.targetCities,
      })),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}

