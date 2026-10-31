import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const VerifyOtpSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone requis'),
  token: z.string().length(6, 'Le code doit comporter 6 chiffres'),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Données invalides' },
        { status: 400 }
      );
    }

    const { phone, token, name } = parsed.data;
    const supabase = await createClient();

    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isConfigured) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      // Update user display name in Supabase user metadata if provided
      if (name && data.user) {
        await supabase.auth.updateUser({
          data: { full_name: name },
        });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: data.user?.id,
          phone: data.user?.phone,
          name: name || data.user?.user_metadata?.full_name || 'Passager Transnumerica',
          role: data.user?.app_metadata?.role || 'PASSENGER',
        },
        provider: 'SUPABASE_AUTH',
      });
    }

    // Local development acceptance
    if (token === '000000') {
      return NextResponse.json(
        { success: false, error: 'Code de vérification expiré ou erroné.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: `usr-local-${phone.replace(/[^0-9]/g, '')}`,
        phone,
        name: name || 'Patrick Mwamba',
        role: 'PASSENGER',
      },
      provider: 'LOCAL_SIMULATOR',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la vérification OTP' },
      { status: 500 }
    );
  }
}

