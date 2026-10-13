import type { APIContext } from 'astro';
import { getImage } from 'astro:assets';
import { getPosts, postUrl, readingTime } from '../lib/posts';
import { getCategory } from '../lib/categories';

/* Lista resumida dos posts publicados, para a seção "Do blog" da home do portfólio
   (joaoa.com.br). A home lê este arquivo no navegador: post novo aparece lá sozinho,
   sem precisar publicar o portfólio de novo. */
export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://joaoa.com.br');
  const posts = await getPosts();

  const items = await Promise.all(posts.slice(0, 6).map(async (post) => {
    const { title, description, date, category, cover, coverAlt } = post.data;
    const image = cover ? await getImage({ src: cover, width: 640, format: 'webp', quality: 72 }) : null;
    return {
      title,
      description,
      url: new URL(postUrl(post), site).href,
      date: date.toISOString().slice(0, 10),
      category: getCategory(category).name,
      readingTime: readingTime(post.body),
      cover: image ? new URL(image.src, site).href : null,
      coverAlt: coverAlt ?? '',
    };
  }));

  return new Response(JSON.stringify({ posts: items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
