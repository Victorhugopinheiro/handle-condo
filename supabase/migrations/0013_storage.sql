insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'occurrence-photos',
  'occurrence-photos',
  false,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy occurrence_photos_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'occurrence-photos'
    and (select public.is_staff())
  );

create policy occurrence_photos_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'occurrence-photos'
    and (select public.is_staff())
  );

create policy occurrence_photos_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'occurrence-photos'
    and (select public.is_staff())
  )
  with check (
    bucket_id = 'occurrence-photos'
    and (select public.is_staff())
  );

create policy occurrence_photos_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'occurrence-photos'
    and (select public.is_staff())
  );
