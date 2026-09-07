-- Kitchen Rental revenue stream setup
-- Annual contractual rent is allocated evenly across 12 monthly records so
-- Commercial Overview can include Kitchen Rental in monthly revenue trends.
-- Kitchen Rental financial reporting uses Rental Fees only.
-- Safe to rerun: replaces the seeded Kitchen Rental financial records for RDXB.

begin;

insert into public.revenue_streams (code, name)
select 'kitchen_rental', 'Kitchen Rental'
where not exists (
  select 1
  from public.revenue_streams
  where code = 'kitchen_rental'
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

-- Replace seeded Kitchen Rental financial rows for the known current years.
delete from public.financial_records fr
using public.schools s, public.revenue_streams rs
where fr.school_id = s.id
  and fr.revenue_stream_id = rs.id
  and s.code = 'RDXB'
  and rs.code = 'kitchen_rental'
  and fr.academic_year in ('AY2025-26', 'AY2026-27')
  and fr.scenario = 'Actual'
  and fr.programme_id is null
  and fr.provider_id is null;

with refs as (
  select
    s.id as school_id,
    rs.id as stream_id,
    max(case when rm.code = 'rental_fees' then rm.id end) as rental_metric_id
  from public.schools s
  cross join public.revenue_streams rs
  join public.revenue_metrics rm
    on rm.revenue_stream_id = rs.id
  where s.code = 'RDXB'
    and rs.code = 'kitchen_rental'
  group by s.id, rs.id
), annual_values as (
  select
    'AY2025-26'::text as academic_year,
    2025::int as start_year,
    500000::numeric as annual_rent
  union all
  select
    'AY2026-27'::text,
    2026::int,
    400000::numeric
), months as (
  select *
  from (values
    (1, 9,  'Term 1'),
    (2, 10, 'Term 1'),
    (3, 11, 'Term 1'),
    (4, 12, 'Term 1'),
    (5, 1,  'Term 2'),
    (6, 2,  'Term 2'),
    (7, 3,  'Term 2'),
    (8, 4,  'Term 3'),
    (9, 5,  'Term 3'),
    (10, 6, 'Term 3'),
    (11, 7,  'Term 3'),
    (12, 8,  'Term 3')
  ) as m(position, month_number, term)
), rental_rows as (
  select
    r.school_id,
    r.stream_id,
    r.rental_metric_id as metric_id,
    a.academic_year,
    make_date(
      case
        when m.month_number >= 9 then a.start_year
        else a.start_year + 1
      end,
      m.month_number,
      1
    ) as record_month,
    m.term,
    'Actual'::text as scenario,
    case
      when m.position < 12 then round(a.annual_rent / 12.0, 2)
      else a.annual_rent - (round(a.annual_rent / 12.0, 2) * 11)
    end as amount
  from refs r
  cross join annual_values a
  cross join months m
)
insert into public.financial_records (
  school_id,
  revenue_stream_id,
  metric_id,
  academic_year,
  month,
  term,
  scenario,
  amount,
  programme_id,
  provider_id,
  is_deleted
)
select
  school_id,
  stream_id,
  metric_id,
  academic_year,
  record_month,
  term,
  scenario,
  amount,
  null,
  null,
  false
from rental_rows
where metric_id is not null;

commit;
