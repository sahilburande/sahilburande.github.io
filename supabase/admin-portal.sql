-- Permit only the verified Supabase Auth account for Sahil to read visitor IPs.
grant select on table public.visitor_visits to authenticated;

drop policy if exists "Only Sahil can read visitor IPs" on public.visitor_visits;
create policy "Only Sahil can read visitor IPs"
  on public.visitor_visits
  for select
  to authenticated
  using (
    lower((select auth.jwt() ->> 'email')) = 'sahilburande@gmail.com'
  );
