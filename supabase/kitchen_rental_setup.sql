-- Kitchen Rental revenue stream setup
-- Annual rental records are stored in financial_records using September as the
-- technical anchor month for each academic year. VAT is stored separately and
-- is not treated as commercial revenue.

begin;

insert into public.revenue_streams (code, name)
select 'kitchen_rental', 'Kitchen Rental'
where not exists (
  select 1 from public.revenue_streams where code = 'kitchen_rental'
);

insert into public.revenue_metrics (revenue_stream_id, code, name, display_order)
select rs.id, 'rental_fees', 'Rental Fees', 1
from public.revenue_streams rs
where rs.code = 'kitchen_rental'
  and not exists (
    select 1
    from public.revenue_metrics rm
    where rm.revenue_stream_id = rs.id
      and rm.code = 'rental_fees'
  );

insert into public.revenue_metrics (revenue_stream_id, code, name, display_order)
select rs.id, 'vat_rate', 'VAT Rate', 2
from public.revenue_streams rs
where rs.code = 'kitchen_rental'
  and not exists (
    select 1
    from public.revenue_metrics rm
    where rm.revenue_stream_id = rs.id
      and rm.code = 'vat_rate'
  );

-- Seed the known Repton Dubai annual arrangements.
-- AY25-26: Ginza AED 500,000 + 5% VAT
-- AY26-27: Ben's Farmhouse AED 400,000 + 5% VAT
with refs as (
  select
    s.id as school_id,
    rs.id as stream_id,
    max(case when rm.code = 'rental_fees' then rm.id end) as rental_metric_id,
    max(case when rm.code = 'vat_rate' then rm.id end) as vat_metric_id
  from public.schools s
  cross join public.revenue_streams rs
  join public.revenue_metrics rm on rm.revenue_stream_id = rs.id
  where s.code = 'RDXB'
    and rs.code = 'kitchen_rental'
  group by s.id, rs.id
), seed_rows as (
  select school_id, stream_id, rental_metric_id as metric_id, 'AY2025-26'::text as academic_year, '2025-09-01'::date as month, 'Term 1'::text as term, 'Actual'::text as scenario, 500000::numeric as amount from refs
  union all
  select school_id, stream_id, vat_metric_id, 'AY2025-26', '2025-09-01'::date, 'Term 1', 'Actual', 5::numeric from refs
  union all
  select school_id, stream_id, rental_metric_id, 'AY2026-27', '2026-09-01'::date, 'Term 1', 'Actual', 400000::numeric from refs
  union all
  select school_id, stream_id, vat_metric_id, 'AY2026-27', '2026-09-01'::date, 'Term 1', 'Actual', 5::numeric from refs
)
insert into public.financial_records (
  school_id, revenue_stream_id, metric_id, academic_year, month, term,
  scenario, amount, programme_id, provider_id, is_deleted
)
select
  sr.school_id, sr.stream_id, sr.metric_id, sr.academic_year, sr.month, sr.term,
  sr.scenario, sr.amount, null, null, false
from seed_rows sr
where sr.metric_id is not null
  and not exists (
    select 1
    from public.financial_records fr
    where fr.school_id = sr.school_id
      and fr.revenue_stream_id = sr.stream_id
      and fr.metric_id = sr.metric_id
      and fr.academic_year = sr.academic_year
      and fr.month = sr.month
      and fr.scenario = sr.scenario
      and fr.is_deleted = false
      and fr.programme_id is null
      and fr.provider_id is null
  );

commit;
