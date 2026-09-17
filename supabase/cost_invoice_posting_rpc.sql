-- Transactional invoice posting/unposting for the Transport Cost Centre.
-- Run after cost_invoice_posting.sql. Safe to rerun.
-- Manual monthly totals are reporting overrides, not posting conflicts.
-- Transport reporting is VAT-inclusive: invoice ledger rows are grossed up from
-- their net line allocation using the invoice header total/subtotal ratio.

begin;

create or replace function public.post_transport_cost_invoice(p_invoice_id bigint)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_invoice public.cost_invoices%rowtype;
  v_user_id uuid := auth.uid();
  v_gross_factor numeric := 1;
begin
  if v_user_id is null then raise exception 'You must be signed in to post invoices.'; end if;

  select * into v_invoice from public.cost_invoices
  where id = p_invoice_id and is_deleted = false for update;
  if not found then raise exception 'Invoice not found.'; end if;
  if v_invoice.cost_centre_code <> 'transport' then raise exception 'Only Transport cost invoices can be posted here.'; end if;
  if v_invoice.posting_status = 'Posted' then return; end if;
  if v_invoice.status not in ('Approved','Paid') then raise exception 'Only Approved or Paid invoices can be posted to the Transport Cost Centre. Current status: %.', v_invoice.status; end if;
  if not exists (select 1 from public.cost_invoice_lines where invoice_id = p_invoice_id) then raise exception 'This invoice has no cost lines to post.'; end if;

  if coalesce(v_invoice.subtotal,0) <> 0 then
    v_gross_factor := coalesce(v_invoice.total_amount,v_invoice.subtotal) / v_invoice.subtotal;
  end if;

  insert into public.transport_cost_records (
    school_id, category_id, academic_year, month, scenario, amount, notes,
    source_type, source_invoice_id, source_invoice_line_id,
    is_deleted, created_by, updated_by, updated_at
  )
  select v_invoice.school_id,l.transport_cost_category_id,v_invoice.academic_year,
    v_invoice.reporting_month,v_invoice.scenario,round(l.amount * v_gross_factor,2),
    concat_ws(' · ','Invoice '||v_invoice.invoice_number,nullif(l.description,'')),
    'invoice',v_invoice.id,l.id,false,v_user_id,v_user_id,now()
  from public.cost_invoice_lines l where l.invoice_id=p_invoice_id;

  update public.cost_invoices set posting_status='Posted',posted_at=now(),posted_by=v_user_id,
    updated_by=v_user_id,updated_at=now() where id=p_invoice_id;
end;
$$;

create or replace function public.unpost_transport_cost_invoice(p_invoice_id bigint)
returns void language plpgsql security invoker set search_path=public as $$
declare v_invoice public.cost_invoices%rowtype; v_user_id uuid:=auth.uid();
begin
  if v_user_id is null then raise exception 'You must be signed in to unpost invoices.'; end if;
  select * into v_invoice from public.cost_invoices where id=p_invoice_id and is_deleted=false for update;
  if not found then raise exception 'Invoice not found.'; end if;
  if v_invoice.cost_centre_code <> 'transport' then raise exception 'Only Transport cost invoices can be unposted here.'; end if;
  if v_invoice.posting_status <> 'Posted' then return; end if;
  update public.transport_cost_records set is_deleted=true,deleted_at=now(),deleted_by=v_user_id,
    updated_by=v_user_id,updated_at=now() where source_invoice_id=p_invoice_id and is_deleted=false;
  update public.cost_invoices set posting_status='Unposted',posted_at=null,posted_by=null,
    updated_by=v_user_id,updated_at=now() where id=p_invoice_id;
end;
$$;

grant execute on function public.post_transport_cost_invoice(bigint) to authenticated;
grant execute on function public.unpost_transport_cost_invoice(bigint) to authenticated;

commit;
