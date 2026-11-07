create table public.staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null,
  created_at timestamptz not null default now(),
  constraint staff_profiles_role_check check (role in ('sindico', 'zelador'))
);

create index staff_profiles_email_idx on public.staff_profiles (email);
create unique index staff_profiles_email_lower_idx on public.staff_profiles (lower(email));
