create table public.occurrence_categories (
  id bigint generated always as identity primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index occurrence_categories_name_lower_idx on public.occurrence_categories (lower(name));
