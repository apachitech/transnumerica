import { NextRequest, NextResponse } from 'next/server';
import { getClientIpAndUa } from '@/lib/server/auth-helpers';
import { isIpRecognized, adminStore } from '@/lib/server/admin-store';

export async function GET(req: NextRequest) {
  const { ip, ua } = getClientIpAndUa(req);
  const isAllowed = isIpRecognized(ip, adminStore.ipAllowlist);

  return NextResponse.json({
    ip,
    isRecognized: isAllowed,
    adapter: 'Wi-Fi (Transnumerica Admin)',
    gateway: '192.168.43.1',
    status: isAllowed ? 'AUTHORIZED' : 'RESTRICTED',
    message: isAllowed
      ? `Poste Administrateur reconnu et autorisé (${ip})`
      : `Accès réseau restreint (${ip})`,
  });
}

