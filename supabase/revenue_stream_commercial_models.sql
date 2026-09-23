-- Revenue stream commercial behaviour
-- Keeps stream classification in data/configuration rather than React stream-name checks.

begin;

alter table public.revenue_streams
  add column if not exists revenue_model text not null default 'transactional';

alter table public.revenue_streams
  drop constraint if exists revenue_streams_revenue_model_check;

alter table public.revenue_streams
  add constraint revenue_streams_revenue_model_check
  check (revenue_model in ('transactional','contracted'));

-- Kitchen Rental is currently the configured contracted stream.
update public.revenue_streams
set revenue_model = 'contracted'
where code = 'kitchen_rental';

-- Enrich ME can be switched to contracted once its annual contractual target
-- is recorded in revenue_contract_targets. Until then it remains transactional.

commit;
