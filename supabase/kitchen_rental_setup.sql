-- Kitchen Rental revenue stream setup
-- Monthly Actual financial records are entered only when revenue materialises.
-- Annual contractual expectations are stored separately in revenue_contract_targets.
-- Safe to rerun: ensures the stream and its Rental Fees metric exist.

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

commit;
