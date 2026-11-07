create table public.occurrence_photos (
  id bigint generated always as identity primary key,
  occurrence_id bigint not null references public.occurrences (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index occurrence_photos_occurrence_id_idx on public.occurrence_photos (occurrence_id);
