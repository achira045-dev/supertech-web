-- Improvements to Schema Relations based on feedback
-- 1. Add 'address_id' to Orders: Links an order to a specific address record
-- 2. Add 'primary_address_id' to Profiles: Links a profile to a specific main address record

-- 1. Update Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS address_id bigint REFERENCES public.addresses(id);

-- 2. Update Profiles Table
-- distinct from the 'address' text column, this is a hard link
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS primary_address_id bigint REFERENCES public.addresses(id);

-- 3. (Optional) Backfill Orders address_id
-- Try to find an address that matches the text, or just default to the user's default address for past orders (imperfect but helpful)
UPDATE public.orders
SET address_id = (
  SELECT id FROM public.addresses 
  WHERE user_id = public.orders.user_id 
  ORDER BY is_default DESC, created_at DESC 
  LIMIT 1
)
WHERE address_id IS NULL;

-- 4. (Optional) Backfill Profiles primary_address_id
UPDATE public.profiles
SET primary_address_id = (
  SELECT id FROM public.addresses 
  WHERE user_id = public.profiles.id 
  ORDER BY is_default DESC, created_at DESC 
  LIMIT 1
)
WHERE primary_address_id IS NULL;
