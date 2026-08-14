# Site — Jeniffer Correia Psicologia

Site institucional estático (6 páginas) preparado para GitHub + Cloudflare Pages,
com formulário de leads gravando no Cloudflare D1.

## ⚠️ Não recrie regras de reescrita no `_redirects`

Este foi o bug que derrubou todas as páginas internas.

O Cloudflare Pages **já** serve `/sobre` a partir de `sobre.html` e redireciona
`/sobre.html` de volta para `/sobre`. Quando o `_redirects` também tinha
`/sobre /sobre.html 200`, os dois comportamentos se cruzavam e o navegador
entrava em laço infinito (`ERR_TOO_MANY_REDIRECTS`).

Regra prática: **os links do site usam URLs limpas (`/sobre`) e o `_redirects`
não precisa de nenhuma linha para elas.**

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `index.html` | Página inicial |
| `sobre.html` | Sobre mim → `/sobre` |
| `psicoterapia.html` | Psicoterapia → `/psicoterapia` |
| `como-funciona.html` | Como funciona (com FAQ) → `/como-funciona` |
| `contato.html` | Formulário de contato → `/contato` |
| `privacidade.html` | Política de privacidade → `/privacidade` |
| `assets/styles.css` | Folha de estilo única, escrita mobile-first |
| `assets/app.js` | Menu, máscara de telefone, envio do formulário, animações |
| `functions/api/leads.js` | Endpoint que grava os contatos no D1 |
| `schema.sql` | Criação da tabela de leads |
| `_headers` | Cabeçalhos de segurança e cache |
| `_redirects` | Apenas atalhos antigos (`/inicio`, `/home`, `/index`) |

## Como o CSS está organizado

O arquivo é **mobile-first**: o que está fora de qualquer `@media` vale para o
celular, e os três blocos `@media (min-width: …)` apenas ampliam o layout.

- `560px` — grades passam a duas colunas
- `900px` — menu horizontal, layouts de duas colunas, fotos com recorte editorial
- `1200px` — respiro máximo

Não adicione blocos `@media (max-width: …)` novos: era a mistura de regras
`max-width` sobrepostas que fazia o hero aparecer espremido em duas colunas no
celular.

## Content-Security-Policy

O `_headers` traz hashes `sha256` dos scripts embutidos nas páginas
(o marcador `js` no `<head>` e os blocos JSON-LD). **Se você editar qualquer
`<script>` inline ou o JSON-LD, os hashes precisam ser recalculados**, senão o
navegador bloqueia o script.

Para recalcular o hash de um bloco, use o conteúdo exato entre `<script>` e
`</script>`:

```bash
printf '%s' "CONTEUDO_DO_SCRIPT" | openssl dgst -sha256 -binary | openssl base64
```

## Publicar pelo GitHub Desktop

1. Faça commit e push das alterações para o repositório.
2. O Cloudflare Pages publica sozinho a cada push na branch principal.

Configuração do projeto no Cloudflare (feita uma única vez):

- Framework preset: `None`
- Build command: vazio
- Build output directory: `/`
- Em **Settings → Bindings**, um D1 database com o nome de variável `DB`
- No D1, executar o conteúdo de `schema.sql` uma única vez
- Em **Custom domains**, adicionar `jenifferpsi.elevesites.com.br`

## Teste local

Só a interface:

```bash
npx serve .
```

Com o formulário funcionando (precisa do D1):

```bash
npx wrangler pages dev . --d1 DB=jeniffer-leads
```

## Conformidade

A copy segue as regras do Conselho Federal de Psicologia: nome completo, a
palavra "psicóloga" e o CRP aparecem em todas as páginas; não há preço como
propaganda, promessa de resultado, depoimento de paciente nem título ainda não
concluído anunciado como especialização. O formulário coleta dado de saúde
(categoria especial da LGPD) com consentimento explícito e desmarcado por padrão.
