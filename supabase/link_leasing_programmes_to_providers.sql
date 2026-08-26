-- Canonically link Leasing programmes to the shared supplier/provider master.
-- Run this once in Supabase SQL Editor before deploying the matching frontend/view changes.
-- Existing provider_name is intentionally retained for backwards compatibility during migration.

begin;

alter table public.programmes
  add column if not exists provider_id bigint
    references public.providers(id) on delete set null;

create index if not exists idx_programmes_provider_id
  on public.programmes(provider_id);

-- Backfill exact display-name matches first.
update public.programmes pr
set provider_id = p.id
from public.providers p
where pr.provider_id is null
  and pr.provider_name is not null
  and trim(pr.provider_name) <> ''
  and lower(trim(pr.provider_name)) = lower(trim(p.name));

-- Refresh the Programme Directory summary so supplier identity comes from providers.
create or replace view public.leasing_programme_summary as
select
    fr.academic_year,
    fr.school_id,
    s.code as school_code,
    s.name as school_name,
    fr.programme_id,
    pr.name as programme_name,
    pr.category as programme_category,
    pr.provider_id,
    coalesce(p.name, pr.provider_name) as provider_name,
    sum(case when rm.code = 'sales' then fr.amount else 0 end) as sales,
    sum(case when rm.code = 'commission' then fr.amount else 0 end) as commission,
    sum(case when rm.code = 'rental_fees' then fr.amount else 0 end) as rental_fees,
    sum(case when rm.code in ('sales', 'rental_fees') then fr.amount else 0 end) as total_revenue,
    sum(case when rm.code in ('commission', 'rental_fees') then fr.amount else 0 end) as school_income
from public.financial_records fr
join public.revenue_streams rs on rs.id = fr.revenue_stream_id
join public.schools s on s.id = fr.school_id
join public.programmes pr on pr.id = fr.programme_id
left join public.providers p on p.id = pr.provider_id
join public.revenue_metrics rm on rm.id = fr.metric_id
where rs.code = 'leasing'
  and fr.is_deleted = false
group by
    fr.academic_year,
    fr.school_id,
    s.code,
    s.name,
    fr.programme_id,
    pr.name,
    pr.category,
    pr.provider_id,
    p.name,
    pr.provider_name;

grant select on public.leasing_programme_summary to authenticated;

commit;

-- Verification: rows returned here still need manual matching before provider_name can be retired.
select id, name as programme_name, provider_name
from public.programmes
where provider_name is not null
  and trim(provider_name) <> ''
  and provider_id is null
order by provider_name, name;
