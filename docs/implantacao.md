# Implantação — CondoManager V1

## 1. Projeto Supabase

1. Crie um projeto no Supabase.
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL `https://…supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Publishable key (`sb_publishable_…`)
   - `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` — Secret key (`sb_secret_…`), só no servidor
   - `DATABASE_URL` — URI **Postgres** do mesmo projeto (`postgresql://…`), não a URL https
   - `RESIDENT_SESSION_SECRET` (string longa e aleatória para o cookie do morador)
3. Aplique as migrations em `supabase/migrations/` (SQL Editor ou `supabase db push`), na ordem numérica. Cada tabela está em `supabase/sql/tables/` e cada função em `supabase/sql/functions/`.
4. Rode `supabase/seed.sql` para as categorias iniciais (Manutenção, Ruído, Limpeza).

Não há cadastro de funcionários na interface. O usuário inicial é criado no Dashboard do Auth. No V1, só funcionário usa Auth: o login cria o registro em `staff_profiles` se ainda não existir. A migration `0014_fn_handle_new_staff_user.sql` também cria o perfil ao adicionar um user no Auth.

## 2. Funcionário inicial

1. Authentication → Users → Add user (e-mail + senha).
2. Marque **Auto Confirm User** (ou confirme o e-mail) — senão o login recusa.
3. Aplique `supabase/migrations/0014_fn_handle_new_staff_user.sql` se as tabelas já existiam antes dessa migration.
4. Entre em `/login` com o mesmo e-mail e senha. Usuários **já criados** recebem `staff_profiles` no primeiro login.

Para inserir o perfil na mão (opcional):

```sql
insert into public.staff_profiles (id, name, email, role)
values (
  'UUID_DO_AUTH',
  'Nome do síndico',
  'victor@victor.com',
  'sindico'
)
on conflict (id) do nothing;
```

O cargo aparece na interface e **não** altera permissões no V1.

## 3. App

```bash
npm install
npm run dev
```

- Área do funcionário: `/login`
- Área do morador: `/acesso`
- Home: `/`
