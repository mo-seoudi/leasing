-- Lightweight programme-level Leasing summary used by Programme Directory.

create or replace view public.leasing_programme_summary as
select
    fr.academic_year,
    fr.school_id,
    s.code as school_code,
    s.name as school_name,
    fr.programme_id,
    p.name as programme_name,
    p.category as programme_category,
    p.provider_name,
    sum(case when rm.code = 'sales' then fr.amount else 0 end) as sales,
    sum(case when rm.code = 'commission' then fr.amount else 0 end) as commission,
    sum(case when rm.code = 'rental_fees' then fr.amount else 0 end) as rental_fees,
    sum(case when rm.code in ('sales', 'rental_fees') then fr.amount else 0 end) as total_revenue,
    sum(case when rm.code in ('commission', 'rental_fees') then fr.amount else 0 end) as school_income
from public.financial_records fr
join public.revenue_streams rs on rs.id = fr.revenue_stream_id
join public.schools s on s.id = fr.school_id
join public.programmes p on p.id = fr.programme_id
join public.revenue_metrics rm on rm.id = fr.metric_id
where rs.code = 'leasing'
  and fr.is_deleted = false
group by
    fr.academic_year,
    fr.school_id,
    s.code,
    s.name,
    fr.programme_id,
    p.name,
    p.category,
    p.provider_name;
