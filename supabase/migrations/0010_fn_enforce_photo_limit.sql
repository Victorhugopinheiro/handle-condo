create or replace function public.enforce_photo_limit()
returns trigger
language plpgsql
as $$
declare
  photo_count integer;
begin
  select count(*) into photo_count
  from public.occurrence_photos
  where occurrence_id = new.occurrence_id;

  if photo_count >= 5 then
    raise exception 'occurrence may have at most 5 photos';
  end if;

  return new;
end;
$$;

drop trigger if exists occurrence_photos_limit on public.occurrence_photos;
create trigger occurrence_photos_limit
before insert on public.occurrence_photos
for each row execute procedure public.enforce_photo_limit();
