create sequence public.occurrence_code_seq;

create table public.occurrences (
  id bigint generated always as identity primary key,
  code text not null default ('OC-' || lpad(nextval('public.occurrence_code_seq')::text, 4, '0')),
  title text not null,
  description text not null,
  category_id bigint not null references public.occurrence_categories (id),
  location_kind text not null,
  location_value text not null,
  author_staff_id uuid references public.staff_profiles (id),
  author_resident_id bigint references public.residents (id),
  status text not null default 'pending',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint occurrences_code_unique unique (code),
  constraint occurrences_location_kind_check check (location_kind in ('common', 'custom')),
  constraint occurrences_status_check check (status in ('pending', 'in_review', 'resolved', 'cancelled')),
  constraint occurrences_one_author check (
    (author_staff_id is not null and author_resident_id is null)
    or (author_staff_id is null and author_resident_id is not null)
  ),
  constraint occurrences_closed_at_check check (
    (status in ('resolved', 'cancelled') and closed_at is not null)
    or (status in ('pending', 'in_review') and closed_at is null)
  )
);

create unique index occurrences_code_idx on public.occurrences (code);
create index occurrences_category_id_idx on public.occurrences (category_id);
create index occurrences_author_staff_id_idx on public.occurrences (author_staff_id);
create index occurrences_author_resident_id_idx on public.occurrences (author_resident_id);
create index occurrences_status_idx on public.occurrences (status);
create index occurrences_opened_at_idx on public.occurrences (opened_at desc);
create index occurrences_closed_at_idx on public.occurrences (closed_at);
