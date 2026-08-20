-- Optimized factual data source for Catering dashboard/comparison.
-- Business/reporting behaviour remains in React.

create or replace view public.catering_dashboard_summary as
select
  fr.academic_year,
  fr.month,
  fr.term,
  fr.scenario,
  fr.school_id,
  s.code as school_code,
  s.name as school_name,
  coalesce(sum(fr.amount) filter (where rm.code = 'sales'), 0)::numeric as sales,
  coalesce(sum(fr.amount) filter (where rm.code = 'commission'), 0)::numeric as commission
from public.financial_records fr
join public.revenue_streams rs on rs.id = fr.revenue_stream_id
join public.revenue_metrics rm on rm.id = fr.metric_id
left join public.schools s on s.id = fr.school_id
where rs.code = 'catering'
  and coalesce(fr.is_deleted, false) = false
group by
  fr.academic_year,
  fr.month,
  fr.term,
  fr.scenario,
  fr.school_id,
  s.code,
  s.name;

grant select on public.catering_dashboard_summary to anon, authenticated;

select
  count(*) as summary_rows,
  min(month) as earliest_month,
  max(month) as latest_month,
  round(sum(sales), 2) as sales,
  round(sum(commission), 2) as commission
from public.catering_dashboard_summary;
