-- 1. Fix Permissions: Allow Admin to view ALL addresses from the 'addresses' table
-- This allows the dashboard code (which joins tables) to actually see the data.
create policy "Admins can view all addresses"
  on public.addresses for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 2. Data Sync (Optional but requested): Copy address data from 'addresses' table to 'profiles' table
-- This ensures 'profiles.address' is not NULL, acting as a fallback or snapshot.
UPDATE public.profiles
SET address = sub.full_address
FROM (
  SELECT 
    user_id,
    TRIM(
      COALESCE(address, '') || ' ' || 
      COALESCE(district, '') || ' ' || 
      COALESCE(province, '') || ' ' || 
      COALESCE(zipcode, '')
    ) as full_address
  FROM public.addresses
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY is_default DESC, created_at DESC) as rn
      FROM public.addresses
    ) t WHERE t.rn = 1
  )
) sub
WHERE profiles.id = sub.user_id;
