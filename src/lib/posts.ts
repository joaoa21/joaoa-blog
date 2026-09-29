import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, type CategorySlug } from './categories';

export type Post = CollectionEntry<'posts'>;

/** Posts publicados, do mais novo para o mais antigo. Rascunhos só aparecem no modo dev. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Destaque do topo: o post marcado como featured mais recente, ou o mais novo de todos. */
export function pickFeatured(posts: Post[]): Post | undefined {
  return posts.find((post) => post.data.featured) ?? posts[0];
}

/** Temas que têm pelo menos um post, na ordem definida em categories.ts, com seus posts. */
export function groupByCategory(posts: Post[]) {
  return CATEGORIES.map((category) => ({
    ...category,
    posts: posts.filter((post) => post.data.category === category.slug),
  })).filter((group) => group.posts.length > 0);
}

export function postsInCategory(posts: Post[], slug: CategorySlug): Post[] {
  return posts.filter((post) => post.data.category === slug);
}

/** Tempo de leitura estimado (200 palavras por minuto), sem contar blocos de código. */
export function readingTime(body = ''): string {
  const text = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min de leitura`;
}

const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** 29 set. 2026 */
export function formatDate(date: Date): string {
  return formatter.format(date).replace(/ de /g, ' ');
}

/** Endereço público de um post: /blog/<id>/ */
export function postUrl(post: Post): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${post.id}/`;
}
