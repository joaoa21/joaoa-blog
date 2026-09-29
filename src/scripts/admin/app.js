/* ============================================================
   PAINEL DO BLOG — interface
   Entrar com token → lista de posts → editor → salvar/publicar.
   Tudo acontece no navegador; o GitHub é o "banco de dados".
   ============================================================ */
import { marked } from 'marked';
import { createClient, rawUrl, POSTS_DIR, COVERS_DIR } from './github.js';
import { parsePost, serializePost, slugify } from './frontmatter.js';
import { enhanceSelect } from './select.js';

const $ = (selector) => document.querySelector(selector);
const TOKEN_KEY = 'joaoa-blog-admin-token';
const SITE = 'https://joaoa.com.br/blog/';
const CATEGORIES = JSON.parse(document.body.dataset.categories);
const categoryName = (slug) => CATEGORIES.find((category) => category.slug === slug)?.name ?? slug;

let client = null;
let posts = [];
let current = null; // { path, slug, isNew, data, body, cover: { bytes, url } | null, removeCover }
let dirty = false;

/* ---------- navegação entre telas ---------- */
function show(view) {
  for (const id of ['viewLogin', 'viewList', 'viewEditor']) $('#' + id).hidden = id !== view;
  $('#logout').hidden = view === 'viewLogin';
  window.scrollTo(0, 0);
}

function status(target, message, kind = '') {
  const element = $(target);
  element.textContent = message;
  element.dataset.kind = kind;
}

const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/* ---------- token ---------- */
function savedToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token, remember) {
  try {
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {}
}

function forgetToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function login(token, remember) {
  const candidate = createClient(token);
  await candidate.check();
  client = candidate;
  if (remember !== undefined) storeToken(token, remember);
  await openList();
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const token = $('#token').value.trim();
  if (!token) return;
  status('#loginError', 'Verificando…');
  try {
    await login(token, $('#remember').checked);
    $('#token').value = '';
    status('#loginError', '');
  } catch (error) {
    status('#loginError', error.status === 401 ? 'Token inválido ou expirado.' : error.message, 'error');
  }
});

$('#logout').addEventListener('click', () => {
  if (dirty && !confirm('Há alterações não salvas. Sair mesmo assim?')) return;
  forgetToken();
  client = null;
  dirty = false;
  show('viewLogin');
});

/* ---------- lista de posts ---------- */
async function loadPosts() {
  const files = await client.listPosts();
  const loaded = await Promise.all(files.map(async (file) => {
    const { data, body } = parsePost(await client.readText(file.path));
    return { path: file.path, slug: file.name.replace(/\.md$/, ''), data, body };
  }));
  posts = loaded.sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));
}

/* ---------- filtros da lista ---------- */
const filters = { search: '', theme: '', status: '', sort: 'new' };

const normalize = (text) => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  return day ? `${day}/${month}/${year}` : String(value);
}

function visiblePosts() {
  const query = normalize(filters.search.trim());
  const list = posts.filter((post) => {
    const draft = post.data.draft === true;
    if (filters.status === 'draft' && !draft) return false;
    if (filters.status === 'live' && draft) return false;
    if (filters.theme && post.data.category !== filters.theme) return false;
    if (!query) return true;
    const haystack = normalize([post.data.title, post.data.description, ...(post.data.tags ?? []), post.slug].join(' '));
    return haystack.includes(query);
  });

  const byDate = (a, b) => String(a.data.date).localeCompare(String(b.data.date));
  if (filters.sort === 'old') list.sort(byDate);
  else if (filters.sort === 'az') list.sort((a, b) => String(a.data.title).localeCompare(String(b.data.title), 'pt-BR'));
  else list.sort((a, b) => byDate(b, a));
  return list;
}

/** miniatura: a capa salva no repositório ou uma capa tipográfica pequena */
function thumbnail(post) {
  const box = document.createElement('span');
  box.className = 'adm-thumb';
  box.setAttribute('aria-hidden', 'true');
  if (post.data.cover) {
    const image = document.createElement('img');
    image.src = rawUrl(coverRepoPath(post.data.cover));
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.remove();
      box.classList.add('adm-thumb--type');
      box.textContent = categoryName(post.data.category);
    });
    box.append(image);
  } else {
    box.classList.add('adm-thumb--type');
    box.textContent = categoryName(post.data.category);
  }
  return box;
}

function renderList() {
  const list = $('#postList');
  list.replaceChildren();
  if (!posts.length) {
    status('#listStatus', 'Nenhum post ainda. Comece pelo botão "Novo post".');
    return;
  }

  const shown = visiblePosts();
  const drafts = posts.filter((post) => post.data.draft === true).length;
  const summary = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'} · ${posts.length - drafts} publicados · ${drafts} ${drafts === 1 ? 'rascunho' : 'rascunhos'}`;
  status('#listStatus', shown.length === posts.length ? summary : `${shown.length} de ${posts.length} posts`);

  if (!shown.length) {
    const empty = document.createElement('li');
    empty.className = 'adm-empty';
    empty.textContent = 'Nenhum post com esses filtros.';
    list.append(empty);
    return;
  }

  for (const post of shown) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'adm-post';
    const draft = post.data.draft === true;
    button.innerHTML = `
      <span class="adm-post-text">
        <span class="adm-post-meta mono"><span class="chip"></span><time></time></span>
        <strong></strong>
        <span class="adm-post-desc"></span>
      </span>
      <span class="adm-badge mono" data-state="${draft ? 'draft' : 'live'}">${draft ? 'Rascunho' : 'Publicado'}</span>`;
    button.prepend(thumbnail(post));
    button.querySelector('.chip').textContent = categoryName(post.data.category);
    button.querySelector('time').textContent = formatDate(post.data.date);
    button.querySelector('strong').textContent = post.data.title || post.slug;
    button.querySelector('.adm-post-desc').textContent = post.data.description || '';
    button.addEventListener('click', () => openEditor(post));
    item.append(button);
    list.append(item);
  }
}

$('#filterSearch').addEventListener('input', (event) => {
  filters.search = event.target.value;
  renderList();
});
$('#filterTheme').addEventListener('change', (event) => {
  filters.theme = event.target.value;
  renderList();
});
$('#filterSort').addEventListener('change', (event) => {
  filters.sort = event.target.value;
  renderList();
});
document.querySelectorAll('[data-status]').forEach((button) => {
  button.addEventListener('click', () => {
    filters.status = button.dataset.status;
    document.querySelectorAll('[data-status]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    renderList();
  });
});

async function openList() {
  show('viewList');
  status('#listStatus', 'Carregando posts…');
  $('#postList').replaceChildren();
  try {
    await loadPosts();
    renderList();
    openFromUrl();
  } catch (error) {
    status('#listStatus', `Não foi possível carregar os posts: ${error.message}`, 'error');
  }
}

/* atalho vindo do blog: /blog/admin/?post=<slug> abre o post; ?novo abre um em branco */
let urlHandled = false;
function openFromUrl() {
  if (urlHandled) return;
  urlHandled = true;
  const params = new URLSearchParams(location.search);
  if (params.has('novo')) {
    openEditor(null);
  } else if (params.get('post')) {
    const post = posts.find((item) => item.slug === params.get('post'));
    if (post) openEditor(post);
  }
  if (params.toString()) history.replaceState(null, '', location.pathname);
}

$('#newPost').addEventListener('click', () => openEditor(null));
$('#backToList').addEventListener('click', () => {
  if (dirty && !confirm('Há alterações não salvas. Voltar mesmo assim?')) return;
  dirty = false;
  openList();
});

/* ---------- editor ---------- */
function openEditor(post) {
  current = post
    ? { ...post, isNew: false, data: { ...post.data }, cover: null, removeCover: false }
    : { path: null, slug: '', isNew: true, data: { date: today(), category: CATEGORIES[0].slug, draft: true }, body: '', cover: null, removeCover: false };

  const { data } = current;
  $('#title').value = data.title ?? '';
  $('#slug').value = current.slug;
  $('#slug').readOnly = !current.isNew || data.draft === false;
  $('#slugHint').textContent = current.isNew ? 'Gerado a partir do título. Depois de salvo, não muda.' : 'O endereço não muda depois de salvo, para não quebrar links.';
  $('#description').value = data.description ?? '';
  $('#date').value = data.date ?? today();
  $('#category').value = data.category ?? CATEGORIES[0].slug;
  $('#tags').value = Array.isArray(data.tags) ? data.tags.join(', ') : '';
  $('#coverAlt').value = data.coverAlt ?? '';
  $('#featured').checked = data.featured === true;
  $('#body').value = current.body ?? '';
  $('#coverFile').value = '';
  $('#deletePost').hidden = current.isNew;
  updateCounter();
  showCover(data.cover ? rawUrl(coverRepoPath(data.cover)) : null);
  updateBadge();
  selectTab('write');
  status('#editorStatus', '');
  dirty = false;
  show('viewEditor');
  fitTitle();
  $('#title').focus();
}

/** "../../assets/covers/x.webp" → "src/assets/covers/x.webp" */
function coverRepoPath(frontmatterPath) {
  return 'src/' + frontmatterPath.replace(/^(\.\.\/)+/, '');
}

/* o título quebra linha e cresce com o texto (Enter não cria linha nova) */
function fitTitle() {
  const title = $('#title');
  title.style.height = 'auto';
  title.style.height = title.scrollHeight + 'px';
}

$('#title').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') event.preventDefault();
});

function updateBadge() {
  const badge = $('#stateBadge');
  if (current.isNew) {
    badge.textContent = 'Novo post';
    badge.dataset.state = 'new';
  } else {
    const draft = current.data.draft === true;
    badge.textContent = draft ? 'Rascunho' : 'Publicado';
    badge.dataset.state = draft ? 'draft' : 'live';
  }
  $('#publish span').textContent = current.isNew || current.data.draft === true ? 'Publicar' : 'Atualizar';
}

function updateCounter() {
  const length = $('#description').value.length;
  $('#descCount').textContent = `${length}/170`;
  $('#descCount').dataset.kind = length > 160 ? 'warn' : '';
}

function showCover(url) {
  const image = $('#coverPreview');
  if (url) {
    image.src = url;
    image.hidden = false;
    $('#coverEmpty').hidden = true;
    $('#coverRemove').hidden = false;
  } else {
    image.removeAttribute('src');
    image.hidden = true;
    $('#coverEmpty').hidden = false;
    $('#coverRemove').hidden = true;
  }
}

$('#editor').addEventListener('input', (event) => {
  dirty = true;
  if (event.target.id === 'title') fitTitle();
  if (event.target.id === 'title' && current.isNew) $('#slug').value = slugify(event.target.value);
  if (event.target.id === 'slug') event.target.value = slugify(event.target.value);
  if (event.target.id === 'description') updateCounter();
});

window.addEventListener('beforeunload', (event) => {
  if (dirty) event.preventDefault();
});

/* ---------- capa: converte para WebP no navegador ---------- */
async function toWebp(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 3200 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.9));
  if (!blob) throw new Error('Não foi possível converter a imagem.');
  return { bytes: new Uint8Array(await blob.arrayBuffer()), url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height, size: blob.size };
}

$('#coverFile').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  status('#editorStatus', 'Preparando a capa…');
  try {
    current.cover = await toWebp(file);
    current.removeCover = false;
    showCover(current.cover.url);
    dirty = true;
    const { width, height, size } = current.cover;
    const note = width < 1600 ? ' A imagem é pequena: pode ficar borrada em telas grandes.' : '';
    status('#editorStatus', `Capa pronta: ${width}×${height}, ${Math.round(size / 1024)} KB.${note}`, note ? 'warn' : '');
  } catch (error) {
    status('#editorStatus', error.message, 'error');
  }
});

$('#coverRemove').addEventListener('click', () => {
  current.cover = null;
  current.removeCover = true;
  $('#coverFile').value = '';
  showCover(null);
  dirty = true;
});

/* ---------- abas escrever / pré-visualizar ---------- */
function selectTab(tab) {
  const preview = tab === 'preview';
  $('#tabWrite').setAttribute('aria-selected', String(!preview));
  $('#tabPreview').setAttribute('aria-selected', String(preview));
  $('#panelWrite').hidden = preview;
  $('#panelPreview').hidden = !preview;
  if (preview) $('#preview').innerHTML = marked.parse($('#body').value || '*Nada escrito ainda.*');
}

$('#tabWrite').addEventListener('click', () => selectTab('write'));
$('#tabPreview').addEventListener('click', () => selectTab('preview'));

/* ---------- barra de formatação ---------- */
const FORMATS = {
  h2: { line: '## ' },
  h3: { line: '### ' },
  list: { line: '- ' },
  check: { line: '- [ ] ' },
  quote: { line: '> ' },
  bold: { wrap: ['**', '**'], placeholder: 'texto em negrito' },
  italic: { wrap: ['_', '_'], placeholder: 'texto em itálico' },
  code: { wrap: ['`', '`'], placeholder: 'código' },
  link: { wrap: ['[', '](https://)'], placeholder: 'texto do link' },
  block: { wrap: ['\n```html\n', '\n```\n'], placeholder: '<!-- código -->' },
};

document.querySelectorAll('[data-md]').forEach((button) => {
  button.addEventListener('click', () => {
    const format = FORMATS[button.dataset.md];
    const area = $('#body');
    const { selectionStart: start, selectionEnd: end, value } = area;
    let insert;
    let cursorStart;
    let cursorEnd;

    if (format.line) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      area.setRangeText(format.line, lineStart, lineStart, 'end');
      cursorStart = cursorEnd = end + format.line.length;
    } else {
      const selected = value.slice(start, end) || format.placeholder;
      insert = format.wrap[0] + selected + format.wrap[1];
      area.setRangeText(insert, start, end, 'end');
      cursorStart = start + format.wrap[0].length;
      cursorEnd = cursorStart + selected.length;
    }

    area.focus();
    area.setSelectionRange(cursorStart, cursorEnd);
    dirty = true;
  });
});

/* ---------- salvar / publicar ---------- */
function collect(publish) {
  const title = $('#title').value.replace(/\s+/g, ' ').trim();
  const description = $('#description').value.trim();
  const body = $('#body').value;
  const slug = current.isNew ? slugify($('#slug').value || title) : current.slug;
  const problems = [];
  if (!title) problems.push('o título');
  if (!slug) problems.push('o endereço');
  if (!description) problems.push('o resumo');
  if (publish && !body.trim()) problems.push('o texto');
  if (problems.length) throw new Error(`Falta preencher ${problems.join(', ')}.`);

  const data = {
    ...current.data,
    title,
    description,
    date: $('#date').value || today(),
    category: $('#category').value,
    tags: $('#tags').value.split(',').map((tag) => tag.trim()).filter(Boolean),
    coverAlt: $('#coverAlt').value.trim(),
    featured: $('#featured').checked,
    draft: !publish,
  };

  // quem edita um post já publicado registra a data da atualização
  if (!current.isNew && current.data.draft !== true && publish) data.updated = today();

  return { slug, data, body };
}

async function save(publish) {
  if (!client || !current) return;
  let payload;
  try {
    payload = collect(publish);
  } catch (error) {
    status('#editorStatus', error.message, 'error');
    return;
  }

  const { slug, data, body } = payload;
  const path = `${POSTS_DIR}/${slug}.md`;
  const files = [];
  const remove = [];
  const oldCover = current.data.cover ? coverRepoPath(current.data.cover) : null;

  setBusy(true);
  status('#editorStatus', publish ? 'Publicando…' : 'Salvando rascunho…');

  try {
    if (current.isNew && (await client.exists(path))) {
      throw new Error(`Já existe um post com o endereço /blog/${slug}/. Mude o endereço.`);
    }

    if (current.cover) {
      const coverPath = `${COVERS_DIR}/${slug}.webp`;
      files.push({ path: coverPath, bytes: current.cover.bytes });
      data.cover = `../../assets/covers/${slug}.webp`;
      if (oldCover && oldCover !== coverPath) remove.push(oldCover);
    } else if (current.removeCover) {
      delete data.cover;
      delete data.coverAlt;
      if (oldCover) remove.push(oldCover);
    }
    if (!data.cover) delete data.coverAlt;

    files.push({ path, text: serializePost(data, body) });

    const verb = publish ? (current.isNew || current.data.draft === true ? 'Publica' : 'Atualiza') : 'Salva rascunho';
    await client.commit({ message: `${verb}: ${data.title}`, files, remove });

    current = { ...current, path, slug, isNew: false, data, body, cover: null, removeCover: false };
    $('#slug').value = slug;
    $('#slug').readOnly = true;
    $('#deletePost').hidden = false;
    dirty = false;
    updateBadge();

    if (publish) {
      const url = `${SITE}${slug}/`;
      status('#editorStatus', '', 'ok');
      const element = $('#editorStatus');
      element.append('Publicado. Em cerca de 1 minuto estará em ');
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = url.replace('https://', '');
      element.append(link, '.');
    } else {
      status('#editorStatus', 'Rascunho salvo. Ele não aparece no site até ser publicado.', 'ok');
    }
  } catch (error) {
    const message = error.status === 409 ? 'O repositório mudou enquanto você editava. Tente de novo.' : error.message;
    status('#editorStatus', `Não foi possível salvar: ${message}`, 'error');
  } finally {
    setBusy(false);
  }
}

function setBusy(busy) {
  for (const id of ['#saveDraft', '#publish', '#deletePost']) $(id).disabled = busy;
}

$('#saveDraft').addEventListener('click', () => save(false));
$('#publish').addEventListener('click', () => save(true));

$('#deletePost').addEventListener('click', async () => {
  if (!current || current.isNew) return;
  if (!confirm(`Excluir o post "${current.data.title}"? Ele sai do site e do repositório.`)) return;
  setBusy(true);
  status('#editorStatus', 'Excluindo…');
  try {
    const remove = [current.path];
    if (current.data.cover) {
      const cover = coverRepoPath(current.data.cover);
      if (await client.exists(cover)) remove.push(cover);
    }
    await client.commit({ message: `Remove post: ${current.data.title}`, remove });
    dirty = false;
    await openList();
    status('#listStatus', 'Post excluído.', 'ok');
  } catch (error) {
    status('#editorStatus', `Não foi possível excluir: ${error.message}`, 'error');
  } finally {
    setBusy(false);
  }
});

/* ---------- início ---------- */
document.querySelectorAll('.admin select').forEach(enhanceSelect);

(async () => {
  const token = savedToken();
  if (!token) {
    show('viewLogin');
    return;
  }
  try {
    await login(token);
  } catch {
    forgetToken();
    show('viewLogin');
    status('#loginError', 'Sua sessão expirou. Entre de novo com o token.', 'error');
  }
})();
