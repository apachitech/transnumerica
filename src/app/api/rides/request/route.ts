import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { serviceControlStore } from '@/lib/server/service-control-store';
import { ServiceMatrixServiceId } from '@/types';

const CreateRideRequestSchema = z.object({
  city: z.string().min(1, 'Ville requise'),
  serviceType: z.string().min(1, 'Type de transport requis'),
  passengerName: z.string().min(2, 'Nom du passager requis'),
  passengerPhone: z.string().min(6, 'Numéro de téléphone requis'),
  pickupLocation: z.string().min(2, 'Lieu de prise en charge requis'),
  dropoffLocation: z.string().min(2, 'Lieu de destination requis'),
  zone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateRideRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de réservation incomplètes', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { city, serviceType, passengerName, passengerPhone, pickupLocation, dropoffLocation, zone } =
      parsed.data;

    const normalizedService = serviceType.toLowerCase() as ServiceMatrixServiceId;

    // Server-side Service Control Gate Check
    const evaluation = serviceControlStore.evaluateServiceStatus(city, normalizedService, {
      currentZone: zone || pickupLocation,
    });

    if (!evaluation.available) {
      return NextResponse.json(
        {
          success: false,
          error: evaluation.code,
          message: evaluation.userMessage || evaluation.reason,
          details: {
            city,
            service: normalizedService,
            reason: evaluation.reason,
          },
        },
        { status: 422 } // Unprocessable Entity due to administrative regulation
      );
    }

    // Service is active and authorized
    const rideId = `ride_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      rideId,
      status: 'CONFIRMED',
      city,
      serviceType: normalizedService,
      passengerName,
      passengerPhone,
      pickupLocation,
      dropoffLocation,
      message: 'Demande de course enregistrée avec succès.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne lors de la réservation' }, { status: 500 });
  }
}

