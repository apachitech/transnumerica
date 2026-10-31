-- ==============================================================================
-- TRANSNUMERICA — SUPABASE AUTH & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'PASSENGER',
  city TEXT DEFAULT 'Kinshasa',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (combining TO authenticated with ownership predicate)
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 2. AUTOMATIC PROFILE TRIGGER ON SIGNUP / OTP VERIFY
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Passager Transnumerica'),
    COALESCE(NEW.raw_app_meta_data->>'role', 'PASSENGER')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    phone = EXCLUDED.phone,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. STORAGE BUCKETS & POLICIES (KYC & MEDIA)
-- Insert standard buckets if not existing
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('transnumerica-media', 'transnumerica-media', true),
  ('transnumerica-kyc', 'transnumerica-kyc', false),
  ('transnumerica-exports', 'transnumerica-exports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view media
CREATE POLICY "Public media access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'transnumerica-media');

-- Storage RLS: Authenticated users can upload to media and KYC
CREATE POLICY "Authenticated users upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('transnumerica-media', 'transnumerica-kyc'));

-- Storage RLS: KYC documents are private to the driver or admin
CREATE POLICY "Drivers view own KYC files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'transnumerica-kyc'
    AND (
      (SELECT auth.uid())::text = (storage.foldername(name))[1]
      OR (SELECT auth.jwt()->'app_metadata'->>'role') IN ('SUPER_ADMIN', 'ADMIN', 'OPERATIONS')
    )
  );

