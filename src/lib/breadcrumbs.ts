/* Breadcrumbs (BreadcrumbList) para os dados estruturados: Início › Blog › … */
const SITE = 'https://joaoa.com.br';

export function breadcrumbs(trail: [name: string, path: string][]) {
  const items: [string, string][] = [['Início', '/'], ['Blog', '/blog/'], ...trail];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: new URL(path, SITE).href,
    })),
  };
}
