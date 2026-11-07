# PRD — Gestão de Ocorrências (CondoManager)

> Tipo: PRD inicial · Data: 2026-10-30
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Sistema web para um condomínio acompanhar solicitações do dia a dia (vazamento, barulho, limpeza, etc.).

Há **duas áreas**:

- **Área do funcionário** (dashboard): síndico e zelador entram com e-mail e senha. Cadastram moradores, categorias, abrem e gerenciam ocorrências (lista, filtros, detalhe, edição, status, fotos, comentários).
- **Área do morador**: o morador acessa por um link público, informa o **e-mail já cadastrado** (sem senha) e passa a ver **todas** as ocorrências do condomínio, abrir nova, ver detalhe, comentar, editar a que ele mesmo abriu e excluir a própria (se ainda não estiver encerrada).

A interface do funcionário deve seguir `docs/DESIGN.md` e a tela de referência de **Gestão de Ocorrências** (lista, cards de totais, busca, filtros de status e categoria, tabela com ID, categoria/título, local, data, status e ação de ver). A área do morador segue o mesmo sistema visual, com layout mais simples e mobile-first.

## 2. Problema que resolve

Hoje ocorrências circulam por WhatsApp, caderno ou conversa informal. Falta um registro único com categoria, local, fotos, histórico de comentários e status. Moradores não conseguem acompanhar o andamento; a administração não consegue filtrar o que está pendente.

## 3. Público-alvo

- **Funcionários do condomínio:** síndico e zelador (no V1, **as mesmas permissões**).
- **Moradores** já cadastrados pela administração (nome, e-mail, torre/apartamento, telefone).

Não é um produto para o público geral nem para vários condomínios.

## 4. Objetivo do recorte atual

Entregar um V1 usável em **um condomínio**: cadastro de moradores, categorias, ocorrências com fotos opcionais, listagem/filtro, detalhe, comentários, status com trava ao encerrar, e as duas formas de acesso (funcionário com senha; morador só com e-mail).

## 5. Funcionalidades

**Essenciais:**

- Login do funcionário com e-mail e senha.
- Acesso do morador pelo e-mail cadastrado (sem senha).
- Cadastro de moradores (criar, listar, editar): nome completo, e-mail, torre/apartamento, telefone.
- Cadastro de categorias de ocorrência (criar e listar; só funcionário).
- Abrir ocorrência (funcionário e morador): título, descrição, categoria, local (área comum **ou** texto livre), fotos opcionais (várias).
- Listar ocorrências, buscar (ID, local ou descrição), filtrar por status e categoria.
- Ver detalhe da ocorrência (dados, fotos, comentários, autor, datas, status).
- Funcionário edita qualquer ocorrência ainda aberta; morador edita **somente** a que ele abriu, se ainda aberta.
- Funcionário muda status: Pendente, Em análise, Resolvido, Cancelado.
- Morador **não** muda status; pode **excluir** a própria ocorrência se ainda aberta.
- Comentários no detalhe; o autor edita ou apaga o **próprio** comentário.
- Trava: Resolvido e Cancelado ficam somente leitura (não edita, não exclui, não comenta, não altera foto, não muda status).
- Indicadores na tela de gestão do funcionário: total de ocorrências, pendentes + em análise, resolvidas no mês.
- Cargo do funcionário (Síndico ou Zelador) visível no cadastro/conta; **sem diferença de permissão no V1**.

**Desejáveis:**

- Não se aplica neste recorte. O que não entra está em “Fora do escopo”.

## 6. Fora do escopo

- Vários condomínios / multi-tenant.
- Magic link, SMS, WhatsApp ou senha para morador.
- Notificações por e-mail, push ou WhatsApp.
- Reservas de áreas, financeiro, boletos, visitantes, encomendas.
- App mobile nativo.
- Tela de Configurações (além do cadastro de categorias, que é simples).
- Dashboard analítico separado (gráficos avançados); a “home” do funcionário é a gestão de ocorrências.
- Busca global do cabeçalho, sino de alertas e “Suporte” da tela de referência.
- Cadastro de novos funcionários pela interface (há usuário inicial na implantação). **Suposição.**
- Permissões diferentes entre síndico e zelador (os cargos existem, o poder é igual).
- Reabrir ocorrência já Resolvida ou Cancelada.
- Anexos em comentários; arquivos que não sejam imagem.
- Auto-cadastro do morador.

## 7. Regras de negócio

- Regra 1: Existe um único condomínio neste produto.
- Regra 2: E-mail é **único** entre moradores e funcionários (não distingue maiúsculas). Um e-mail não pode ser morador e funcionário ao mesmo tempo.
- Regra 3: Só morador **cadastrado** acessa a área do morador. E-mail inexistente não cria conta e não entra.
- Regra 4: Acesso do morador **não exige senha**. Quem souber o e-mail cadastrado entra como aquele morador. Risco aceito no V1.
- Regra 5: Funcionário entra só com e-mail **e senha**.
- Regra 6: Síndico e zelador têm as **mesmas** permissões no V1.
- Regra 7: Morador **vê todas** as ocorrências do condomínio.
- Regra 8: Morador **edita** e **exclui** só ocorrências das quais ele é o autor, e só se o status for Pendente ou Em análise.
- Regra 9: Funcionário **cria, edita e exclui** qualquer ocorrência em Pendente ou Em análise; **muda status** enquanto não estiver Resolvido ou Cancelado.
- Regra 10: Morador **não muda status**.
- Regra 11: Status possíveis: **Pendente**, **Em análise**, **Resolvido**, **Cancelado**. Nova ocorrência nasce **Pendente**.
- Regra 12: **Resolvido** e **Cancelado** travam a ocorrência: somente visualização. Não há reabertura no V1.
- Regra 13: Categoria é escolhida de uma **lista** cadastrada pelo funcionário. Morador não cria categoria.
- Regra 14: Local é **híbrido**: escolher uma área comum da **lista fixa do V1** **ou** preencher texto livre. Um dos dois é obrigatório; não os dois ao mesmo tempo.
- Regra 15: Fotos são opcionais e podem ser várias, somente na ocorrência (não no comentário).
- Regra 16: Comentário só em ocorrência não travada. Só o autor edita ou apaga o próprio comentário. Funcionário não apaga comentário de morador (e vice-versa), salvo se for o autor.
- Regra 17: Cada ocorrência tem um identificador visível para pessoas (ex.: formato de código curto), autor (morador ou funcionário), data de abertura e status.
- Regra 18: Título, descrição e categoria são obrigatórios na ocorrência.
- Regra 19: Sessão permanece até o usuário sair ou a sessão expirar de forma usual do produto. **Suposição:** logout explícito existe nas duas áreas.

**Lista fixa de áreas comuns (V1) — suposição** (o pedido 15.c não trouxe os nomes; ajuste se necessário):

Hall, Garagem, Piscina, Salão de festas, Playground, Elevador, Jardim, Portaria.

**Categorias iniciais — suposição:** Manutenção, Ruído, Limpeza. Funcionário pode cadastrar outras.

**Limite de fotos — suposição:** até 5 imagens por ocorrência; apenas formatos de imagem usuais.

## 8. Fluxos principais

### Fluxo 1 — Funcionário entra e acompanha ocorrências

1. Acessa a área do funcionário.
2. Informa e-mail e senha.
3. Se válido, vê a gestão de ocorrências (totais, busca, filtros, lista).
4. Filtra ou busca, abre o detalhe, comenta, edita ou muda status conforme as regras.

### Fluxo 2 — Funcionário cadastra morador

1. Logado, abre Cadastro de Moradores.
2. Preenche nome completo, e-mail, torre/apartamento, telefone.
3. Sistema recusa e-mail já usado.
4. Morador passa a poder acessar a área do morador com esse e-mail.

### Fluxo 3 — Morador acessa pelo link

1. Abre o link da área do morador.
2. Informa o e-mail.
3. Se o e-mail existir no cadastro, entra; senão, vê erro claro e não entra.
4. Vê a lista de todas as ocorrências, com filtro de status e categoria.

### Fluxo 4 — Morador abre ocorrência

1. Logado na área do morador, escolhe nova ocorrência.
2. Preenche título, descrição, categoria (lista), local (área comum **ou** texto), fotos opcionais.
3. Envia. A ocorrência nasce Pendente, com ele como autor.
4. Aparece nas listas do morador e do funcionário.

### Fluxo 5 — Comentário no detalhe

1. Usuário (morador ou funcionário) abre uma ocorrência não travada.
2. Lê dados, fotos e comentários anteriores.
3. Escreve um comentário e envia.
4. Pode editar ou apagar **o próprio** comentário.

### Fluxo 6 — Encerrar ocorrência

1. Funcionário no detalhe (ou ação equivalente) escolhe Resolvido ou Cancelado.
2. Sistema confirma a ação (é irreversível no V1).
3. Ocorrência fica somente leitura para todos.

### Fluxo 7 — Morador exclui o próprio chamado

1. Autor abre a ocorrência em Pendente ou Em análise.
2. Confirma exclusão.
3. A ocorrência some das listas. Se já estiver Resolvida/Cancelada, a exclusão é recusada.

## 9. Critérios de aceite

- O funcionário consegue entrar com e-mail e senha e usar a gestão de ocorrências.
- O morador consegue entrar só com e-mail cadastrado e é barrado se o e-mail não existir.
- O morador vê todas as ocorrências, não só as dele.
- O usuário consegue abrir ocorrência com categoria, local (lista ou texto) e fotos opcionais.
- O usuário consegue listar, buscar e filtrar por status e categoria.
- O usuário consegue abrir o detalhe e comentar.
- O morador consegue editar e excluir **somente** a ocorrência que abriu, se não estiver travada.
- O funcionário consegue editar, excluir e mudar status de ocorrências não travadas.
- O sistema não deixa o morador mudar status.
- O sistema não deixa alterar ocorrência Resolvida ou Cancelada.
- O sistema impede e-mail duplicado no cadastro de moradores (e em relação a funcionários).
- Só o autor do comentário edita ou apaga aquele comentário.
- Quando a ação é inválida (sem permissão, travada, dados faltando), o sistema informa o erro e não grava.
- A tela de gestão do funcionário apresenta os totais e a lista no espírito da tela de referência, usando o visual de `docs/DESIGN.md`.

## 10. Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase (autenticação do funcionário, dados e armazenamento das fotos)
- shadcn/ui
- Referência visual: `docs/DESIGN.md` e tela de Gestão de Ocorrências

## 11. Justificativa da stack

O repositório já é Next.js + TypeScript + Tailwind. Dashboard com login, dados e fotos combina com Supabase (auth, banco e storage) sem inflar o V1. shadcn/ui e o DESIGN.md dão consistência visual. Não há necessidade de app nativo, fila ou multi-condomínio neste recorte.

## 12. Fases de construção

### Fase 1 — Experiência base das duas áreas

Objetivo: existir a área do funcionário e a área do morador, com visual e navegação do V1, sem ainda o ciclo completo da ocorrência.

Specs:

- Spec 01 — Duas áreas, navegação e identidade visual
- Spec 02 — Login do funcionário
- Spec 03 — Acesso do morador por e-mail

### Fase 2 — Cadastros de apoio

Objetivo: existir morador e categoria, que a ocorrência e o acesso do morador dependem.

Specs:

- Spec 04 — Cadastro de moradores
- Spec 05 — Categorias de ocorrência

### Fase 3 — Ocorrências (núcleo)

Objetivo: abrir, listar, filtrar, ver detalhe, editar, status/trava e excluir.

Specs:

- Spec 06 — Abrir ocorrência
- Spec 07 — Listar, buscar e filtrar ocorrências
- Spec 08 — Detalhe da ocorrência
- Spec 09 — Editar ocorrência
- Spec 10 — Status e trava
- Spec 11 — Excluir ocorrência

### Fase 4 — Fotos, comentários e indicadores

Objetivo: completar o acompanhamento e a tela de gestão do funcionário.

Specs:

- Spec 12 — Fotos da ocorrência
- Spec 13 — Comentários
- Spec 14 — Indicadores da gestão (funcionário)

## 13. Specs funcionais detalhadas

> Cada spec deve ser autossuficiente: um agente de codificação vai ler SÓ esta spec (mais as dependências) para montar o plano técnico e implementar. Preencha todos os campos; se um não se aplica, escreva "Não se aplica" e o porquê.

### Spec 01 — Duas áreas, navegação e identidade visual

- **Fase:** Fase 1
- **Objetivo (o quê):** Separar com clareza a área do funcionário e a área do morador, com navegação do V1 e visual alinhado ao DESIGN.md e à tela de referência.
- **Intenção (por quê):** Evitar que morador e administração se misturem no mesmo fluxo e dar o “chão” visual para as specs seguintes.
- **Contexto:** Produto novo. Referências: `docs/DESIGN.md` (Civic Horizon: confiável, corporativo moderno, azul institucional, Manrope + Inter, dashboard com sidebar ~240px, área do morador mobile-first). Tela de referência: Gestão de Ocorrências (marca CondoManager, sidebar com condomínio, Nova Ocorrência, itens Ocorrências e Cadastro de Moradores, Sair).
- **Atores:** Funcionário e morador.
- **Descrição do comportamento:** O sistema oferece dois pontos de entrada. Na área do funcionário, após autenticado (Spec 02), há menu: Ocorrências (tela principal de gestão) e Cadastro de Moradores. Não há, no V1, item Configurações, Dashboard analítico, Suporte nem busca global do topo. Há identificação do condomínio, ação de sair e espaço para o conteúdo. Na área do morador, após acesso (Spec 03), o layout é coluna única, focado em listar/abrir/ver ocorrências e sair. Visitante não autenticado na área do funcionário vê só o login. Visitante na área do morador vê só o pedido de e-mail. Estados de carregamento e vazio das telas seguintes devem caber nesse casco visual.
- **Entradas e saídas:** Entrada: usuário escolhe o link da área (funcionário ou morador). Saída: tela de acesso ou, se já autenticado, a tela principal daquela área.
- **Dados/entidades envolvidos (conceitual):** Sessão (funcionário autenticado ou morador identificado pelo e-mail); identificação do condomínio (nome de exibição).
- **Estados e transições:** Desconectado → tela de acesso da respectiva área. Conectado → área autenticada com menu. Sair → volta à tela de acesso.
- **Regras de negócio:** Morador nunca vê o menu administrativo. Funcionário nunca usa o acesso só-e-mail da área do morador para administrar (são papéis distintos; e-mail único).
- **Validações:** Não se aplica a formulário nesta spec; vale não exibir itens fora do escopo.
- **Fluxo do usuário (passo a passo):**
  1. Abre o link da área desejada.
  2. Se não estiver autenticado, vê o acesso daquela área.
  3. Se estiver, vê a navegação permitida ao papel.
  4. Usa Sair e retorna ao acesso.
- **Casos de borda e erros:** Link da área do funcionário com sessão de morador (ou o inverso): o sistema não mistura papéis; cada área só aceita o tipo correspondente. Página inexistente: mensagem simples de não encontrado.
- **Impacto no existente:** Nenhum produto anterior; define o casco das próximas specs.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um visitante Quando abre a área do funcionário sem sessão Então vê o acesso de funcionário e não o menu administrativo.
  - Dado um funcionário autenticado Quando navega Então vê Ocorrências e Cadastro de Moradores e consegue Sair.
  - Dado um morador autenticado Quando navega Então não vê Cadastro de Moradores nem indicadores administrativos da tela de referência.
  - Dado qualquer tela autenticada Quando renderiza Então tipografia, cores, cantos e hierarquia seguem o DESIGN.md (não o tema genérico do scaffold).
- **Definição de pronto:** As duas áreas existem, com navegação do V1, logout e visual reconhecível em relação ao DESIGN.md e à tela de referência (mesmo que as listas ainda sejam placeholder até as specs de dados).
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Login real, cadastros, CRUD de ocorrência, permissões por cargo distintas, item Configurações.

### Spec 02 — Login do funcionário

- **Fase:** Fase 1
- **Objetivo (o quê):** Funcionário entra com e-mail e senha e obtém sessão na área administrativa.
- **Intenção (por quê):** Proteger cadastro de moradores e gestão de ocorrências. Morador não usa este fluxo.
- **Contexto:** Depende do casco da Spec 01. Há um usuário inicial de funcionário na implantação (e-mail + senha + cargo Síndico ou Zelador). Cadastro de novos funcionários pela UI está fora do V1.
- **Atores:** Funcionário (síndico ou zelador).
- **Descrição do comportamento:** Na área do funcionário, o usuário informa e-mail e senha. Credenciais válidas abrem a gestão de ocorrências. Credenciais inválidas não entram e mostram erro genérico (não revelar se o e-mail existe). Funcionário já autenticado que acessa o login é levado à área autenticada. Sair encerra a sessão. O cargo (Síndico/Zelador) pode aparecer na interface; **não altera permissões**.
- **Entradas e saídas:** Entrada: e-mail, senha. Saída: sessão de funcionário ou mensagem de erro.
- **Dados/entidades envolvidos (conceitual):** Funcionário: nome (se houver), e-mail, senha, cargo (Síndico ou Zelador).
- **Estados e transições:** Sem sessão → autenticando → autenticado ou erro. Autenticado → sair → sem sessão.
- **Regras de negócio:** Só funcionário usa senha. E-mail único no sistema. Morador não autentica neste formulário mesmo que o e-mail exista como morador.
- **Validações:** E-mail em formato válido; senha obrigatória. Campos vazios não enviam.
- **Fluxo do usuário (passo a passo):**
  1. Abre a área do funcionário.
  2. Preenche e-mail e senha e envia.
  3. Em sucesso, vê a área autenticada.
  4. Em falha, permanece no login com erro.
- **Casos de borda e erros:** Senha errada; e-mail de morador neste login; campos vazios; falha de rede: mensagem para tentar de novo, sem entrar.
- **Impacto no existente:** Ativa a área autenticada da Spec 01 para funcionário.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário cadastrado Quando informa e-mail e senha corretos Então entra na área administrativa.
  - Dado um e-mail/senha inválidos Quando envia Então não entra e vê erro.
  - Dado um e-mail de morador (sem ser funcionário) Quando tenta este login Então não entra.
  - Dado um funcionário autenticado Quando sai Então precisa autenticar de novo para voltar.
- **Definição de pronto:** Login e logout do funcionário funcionam com o usuário inicial; rotas administrativas não abrem sem sessão de funcionário.
- **Dependências:** Spec 01 — áreas e navegação.
- **Fora do escopo desta spec:** Recuperação de senha, 2FA, magic link, cadastro público de funcionário, acesso do morador.

### Spec 03 — Acesso do morador por e-mail

- **Fase:** Fase 1
- **Objetivo (o quê):** Morador entra na área do morador informando apenas o e-mail já cadastrado.
- **Intenção (por quê):** Baixa fricção para quem não quer senha. O cadastro é feito pela administração (Spec 04).
- **Contexto:** Link próprio da área do morador (Spec 01). Sem o cadastro de moradores, ninguém entra; a spec pode ser integrada assim que a Spec 04 existir. Risco aceito: quem conhece o e-mail entra como aquele morador.
- **Atores:** Morador cadastrado; visitante com e-mail desconhecido.
- **Descrição do comportamento:** O visitante informa o e-mail e envia. Se existir morador com esse e-mail, o sistema inicia sessão de morador e mostra a área do morador. Se não existir, mostra erro claro do tipo “e-mail não encontrado no cadastro” e não entra. Não cria morador neste fluxo. E-mail de funcionário não serve para este acesso. Sair encerra a sessão de morador.
- **Entradas e saídas:** Entrada: e-mail. Saída: sessão de morador ou erro.
- **Dados/entidades envolvidos (conceitual):** Morador: e-mail (chave de acesso), nome, torre/apartamento.
- **Estados e transições:** Sem identificação → verificando e-mail → identificado ou erro.
- **Regras de negócio:** Sem senha. Só e-mail cadastrado como morador. E-mail comparado sem diferenciar maiúsculas.
- **Validações:** E-mail obrigatório e em formato válido.
- **Fluxo do usuário (passo a passo):**
  1. Abre o link da área do morador.
  2. Informa o e-mail e envia.
  3. Entra ou vê que o e-mail não está cadastrado.
- **Casos de borda e erros:** E-mail vazio/inválido; e-mail de funcionário; e-mail inexistente; falha de rede. Em todos, não entra.
- **Impacto no existente:** Complementa a Spec 01 para o papel morador.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador cadastrado Quando informa o e-mail correto Então acessa a área do morador.
  - Dado um e-mail não cadastrado Quando envia Então não entra e vê que o e-mail não foi encontrado.
  - Dado um e-mail de funcionário Quando usa este acesso Então não entra como morador.
  - Dado um morador identificado Quando sai Então a próxima visita pede o e-mail de novo.
- **Definição de pronto:** Identificação só-e-mail funciona; área do morador não abre sem essa identificação.
- **Dependências:** Spec 01. Fica completa com Spec 04 (precisa existir morador cadastrado).
- **Fora do escopo desta spec:** Senha do morador, magic link, auto-cadastro, permissões de ocorrência (specs 06–13).

### Spec 04 — Cadastro de moradores

- **Fase:** Fase 2
- **Objetivo (o quê):** Funcionário cria, lista e edita moradores: nome completo, e-mail, torre/apartamento, telefone. Sem senha.
- **Intenção (por quê):** Sem morador cadastrado, a área do morador não tem quem entrar e a ocorrência perde o vínculo de autor morador.
- **Contexto:** Menu Cadastro de Moradores da área do funcionário. E-mail único no sistema (moradores + funcionários).
- **Atores:** Funcionário autenticado.
- **Descrição do comportamento:** O funcionário vê a lista de moradores (nome, e-mail, torre/apartamento, telefone). Pode cadastrar novo e editar existente. Não há senha. Exclusão física de morador está fora; **suposição:** não excluir morador no V1 para preservar histórico de ocorrências. Lista vazia mostra estado vazio com convite para cadastrar.
- **Entradas e saídas:** Entrada: nome completo, e-mail, torre/apartamento, telefone. Saída: morador persistido ou erros de validação; lista atualizada.
- **Dados/entidades envolvidos (conceitual):** Morador: nome completo, e-mail, torre/apartamento, telefone, data de cadastro.
- **Estados e transições:** Não se aplica (cadastro ativo único). Não há status inativo no V1.
- **Regras de negócio:** E-mail único (inclusive vs. funcionário). Todos os quatro campos obrigatórios. Só funcionário acessa esta tela. Morador não vê nem edita o cadastro de outros moradores.
- **Validações:** Nome com ao menos nome e sobrenome (mínimo duas palavras). **Suposição.** E-mail válido. Telefone obrigatório (formato livre, não vazio). Torre/apartamento não vazio. E-mail duplicado: recusa com mensagem.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre Cadastro de Moradores.
  2. Clica em cadastrar, preenche, salva.
  3. Vê o morador na lista.
  4. Abre edição, altera (exceto se e-mail novo colidir), salva.
- **Casos de borda e erros:** E-mail duplicado; e-mail igual ao do funcionário; campos vazios; falha ao salvar. A lista não some em caso de erro de um formulário.
- **Impacto no existente:** Habilita Spec 03. Ocorrências futuras (Spec 06) usam o morador como autor.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário autenticado Quando cadastra morador com dados válidos Então o morador aparece na lista e consegue o acesso da Spec 03.
  - Dado um e-mail já usado Quando tenta cadastrar ou editar para esse e-mail Então o sistema recusa e explica a duplicidade.
  - Dado um morador autenticado Quando tenta a URL/tela de cadastro de moradores Então não acessa.
  - Dado um morador existente Quando o funcionário edita telefone ou apto Então a lista mostra os novos dados.
- **Definição de pronto:** CRUD de criar/listar/editar moradores validado, com e-mail único, só na área do funcionário.
- **Dependências:** Spec 01, Spec 02.
- **Fora do escopo desta spec:** Importação em planilha, exclusão/inativação, foto do morador, auto-cadastro.

### Spec 05 — Categorias de ocorrência

- **Fase:** Fase 2
- **Objetivo (o quê):** Funcionário cadastra e lista categorias usadas ao abrir/filtrar ocorrência.
- **Intenção (por quê):** Evitar categoria 100% livre (Ruído vs ruido) e ainda permitir o condomínio incluir tipos novos.
- **Contexto:** Só funcionário. Categorias iniciais **supostas:** Manutenção, Ruído, Limpeza. Não há tela grande de Configurações; pode ser uma lista simples acessível ao funcionário (por exemplo junto da gestão de ocorrências ou tela enxuta de categorias).
- **Atores:** Funcionário.
- **Descrição do comportamento:** O funcionário vê as categorias existentes e adiciona uma nova (nome). Nome único, sem diferenciar maiúsculas. Categorias aparecem no select de nova ocorrência e no filtro. **Suposição V1:** não excluir categoria já usada; não editar nome se isso quebrar o histórico — apenas criar novas. Se for permitido editar nome, todas as ocorrências daquela categoria passam a exibir o novo nome. Decisão desta spec: **criar e listar**; não excluir.
- **Entradas e saídas:** Entrada: nome da categoria. Saída: categoria na lista ou erro de duplicidade/vazio.
- **Dados/entidades envolvidos (conceitual):** Categoria: nome.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** Só funcionário cria categoria. Morador só escolhe da lista. Nome obrigatório e único.
- **Validações:** Nome não vazio, sem duplicar existente.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre a gestão de categorias.
  2. Informa o nome e salva.
  3. A categoria aparece na lista e nos selects de ocorrência.
- **Casos de borda e erros:** Nome vazio; duplicado; morador tentando criar: recusado.
- **Impacto no existente:** Spec 06 e Spec 07 dependem desta lista.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário Quando cadastra categoria com nome novo Então ela aparece para escolher ao abrir ocorrência e no filtro.
  - Dado um nome já existente Quando tenta cadastrar de novo Então o sistema recusa.
  - Dado um morador Quando usa o sistema Então não encontra ação de criar categoria.
- **Definição de pronto:** Lista inicial existe; funcionário adiciona categoria nova; ocorrência e filtro consomem essa lista.
- **Dependências:** Spec 01, Spec 02.
- **Fora do escopo desta spec:** Ícones por categoria, cor, exclusão, categoria em texto livre.

### Spec 06 — Abrir ocorrência

- **Fase:** Fase 3
- **Objetivo (o quê):** Morador e funcionário abrem ocorrência com título, descrição, categoria, local (área comum **ou** texto livre) e, opcionalmente, fotos (Spec 12 pode completar o anexo; esta spec já reserva o comportamento de criar o registro).
- **Intenção (por quê):** Registrar o problema de forma padronizada para a administração agir.
- **Contexto:** Listas da Spec 05. Áreas comuns **fixas no V1** (suposição na seção 7). Autor: quem está autenticado (morador ou funcionário). Status inicial: Pendente.
- **Atores:** Morador identificado; funcionário autenticado.
- **Descrição do comportamento:** O usuário aciona “Nova ocorrência”, preenche os campos e envia. Categoria vem de select. Local: ou escolhe área comum da lista fixa, ou marca/usa campo de texto livre — nunca os dois. Fotos: ver Spec 12; criar sem foto é válido. Sucesso: ocorrência gravada, usuário vai ao detalhe ou à lista com confirmação. Identificador visível é gerado pelo sistema.
- **Entradas e saídas:** Entrada: título, descrição, categoria, tipo de local + valor (lista ou texto), fotos opcionais. Saída: ocorrência Pendente com autor, data e código visível.
- **Dados/entidades envolvidos (conceitual):** Ocorrência: código visível, título, descrição, categoria, local (origem lista ou texto), autor (morador ou funcionário), data/hora de abertura, status (Pendente), fotos (0 a N).
- **Estados e transições:** Criação → status Pendente (demais transições na Spec 10).
- **Regras de negócio:** Título, descrição, categoria e local obrigatórios. Morador autor = morador da sessão. Funcionário autor = funcionário da sessão (não é obrigatório “abrir em nome de um morador”). **Suposição.**
- **Validações:** Campos obrigatórios; categoria deve existir; se local for lista, valor deve ser uma área da lista fixa; se for texto, não vazio; não enviar lista e texto juntos.
- **Fluxo do usuário (passo a passo):**
  1. Usuário autenticado aciona nova ocorrência.
  2. Preenche e escolhe categoria e local.
  3. Opcionalmente anexa fotos (Spec 12).
  4. Envia e vê a ocorrência criada.
- **Casos de borda e erros:** Sem sessão: não abre o formulário. Validação falha: mantém dados e mostra erros. Falha ao gravar: não cria registro parcial visível como sucesso.
- **Impacto no existente:** Alimenta lista (Spec 07) e detalhe (Spec 08).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador identificado Quando envia ocorrência válida Então ela nasce Pendente com ele como autor e aparece para todos nas listas.
  - Dado um funcionário Quando envia ocorrência válida Então ela nasce Pendente com ele como autor.
  - Dado o formulário Quando a categoria ou o local faltam Então o sistema não grava.
  - Dado o local Quando o usuário escolhe área comum Então o texto livre não é usado; o inverso também.
- **Definição de pronto:** Morador e funcionário criam ocorrência válida; inválida é recusada com mensagem.
- **Dependências:** Spec 02 e/ou 03, Spec 05. Fotos completas na Spec 12 (criar sem foto já vale).
- **Fora do escopo desta spec:** Mudar status na criação, atribuir responsável, prioridade, prazo.

### Spec 07 — Listar, buscar e filtrar ocorrências

- **Fase:** Fase 3
- **Objetivo (o quê):** Mostrar ocorrências em lista, com busca por código/local/descrição (e título) e filtros de status e categoria.
- **Intenção (por quê):** Administração e moradores precisam achar o que está pendente ou de um tipo, sem abrir uma a uma.
- **Contexto:** Tela de referência do funcionário: cards de totais (Spec 14), busca “ID, Local ou Descrição”, Status, Categoria, Filtrar, tabela (código, categoria/título, local, data, status, ação de ver), paginação. Área do morador: mesma informação em lista mais simples (cards ou lista), mobile-first, **sem** os cards de KPI administrativos.
- **Atores:** Funcionário e morador (ambos veem **todas** as ocorrências).
- **Descrição do comportamento:** Lista ordenada da mais recente para a mais antiga. Filtros combináveis: status (todos ou um dos quatro), categoria (todas ou uma). Busca textual no código visível, local e descrição/título. “Filtrar” aplica os critérios. Sem resultados: estado vazio. Paginação quando passar do tamanho de página. **Suposição:** 10 itens por página. Ação de ver abre o detalhe (Spec 08). Status como chip visual (Pendente, Em análise, Resolvido, Cancelado) alinhado ao DESIGN.md.
- **Entradas e saídas:** Entrada: texto de busca, status, categoria, página. Saída: conjunto filtrado e total correspondente.
- **Dados/entidades envolvidos (conceitual):** Os da ocorrência já listados na Spec 06.
- **Estados e transições:** Não se aplica (leitura). Filtros são estado de tela, não da ocorrência.
- **Regras de negócio:** Morador vê todas. Sem sessão, sem lista. Filtro de categoria usa as categorias cadastradas.
- **Validações:** Status e categoria, se informados, devem ser valores conhecidos; busca livre.
- **Fluxo do usuário (passo a passo):**
  1. Entra na lista da sua área.
  2. Opcionalmente busca e/ou escolhe status e categoria.
  3. Aplica filtro e percorre a lista/páginas.
  4. Abre uma ocorrência pelo ver/detalhe.
- **Casos de borda e erros:** Nenhum registro; filtro sem match; busca com espaços; falha ao carregar: mensagem e retry. Não vazar dados para quem não está autenticado.
- **Impacto no existente:** Consome Spec 06. A tela do funcionário deve lembrar a referência visual.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado ocorrências de vários status Quando o usuário filtra por Pendente Então só pendentes aparecem.
  - Dado ocorrências de várias categorias Quando filtra por uma categoria Então só essa categoria aparece.
  - Dado um código visível conhecido Quando busca esse código Então a ocorrência correspondente aparece.
  - Dado um morador autenticado Quando abre a lista Então vê ocorrências de outros moradores também.
  - Dado lista vazia ou filtro sem resultado Quando a tela renderiza Então há estado vazio compreensível, não uma tabela quebrada.
- **Definição de pronto:** Listas das duas áreas filtram e buscam de verdade; a do funcionário segue a referência (colunas e filtros), sem KPI ainda (Spec 14).
- **Dependências:** Spec 06 (e Spec 05 para o filtro de categoria).
- **Fora do escopo desta spec:** Ordenação avançada, exportar planilha, KPI (Spec 14), edição em linha.

### Spec 08 — Detalhe da ocorrência

- **Fase:** Fase 3
- **Objetivo (o quê):** Exibir uma ocorrência completa: dados, autor, datas, status, local, categoria, fotos, ações permitidas ao papel, e o espaço de comentários (Spec 13 preenche o fio).
- **Intenção (por quê):** É o lugar onde se entende o caso e se age (editar, status, excluir, comentar).
- **Atores:** Funcionário e morador autenticados.
- **Descrição do comportamento:** Ao abrir pelo código/ação ver, o sistema mostra todos os campos da ocorrência. Se não existir ou o usuário não estiver autenticado, não mostra dados. Ações visíveis dependem das regras: editar/excluir/status só se não travada e se o papel permitir (Specs 09–11). Comentários abaixo (Spec 13). Fotos visíveis (Spec 12).
- **Entradas e saídas:** Entrada: identificação da ocorrência. Saída: visualização completa ou não encontrado.
- **Dados/entidades envolvidos (conceitual):** Ocorrência completa + autor (nome; se morador, torre/apartamento) + fotos + comentários.
- **Estados e transições:** Somente exibe o status atual; quem muda é a Spec 10.
- **Regras de negócio:** Qualquer morador ou funcionário autenticado vê qualquer ocorrência do condomínio. Área errada/papel errado não mistura menus (Spec 01).
- **Validações:** ID inexistente → não encontrado, sem erro técnico cru.
- **Fluxo do usuário (passo a passo):**
  1. Clica para ver na lista.
  2. Lê o detalhe.
  3. Usa as ações que o sistema habilita para o seu papel e para o status.
- **Casos de borda e erros:** ID inválido; sessão expirou no meio; ocorrência excluída: mensagem de não encontrada.
- **Impacto no existente:** Destino da Spec 07; ponto de ancoragem das Specs 09–13.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência existente Quando qualquer morador autenticado abre o detalhe Então vê os dados (não só o autor).
  - Dado um ID inexistente Quando alguém tenta abrir Então vê que não foi encontrada.
  - Dado uma ocorrência Resolvida Quando o usuário abre Então vê os dados e **não** vê ações de editar, excluir, comentar ou mudar status.
- **Definição de pronto:** Detalhe abre para os dois papéis com os dados corretos e esconde ações conforme a trava/permissão (mesmo que editar/status ainda sejam specs seguintes, o detalhe já mostra o conteúdo).
- **Dependências:** Spec 06, Spec 07.
- **Fora do escopo desta spec:** Implementar por completo o editor, a máquina de status, exclusão e o CRUD de comentários — cada um tem spec; aqui o detalhe é o palco.

### Spec 09 — Editar ocorrência

- **Fase:** Fase 3
- **Objetivo (o quê):** Permitir alterar título, descrição, categoria, local e fotos de ocorrência ainda aberta, com regras de quem pode.
- **Intenção (por quê):** Corrigir dados sem abrir um chamado novo; impedir que um morador altere o chamado do vizinho.
- **Contexto:** Spec 08. Fotos na Spec 12 (incluir/remover foto na edição segue as mesmas regras de permissão).
- **Atores:** Autor morador; qualquer funcionário.
- **Descrição do comportamento:** Em Pendente ou Em análise: o autor morador edita a própria; o funcionário edita qualquer uma. Em Resolvido ou Cancelado: ninguém edita. Campos e validações iguais à criação. Sucesso atualiza o detalhe. Não se muda status por este formulário (Spec 10).
- **Entradas e saídas:** Entrada: campos alterados. Saída: ocorrência atualizada ou recusa.
- **Dados/entidades envolvidos (conceitual):** Os mesmos da Spec 06.
- **Estados e transições:** Status não muda nesta spec.
- **Regras de negócio:** Morador não edita ocorrência de outro (nem de funcionário). Funcionário edita qualquer aberta. Travadas: somente leitura.
- **Validações:** Iguais à Spec 06. Tentativa sem permissão: recusa.
- **Fluxo do usuário (passo a passo):**
  1. No detalhe, aciona editar (se visível).
  2. Altera campos e salva.
  3. Vê os dados novos no detalhe.
- **Casos de borda e erros:** Morador tenta editar a de outro (UI escondida e servidor recusa). Edição em ocorrência que foi travada enquanto o formulário estava aberto: recusa. Validação igual à criação.
- **Impacto no existente:** Lista e detalhe passam a mostrar dados novos.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o autor morador e ocorrência Pendente Quando altera o título Então o detalhe mostra o novo título.
  - Dado um morador que não é o autor Quando tenta editar Então o sistema impede.
  - Dado um funcionário e ocorrência Em análise de um morador Quando altera a categoria Então grava.
  - Dado status Resolvido Quando qualquer um tenta editar Então o sistema impede.
- **Definição de pronto:** Permissões de edição cobertas nos dois papéis e nos status abertos vs travados.
- **Dependências:** Spec 08. Spec 10 para a trava (pode ser implementada em paralelo se a edição já recusar Resolvido/Cancelado).
- **Fora do escopo desta spec:** Mudar status, editar comentários, transferir autoria.

### Spec 10 — Status e trava

- **Fase:** Fase 3
- **Objetivo (o quê):** Funcionário altera o status entre Pendente, Em análise, Resolvido e Cancelado; Resolvido e Cancelado travam a ocorrência para sempre no V1.
- **Intenção (por quê):** O acompanhamento só funciona se o estado for explícito e o encerramento não for desfeito por acidente.
- **Contexto:** Detalhe da ocorrência. Morador não muda status. Encerrar deve pedir confirmação porque é irreversível.
- **Atores:** Funcionário. Morador apenas visualiza o status.
- **Descrição do comportamento:** Em Pendente ou Em análise, o funcionário pode ir para qualquer um dos quatro status. Ao escolher Resolvido ou Cancelado, o sistema pede confirmação explícita. Depois disso: sem editar, excluir, comentar, mudar foto ou mudar status de novo. Transições entre Pendente e Em análise não travam e não precisam de confirmação pesada (podem ter confirmação leve). **Suposição:** não há fluxo “reabrir”.
- **Entradas e saídas:** Entrada: novo status. Saída: ocorrência com status atualizado ou recusa.
- **Dados/entidades envolvidos (conceitual):** Ocorrência.status; data da última mudança de status (**suposição:** registrar quando foi resolvida/cancelada, útil no KPI do mês).
- **Estados e transições:**
  - Pendente → Em análise, Resolvido, Cancelado
  - Em análise → Pendente, Resolvido, Cancelado
  - Resolvido → (nenhuma)
  - Cancelado → (nenhuma)
  - Nova ocorrência entra em Pendente (Spec 06)
- **Regras de negócio:** Só funcionário muda status. Morador não. Trava total após Resolvido ou Cancelado.
- **Validações:** Status informado deve ser um dos quatro. Recusar se já travada. Recusar se o ator for morador.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre o detalhe de uma ocorrência aberta.
  2. Escolhe o novo status.
  3. Se for Resolvido ou Cancelado, confirma.
  4. A lista e o detalhe mostram o novo chip; ações de edição desaparecem.
- **Casos de borda e erros:** Morador tenta mudar status: impede. Dois funcionários ao mesmo tempo: o segundo a encerrar vence; o outro recebe recusa se já travada. Falha ao salvar: status antigo permanece.
- **Impacto no existente:** Specs 09, 11, 12, 13 devem respeitar a trava. Spec 14 conta resolvidas no mês.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário e ocorrência Pendente Quando muda para Em análise Então o status atualiza e a ocorrência continua editável.
  - Dado um funcionário Quando confirma Resolvido Então a ocorrência fica somente leitura para todos.
  - Dado um funcionário Quando confirma Cancelado Então a ocorrência fica somente leitura para todos.
  - Dado um morador Quando está no detalhe Então não há controle de mudar status.
  - Dado uma ocorrência já Resolvida Quando um funcionário tenta mudar o status Então o sistema impede.
- **Definição de pronto:** Os quatro status existem; trava irreversível funciona; morador não altera status.
- **Dependências:** Spec 08.
- **Fora do escopo desta spec:** Reabertura, status “Recusado” extra, SLA, responsável técnico.

### Spec 11 — Excluir ocorrência

- **Fase:** Fase 3
- **Objetivo (o quê):** Remover ocorrência ainda aberta: morador só a própria; funcionário qualquer uma. Travadas não se excluem.
- **Intenção (por quê):** O morador pediu poder excluir o chamado (em vez de mudar status). Evita lixo e erros de abertura, sem apagar histórico já encerrado.
- **Contexto:** Complementa a Spec 10 (cancelar é encerrar com rastro; excluir some da lista). Preferir Cancelado quando a administração quiser manter histórico — a spec não força isso, só descreve a exclusão.
- **Atores:** Autor morador; funcionário.
- **Descrição do comportamento:** Ação de excluir pede confirmação. Se permitida, a ocorrência (e seus comentários e fotos) deixa de aparecer nas listas e o detalhe passa a “não encontrada”. Se Pendente/Em análise e o ator é o autor morador ou um funcionário, pode excluir. Se Resolvido/Cancelado, recusa. Se morador não autor, recusa.
- **Entradas e saídas:** Entrada: confirmação de exclusão. Saída: ausência da ocorrência ou erro.
- **Dados/entidades envolvidos (conceitual):** Ocorrência e itens ligados (fotos, comentários) deixam de ser visíveis.
- **Estados e transições:** Registro deixa de existir para o usuário. Não há lixeira no V1. **Suposição.**
- **Regras de negócio:** Ver acima. Excluir não é o mesmo que Cancelar.
- **Validações:** Permissão + status aberto + confirmação.
- **Fluxo do usuário (passo a passo):**
  1. No detalhe (ou ação equivalente), escolhe excluir.
  2. Confirma.
  3. Volta à lista sem aquele item.
- **Casos de borda e erros:** Sem confirmação: não exclui. Travada: recusa. Não autor: recusa. Já excluída: não encontrada.
- **Impacto no existente:** Lista e totais (Spec 14) deixam de contar o item.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o autor e ocorrência Pendente Quando confirma exclusão Então ela some da lista de todos.
  - Dado um morador não autor Quando tenta excluir Então o sistema impede.
  - Dado um funcionário e ocorrência Em análise de um morador Quando confirma exclusão Então ela some.
  - Dado status Cancelado ou Resolvido Quando alguém tenta excluir Então o sistema impede.
- **Definição de pronto:** Exclusão respeita autor, papel e trava, com confirmação.
- **Dependências:** Spec 08, Spec 10 (trava).
- **Fora do escopo desta spec:** Lixeira, exclusão em massa, exclusão só de foto (isso é Spec 12).

### Spec 12 — Fotos da ocorrência

- **Fase:** Fase 4
- **Objetivo (o quê):** Anexar várias fotos opcionais na criação e na edição da ocorrência; exibi-las no detalhe; permitir remover foto enquanto a ocorrência estiver aberta e o usuário tiver permissão de editar.
- **Intenção (por quê):** Prova visual do problema (vazamento, sujeira) sem tornar a foto obrigatória.
- **Contexto:** Spec 06 e 09. Storage na stack (Supabase). Comentário não tem anexo.
- **Atores:** Quem pode criar/editar aquela ocorrência.
- **Descrição do comportamento:** No formulário de criar/editar, o usuário pode adicionar imagens (zero a várias). **Suposição:** máximo 5; apenas tipos de imagem usuais. No detalhe, as fotos aparecem em galeria simples. Remover foto conta como edição (mesmas permissões e trava). Falha no envio de uma foto não deve anunciar sucesso total se a ocorrência ficou sem o anexo prometido: ou grava ocorrência e avisa a foto que falhou, ou recusa o pacote — **decisão de comportamento:** a ocorrência pode ser salva e as fotos que falharam são informadas para tentar de novo na edição.
- **Entradas e saídas:** Entrada: arquivos de imagem. Saída: fotos visíveis no detalhe ou mensagem de tipo/quantidade inválida.
- **Dados/entidades envolvidos (conceitual):** Foto ligada à ocorrência (ordem de inclusão).
- **Estados e transições:** Não se aplica além da trava da ocorrência.
- **Regras de negócio:** Opcional. Várias. Só na ocorrência. Travada: não adiciona nem remove.
- **Validações:** Tipo imagem; limite de quantidade; recusar se não puder editar.
- **Fluxo do usuário (passo a passo):**
  1. Ao criar ou editar, anexa uma ou mais imagens.
  2. Salva.
  3. No detalhe, visualiza; se ainda aberta e com permissão, remove alguma e salva.
- **Casos de borda e erros:** Arquivo não imagem; acima do limite; ocorrência travada; falha de envio. Sempre mensagem clara.
- **Impacto no existente:** Formulários das Specs 06 e 09 e detalhe da Spec 08.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado o formulário de nova ocorrência Quando o usuário envia sem fotos Então a ocorrência é criada mesmo assim.
  - Dado o formulário Quando anexa várias imagens válidas Então todas aparecem no detalhe.
  - Dado o autor em ocorrência aberta Quando remove uma foto Então ela deixa de aparecer.
  - Dado ocorrência Resolvida Quando alguém tenta anexar foto Então o sistema impede.
  - Dado um arquivo que não é imagem Quando tenta anexar Então o sistema recusa.
- **Definição de pronto:** Criar/editar/ver/remover fotos obedece limite, tipo e permissão/trava.
- **Dependências:** Spec 06, Spec 08, Spec 09, Spec 10.
- **Fora do escopo desta spec:** Vídeo, PDF, fotos em comentário, edição da imagem (recorte).

### Spec 13 — Comentários

- **Fase:** Fase 4
- **Objetivo (o quê):** Fio de comentários no detalhe; criar; autor edita ou apaga o próprio.
- **Intenção (por quê):** Conversar no contexto do chamado sem WhatsApp paralelo.
- **Contexto:** Spec 08. Qualquer morador ou funcionário autenticado comenta em qualquer ocorrência **não travada**.
- **Atores:** Morador e funcionário.
- **Descrição do comportamento:** Abaixo dos dados, lista de comentários em ordem cronológica (mais antigo primeiro ou mais novo primeiro — **suposição:** mais antigo no topo, novo embaixo, como conversa). Cada item: texto, nome do autor, papel (morador/funcionário), data/hora. Campo para novo comentário só se não travada. Autor vê editar/apagar no próprio. Editar atualiza o texto (opcionalmente marca “editado”). Apagar pede confirmação e remove do fio. Não há resposta aninhada no V1.
- **Entradas e saídas:** Entrada: texto do comentário. Saída: comentário visível a todos que veem o detalhe, ou recusa.
- **Dados/entidades envolvidos (conceitual):** Comentário: texto, autor, data, ocorrência, indicador de editado.
- **Estados e transições:** Publicado → editado → ou excluído. Ocorrência travada: sem novas transições.
- **Regras de negócio:** Texto obrigatório, não vazio. Só autor edita/apaga o próprio. Travada: somente leitura do fio. Sem anexo.
- **Validações:** Texto não vazio; ocorrência existente e aberta para criar; identidade do autor para editar/apagar.
- **Fluxo do usuário (passo a passo):**
  1. Abre o detalhe.
  2. Lê o fio.
  3. Escreve e envia.
  4. Se quiser, edita ou apaga o que ele mesmo escreveu.
- **Casos de borda e erros:** Texto vazio; travada; outro usuário tenta apagar comentário alheio; sessão expirou. Recusas com mensagem.
- **Impacto no existente:** Detalhe (Spec 08) fica completo para acompanhamento.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado uma ocorrência aberta Quando um morador (não necessariamente o autor) envia comentário Então todos veem no detalhe.
  - Dado o autor do comentário Quando edita o texto Então o fio mostra a versão nova.
  - Dado o autor do comentário Quando confirma exclusão Então o comentário some.
  - Dado outro usuário Quando tenta apagar comentário alheio Então o sistema impede.
  - Dado ocorrência Cancelada ou Resolvida Quando alguém tenta comentar Então o sistema impede.
- **Definição de pronto:** Criar/editar/apagar o próprio comentário funciona; alheio e travado são bloqueados.
- **Dependências:** Spec 08, Spec 10.
- **Fora do escopo desta spec:** Menções, anexo, thread aninhada, comentário interno só da administração.

### Spec 14 — Indicadores da gestão (funcionário)

- **Fase:** Fase 4
- **Objetivo (o quê):** Na tela de Gestão de Ocorrências do funcionário, mostrar três totais: total de ocorrências, pendentes + em análise, resolvidas no mês corrente.
- **Intenção (por quê):** Dar visão rápida da carga, como na tela de referência, sem um dashboard analítico separado.
- **Contexto:** Spec 07. Área do morador **não** mostra esses cards. Tela de referência: “Total de ocorrências”, “Pendentes / Em análise”, “Resolvidas (mês)”.
- **Atores:** Funcionário.
- **Descrição do comportamento:** Os números refletem o conjunto real (após exclusões). Total = quantidade de ocorrências existentes. Segundo card = soma de Pendente e Em análise. Terceiro = quantidade com status Resolvido cuja data de resolução cai no mês/ano atuais. Filtros da lista **não** alteram os cards (os cards são do conjunto geral). **Suposição.** Canceladas não entram no card de resolvidas.
- **Entradas e saídas:** Entrada: nenhuma do usuário além de estar na tela. Saída: três números atualizados.
- **Dados/entidades envolvidos (conceitual):** Contagens derivadas das ocorrências e da data de resolução.
- **Estados e transições:** Não se aplica.
- **Regras de negócio:** Só funcionário vê. Números consistentes com a base (não inventados).
- **Validações:** Não se aplica.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre Gestão de Ocorrências.
  2. Lê os três cards.
  3. Usa a lista abaixo (Spec 07) para operar.
- **Casos de borda e erros:** Zero ocorrências: cards em zero. Virada de mês: resolvidas do mês anterior saem do terceiro card. Falha ao carregar: indicador de erro, não número mentiroso.
- **Impacto no existente:** Completa a tela da Spec 07 para ficar fiel à referência.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado N ocorrências no sistema Quando o funcionário abre a gestão Então o total é N.
  - Dado P pendentes e A em análise Quando abre a gestão Então o segundo card é P+A.
  - Dado R resolvidas neste mês e outras resolvidas em meses anteriores Quando abre a gestão Então o terceiro card é só R.
  - Dado um morador autenticado Quando usa a área do morador Então não vê esses três cards administrativos.
- **Definição de pronto:** Cards visíveis só no funcionário, com números corretos e visual alinhado à referência/DESIGN.md.
- **Dependências:** Spec 07, Spec 10 (data de resolvida).
- **Fora do escopo desta spec:** Gráficos, comparativo mensal, card de canceladas, filtros alterando KPI.

## 14. Ordem recomendada de implementação

1. Spec 01 — Duas áreas, navegação e identidade visual
2. Spec 02 — Login do funcionário
3. Spec 04 — Cadastro de moradores
4. Spec 03 — Acesso do morador por e-mail
5. Spec 05 — Categorias de ocorrência
6. Spec 06 — Abrir ocorrência
7. Spec 07 — Listar, buscar e filtrar ocorrências
8. Spec 08 — Detalhe da ocorrência
9. Spec 12 — Fotos da ocorrência (pode acompanhar a Spec 06 se for mais barato já nascer com anexo)
10. Spec 09 — Editar ocorrência
11. Spec 10 — Status e trava
12. Spec 11 — Excluir ocorrência
13. Spec 13 — Comentários
14. Spec 14 — Indicadores da gestão (funcionário)

Seguir essa ordem evita construir lista/detalhe sem autor e categoria, e evita a área do morador antes de existir morador cadastrado. A Spec 12 pode ser puxada para junto da 06 se o anexo já estiver no formulário de criação. Specs 09–11 dependem do detalhe e da ideia de status; a trava (10) deve existir antes de dar exclusão (11) como regra fechada.

**Suposições a confirmar só se quiser mudar o V1 (já documentadas no texto):** nomes das áreas comuns; categorias iniciais; máximo de 5 fotos; sem exclusão de morador; sem cadastro de funcionários na UI; cards de KPI ignoram o filtro da lista; funcionário pode criar ocorrência sem vincular um morador.
