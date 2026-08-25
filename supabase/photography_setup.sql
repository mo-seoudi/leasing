-- Photography revenue stream setup
-- Run once in Supabase before importing Photography financial records.

insert into public.revenue_streams (code, name)
values ('photography', 'Photography')
on conflict (code) do update
set name = excluded.name;

-- Photography uses the existing shared Sales and Commission metrics
-- and the existing financial_records table, exactly like the other
-- straightforward commercial revenue streams.
