import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const RequestOtpSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  channel: z.enum(['sms', 'whatsapp']).default('sms'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Données invalides' },
        { status: 400 }
      );
    }

    const { phone, channel } = parsed.data;
    const supabase = await createClient();

    // Check if Supabase is configured with real credentials
    const isConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isConfigured) {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        },
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Code de vérification envoyé par ${channel.toUpperCase()} au ${phone}`,
        provider: 'SUPABASE_AUTH',
      });
    }

    // Local development / fallback simulation
    return NextResponse.json({
      success: true,
      message: `Code de simulation envoyé au ${phone} (Environnement local: utilisez '123456')`,
      provider: 'LOCAL_SIMULATOR',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la requête OTP' },
      { status: 500 }
    );
  }
}

