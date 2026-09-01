-- School-level commercial terms for supplier contracts
-- Allows one supplier contract to cover multiple schools while commercial terms
-- (fixed amounts, commission rates, collection and invoicing) vary by school.
-- Safe to rerun.

begin;

alter table public.provider_contract_schools
  add column if not exists commercial_model text,
  add column if not exists fixed_amount numeric,
  add column if not exists commission_rate numeric,
  add column if not exists revenue_collection text,
  add column if not exists invoice_frequency text,
  add column if not exists commercial_terms text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.provider_contract_schools enable row level security;

drop policy if exists "Authenticated users can update contract schools"
  on public.provider_contract_schools;
create policy "Authenticated users can update contract schools"
  on public.provider_contract_schools
  for update
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on public.provider_contract_schools to authenticated;

-- Extend the contract register so the application can read school-specific terms
-- without replacing the existing contract-level fields used by legacy records.
create or replace view public.supplier_contract_school_terms as
select
  pc.id as contract_id,
  pc.provider_id,
  p.name as supplier_name,
  pc.revenue_stream_id,
  rs.code as revenue_stream_code,
  rs.name as revenue_stream_name,
  pc.status,
  pc.start_date,
  pc.expiry_date,
  pc.notice_period,
  pc.is_active,
  pcs.school_id,
  s.code as school_code,
  s.name as school_name,
  coalesce(pcs.commercial_model,
    case
      when pc.rental_fees_amount is not null and pc.commission_rate is not null then 'fixed_plus_commission'
      when pc.rental_fees_amount is not null then 'fixed_amount'
      when pc.commission_rate is not null then 'commission'
      else 'terms_only'
    end
  ) as commercial_model,
  coalesce(pcs.fixed_amount, pc.rental_fees_amount) as fixed_amount,
  coalesce(pcs.commission_rate, pc.commission_rate) as commission_rate,
  coalesce(pcs.revenue_collection, pc.revenue_collection) as revenue_collection,
  coalesce(pcs.invoice_frequency, pc.invoice_frequency) as invoice_frequency,
  coalesce(pcs.commercial_terms, pc.rental_fees_description) as commercial_terms
from public.provider_contracts pc
join public.providers p on p.id = pc.provider_id
left join public.revenue_streams rs on rs.id = pc.revenue_stream_id
join public.provider_contract_schools pcs on pcs.provider_contract_id = pc.id
join public.schools s on s.id = pcs.school_id;

grant select on public.supplier_contract_school_terms to authenticated;

commit;
