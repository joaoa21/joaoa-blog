/* Temas do blog. O "slug" vira o endereço: /blog/tema/<slug>/
   Para criar um tema novo, é só adicionar aqui (e usar o slug no post). */
export const CATEGORIES = [
  {
    slug: 'email-html',
    name: 'Email HTML',
    description: 'Emails que funcionam em qualquer caixa de entrada: Gmail, Outlook, Apple Mail e além.',
  },
  {
    slug: 'crm',
    name: 'CRM & Gamificação',
    description: 'Design para retenção e engajamento: campanhas, missões, torneios e ciclo de vida.',
  },
  {
    slug: 'design',
    name: 'Design & Marca',
    description: 'Identidade visual, direção de arte e key visuals, do conceito às aplicações.',
  },
  {
    slug: 'web',
    name: 'Web & Ferramentas',
    description: 'Sites, front-end e ferramentas que aceleram o dia a dia de quem cria.',
  },
  {
    slug: 'bastidores',
    name: 'Bastidores',
    description: 'Como os projetos do portfólio foram pensados, do briefing à entrega.',
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug) as [CategorySlug, ...CategorySlug[]];

export function getCategory(slug: CategorySlug) {
  return CATEGORIES.find((category) => category.slug === slug)!;
}

export function categoryUrl(slug: CategorySlug): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/tema/${slug}/`;
}
