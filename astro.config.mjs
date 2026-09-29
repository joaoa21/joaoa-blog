// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/* O blog é um projeto separado do portfólio, mas é servido em
   joaoa.com.br/blog/ (o _redirects do portfólio faz o proxy).
   Por isso: site = domínio principal, base = /blog e a saída do
   build fica em dist/blog, então os arquivos já nascem em /blog/. */
export default defineConfig({
  site: 'https://joaoa.com.br',
  base: '/blog',
  trailingSlash: 'always',
  outDir: './dist/blog',
  build: { format: 'directory' },
  integrations: [sitemap()],
  // blocos de código com fundo quase preto, como o resto do site
  markdown: { shikiConfig: { theme: 'vitesse-dark' } },
});
