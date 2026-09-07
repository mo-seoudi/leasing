-- Financial record VAT basis
-- Run once in Supabase before deploying the VAT-aware application code.

begin;

alter table public.financial_records
  add column if not exists vat_basis text,
  add column if not exists vat_rate numeric(6,3);

-- Existing records are deliberately left unclassified. Their historical basis
-- must be confirmed rather than silently assuming inclusive or exclusive.
update public.financial_records
set vat_rate = 5.000
where vat_rate is null;

alter table public.financial_records
  alter column vat_rate set default 5.000;

alter table public.financial_records
  drop constraint if exists financial_records_vat_basis_check;

alter table public.financial_records
  add constraint financial_records_vat_basis_check
  check (vat_basis is null or vat_basis in ('inclusive','exclusive','no_vat'));

alter table public.financial_records
  drop constraint if exists financial_records_vat_rate_check;

alter table public.financial_records
  add constraint financial_records_vat_rate_check
  check (vat_rate is null or (vat_rate >= 0 and vat_rate <= 100));

comment on column public.financial_records.vat_basis is
  'Basis of the amount as entered: inclusive, exclusive, or no_vat. NULL means historical basis not yet classified.';
comment on column public.financial_records.vat_rate is
  'VAT percentage used to normalize the entered amount. UAE default is 5 percent.';

commit;
