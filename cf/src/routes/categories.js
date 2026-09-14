import { all, one, run } from '../db.js';
import { ok, fail, readBody, slugify } from '../util.js';

export const routes = [
  {
    method: 'GET',
    path: '/api/categories',
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const categories = await all(
          db,
          `SELECT c.*, COUNT(wc.writing_id) as writing_count
           FROM categories c
           LEFT JOIN writing_categories wc ON wc.category_id = c.id
           LEFT JOIN writings w ON w.id = wc.writing_id AND w.status = 'published'
           GROUP BY c.id
           ORDER BY c.name ASC`
        );
        return ok(categories);
      } catch {
        return fail('Failed to fetch categories', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/categories',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      const body = await readBody(ctx.request);
      try {
        if (!body.name) return fail('Name is required', 400);

        const slug = slugify(body.name);
        const existing = await one(db, 'SELECT id FROM categories WHERE slug = ?', [slug]);
        if (existing) return fail('Category already exists', 409);

        const result = await run(db, 'INSERT INTO categories (name, slug) VALUES (?, ?)', [body.name, slug]);
        const category = await one(db, 'SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);
        return ok(category, 201);
      } catch {
        return fail('Failed to create category', 500);
      }
    },
  },
  {
    method: 'PUT',
    path: '/api/categories/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      const body = await readBody(ctx.request);
      try {
        const slug = slugify(body.name);
        await run(db, 'UPDATE categories SET name = ?, slug = ? WHERE id = ?', [body.name, slug, params.id]);
        const category = await one(db, 'SELECT * FROM categories WHERE id = ?', [params.id]);
        return ok(category);
      } catch {
        return fail('Failed to update category', 500);
      }
    },
  },
  {
    method: 'DELETE',
    path: '/api/categories/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        await run(db, 'DELETE FROM categories WHERE id = ?', [params.id]);
        return ok({ message: 'Category deleted' });
      } catch {
        return fail('Failed to delete category', 500);
      }
    },
  },
];

export default routes;