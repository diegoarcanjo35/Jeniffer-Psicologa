# Site — Jeniffer Correia Psicologia

Site institucional estático (6 páginas) para GitHub + Cloudflare Pages, com
formulário de leads gravando no Cloudflare D1.

## ⚠️ Não recrie regras de reescrita no `_redirects`

Este foi o bug que derrubou todas as páginas internas.

O Cloudflare Pages **já** serve `/sobre` a partir de `sobre.html` e redireciona
`/sobre.html` de volta para `/sobre`. Quando o `_redirects` também tinha
`/sobre /sobre.html 200`, os dois comportamentos se cruzavam e o navegador
entrava em laço infinito (`ERR_TOO_MANY_REDIRECTS`).

Regra prática: **os links usam URLs limpas (`/sobre`) e o `_redirects` não
precisa de nenhuma linha para elas.**

## Sistema visual: "escuro e intimista"

O site é escuro por padrão. A hierarquia de fundos, do mais escuro ao mais claro:

| Token | Cor | Onde |
| --- | --- | --- |
| `--void` | `#0d0908` | rodapé, fecho, painel do menu |
| `--night` | `#15100e` | fundo base do site |
| `--surface` | `#1c1512` | faixas alternadas |
| `--wine` | `#38201a` | faixas com foto editorial |
| `--cream` | `#f3ebe2` | texto — e a **única** faixa clara |

A faixa `.band--light` é uma quebra luminosa proposital, usada **uma vez por
página no máximo**. Se ela aparecer duas ou três vezes, o contraste perde o
efeito e o site deixa de parecer escuro — passa a parecer inconsistente.

Acentos: `--gold` (`#c9a97c`) para eyebrows, filetes e links de ação;
`--rose` (`#c69a87`) para os trechos em itálico dos títulos.

### Tipografia

Duas fontes, hospedadas no próprio site (`assets/fonts/`), sem Google Fonts —
o que mantém a CSP fechada em `font-src 'self'`.

- **Cormorant** (variável, 300–700) — títulos, citações e números. É uma serifa
  de contraste alto: só funciona em corpo grande. Não use abaixo de ~20px.
- **Inter** (variável) — texto corrido, rótulos, botões.

Os rótulos e botões usam caixa alta com `letter-spacing: .18em`. Esse respiro
entre as letras é parte da identidade — se for removido, o site perde o ar
editorial.

### Grão

`body::after` aplica uma textura de ruído em SVG sobre a página inteira. É o
que impede o fundo escuro de parecer chapado. É puramente decorativo e não
recebe eventos de mouse.

## Como o CSS está organizado

O arquivo é **mobile-first**: o que está fora de qualquer `@media` vale para o
celular, e os blocos `@media (min-width: …)` apenas ampliam o layout.

- `600px` — grades passam a duas colunas
- `960px` — menu horizontal, hero dividido, layouts de duas colunas
- `1400px` — respiro máximo

Não adicione blocos `@media (max-width: …)`: era a mistura de regras
`max-width` sobrepostas que fazia o hero aparecer espremido em duas colunas no
celular na versão anterior.

## Content-Security-Policy

O `_headers` traz hashes `sha256` dos scripts embutidos (o marcador `js` no
`<head>` e os blocos JSON-LD). **Se você editar qualquer `<script>` inline ou o
JSON-LD, os hashes precisam ser recalculados**, senão o navegador bloqueia.

Duas consequências práticas da CSP que já causaram problema:

- `style-src 'self'` bloqueia atributos `style="..."` no HTML. Todo estilo
  precisa virar classe no CSS.
- `img-src 'self' data:` permite os SVGs embutidos (grão de fundo, seta do
  select). Não remova o `data:`.

Para recalcular o hash de um bloco, use o conteúdo exato entre `<script>` e
`</script>`:

```bash
printf '%s' "CONTEUDO_DO_SCRIPT" | openssl dgst -sha256 -binary | openssl base64
```

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `index.html` | Página inicial |
| `sobre.html` | Sobre mim → `/sobre` |
| `psicoterapia.html` | Psicoterapia → `/psicoterapia` |
| `como-funciona.html` | Como funciona, com FAQ → `/como-funciona` |
| `contato.html` | Formulário → `/contato` |
| `privacidade.html` | Política de privacidade → `/privacidade` |
| `assets/styles.css` | Folha de estilo única |
| `assets/app.js` | Cabeçalho, menu, máscara de telefone, formulário, animações |
| `assets/fonts/` | Cormorant e Inter em woff2 (subconjunto latino) |
| `functions/api/leads.js` | Endpoint que grava os contatos no D1 |
| `schema.sql` | Criação da tabela de leads |
| `_headers` | Cabeçalhos de segurança e cache |
| `_redirects` | Apenas atalhos antigos (`/inicio`, `/home`, `/index`) |

### Fotos

| Arquivo | Onde | Fundo |
| --- | --- | --- |
| `jeniffer-capa.webp` | capa da home | escuro |
| `jeniffer-hero.webp` | abertura da página Sobre | escuro |
| `jeniffer-sentada.webp` | faixa vinho da home | escuro |
| `jeniffer-sobre.webp` | faixa vinho da Psicoterapia | escuro |
| `jeniffer-detalhe.webp` | faixa vinho do Como funciona | escuro |
| `jeniffer-clara.webp` | faixa clara da home | claro |
| `jeniffer-apoiada.webp` | faixa clara do Sobre | claro |
| `jeniffer-olhar.webp` | reserva, não usada | claro |
| `jeniffer-social.jpg` | prévia em WhatsApp e redes | montada |

**Cache:** o `_headers` marca `/assets/*` como `immutable` por um ano. Para
trocar uma foto, **suba com um nome novo** e atualize o HTML. Sobrescrever um
arquivo mantendo o nome faz os navegadores continuarem exibindo a versão antiga.

## Publicar pelo GitHub Desktop

1. Faça commit e push para o repositório.
2. O Cloudflare Pages publica sozinho a cada push na branch principal.

Configuração no Cloudflare (feita uma única vez):

- Framework preset: `None` · Build command: vazio · Output directory: `/`
- **Settings → Bindings**: um D1 database com o nome de variável `DB`
- No D1, executar `schema.sql` uma única vez
- **Custom domains**: `jenifferpsi.elevesites.com.br`

## Teste local

```bash
npx serve .                                    # só a interface
npx wrangler pages dev . --d1 DB=jeniffer-leads  # com o formulário gravando
```

## Conformidade

A copy segue as regras do Conselho Federal de Psicologia: nome completo, a
palavra "psicóloga" e o CRP aparecem em todas as páginas; não há preço como
propaganda, promessa de resultado, depoimento de paciente nem título ainda não
concluído anunciado como especialização. O formulário coleta dado de saúde
(categoria especial da LGPD) com consentimento explícito e desmarcado por padrão.

Reconect Claudflare
