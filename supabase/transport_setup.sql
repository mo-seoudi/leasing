-- Transport revenue stream setup
-- Adds the standard Transport commercial metrics used by Financial Records,
-- Transport Dashboard and Performance Comparison.
-- Safe to rerun.

begin;

insert into public.revenue_streams (code, name)
select 'transport', 'Transport'
where not exists (
  select 1 from public.revenue_streams where code = 'transport'
);

insert into public.revenue_metrics (revenue_stream_id, code, name, display_order)
select rs.id, 'transport_fees', 'Transport Fees', 1
from public.revenue_streams rs
where rs.code = 'transport'
  and not exists (
    select 1 from public.revenue_metrics rm
    where rm.revenue_stream_id = rs.id and rm.code = 'transport_fees'
  );

insert into public.revenue_metrics (revenue_stream_id, code, name, display_order)
select rs.id, 'commission', 'Commission', 2
from public.revenue_streams rs
where rs.code = 'transport'
  and not exists (
    select 1 from public.revenue_metrics rm
    where rm.revenue_stream_id = rs.id and rm.code = 'commission'
  );

commit;
