# Site — Jeniffer Correia Psicologia

Site institucional estático preparado para GitHub + Cloudflare Pages, com formulário de leads conectado ao Cloudflare D1.

## Publicar pelo GitHub Desktop

1. Adicione esta pasta como repositório local no GitHub Desktop.
2. Publique o repositório no GitHub.
3. No Cloudflare, acesse **Workers & Pages → Create → Pages → Connect to Git**.
4. Selecione o repositório e configure:
   - Framework preset: `None`
   - Build command: deixe vazio
   - Build output directory: `/`
5. Depois do primeiro deploy, em **Settings → Bindings**, adicione um D1 database com o nome de variável `DB`.
6. No banco D1, execute o conteúdo de `schema.sql` uma única vez.
7. Em **Custom domains**, adicione `jenifferpsi.elevesites.com.br`.

O arquivo `wrangler.toml.example` é apenas uma referência para testes locais. Não renomeie nem preencha esse arquivo se você fizer toda a configuração pelo painel do Cloudflare.

## Estrutura

- `index.html`: página principal.
- `privacidade.html`: política de privacidade.
- `assets/`: estilos, scripts e fotos.
- `functions/api/leads.js`: endpoint seguro que grava os contatos no D1.
- `schema.sql`: criação da tabela de leads.
- `_headers`: cabeçalhos de segurança e cache.
- `_redirects`: rotas amigáveis.
- `robots.txt` e `sitemap.xml`: indexação.

## Teste local

Para testar apenas a interface, abra `index.html` com um servidor local. Para testar também o formulário com D1, use o Wrangler:

```bash
npx wrangler pages dev . --d1 DB=jeniffer-leads
```

O formulário só registra dados quando o binding `DB` estiver configurado.

*Atualização de Publicação*

Deploy após reconexão do Cloudflare.