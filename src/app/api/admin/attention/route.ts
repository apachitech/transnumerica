import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getAdminKycQueue, getAdminDisputes } from '@/lib/server/admin-store';

export interface AttentionItem {
  id: string;
  type: 'KYC_PENDING' | 'OPEN_DISPUTE' | 'FAILED_PAYMENT' | 'SOS_ALERT';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  href: string;
  actionLabel: string;
}

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const items: AttentionItem[] = [];

  // 1. Pending KYC
  const kyc = getAdminKycQueue().filter((k) => k.status === 'PENDING');
  kyc.forEach((k) => {
    items.push({
      id: `att-kyc-${k.id}`,
      type: 'KYC_PENDING',
      title: `Vérification requise : ${k.applicantName}`,
      description: `Dossier ${k.type} (${k.vehiclePlate || k.companyName || 'Indépendant'}) en attente d'approbation documentaire.`,
      severity: 'MEDIUM',
      timestamp: k.appliedAt,
      href: '/admin/drivers',
      actionLabel: 'Examiner le dossier',
    });
  });

  // 2. Open Disputes
  const disputes = getAdminDisputes().filter((d) => d.status === 'OPEN');
  disputes.forEach((d) => {
    items.push({
      id: `att-disp-${d.id}`,
      type: 'OPEN_DISPUTE',
      title: `Litige ouvert #${d.ticketNumber} : ${d.passengerName}`,
      description: `${d.title} • Montant contesté : ${(d.amountInDisputeMinor / 100).toLocaleString('fr-FR')} CDF`,
      severity: 'HIGH',
      timestamp: d.createdAt,
      href: '/admin/disputes',
      actionLabel: 'Résoudre le litige',
    });
  });

  // 3. Simulated Failed Mobile Money Payments (high friction in DR Congo)
  items.push({
    id: 'att-pay-fail-01',
    type: 'FAILED_PAYMENT',
    title: 'Échec Webhook M-Pesa (Timeout réseau)',
    description: 'Transaction #TX-9842 (35 000 CDF) en attente de confirmation Vodacom depuis 18 min.',
    severity: 'HIGH',
    timestamp: 'Il y a 18 min',
    href: '/admin/payments',
    actionLabel: 'Relancer la vérification',
  });

  // 4. SOS Emergency Alert (simulated critical event)
  items.push({
    id: 'att-sos-01',
    type: 'SOS_ALERT',
    title: 'Alerte SOS Chauffeur : Axe N1 Matadi (km 42)',
    description: 'Bouton détresse activé par Chauffeur Dieudonné K. (Course #RIDE-4982). Géolocalisation active.',
    severity: 'CRITICAL',
    timestamp: 'Il y a 6 min',
    href: '/admin/bookings',
    actionLabel: 'Voir le direct SOS',
  });

  return NextResponse.json({
    items,
    totalCount: items.length,
    criticalCount: items.filter((i) => i.severity === 'CRITICAL').length,
    highCount: items.filter((i) => i.severity === 'HIGH').length,
  });
}
