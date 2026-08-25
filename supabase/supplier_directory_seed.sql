-- Supplier & Contract Register seed data
-- Source: Supplier Database.xlsx supplied 25 Aug 2026.
-- Safe to rerun: supplier/contact/contract inserts are guarded against duplicates.
-- Unknown fields (including commission rates for these contracts) are deliberately left null.

begin;

-- Transport exists in the commercial supplier register even though its revenue dashboard is not built yet.
insert into public.revenue_streams (code, name, is_active)
select 'transport', 'Transport', true
where not exists (
  select 1 from public.revenue_streams where code = 'transport'
);

-- ---------------------------------------------------------------------------
-- SUPPLIER MASTER
-- ---------------------------------------------------------------------------

insert into public.providers (name, legal_name, company_number, vat_trn, address, contact_person, email, is_active)
select
  'Zona Trading',
  'ZONA TRADING L.L.C',
  '608860',
  '100019851300003',
  'PO Box 36272, Dubai, United Arab Emirates',
  'Yasser Abouda',
  'yasser@zonatrading.net',
  true
where not exists (select 1 from public.providers where lower(name) = lower('Zona Trading'));

update public.providers
set legal_name = coalesce(nullif(legal_name, ''), 'ZONA TRADING L.L.C'),
    company_number = coalesce(nullif(company_number, ''), '608860'),
    vat_trn = coalesce(nullif(vat_trn, ''), '100019851300003'),
    address = coalesce(nullif(address, ''), 'PO Box 36272, Dubai, United Arab Emirates'),
    contact_person = coalesce(nullif(contact_person, ''), 'Yasser Abouda'),
    email = coalesce(nullif(email, ''), 'yasser@zonatrading.net')
where lower(name) = lower('Zona Trading');

insert into public.providers (name, legal_name, company_number, vat_trn, address, contact_person, email, is_active)
select
  'Ginza Catering Services',
  'Ginza Catering Services L.L.C.',
  '790238',
  '100238769200003',
  'Level 15, Park Place Tower, UAE',
  'Dominic Gruening',
  'dominic.gruening@ginzarestaurants.com',
  true
where not exists (select 1 from public.providers where lower(name) = lower('Ginza Catering Services'));

update public.providers
set legal_name = coalesce(nullif(legal_name, ''), 'Ginza Catering Services L.L.C.'),
    company_number = coalesce(nullif(company_number, ''), '790238'),
    vat_trn = coalesce(nullif(vat_trn, ''), '100238769200003'),
    address = coalesce(nullif(address, ''), 'Level 15, Park Place Tower, UAE'),
    contact_person = coalesce(nullif(contact_person, ''), 'Dominic Gruening'),
    email = coalesce(nullif(email, ''), 'dominic.gruening@ginzarestaurants.com')
where lower(name) = lower('Ginza Catering Services');

insert into public.providers (name, is_active)
select v.name, true
from (values
  ('Food Nation'),
  ('Ben''s Farmhouse'),
  ('Stu Williamson'),
  ('STS (School Transport Services)'),
  ('BBT (Bright Bus Transport)')
) as v(name)
where not exists (
  select 1 from public.providers p where lower(p.name) = lower(v.name)
);

-- ---------------------------------------------------------------------------
-- CONTACTS
-- ---------------------------------------------------------------------------

insert into public.supplier_contacts (provider_id, contact_name, role, email, is_primary, is_active)
select p.id, c.contact_name, c.role, c.email, c.is_primary, true
from public.providers p
join (values
  ('Zona Trading','Yasser Abouda','Key Contact','yasser@zonatrading.net',true),
  ('Zona Trading','Shanawaz Ameer Basha','Key Contact','shanawaz@zonatrading.net',false),
  ('Zona Trading','Anas El Hamwy','Owner / CEO / Signatory','anas.hamwi@greentrendlandscape.com',false),
  ('Ginza Catering Services','Dominic Gruening','Key Contact','dominic.gruening@ginzarestaurants.com',true),
  ('Ginza Catering Services','Wassim Ghalayini','Owner / CEO / Signatory','wassimrg@ginzaholdings.com',false)
) as c(provider_name, contact_name, role, email, is_primary)
  on lower(p.name) = lower(c.provider_name)
where not exists (
  select 1
  from public.supplier_contacts sc
  where sc.provider_id = p.id
    and lower(sc.contact_name) = lower(c.contact_name)
    and lower(coalesce(sc.email,'')) = lower(coalesce(c.email,''))
);

-- ---------------------------------------------------------------------------
-- CONTRACTS
-- One contract row per supplier + revenue stream + expiry/status relationship.
-- School coverage is linked separately below.
-- ---------------------------------------------------------------------------

-- Zona / Uniform / all four schools / current
insert into public.provider_contracts (
  provider_id, revenue_stream_id, status, expiry_date, commission_rate, is_active
)
select p.id, rs.id, 'Active', date '2027-07-31', null, true
from public.providers p
join public.revenue_streams rs on rs.code = 'uniform'
where lower(p.name) = lower('Zona Trading')
  and not exists (
    select 1 from public.provider_contracts pc
    where pc.provider_id = p.id and pc.revenue_stream_id = rs.id
      and pc.expiry_date = date '2027-07-31'
  );

-- Ginza / Catering / RDXB + RAB / historical
insert into public.provider_contracts (
  provider_id, revenue_stream_id, status, expiry_date, commission_rate, is_active
)
select p.id, rs.id, 'Expired', date '2026-07-31', null, false
from public.providers p
join public.revenue_streams rs on rs.code = 'catering'
where lower(p.name) = lower('Ginza Catering Services')
  and not exists (
    select 1 from public.provider_contracts pc
    where pc.provider_id = p.id and pc.revenue_stream_id = rs.id
      and pc.expiry_date = date '2026-07-31'
  );

-- Food Nation / Catering / FRY + ROSE / historical
insert into public.provider_contracts (
  provider_id, revenue_stream_id, status, expiry_date, commission_rate, is_active
)
select p.id, rs.id, 'Expired', date '2026-07-31', null, false
from public.providers p
join public.revenue_streams rs on rs.code = 'catering'
where lower(p.name) = lower('Food Nation')
  and not exists (
    select 1 from public.provider_contracts pc
    where pc.provider_id = p.id and pc.revenue_stream_id = rs.id
      and pc.expiry_date = date '2026-07-31'
  );

-- Ben's Farmhouse / Catering / all four schools / current AY2026-27 onward
insert into public.provider_contracts (
  provider_id, revenue_stream_id, status, expiry_date, commission_rate, is_active
)
select p.id, rs.id, 'Active', date '2030-07-31', null, true
from public.providers p
join public.revenue_streams rs on rs.code = 'catering'
where lower(p.name) = lower('Ben''s Farmhouse')
  and not exists (
    select 1 from public.provider_contracts pc
    where pc.provider_id = p.id and pc.revenue_stream_id = rs.id
      and pc.expiry_date = date '2030-07-31'
  );

-- Stu Williamson / Photography / all four schools / current
insert into public.provider_contracts (
  provider_id, revenue_stream_id, status, expiry_date, commission_rate, is_active
)
select p.id, rs.id, 'Active', date '2027-07-31', null, true
from public.providers p
join public.revenue_streams rs on rs.code = 'photography'
where lower(p.name) = lower('Stu Williamson')
  and not exists (
    select 1 from public.provider_contracts pc
    where pc.provider_id = p.id and pc.revenue_stream_id = rs.id
      and pc.expiry_date = date '2027-07-31'
  );

-- STS / Transport / Dubai schools / current
insert into public.provider_contracts (
  provider_id, revenue_stream_id, status, expiry_date, commission_rate, is_active
)
select p.id, rs.id, 'Active', date '2027-07-31', null, true
from public.providers p
join public.revenue_streams rs on rs.code = 'transport'
where lower(p.name) = lower('STS (School Transport Services)')
  and not exists (
    select 1 from public.provider_contracts pc
    where pc.provider_id = p.id and pc.revenue_stream_id = rs.id
      and pc.expiry_date = date '2027-07-31'
  );

-- BBT / Transport / Abu Dhabi schools / current
insert into public.provider_contracts (
  provider_id, revenue_stream_id, status, expiry_date, commission_rate, is_active
)
select p.id, rs.id, 'Active', date '2027-07-31', null, true
from public.providers p
join public.revenue_streams rs on rs.code = 'transport'
where lower(p.name) = lower('BBT (Bright Bus Transport)')
  and not exists (
    select 1 from public.provider_contracts pc
    where pc.provider_id = p.id and pc.revenue_stream_id = rs.id
      and pc.expiry_date = date '2027-07-31'
  );

-- ---------------------------------------------------------------------------
-- SCHOOL ASSIGNMENTS
-- ---------------------------------------------------------------------------

-- Helper source expressed as supplier / stream / expiry / school tuples.
with assignments(provider_name, stream_code, expiry_date, school_code) as (
  values
    ('Zona Trading','uniform',date '2027-07-31','RDXB'),
    ('Zona Trading','uniform',date '2027-07-31','RAB'),
    ('Zona Trading','uniform',date '2027-07-31','FRY'),
    ('Zona Trading','uniform',date '2027-07-31','ROSE'),

    ('Ginza Catering Services','catering',date '2026-07-31','RDXB'),
    ('Ginza Catering Services','catering',date '2026-07-31','RAB'),

    ('Food Nation','catering',date '2026-07-31','FRY'),
    ('Food Nation','catering',date '2026-07-31','ROSE'),

    ('Ben''s Farmhouse','catering',date '2030-07-31','RDXB'),
    ('Ben''s Farmhouse','catering',date '2030-07-31','RAB'),
    ('Ben''s Farmhouse','catering',date '2030-07-31','FRY'),
    ('Ben''s Farmhouse','catering',date '2030-07-31','ROSE'),

    ('Stu Williamson','photography',date '2027-07-31','RDXB'),
    ('Stu Williamson','photography',date '2027-07-31','RAB'),
    ('Stu Williamson','photography',date '2027-07-31','FRY'),
    ('Stu Williamson','photography',date '2027-07-31','ROSE'),

    ('STS (School Transport Services)','transport',date '2027-07-31','RDXB'),
    ('STS (School Transport Services)','transport',date '2027-07-31','RAB'),

    ('BBT (Bright Bus Transport)','transport',date '2027-07-31','FRY'),
    ('BBT (Bright Bus Transport)','transport',date '2027-07-31','ROSE')
)
insert into public.provider_contract_schools (provider_contract_id, school_id)
select pc.id, s.id
from assignments a
join public.providers p on lower(p.name) = lower(a.provider_name)
join public.revenue_streams rs on rs.code = a.stream_code
join public.provider_contracts pc
  on pc.provider_id = p.id
 and pc.revenue_stream_id = rs.id
 and pc.expiry_date = a.expiry_date
join public.schools s on s.code = a.school_code
on conflict (provider_contract_id, school_id) do nothing;

commit;

-- Verification queries (run automatically after commit; read-only)
select
  revenue_stream_name,
  supplier_name,
  status,
  expiry_date,
  schools,
  commission_rate,
  contacts
from public.supplier_contract_register
where supplier_name in (
  'Zona Trading',
  'Ginza Catering Services',
  'Food Nation',
  'Ben''s Farmhouse',
  'Stu Williamson',
  'STS (School Transport Services)',
  'BBT (Bright Bus Transport)'
)
order by revenue_stream_name, supplier_name;
