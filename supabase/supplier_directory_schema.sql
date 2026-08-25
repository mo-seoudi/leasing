-- Supplier & Contract Register schema extension
-- Keeps Leasing programme/provider usage intact while allowing cross-stream contracts.

begin;

alter table public.provider_contracts
  add column if not exists revenue_stream_id bigint
    references public.revenue_streams(id) on delete restrict;

create index if not exists idx_provider_contracts_revenue_stream_id
  on public.provider_contracts(revenue_stream_id);

-- Existing provider contracts were created from the Leasing provider directory.
-- Backfill only rows that do not already have a stream assigned.
update public.provider_contracts pc
set revenue_stream_id = rs.id
from public.revenue_streams rs
where rs.code = 'leasing'
  and pc.revenue_stream_id is null;

-- Readable register view. One row represents one contract relationship;
-- schools remain a many-to-many list via provider_contract_schools.
create or replace view public.supplier_contract_register as
select
  pc.id as contract_id,
  p.id as provider_id,
  p.name as supplier_name,
  p.contact_person,
  p.email,
  p.phone,
  p.company_number,
  p.address,
  rs.id as revenue_stream_id,
  rs.code as revenue_stream_code,
  rs.name as revenue_stream_name,
  pc.status,
  pc.start_date,
  pc.expiry_date,
  pc.notice_period,
  pc.commission_rate,
  pc.rental_fees_amount,
  pc.rental_fees_description,
  pc.revenue_collection,
  pc.invoice_frequency,
  pc.is_active,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'code', s.code,
        'name', s.name
      ) order by s.name
    ) filter (where s.id is not null),
    '[]'::jsonb
  ) as schools
from public.provider_contracts pc
join public.providers p on p.id = pc.provider_id
left join public.revenue_streams rs on rs.id = pc.revenue_stream_id
left join public.provider_contract_schools pcs on pcs.provider_contract_id = pc.id
left join public.schools s on s.id = pcs.school_id
group by
  pc.id,
  p.id,
  p.name,
  p.contact_person,
  p.email,
  p.phone,
  p.company_number,
  p.address,
  rs.id,
  rs.code,
  rs.name,
  pc.status,
  pc.start_date,
  pc.expiry_date,
  pc.notice_period,
  pc.commission_rate,
  pc.rental_fees_amount,
  pc.rental_fees_description,
  pc.revenue_collection,
  pc.invoice_frequency,
  pc.is_active;

grant select on public.supplier_contract_register to authenticated;

commit;
