-- Add policy for admins to view ALL orders
-- This is necessary for the Admin Dashboard to work correctly
-- Without this, admins can only see their own orders due to the 'Users can view own orders' policy

create policy "Admins can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Add policy for admins to view ALL order items (for detail view)
create policy "Admins can view all order items"
  on public.order_items for select
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Add policy for admins to update orders (e.g. change status)
create policy "Admins can update all orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
