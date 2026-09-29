import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* Cada post é um arquivo Markdown em src/content/posts/.
   O nome do arquivo vira o endereço: botao-outlook.md → /blog/botao-outlook/ */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    // imagem de compartilhamento (1200x630) em public/og/; sem ela, usa a padrão do blog
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    // rascunhos aparecem no `npm run dev`, mas não vão para o site publicado
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
