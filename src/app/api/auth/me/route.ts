import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const { user } = data;
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Passager',
        role: user.app_metadata?.role || 'PASSENGER',
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

