-- Cost Invoice -> Transport Cost Ledger posting
-- Adds explicit posting state and source linkage so invoices can feed reporting
-- without being double-counted against manually maintained monthly totals.
-- Run after cost_invoice_register.sql. Safe to rerun.

begin;

alter table public.cost_invoices
  add column if not exists posting_status text not null default 'Unposted',
  add column if not exists posted_at timestamptz,
  add column if not exists posted_by uuid;

alter table public.cost_invoices
  drop constraint if exists cost_invoices_posting_status_check;
alter table public.cost_invoices
  add constraint cost_invoices_posting_status_check
  check (posting_status in ('Unposted','Posted'));

alter table public.transport_cost_records
  add column if not exists source_invoice_id bigint references public.cost_invoices(id) on delete restrict,
  add column if not exists source_invoice_line_id bigint references public.cost_invoice_lines(id) on delete restrict;

create index if not exists transport_cost_records_source_invoice_idx
  on public.transport_cost_records(source_invoice_id);
create unique index if not exists transport_cost_records_source_invoice_line_idx
  on public.transport_cost_records(source_invoice_line_id)
  where source_invoice_line_id is not null and is_deleted = false;

-- The original uniqueness rule allowed only one record per school/category/month/scenario,
-- which prevents several genuine invoices in the same category/month. Keep that rule only
-- for manually maintained monthly totals. Invoice lines are individually unique above.
drop index if exists transport_cost_records_unique_entry_idx;
create unique index if not exists transport_cost_records_unique_manual_entry_idx
  on public.transport_cost_records (school_id, category_id, month, scenario)
  where is_deleted = false and source_type = 'monthly_total';

commit;
