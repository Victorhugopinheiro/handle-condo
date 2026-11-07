create table public.occurrence_comments (
  id bigint generated always as identity primary key,
  occurrence_id bigint not null references public.occurrences (id) on delete cascade,
  body text not null,
  author_staff_id uuid references public.staff_profiles (id),
  author_resident_id bigint references public.residents (id),
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint occurrence_comments_one_author check (
    (author_staff_id is not null and author_resident_id is null)
    or (author_staff_id is null and author_resident_id is not null)
  )
);

create index occurrence_comments_occurrence_id_idx on public.occurrence_comments (occurrence_id);
