/* A página 404 do blog é a mesma do portfólio: a cada build ela é
   baixada de joaoa.com.br e salva em dist/404.html, que é o arquivo
   que o Netlify mostra para endereços inexistentes. Como o blog é
   servido no mesmo domínio, os estilos, a TV e as animações da 404
   carregam direto do portfólio — e ela nunca fica desatualizada. */
import fs from 'node:fs/promises';

const SOURCE = 'https://joaoa.com.br/404.html';

try {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  if (!html.includes('data-error="404"')) throw new Error('conteúdo inesperado');
  await fs.writeFile(new URL('../dist/404.html', import.meta.url), html);
  console.log('404 do portfólio copiada para dist/404.html');
} catch (error) {
  // sem internet ou portfólio fora do ar: o build segue, e o Netlify usa a 404 padrão
  console.warn(`Não foi possível copiar a 404 do portfólio (${error.message}).`);
}
