# CondoManager

Gestão de ocorrências de um condomínio. O funcionário entra com e-mail e senha. O morador entra só com o e-mail já cadastrado.

O que o produto faz: [docs/project-overview.md](docs/project-overview.md). Como o código está dividido: [docs/architecture.md](docs/architecture.md).

## Começar

É preciso Node.js e um projeto Supabase.

```bash
npm install
```

Copie `.env.example` para `.env.local`, preencha as chaves e aplique as migrations como em [docs/implantacao.md](docs/implantacao.md).

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

- Funcionário: `/login`
- Morador: `/acesso`

## Scripts

| Comando         | Efeito                     |
| --------------- | -------------------------- |
| `npm run dev`   | Next.js em desenvolvimento |
| `npm run build` | build de produção          |
| `npm start`     | serve o build              |

## Onde mexer

Rotas em `src/app`. Leitura e escrita em `src/lib/data`. Regras de quem pode editar, excluir, mudar status ou comentar em `src/lib/permissions.ts`. SQL em `supabase/migrations`.
