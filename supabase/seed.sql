insert into public.occurrence_categories (name)
select name
from (values ('Manutenção'), ('Ruído'), ('Limpeza')) as seed(name)
where not exists (
  select 1
  from public.occurrence_categories c
  where lower(c.name) = lower(seed.name)
);
