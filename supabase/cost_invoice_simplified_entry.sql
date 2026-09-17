-- Simplified Cost Invoice entry model
-- Invoice number, school, reporting month and cost allocation remain required.
-- Invoice date and supplier are optional supporting details.
-- Safe to rerun.

begin;

alter table public.cost_invoices
  alter column invoice_date drop not null;

-- provider_id is already nullable in the original register schema; keep it optional.

-- Invoice numbers remain mandatory. When a supplier is omitted, still prevent
-- duplicate active invoice numbers within the same cost centre.
create unique index if not exists cost_invoices_unique_active_number_no_provider_idx
  on public.cost_invoices (cost_centre_code, invoice_number)
  where is_deleted = false and provider_id is null;

commit;
