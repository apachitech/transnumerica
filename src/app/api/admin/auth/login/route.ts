import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  attemptAdminLogin,
  ADMIN_SESSION_COOKIE_NAME,
  SESSION_IDLE_TIMEOUT_MS,
} from '@/lib/server/admin-store';
import { getClientIpAndUa } from '@/lib/server/auth-helpers';

const LoginSchema = z.object({
  identifier: z.string().min(3, 'Identifiant requis'),
  password: z.string().min(4, 'Mot de passe requis'),
  totpCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Données invalides' },
        { status: 400 }
      );
    }

    const { identifier, password, totpCode } = parsed.data;
    const { ip, ua } = getClientIpAndUa(req);

    const result = attemptAdminLogin(identifier, password, totpCode, ip, ua);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          requires2FA: result.requires2FA,
        },
        { status: result.requires2FA ? 200 : 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      session: {
        adminId: result.session?.adminId,
        name: result.session?.name,
        email: result.session?.email,
        role: result.session?.role,
        permissions: result.session?.permissions,
        expiresAt: result.session?.expiresAt,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE_NAME,
      value: result.sessionToken!,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Math.floor(SESSION_IDLE_TIMEOUT_MS / 1000),
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Une erreur interne est survenue.' },
      { status: 500 }
    );
  }
}

