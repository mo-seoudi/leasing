-- Private storage for supplier invoice documents.
-- Run once in Supabase SQL Editor. Safe to rerun.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cost-invoices',
  'cost-invoices',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated application users may manage invoice files. The bucket is
-- private, so documents are viewed through short-lived signed URLs only.
drop policy if exists "Authenticated users can view cost invoice files" on storage.objects;
create policy "Authenticated users can view cost invoice files"
on storage.objects for select
to authenticated
using (bucket_id = 'cost-invoices');

drop policy if exists "Authenticated users can upload cost invoice files" on storage.objects;
create policy "Authenticated users can upload cost invoice files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'cost-invoices');

drop policy if exists "Authenticated users can update cost invoice files" on storage.objects;
create policy "Authenticated users can update cost invoice files"
on storage.objects for update
to authenticated
using (bucket_id = 'cost-invoices')
with check (bucket_id = 'cost-invoices');

drop policy if exists "Authenticated users can delete cost invoice files" on storage.objects;
create policy "Authenticated users can delete cost invoice files"
on storage.objects for delete
to authenticated
using (bucket_id = 'cost-invoices');

commit;
