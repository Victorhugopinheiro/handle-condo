# CondoManager

Última atualização: 2026-11-03

CondoManager é a gestão de ocorrências de um condomínio (Residencial Horizonte). Há duas áreas: funcionário (síndico e zelador) e morador. Os dois veem todas as ocorrências do condomínio.

## Acesso

| Quem        | Como entra                           | Destino                  |
| ----------- | ------------------------------------ | ------------------------ |
| Funcionário | E-mail e senha (Supabase Auth)       | `/dashboard/ocorrencias` |
| Morador     | Só o e-mail já cadastrado, sem senha | `/ocorrencias`           |

O cargo (Síndico ou Zelador) aparece na interface e não muda permissões. Não há tela para cadastrar funcionário; o usuário nasce no Auth e o perfil em `staff_profiles` é criado no primeiro login. Passo a passo em [implantacao.md](implantacao.md).

## Ocorrências

Código no formato `OC-0001`. Campos: título, descrição, categoria, local (área comum da lista ou texto livre) e até 5 fotos.

Status: Pendente, Em análise, Resolvido, Cancelado. Resolvido e Cancelado ficam somente leitura.

- Funcionário abre, edita, exclui e muda o status enquanto a ocorrência está aberta.
- Morador abre ocorrência, edita e exclui só a que ele mesmo abriu, e só enquanto está aberta.
- Os dois comentam. Cada um edita ou apaga só o próprio comentário, enquanto a ocorrência está aberta.
- A lista filtra por texto, status e categoria, com 10 itens por página. O funcionário vê tabela e indicadores; o morador vê cartões.

## Cadastros (só funcionário)

- Moradores: nome, e-mail, torre/apartamento e telefone. Criar e editar. Não há exclusão.
- Categorias: criar e listar. Sem editar nem apagar. O seed traz Manutenção, Ruído e Limpeza.

## O que esta versão não faz

- Senha, magic link ou cadastro público do morador.
- Cadastro de funcionário pela interface.
- Recuperação de senha.
- Permissão diferente entre síndico e zelador.
