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
  // sem a barra flutuante do modo dev (não aparece no site publicado de qualquer forma)
  devToolbar: { enabled: false },
  // blocos de código com as duas paletas; o CSS escolhe conforme o tema do blog
  markdown: { shikiConfig: { themes: { light: 'vitesse-light', dark: 'vitesse-dark' }, defaultColor: false } },
});
