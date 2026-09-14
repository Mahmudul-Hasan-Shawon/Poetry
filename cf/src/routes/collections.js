import { all, one, run } from '../db.js';
import { ok, fail, readBody, slugify, generateUniqueSlug } from '../util.js';

export const routes = [
  {
    method: 'GET',
    path: '/api/collections',
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const collections = await all(
          db,
          `SELECT co.*, COUNT(cw.writing_id) as writing_count
           FROM collections co
           LEFT JOIN collection_writings cw ON cw.collection_id = co.id
           LEFT JOIN writings w ON w.id = cw.writing_id AND w.status = 'published'
           GROUP BY co.id
           ORDER BY co.name ASC`
        );
        return ok(collections);
      } catch {
        return fail('Failed to fetch collections', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/collections/:slug',
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const collection = await one(db, 'SELECT * FROM collections WHERE slug = ?', [params.slug]);
        if (!collection) return fail('Collection not found', 404);

        const writings = await all(
          db,
          `SELECT w.*, a.name as author_name, a.slug as author_slug,
                  GROUP_CONCAT(c.name) as category_names
           FROM collection_writings cw
           JOIN writings w ON w.id = cw.writing_id
           LEFT JOIN authors a ON a.id = w.author_id
           LEFT JOIN writing_categories wc ON wc.writing_id = w.id
           LEFT JOIN categories c ON c.id = wc.category_id
           WHERE cw.collection_id = ? AND w.status = 'published'
           GROUP BY w.id
           ORDER BY cw.position ASC, w.created_at DESC`,
          [collection.id]
        );

        return ok({ collection, writings });
      } catch {
        return fail('Failed to fetch collection', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/collections',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      const body = await readBody(ctx.request);
      try {
        if (!body.name) return fail('Name is required', 400);

        const slug = await generateUniqueSlug(db, 'collections', slugify(body.name));
        const result = await run(
          db,
          'INSERT INTO collections (name, slug, description, cover_image) VALUES (?, ?, ?, ?)',
          [body.name, slug, body.description || null, body.cover_image || null]
        );

        const collection = await one(db, 'SELECT * FROM collections WHERE id = ?', [result.lastInsertRowid]);
        return ok(collection, 201);
      } catch {
        return fail('Failed to create collection', 500);
      }
    },
  },
  {
    method: 'PUT',
    path: '/api/collections/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      const body = await readBody(ctx.request);
      try {
        const id = params.id;
        const existing = await one(db, 'SELECT * FROM collections WHERE id = ?', [id]);
        if (!existing) return fail('Collection not found', 404);

        let slug = existing.slug;
        if (body.name && body.name !== existing.name) {
          slug = await generateUniqueSlug(db, 'collections', slugify(body.name), id);
        }

        await run(
          db,
          `UPDATE collections SET name=?, slug=?, description=?, cover_image=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
          [
            body.name || existing.name, slug,
            body.description !== undefined ? body.description : existing.description,
            body.cover_image !== undefined ? body.cover_image : existing.cover_image,
            id,
          ]
        );

        const collection = await one(db, 'SELECT * FROM collections WHERE id = ?', [id]);
        return ok(collection);
      } catch {
        return fail('Failed to update collection', 500);
      }
    },
  },
  {
    method: 'DELETE',
    path: '/api/collections/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const result = await run(db, 'DELETE FROM collections WHERE id = ?', [params.id]);
        if (result.changes === 0) return fail('Collection not found', 404);
        return ok({ message: 'Collection deleted' });
      } catch {
        return fail('Failed to delete collection', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/collections/:id/writings',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      const body = await readBody(ctx.request);
      try {
        const collection_id = params.id;
        const { writing_id } = body;
        const maxPos = await one(db, 'SELECT MAX(position) as max FROM collection_writings WHERE collection_id = ?', [collection_id]);
        const position = (maxPos?.max || 0) + 1;

        await run(
          db,
          'INSERT OR IGNORE INTO collection_writings (collection_id, writing_id, position) VALUES (?, ?, ?)',
          [collection_id, writing_id, position]
        );

        return ok({ message: 'Writing added to collection' });
      } catch {
        return fail('Failed to add writing', 500);
      }
    },
  },
  {
    method: 'DELETE',
    path: '/api/collections/:id/writings/:writingId',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        await run(db, 'DELETE FROM collection_writings WHERE collection_id = ? AND writing_id = ?', [params.id, params.writingId]);
        return ok({ message: 'Writing removed from collection' });
      } catch {
        return fail('Failed to remove writing', 500);
      }
    },
  },
];

export default routes;