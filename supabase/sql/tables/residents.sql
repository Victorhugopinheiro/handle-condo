create table public.residents (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  unit text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create index residents_email_idx on public.residents (email);
create unique index residents_email_lower_idx on public.residents (lower(email));
