-- Fix permissions for 'address' (singular) table
-- The user has a table named 'address', not 'addresses'
alter table public.address enable row level security;

create policy "Admins can view all address data"
  on public.address for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
