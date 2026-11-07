alter table public.staff_profiles enable row level security;
alter table public.residents enable row level security;
alter table public.registered_emails enable row level security;
alter table public.occurrence_categories enable row level security;
alter table public.occurrences enable row level security;
alter table public.occurrence_photos enable row level security;
alter table public.occurrence_comments enable row level security;

alter table public.staff_profiles force row level security;
alter table public.residents force row level security;
alter table public.registered_emails force row level security;
alter table public.occurrence_categories force row level security;
alter table public.occurrences force row level security;
alter table public.occurrence_photos force row level security;
alter table public.occurrence_comments force row level security;

create policy staff_profiles_staff_all on public.staff_profiles
  for all to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

create policy residents_staff_all on public.residents
  for all to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

create policy registered_emails_staff_select on public.registered_emails
  for select to authenticated
  using ((select public.is_staff()));

create policy occurrence_categories_staff_all on public.occurrence_categories
  for all to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

create policy occurrences_staff_all on public.occurrences
  for all to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

create policy occurrence_photos_staff_all on public.occurrence_photos
  for all to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

create policy occurrence_comments_staff_all on public.occurrence_comments
  for all to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

revoke all on table public.staff_profiles from anon;
revoke all on table public.residents from anon;
revoke all on table public.registered_emails from anon;
revoke all on table public.occurrence_categories from anon;
revoke all on table public.occurrences from anon;
revoke all on table public.occurrence_photos from anon;
revoke all on table public.occurrence_comments from anon;
