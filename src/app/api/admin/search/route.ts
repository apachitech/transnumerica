import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getAdminUsersList,
  getAdminKycQueue,
  getAdminDisputes,
} from '@/lib/server/admin-store';
import { corridorsRepository } from '@/lib/server/corridors-store';

export interface AdminSearchResult {
  id: string;
  type: 'user' | 'driver' | 'booking' | 'dispute' | 'corridor' | 'payment';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  href: string;
}

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: AdminSearchResult[] = [];

  // 1. Search Users / Admins
  const users = getAdminUsersList();
  for (const user of users) {
    if (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.id.toLowerCase().includes(q)
    ) {
      results.push({
        id: user.id,
        type: 'user',
        title: user.name,
        subtitle: `${user.email} • ${user.phone} (${user.role})`,
        badge: user.role,
        badgeColor: user.role === 'SUPER_ADMIN' ? 'bg-purple-900/50 text-purple-300' : 'bg-emerald-900/50 text-emerald-300',
        href: '/admin/users',
      });
    }
  }

  // 2. Search KYC / Drivers
  const kyc = getAdminKycQueue();
  for (const item of kyc) {
    if (
      item.applicantName.toLowerCase().includes(q) ||
      item.phone.includes(q) ||
      item.vehiclePlate?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    ) {
      results.push({
        id: item.id,
        type: 'driver',
        title: item.applicantName,
        subtitle: `${item.type} • ${item.phone} ${item.vehiclePlate ? `[${item.vehiclePlate}]` : ''}`,
        badge: item.status,
        badgeColor: item.status === 'PENDING' ? 'bg-amber-900/50 text-amber-300' : 'bg-emerald-900/50 text-emerald-300',
        href: '/admin/drivers',
      });
    }
  }

  // 3. Search Disputes
  const disputes = getAdminDisputes();
  for (const dispute of disputes) {
    if (
      dispute.id.toLowerCase().includes(q) ||
      dispute.ticketNumber.toLowerCase().includes(q) ||
      dispute.passengerName.toLowerCase().includes(q) ||
      dispute.driverOrOperatorName.toLowerCase().includes(q) ||
      dispute.title.toLowerCase().includes(q)
    ) {
      results.push({
        id: dispute.id,
        type: 'dispute',
        title: `Litige ${dispute.ticketNumber} : ${dispute.title}`,
        subtitle: `${dispute.passengerName} vs ${dispute.driverOrOperatorName} • ${(dispute.amountInDisputeMinor / 100).toLocaleString('fr-FR')} CDF`,
        badge: dispute.status,
        badgeColor: dispute.status === 'OPEN' ? 'bg-red-900/50 text-red-300' : 'bg-neutral-800 text-neutral-300',
        href: '/admin/disputes',
      });
    }
  }

  // 4. Search Corridors
  const { data: corridors } = await corridorsRepository.findMany({ search: q, limit: 10 });
  for (const corridor of corridors) {
    results.push({
      id: corridor.id,
      type: 'corridor',
      title: `${corridor.code} : ${corridor.originCity} → ${corridor.destinationCity}`,
      subtitle: `${corridor.distanceKm} km • ${corridor.basePriceCdf.toLocaleString('fr-FR')} CDF • ${corridor.operatorCount} opérateurs`,
      badge: corridor.status,
      badgeColor: corridor.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/50 text-amber-300',
      href: '/admin/corridors',
    });
  }

  // 5. Common mock bookings / payments matching search
  if ('kin-mat'.includes(q) || 'bkg-'.includes(q) || 'tn-'.includes(q) || 'orange'.includes(q) || 'airtel'.includes(q) || '081'.includes(q)) {
    results.push({
      id: 'bkg-kin-mat-9921',
      type: 'booking',
      title: 'Réservation #BKG-9921 (Kinshasa → Matadi)',
      subtitle: 'Passager: Bienvenu Ilunga • VIP • 45 000 CDF • Confirmé',
      badge: 'CONFIRMÉ',
      badgeColor: 'bg-emerald-900/50 text-emerald-300',
      href: '/admin/bookings',
    });
    results.push({
      id: 'pay-om-7729',
      type: 'payment',
      title: 'Paiement #PAY-7729 via Orange Money',
      subtitle: 'Réf Telco: OM-243-98231 • 45 000 CDF • Succès',
      badge: 'CAPTÉ',
      badgeColor: 'bg-emerald-900/50 text-emerald-300',
      href: '/admin/payments',
    });
  }

  return NextResponse.json({ results: results.slice(0, 15) });
}
