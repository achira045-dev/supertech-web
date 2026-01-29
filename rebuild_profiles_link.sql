-- ==========================================
-- REBUILD PROFILES LINKAGE
-- This script refactors the profiles table to "hard link" with the address table
-- and ensures data is synchronized.
-- ==========================================

-- 1. Ensure the 'address' table logic is correct (RLS & Keys)
ALTER TABLE public.address ENABLE ROW LEVEL SECURITY;

-- Allow Admins to see all addresses (Crucial for Dashboard)
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.address;
CREATE POLICY "Admins can view all addresses" ON public.address FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. Add 'address_id' to Profiles (The "Link")
-- This creates a direct Foreign Key connection to the specific address row
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address_id bigint REFERENCES public.address(id);

-- 3. SYNC DATA: Auto-link existing profiles to their most recent address
-- This fixes the issue where profiles have NULL addresses even if they have address data
UPDATE public.profiles
SET address_id = (
  SELECT id FROM public.address
  WHERE user_id = public.profiles.id
  ORDER BY created_at DESC
  LIMIT 1
);

-- 4. Also Sync the TEXT address for easier display (Optional but recommended)
UPDATE public.profiles
SET address = (
  SELECT 
    COALESCE(address, '') || ' ' || COALESCE(sub_district, '') || ' ' || COALESCE(district, '') || ' ' || COALESCE(province, '') || ' ' || COALESCE(zipcode, '')
  FROM public.address
  WHERE id = public.profiles.address_id
)
WHERE address_id IS NOT NULL;

-- 5. Create a Trigger to KEEP them linked automatically
-- Whenever a user adds a new address, update their profile to point to it
CREATE OR REPLACE FUNCTION public.sync_profile_address()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile's address_id to the new address
  UPDATE public.profiles
  SET 
    address_id = NEW.id,
    address = COALESCE(NEW.address, '') || ' ' || COALESCE(NEW.province, '') || ' ' || COALESCE(NEW.zipcode, '')
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_address_added ON public.address;
CREATE TRIGGER on_address_added
AFTER INSERT ON public.address
FOR EACH ROW EXECUTE PROCEDURE public.sync_profile_address();

-- 6. Grant permissions just in case
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.address TO authenticated;
GRANT ALL ON public.address TO service_role;
