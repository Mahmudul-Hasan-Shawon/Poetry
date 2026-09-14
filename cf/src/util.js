export function ok(data, status = 200, setCookie) {
  const headers = { 'Content-Type': 'application/json' };
  if (setCookie) headers['Set-Cookie'] = setCookie;
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export function fail(message, status = 400) {
  return ok({ error: message }, status);
}

export async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function parseQuery(url) {
  const out = {};
  for (const [k, v] of url.searchParams) out[k] = v;
  return out;
}

export function parseParams(pattern, pathname) {
  const pSeg = pattern.split('/').filter(Boolean);
  const uSeg = pathname.split('/').filter(Boolean);
  if (pSeg.length !== uSeg.length) return null;
  const params = {};
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(':')) params[pSeg[i].slice(1)] = decodeURIComponent(uSeg[i]);
    else if (pSeg[i] !== uSeg[i]) return null;
  }
  return params;
}

export function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\p{L}\p{M}\p{N}\-]+/gu, '')
    .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
    .substring(0, 200);
}

export async function generateUniqueSlug(db, table, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = excludeId
      ? await one(db, `SELECT id FROM ${table} WHERE slug = ? AND id != ?`, [slug, excludeId])
      : await one(db, `SELECT id FROM ${table} WHERE slug = ?`, [slug]);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export { all, one, run } from './db.js';