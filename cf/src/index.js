import authRoutes from './routes/auth.js';
import writingsRoutes from './routes/writings.js';
import authorsRoutes from './routes/authors.js';
import categoriesRoutes from './routes/categories.js';
import collectionsRoutes from './routes/collections.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import { parseCookies, verifyToken } from './auth.js';
import { ok, fail, readBody, parseQuery, parseParams } from './util.js';

const ALL_ROUTES = [
  ...authRoutes,
  ...writingsRoutes,
  ...authorsRoutes,
  ...categoriesRoutes,
  ...collectionsRoutes,
  ...searchRoutes,
  ...analyticsRoutes,
  ...exportRoutes,
];

async function getUser(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const token = cookies.auth_token;
  if (!token) return null;
  return verifyToken(token, env.JWT_SECRET || 'poetry-archive-d1-secret');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      const method = request.method.toUpperCase();
      const user = await getUser(request, env);

      let methodMismatch = false;

      for (const route of ALL_ROUTES) {
        const params = parseParams(route.path, url.pathname);
        if (!params) continue;

        if (route.method !== method) {
          methodMismatch = true;
          continue;
        }
        if (route.admin && !user) {
          return fail('Authentication required', 401);
        }

        const ctx = {
          request,
          env,
          url,
          db: env.DB,
          params,
          query: parseQuery(url),
          user,
        };

        try {
          return await route.handler(ctx);
        } catch (e) {
          console.error(String((e && e.stack) || e));
          return fail('Internal server error', 500);
        }
      }

      return methodMismatch ? fail('Method not allowed', 405) : fail('Not found', 404);
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status === 404) {
      const index = await env.ASSETS.fetch(new URL('/', request.url));
      return new Response(index.body, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }
    return asset;
  },
};