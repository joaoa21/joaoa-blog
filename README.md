# Blog — João Alberto

Blog em [Astro](https://astro.build) servido em **joaoa.com.br/blog/**.

É um projeto separado do portfólio (que continua em HTML puro), publicado como um segundo site no Netlify. O portfólio faz proxy de `/blog/*` para este site, então leitores e Google enxergam tudo no mesmo domínio.

## Escrever um post

1. Crie um arquivo em `src/content/posts/`. O nome vira o endereço: `meu-post.md` → `joaoa.com.br/blog/meu-post/`.
2. Comece com o cabeçalho:

   ```md
   ---
   title: "Título do post"
   description: "Resumo de até 170 caracteres — aparece no Google e nas prévias de link."
   date: 2026-10-15
   tags: ["Email HTML", "CRM"]
   image: "/blog/og/meu-post.jpg"      # opcional: imagem 1200x630 em public/og/
   imageAlt: "Descrição da imagem"     # opcional
   draft: true                          # opcional: não publica enquanto for true
   ---
   ```

3. Escreva em Markdown. Títulos `##`, listas, links, `código`, blocos de código com ```html e checklist `- [ ]` já têm estilo.
4. Para atualizar um post antigo, adicione `updated: 2026-11-02` ao cabeçalho.

Rascunhos (`draft: true`) aparecem no `npm run dev`, mas não vão para o site publicado.

## Rodar e publicar

```bash
npm install
npm run dev        # http://localhost:4321/blog/
npm run build      # gera dist/blog/
```

Cada push na `main` publica no Netlify automaticamente (`netlify.toml` já configura build e pasta).

## O que já vem pronto

- Mesma identidade do portfólio: fontes, cores, navegação, botões e rodapé (arquivos em `public/`).
- SEO por página: título, descrição, canonical em `joaoa.com.br/blog/…`, Open Graph, X/Twitter e dados estruturados (`Blog` e `BlogPosting`, com o autor ligado ao `#person` do portfólio).
- `sitemap-index.xml` e `rss.xml` gerados no build.
- Tempo de leitura, "Continue lendo", caixa do autor e chamada para contato em cada post.
- Página rápida: sem JavaScript de animação, só CSS.
- Página 404 igual à do portfólio: `scripts/fetch-404.mjs` baixa `joaoa.com.br/404.html` a cada build.

## Configuração (uma vez)

1. **GitHub:** crie o repositório `joaoa-blog` e envie este projeto.
2. **Netlify:** *Add new site → Import an existing project*, escolha o repositório. Build e pasta já vêm do `netlify.toml`. Anote o endereço gerado (ex.: `joaoa-blog.netlify.app`).
3. **Portfólio:** no `_redirects` do portfólio, **antes** da linha `/*`, adicione:

   ```
   /blog/*  https://joaoa-blog.netlify.app/blog/:splat  200
   ```

   e no `robots.txt` do portfólio:

   ```
   Sitemap: https://joaoa.com.br/blog/sitemap-index.xml
   ```

4. **Search Console:** envie `blog/sitemap-index.xml` em *Sitemaps*.
