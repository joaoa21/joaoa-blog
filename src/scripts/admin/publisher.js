/* Conversa com o publicador (publicar.authik.com.br), que grava no GitHub em nome do painel.
   Quem entra é a conta do Authik (auth.joaoa.com.br); o painel não guarda nenhuma chave:
   a cada pedido, pega um token curto no Authik e manda ao publicador, que confere se a
   conta é administradora deste blog. Cada publicação vira UM commit (texto e capa juntos),
   o que dispara um único deploy no Netlify. */
import { createCentralAuth } from '@central-auth/sdk-react/browser';

export const AUTH_URL = import.meta.env.PUBLIC_AUTH_URL || 'https://auth.joaoa.com.br';
const PUBLISHER_URL = import.meta.env.PUBLIC_PUBLISHER_URL || 'https://publicar.authik.com.br';
const SITE_ID = 'joaoa-blog';

export const POSTS_DIR = 'src/content/posts';
export const COVERS_DIR = 'src/assets/covers';

export const auth = createCentralAuth({ authURL: AUTH_URL });

function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function createClient() {
  const base = `${PUBLISHER_URL}/v1/${SITE_ID}`;
  // o token vale 5 minutos: reaproveita por 4 e fica só na memória
  let token = null;
  let tokenUntil = 0;

  async function bearer() {
    if (token && Date.now() < tokenUntil) return token;
    const result = await auth.getToken();
    if (!result.ok) {
      const error = new Error('Sua sessão expirou. Entre de novo.');
      error.status = 401;
      throw error;
    }
    token = result.data;
    tokenUntil = Date.now() + 4 * 60_000;
    return token;
  }

  async function request(path, options = {}) {
    const response = await fetch(base + path, {
      ...options,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${await bearer()}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    }).catch(() => {
      throw new Error('Sem conexão com o publicador. Confira a internet e tente de novo.');
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload.message || `O publicador respondeu ${response.status}`);
      error.status = response.status;
      error.code = payload.code;
      if (response.status === 401) token = null;
      throw error;
    }
    return response;
  }

  const file = (path) => `/file?path=${encodeURIComponent(path)}`;
  const imageCache = new Map();

  return {
    /** Confirma que a conta pode publicar neste blog. */
    async check() {
      return (await request('/me')).json();
    },

    /** Arquivos .md da pasta de posts. */
    async listPosts() {
      const { files } = await (await request(`/list?dir=${encodeURIComponent(POSTS_DIR)}`)).json();
      return files;
    },

    async readText(path) {
      return (await request(file(path))).text();
    },

    /** Endereço local (blob:) de uma imagem do repositório, para mostrar a capa já salva. */
    imageUrl(path) {
      if (!imageCache.has(path)) {
        imageCache.set(path, request(file(path)).then(async (response) => URL.createObjectURL(await response.blob())));
        imageCache.get(path).catch(() => imageCache.delete(path));
      }
      return imageCache.get(path);
    },

    async exists(path) {
      try {
        await request(file(path));
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
      const body = {
        message,
        files: files.map((item) => (item.bytes ? { path: item.path, base64: bytesToBase64(item.bytes) } : { path: item.path, text: item.text })),
        remove,
      };
      return (await request('/commit', { method: 'POST', body: JSON.stringify(body) })).json();
    },
  };
}
