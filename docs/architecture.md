# Arquitetura

Última atualização: 2026-11-03

Como o código está organizado. O produto está em [project-overview.md](project-overview.md). Subir o banco está em [implantacao.md](implantacao.md).

## Stack

| Peça              | No `package.json`                                   |
| ----------------- | --------------------------------------------------- |
| Next.js           | 16.4.3, App Router                                  |
| React             | 19.3.0                                              |
| Tailwind CSS      | 4                                                   |
| UI                | shadcn/ui, Radix, Hugeicons                         |
| Dados             | `@supabase/supabase-js` 2 e `@supabase/ssr`         |
| Formulários       | Zod 4 e React Hook Form                             |
| Sessão do morador | `jose`                                              |
| Fontes            | Inter, Manrope e Geist Mono em `src/app/layout.tsx` |

`drizzle-orm` e `postgres` estão instalados. `src/db/schema.ts` espelha as tabelas. `getDb()` em `src/db/index.ts` não é chamado pelas consultas da aplicação.

## Pastas

```
src/app/(painel)/       login e /dashboard
src/app/(morador)/      /acesso e /ocorrencias
src/lib/data/           leitura e escrita no Supabase
src/lib/occurrences/    schema Zod, filtros e comandos
src/lib/permissions.ts  quem edita, exclui, muda status ou comenta
src/lib/session.ts      sessão de funcionário e de morador
src/proxy.ts            redirects de acesso
supabase/migrations/    SQL aplicado no projeto
supabase/sql/           tabelas e funções, uma por arquivo
```

`page.tsx` é Server Component: busca dados e exige sessão. Interação fica em `_components` (`"use client"`). Mutação fica em `_actions` (`"use server"`) e chama `src/lib/occurrences/commands.ts`. O formulário valida com Zod no cliente; o comando valida de novo no servidor.

## Autenticação

Funcionário: `signInWithPassword` em `src/app/(painel)/login/_actions/login.ts`. A sessão é o cookie do Supabase. `getStaffSession` lê `getClaims()` e a linha em `staff_profiles`. No primeiro login, `ensureStaffProfile` cria essa linha se o usuário do Auth ainda não tiver perfil.

Morador: `src/app/(morador)/acesso/_actions/access.ts` aceita o e-mail se existir em `residents` e não for e-mail de funcionário. Grava o cookie `cm_resident`, um JWT assinado com `RESIDENT_SESSION_SECRET`, válido por 7 dias.

`src/proxy.ts` corre em cada request, exceto assets:

- `/dashboard` sem funcionário vai para `/login`.
- `/login` com funcionário vai para `/dashboard/ocorrencias`.
- `/ocorrencias` sem morador vai para `/acesso`.
- `/acesso` com morador vai para `/ocorrencias`.
- Funcionário autenticado não entra na área do morador, e o contrário também.

`/dashboard` redireciona para `/dashboard/ocorrencias`.

## Dados

Consultas e mutações usam o client de service role em `src/lib/supabase/data.ts` (`dataClient()`). Esse client ignora RLS. Quem pode agir é decidido em `requireStaff` / `requireResident` e de novo em `src/lib/permissions.ts`, dentro dos comandos.

As migrations ligam RLS nas tabelas públicas e no bucket `occurrence-photos`. As políticas de `authenticated` exigem `is_staff()`. O morador não lê essas tabelas com a chave anon; o servidor lê com a secret key.

Tabelas: `staff_profiles`, `residents`, `registered_emails`, `occurrence_categories`, `occurrences`, `occurrence_photos`, `occurrence_comments`. O código `OC-` mais quatro dígitos é default da coluna `occurrences.code`.

Fotos: bucket privado `occurrence-photos`, no máximo 5 por ocorrência, jpeg, jpg, png, webp ou gif. Upload e delete passam pelo service client. A página de detalhe recebe URL assinada.

## Rotas

| Rota                                                               | Quem                    |
| ------------------------------------------------------------------ | ----------------------- |
| `/`                                                                | público; escolhe a área |
| `/login`                                                           | funcionário             |
| `/dashboard/ocorrencias`, `/nova`, `/[codigo]`, `/[codigo]/editar` | funcionário             |
| `/dashboard/moradores`, `/novo`, `/[id]/editar`                    | funcionário             |
| `/dashboard/categorias`                                            | funcionário             |
| `/acesso`                                                          | morador                 |
| `/ocorrencias`, `/nova`, `/[codigo]`, `/[codigo]/editar`           | morador                 |

Variáveis em `.env.example`. `DATABASE_URL` é a URI Postgres do mesmo projeto Supabase. O client Drizzle que a usaria não está no caminho das queries atuais.
