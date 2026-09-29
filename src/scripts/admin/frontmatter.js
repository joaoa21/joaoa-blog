/* Lê e escreve o cabeçalho (frontmatter) dos posts em Markdown.
   Só os formatos que o próprio blog usa: textos entre aspas, datas,
   booleanos e a lista de tags. Campos desconhecidos são preservados. */

const ORDER = ['title', 'description', 'date', 'updated', 'category', 'tags', 'cover', 'coverAlt', 'featured', 'image', 'imageAlt', 'draft'];
const QUOTED = new Set(['title', 'description', 'coverAlt', 'image', 'imageAlt']);

function parseValue(raw) {
  const value = raw.trim();
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.startsWith('"') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      if (value.startsWith('[')) {
        return value.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
    }
  }
  return value.replace(/^'(.*)'$/, '$1');
}

/** Separa o cabeçalho do texto: { data, body } */
export function parsePost(text) {
  const match = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };

  const data = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (field) data[field[1]] = parseValue(field[2]);
  }
  return { data, body: match[2].replace(/^\n+/, '') };
}

function formatValue(key, value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'boolean') return String(value);
  if (QUOTED.has(key)) return JSON.stringify(String(value));
  const text = String(value);
  // valores simples (datas, temas, caminhos) vão sem aspas; o resto, com aspas
  return /^[\w./-]+$/.test(text) ? text : JSON.stringify(text);
}

/** Monta o arquivo .md a partir dos campos e do texto. */
export function serializePost(data, body) {
  const keys = [...ORDER, ...Object.keys(data).filter((key) => !ORDER.includes(key))];
  const lines = [];
  for (const key of keys) {
    const value = data[key];
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if ((key === 'draft' || key === 'featured') && value === false) continue;
    lines.push(`${key}: ${formatValue(key, value)}`);
  }
  return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`;
}

/** "Botão de email no Outlook!" → "botao-de-email-no-outlook" */
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}
