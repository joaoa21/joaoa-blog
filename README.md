# Blog — João Alberto

Blog sobre design, email HTML, CRM e web, feito em **Astro** e servido em **[joaoa.com.br/blog](https://joaoa.com.br/blog/)**, com um **painel de publicação próprio que funciona sem backend**.

![Blog de João Alberto](https://joaoa.com.br/blog/og/og-blog.jpg)

## Destaques

- **Painel de publicação sem servidor** (`/blog/admin/`): cria, edita, publica e exclui posts pelo navegador. Ele salva direto neste repositório pela **API do GitHub** (Git Data API: blobs → tree → commit → ref), com texto e capa **num único commit**, e o Netlify publica em cerca de 1 minuto.
  - Editor com barra de Markdown, prévia, conversão da capa para WebP no navegador, filtros por tema, status e busca, e dropdown acessível próprio.
  - Acesso por *fine-grained token* do GitHub, guardado só no navegador de quem publica.
- **Layout de revista:** destaque, grade por tema e páginas de tema, com capas otimizadas pelo `astro:assets` (WebP em vários tamanhos) e capa tipográfica automática quando o post não tem imagem.
- **Tema claro e escuro** que segue o sistema, com opção de trocar manualmente e sem "piscar" ao carregar. Os blocos de código seguem o tema (Shiki com duas paletas).
- **SEO:** canonical, Open Graph e X/Twitter por post, dados estruturados (`Blog`, `BlogPosting`, autor ligado ao `#person` do portfólio), sitemap e RSS.
- **Mesmo domínio do portfólio:** projeto separado, servido em `/blog` por proxy do Netlify. O portfólio continua em HTML puro.
- **Leve:** sem JavaScript de animação; o JavaScript da página é só o do tema e o do painel.

## Stack

Astro · TypeScript · JavaScript · Content Collections · astro:assets · Shiki · marked · GitHub REST API · Netlify

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:4321/blog/
npm run build      # gera dist/blog/
```

Cada push na `main` publica no Netlify (`netlify.toml` configura build, redirecionamento e cabeçalhos).

## Estrutura

```
src/
  content/posts/        posts em Markdown (o nome do arquivo vira o endereço)
  assets/covers/        capas dos posts
  lib/                  temas (categories.ts) e utilitários de posts (posts.ts)
  components/           cabeçalho de SEO, cards de post, capas, barra de temas
  pages/                home, post, páginas de tema, RSS e o painel (admin/)
  scripts/admin/        painel: cliente da API do GitHub, frontmatter, editor e dropdown
public/                 fontes, CSS compartilhado e imagens de compartilhamento
scripts/fetch-404.mjs   copia a 404 do portfólio a cada build
```

## Escrever um post pelo código

1. Crie um arquivo em `src/content/posts/`: `meu-post.md` vira `joaoa.com.br/blog/meu-post/`.
2. Comece com o cabeçalho:

   ```md
   ---
   title: "Título do post"
   description: "Resumo de até 170 caracteres — aparece no Google e nas prévias de link."
   date: 2026-10-15
   category: email-html            # email-html, crm, design, web ou bastidores
   tags: ["Email HTML", "CRM"]
   cover: ../../assets/covers/meu-post.webp   # opcional; sem capa, gera uma tipográfica
   coverAlt: "Descrição da capa"
   draft: true                     # opcional: não publica enquanto for true
   ---
   ```

3. Escreva em Markdown. Títulos `##`, listas, links, blocos de código e checklists `- [ ]` já têm estilo.
4. Para atualizar um post antigo, adicione `updated: 2026-11-02`.

Rascunhos aparecem no `npm run dev`, mas não vão para o site publicado.

---

Feito por **João Alberto** — designer e desenvolvedor front-end · [joaoa.com.br](https://joaoa.com.br) · [LinkedIn](https://www.linkedin.com/in/joaoa210/)
