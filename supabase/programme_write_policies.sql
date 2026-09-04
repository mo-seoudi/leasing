-- Programme master-data permissions for the Records workspace.
-- The application exposes programme editing only to Admin/Editor roles.
-- Supabase RLS still requires explicit authenticated write access for the browser client.

begin;

alter table public.programmes enable row level security;

drop policy if exists "Authenticated users can read programmes" on public.programmes;
create policy "Authenticated users can read programmes"
on public.programmes
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert programmes" on public.programmes;
create policy "Authenticated users can insert programmes"
on public.programmes
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update programmes" on public.programmes;
create policy "Authenticated users can update programmes"
on public.programmes
for update
to authenticated
using (true)
with check (true);

grant select, insert, update on public.programmes to authenticated;
grant usage, select on all sequences in schema public to authenticated;

commit;
