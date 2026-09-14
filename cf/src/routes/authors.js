import { all, one, run } from '../db.js';
import { ok, fail, readBody, slugify, generateUniqueSlug } from '../util.js';

export const routes = [
  {
    method: 'GET',
    path: '/api/authors',
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const authors = await all(
          db,
          `SELECT a.*, COUNT(w.id) as writing_count
           FROM authors a
           LEFT JOIN writings w ON w.author_id = a.id AND w.status = 'published'
           GROUP BY a.id
           ORDER BY a.name ASC`
        );
        return ok(authors);
      } catch {
        return fail('Failed to fetch authors', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/authors/:slug',
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const author = await one(db, 'SELECT * FROM authors WHERE slug = ?', [params.slug]);
        if (!author) return fail('Author not found', 404);

        const writings = await all(
          db,
          `SELECT w.*, GROUP_CONCAT(c.name) as category_names
           FROM writings w
           LEFT JOIN writing_categories wc ON wc.writing_id = w.id
           LEFT JOIN categories c ON c.id = wc.category_id
           WHERE w.author_id = ? AND w.status = 'published'
           GROUP BY w.id
           ORDER BY w.featured DESC, w.created_at DESC`,
          [author.id]
        );

        return ok({ author, writings });
      } catch {
        return fail('Failed to fetch author', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/authors',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      const body = await readBody(ctx.request);
      try {
        if (!body.name) return fail('Name is required', 400);

        const slug = await generateUniqueSlug(db, 'authors', slugify(body.name));

        const result = await run(
          db,
          `INSERT INTO authors (name, slug, short_bio, full_bio, portrait, birth_date, death_date, country, primary_language, other_languages, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            body.name, slug,
            body.short_bio || null, body.full_bio || null, body.portrait || null,
            body.birth_date || null, body.death_date || null, body.country || null,
            body.primary_language || null, body.other_languages || null, body.tags || null,
          ]
        );

        const author = await one(db, 'SELECT * FROM authors WHERE id = ?', [result.lastInsertRowid]);
        return ok(author, 201);
      } catch {
        return fail('Failed to create author', 500);
      }
    },
  },
  {
    method: 'PUT',
    path: '/api/authors/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      const body = await readBody(ctx.request);
      try {
        const id = params.id;
        const existing = await one(db, 'SELECT * FROM authors WHERE id = ?', [id]);
        if (!existing) return fail('Author not found', 404);

        let slug = existing.slug;
        if (body.name && body.name !== existing.name) {
          slug = await generateUniqueSlug(db, 'authors', slugify(body.name), id);
        }

        await run(
          db,
          `UPDATE authors SET name=?, slug=?, short_bio=?, full_bio=?, portrait=?, birth_date=?, death_date=?, country=?, primary_language=?, other_languages=?, tags=?, updated_at=CURRENT_TIMESTAMP
           WHERE id=?`,
          [
            body.name || existing.name, slug,
            body.short_bio !== undefined ? body.short_bio : existing.short_bio,
            body.full_bio !== undefined ? body.full_bio : existing.full_bio,
            body.portrait !== undefined ? body.portrait : existing.portrait,
            body.birth_date !== undefined ? body.birth_date : existing.birth_date,
            body.death_date !== undefined ? body.death_date : existing.death_date,
            body.country !== undefined ? body.country : existing.country,
            body.primary_language !== undefined ? body.primary_language : existing.primary_language,
            body.other_languages !== undefined ? body.other_languages : existing.other_languages,
            body.tags !== undefined ? body.tags : existing.tags,
            id,
          ]
        );

        const author = await one(db, 'SELECT * FROM authors WHERE id = ?', [id]);
        return ok(author);
      } catch {
        return fail('Failed to update author', 500);
      }
    },
  },
  {
    method: 'DELETE',
    path: '/api/authors/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const result = await run(db, 'DELETE FROM authors WHERE id = ?', [params.id]);
        if (result.changes === 0) return fail('Author not found', 404);
        return ok({ message: 'Author deleted' });
      } catch {
        return fail('Failed to delete author', 500);
      }
    },
  },
];

export default routes;