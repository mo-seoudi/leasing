-- One-time cleanup for AY2026-27 fixed annual revenue streams.
-- Contracted annual values now live in supplier_contract_school_terms.fixed_amount.
-- financial_records should contain only revenue that has actually been recognised.
--
-- As of September 2026, keep September Actual revenue and soft-delete Oct-Aug
-- Actual revenue for Kitchen Rental and Enrich ME. This leaves Commercial Overview
-- unchanged: it will simply sum the recognised financial records that remain active.
--
-- Safe to rerun: rows already soft-deleted are excluded by is_deleted = false.

begin;

update public.financial_records fr
set
  is_deleted = true,
  deleted_at = now(),
  updated_at = now()
where fr.is_deleted = false
  and fr.scenario = 'Actual'
  and fr.academic_year = 'AY2026-27'
  and fr.month >= date '2026-10-01'
  and fr.month <= date '2027-08-01'
  and fr.revenue_stream_id in (
    select id
    from public.revenue_streams
    where code in ('kitchen_rental', 'enrich_me')
  )
  and fr.metric_id in (
    select rm.id
    from public.revenue_metrics rm
    join public.revenue_streams rs on rs.id = rm.revenue_stream_id
    where (rs.code = 'kitchen_rental' and rm.code = 'rental_fees')
       or (rs.code = 'enrich_me' and rm.code in ('enrich_me_revenue', 'revenue'))
  );

commit;
