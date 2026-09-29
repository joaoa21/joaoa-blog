/* Conversa com a API do GitHub direto do navegador (sem servidor próprio).
   Cada publicação vira UM commit no repositório do blog — texto e capa
   juntos —, o que dispara um único deploy no Netlify. */

const API = 'https://api.github.com';

export const REPO = { owner: 'joaoa21', name: 'joaoa-blog', branch: 'main' };
export const POSTS_DIR = 'src/content/posts';
export const COVERS_DIR = 'src/assets/covers';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToText(base64) {
  const binary = atob(base64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return decoder.decode(bytes);
}

const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');

/** Endereço público de um arquivo do repositório (para mostrar a capa já salva). */
export function rawUrl(path) {
  return `https://raw.githubusercontent.com/${REPO.owner}/${REPO.name}/${REPO.branch}/${encodePath(path)}`;
}

export function createClient(token, fetchImpl = globalThis.fetch.bind(globalThis)) {
  const base = `/repos/${REPO.owner}/${REPO.name}`;

  async function request(path, options = {}) {
    const response = await fetchImpl(API + path, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload.message || `GitHub respondeu ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.status === 204 ? null : response.json();
  }

  return {
    /** Confirma que o token existe e pode escrever no repositório do blog. */
    async check() {
      const repo = await request(base);
      if (!repo.permissions?.push) {
        throw new Error('O token funciona, mas não tem permissão de escrita no repositório do blog.');
      }
      return repo;
    },

    /** Arquivos .md da pasta de posts. */
    async listPosts() {
      const items = await request(`${base}/contents/${POSTS_DIR}?ref=${REPO.branch}`);
      return items.filter((item) => item.type === 'file' && item.name.endsWith('.md'));
    },

    async readText(path) {
      const file = await request(`${base}/contents/${encodePath(path)}?ref=${REPO.branch}`);
      return base64ToText(file.content);
    },

    async exists(path) {
      try {
        await request(`${base}/contents/${encodePath(path)}?ref=${REPO.branch}`);
        return true;
      } catch (error) {
        if (error.status === 404) return false;
        throw error;
      }
    },

    /**
     * Um commit com vários arquivos.
     * files: [{ path, text } | { path, bytes }]; remove: [path] (só arquivos que existem)
     */
    async commit({ message, files = [], remove = [] }) {
      const ref = await request(`${base}/git/ref/heads/${REPO.branch}`);
      const head = ref.object.sha;
      const parent = await request(`${base}/git/commits/${head}`);

      const tree = [];
      for (const file of files) {
        const bytes = file.bytes ?? encoder.encode(file.text);
        const blob = await request(`${base}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: bytesToBase64(bytes), encoding: 'base64' }),
        });
        tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
      }
      for (const path of remove) {
        tree.push({ path, mode: '100644', type: 'blob', sha: null });
      }

      const newTree = await request(`${base}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
      });
      const commit = await request(`${base}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({ message, tree: newTree.sha, parents: [head] }),
      });
      await request(`${base}/git/refs/heads/${REPO.branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha }),
      });
      return commit;
    },
  };
}
