-- Supplier/contract record-management permissions.
-- The application limits the editing UI to Admin/Editor roles; these policies allow
-- authenticated application users to perform the corresponding Supabase writes.
-- Run after supplier_directory_schema.sql.

begin;

alter table public.providers enable row level security;
alter table public.provider_contracts enable row level security;
alter table public.provider_contract_schools enable row level security;
alter table public.supplier_contacts enable row level security;

-- Preserve existing policies and add explicit authenticated write policies.
drop policy if exists "Authenticated users can insert providers" on public.providers;
create policy "Authenticated users can insert providers" on public.providers for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update providers" on public.providers;
create policy "Authenticated users can update providers" on public.providers for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can insert provider contracts" on public.provider_contracts;
create policy "Authenticated users can insert provider contracts" on public.provider_contracts for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update provider contracts" on public.provider_contracts;
create policy "Authenticated users can update provider contracts" on public.provider_contracts for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can insert contract schools" on public.provider_contract_schools;
create policy "Authenticated users can insert contract schools" on public.provider_contract_schools for insert to authenticated with check (true);
drop policy if exists "Authenticated users can delete contract schools" on public.provider_contract_schools;
create policy "Authenticated users can delete contract schools" on public.provider_contract_schools for delete to authenticated using (true);

drop policy if exists "Authenticated users can insert supplier contacts" on public.supplier_contacts;
create policy "Authenticated users can insert supplier contacts" on public.supplier_contacts for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update supplier contacts" on public.supplier_contacts;
create policy "Authenticated users can update supplier contacts" on public.supplier_contacts for update to authenticated using (true) with check (true);

grant insert, update on public.providers to authenticated;
grant insert, update on public.provider_contracts to authenticated;
grant insert, delete on public.provider_contract_schools to authenticated;
grant insert, update on public.supplier_contacts to authenticated;

grant usage, select on all sequences in schema public to authenticated;

commit;
