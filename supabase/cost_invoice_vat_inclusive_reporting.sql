-- Make existing posted Transport invoice ledger rows VAT-inclusive.
-- Safe to rerun: values are always recalculated from invoice line net amount
-- and the invoice header total/subtotal ratio, rather than incremented.

begin;

update public.transport_cost_records r
set amount = round(
      l.amount * case
        when coalesce(i.subtotal,0) <> 0 then coalesce(i.total_amount,i.subtotal) / i.subtotal
        else 1
      end,
      2
    ),
    updated_at = now()
from public.cost_invoice_lines l
join public.cost_invoices i on i.id = l.invoice_id
where r.source_type = 'invoice'
  and r.source_invoice_id = i.id
  and r.source_invoice_line_id = l.id
  and r.is_deleted = false
  and i.cost_centre_code = 'transport'
  and i.posting_status = 'Posted'
  and i.is_deleted = false;

commit;
