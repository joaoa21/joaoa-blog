import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: 'Blog de João Alberto',
    description: 'Design digital, email HTML, CRM, identidade visual e web, na prática.',
    // o link principal do feed é a página do blog, não a home do portfólio
    site: new URL('/blog/', context.site ?? 'https://joaoa.com.br').href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
      categories: post.data.tags,
    })),
    customData: '<language>pt-br</language>',
  });
}
