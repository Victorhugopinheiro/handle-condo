create or replace function public.sync_registered_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.registered_emails (email_normalized)
    values (lower(new.email));
    return new;
  elsif tg_op = 'UPDATE' then
    if lower(new.email) is distinct from lower(old.email) then
      delete from public.registered_emails
      where email_normalized = lower(old.email);
      insert into public.registered_emails (email_normalized)
      values (lower(new.email));
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    delete from public.registered_emails
    where email_normalized = lower(old.email);
    return old;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists staff_profiles_sync_email on public.staff_profiles;
create trigger staff_profiles_sync_email
after insert or update of email or delete on public.staff_profiles
for each row execute procedure public.sync_registered_email();

drop trigger if exists residents_sync_email on public.residents;
create trigger residents_sync_email
after insert or update of email or delete on public.residents
for each row execute procedure public.sync_registered_email();
