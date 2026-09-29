import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from './lib/categories';

/* Cada post é um arquivo Markdown em src/content/posts/.
   O nome do arquivo vira o endereço: botao-outlook.md → /blog/botao-outlook/ */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(170),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      // tema principal (um só): define a página de tema e a etiqueta da capa
      category: z.enum(CATEGORY_SLUGS),
      tags: z.array(z.string()).default([]),
      // capa do post (de preferência 16:10, ex.: 1600x1000) em src/assets/covers/.
      // É otimizada no build (WebP, vários tamanhos). Sem capa, o post ganha uma capa tipográfica.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // destaque fixo no topo do blog; sem isso, o mais recente é o destaque
      featured: z.boolean().default(false),
      // imagem de compartilhamento (1200x630) em public/og/; sem ela, usa a capa ou a padrão do blog
      image: z.string().optional(),
      imageAlt: z.string().optional(),
      // rascunhos aparecem no `npm run dev`, mas não vão para o site publicado
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
