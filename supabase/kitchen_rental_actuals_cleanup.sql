-- One-time cleanup after introducing revenue_contract_targets.
-- Kitchen Rental AY2026-27 was originally seeded as 12 monthly Actual rows solely
-- to represent the AED 400,000 annual contract value. That expectation now lives
-- in revenue_contract_targets, so future Actual months should remain empty until reported.
--
-- Safety: this only removes the exact generated seed pattern (11 x 33,333.33 and
-- one balancing 33,333.37 row) for RDXB / Kitchen Rental / Rental Fees / AY2026-27.
-- Any manually entered amount that differs from the seed is preserved.

begin;

delete from public.financial_records fr
using public.schools s, public.revenue_streams rs, public.revenue_metrics rm
where fr.school_id = s.id
  and fr.revenue_stream_id = rs.id
  and fr.metric_id = rm.id
  and rm.revenue_stream_id = rs.id
  and s.code = 'RDXB'
  and rs.code = 'kitchen_rental'
  and rm.code = 'rental_fees'
  and fr.academic_year = 'AY2026-27'
  and fr.scenario = 'Actual'
  and fr.programme_id is null
  and fr.provider_id is null
  and fr.is_deleted = false
  and (
    fr.amount = 33333.33
    or (fr.month = date '2027-08-01' and fr.amount = 33333.37)
  );

commit;
