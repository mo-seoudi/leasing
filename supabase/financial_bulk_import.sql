-- Transactional Financial Records bulk import.
-- All accepted rows are applied in one PostgreSQL transaction. If any row fails,
-- the entire RPC call rolls back and no partial import is left behind.

begin;

create or replace function public.import_financial_records_bulk(
  p_rows jsonb,
  p_overwrite_existing boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row jsonb;
  v_school_id bigint;
  v_stream_id bigint;
  v_metric_id bigint;
  v_programme_id bigint;
  v_month date;
  v_scenario text;
  v_amount numeric;
  v_academic_year text;
  v_term text;
  v_existing_id bigint;
  v_inserted integer := 0;
  v_updated integer := 0;
  v_skipped integer := 0;
begin
  if v_user is null then
    raise exception 'You must be signed in to import financial records.';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Import rows must be supplied as a JSON array.';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    v_school_id := (v_row->>'school_id')::bigint;
    v_stream_id := (v_row->>'revenue_stream_id')::bigint;
    v_metric_id := (v_row->>'metric_id')::bigint;
    v_programme_id := nullif(v_row->>'programme_id','')::bigint;
    v_month := (v_row->>'month')::date;
    v_scenario := v_row->>'scenario';
    v_amount := (v_row->>'amount')::numeric;
    v_academic_year := v_row->>'academic_year';
    v_term := v_row->>'term';

    if v_school_id is null or v_stream_id is null or v_metric_id is null or v_month is null
       or v_scenario is null or v_amount is null or v_academic_year is null or v_term is null then
      raise exception 'An import row is missing required financial record data.';
    end if;

    select fr.id into v_existing_id
    from public.financial_records fr
    where fr.school_id = v_school_id
      and fr.revenue_stream_id = v_stream_id
      and fr.metric_id = v_metric_id
      and fr.month = v_month
      and fr.scenario = v_scenario
      and fr.is_deleted = false
      and ((v_programme_id is null and fr.programme_id is null) or fr.programme_id = v_programme_id)
    limit 1;

    if v_existing_id is not null then
      if p_overwrite_existing then
        update public.financial_records
        set amount = v_amount,
            academic_year = v_academic_year,
            term = v_term,
            provider_id = null,
            updated_by = v_user
        where id = v_existing_id;
        v_updated := v_updated + 1;
      else
        v_skipped := v_skipped + 1;
      end if;
    else
      insert into public.financial_records (
        school_id, revenue_stream_id, metric_id, programme_id, provider_id,
        academic_year, month, term, scenario, amount, is_deleted,
        created_by, updated_by, deleted_by, deleted_at
      ) values (
        v_school_id, v_stream_id, v_metric_id, v_programme_id, null,
        v_academic_year, v_month, v_term, v_scenario, v_amount, false,
        v_user, v_user, null, null
      );
      v_inserted := v_inserted + 1;
    end if;

    v_existing_id := null;
  end loop;

  return jsonb_build_object(
    'inserted', v_inserted,
    'updated', v_updated,
    'skipped', v_skipped
  );
end;
$$;

grant execute on function public.import_financial_records_bulk(jsonb, boolean) to authenticated;

commit;
