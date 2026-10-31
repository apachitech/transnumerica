import { z } from 'zod';

export const BookingPassengerInputSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet du passager est requis'),
  phone: z.string().min(6, 'Numéro de téléphone requis'),
  idNumber: z.string().optional(),
  seatNumber: z.string().min(1, 'Numéro de siège requis'),
  fareMinor: z.number().int().positive('Le tarif doit être positif'),
});

export const ManualBookingCreateSchema = z.object({
  customerName: z.string().min(2, 'Le nom du client est requis'),
  customerPhone: z.string().min(6, 'Numéro de téléphone requis (ex: +243810000000)'),
  customerEmail: z.string().email('Format email invalide').optional().or(z.literal('')),
  routeId: z.string().min(1, 'Itinéraire requis'),
  corridorCode: z.string().default('KIN-MAT'),
  originCity: z.string().min(1, 'Ville de départ requise'),
  destinationCity: z.string().min(1, 'Ville de destination requise'),
  boardingStation: z.string().min(1, 'Gare d’embarquement requise'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis'),
  departureTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:mm requis'),
  operatorId: z.string().min(1, 'Opérateur requis'),
  operatorName: z.string().min(1, 'Nom de l’opérateur requis'),
  busPlateNumber: z.string().min(1, 'Numéro de plaque requis'),
  comfortClass: z.string().default('VIP'),
  passengers: z.array(BookingPassengerInputSchema).min(1, 'Au moins un passager est requis'),
  currency: z.enum(['CDF', 'USD']).default('CDF'),
  paymentMethod: z.enum(['Vodacom M-Pesa', 'Orange Money', 'Airtel Money', 'Espèces (Guichet)', 'Carte Bancaire']),
  notes: z.string().optional(),
});

export const UpdatePassengerDetailsSchema = z.object({
  passengerId: z.string().min(1, 'Identifiant passager requis'),
  fullName: z.string().min(2, 'Le nom complet est obligatoire'),
  phone: z.string().min(6, 'Numéro de téléphone requis'),
  idNumber: z.string().optional(),
  reason: z.string().min(3, 'Le motif de modification est requis'),
  version: z.number().int().nonnegative('Version invalide'),
});

export const MoveSeatSchema = z.object({
  passengerId: z.string().min(1, 'Identifiant passager requis'),
  newSeatNumber: z.string().min(1, 'Nouveau numéro de siège requis'),
  reason: z.string().min(3, 'Le motif de changement de siège est obligatoire'),
  version: z.number().int().nonnegative('Version invalide'),
});

export const RescheduleBookingSchema = z.object({
  newDepartureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis'),
  newDepartureTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:mm requis'),
  newBusPlateNumber: z.string().optional(),
  fareDifferenceMinor: z.number().int().default(0),
  reason: z.string().min(5, 'Le motif de report de date est obligatoire'),
  version: z.number().int().nonnegative('Version invalide'),
});

export const CancelBookingSchema = z.object({
  passengerId: z.string().optional(), // if provided: partial cancellation
  reason: z.string().min(5, 'Le motif d’annulation est obligatoire (min 5 caractères)'),
  refundMode: z.enum(['FULL_REFUND', 'PARTIAL_REFUND', 'NO_REFUND', 'VOUCHER']).default('FULL_REFUND'),
  version: z.number().int().nonnegative('Version invalide'),
});

export const ResendTicketSchema = z.object({
  channel: z.enum(['SMS', 'WHATSAPP', 'EMAIL']),
  recipient: z.string().min(5, 'Destinataire requis'),
  reason: z.string().min(3, 'Motif d’envoi requis'),
});

export const VerifyTicketSchema = z.object({
  code: z.string().min(3, 'Code de billet, référence ou jeton requis'),
});

export const MarkTicketUsedSchema = z.object({
  ticketNumber: z.string().optional(),
  notes: z.string().optional(),
  version: z.number().int().nonnegative('Version invalide'),
});

export const BookingRefundSchema = z.object({
  amountMinor: z.number().int().positive('Le montant à rembourser doit être supérieur à 0'),
  reason: z.string().min(5, 'Le motif de remboursement est obligatoire'),
  version: z.number().int().nonnegative('Version invalide'),
});

