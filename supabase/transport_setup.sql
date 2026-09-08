-- Transport revenue stream setup
-- Transport Fees uses the platform-standard `sales` metric code so it flows
-- into Commercial Revenue automatically, while its display name remains
-- Transport Fees throughout the Transport module and Financial Records.
-- Safe to rerun before Transport data is loaded.

begin;

insert into public.revenue_streams (code, name)
select 'transport', 'Transport'
where not exists (
  select 1 from public.revenue_streams where code = 'transport'
);

insert into public.revenue_metrics (revenue_stream_id, code, name, display_order)
select rs.id, 'sales', 'Transport Fees', 1
from public.revenue_streams rs
where rs.code = 'transport'
  and not exists (
    select 1 from public.revenue_metrics rm
    where rm.revenue_stream_id = rs.id and rm.code = 'sales'
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
