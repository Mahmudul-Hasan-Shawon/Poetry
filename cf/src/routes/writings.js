import { all, one, run } from '../db.js';
import { ok, fail, readBody, parseQuery, slugify, generateUniqueSlug } from '../util.js';

async function enrichWriting(db, writing) {
  if (!writing) return null;
  const categories = await all(
    db,
    `SELECT c.id, c.name, c.slug
     FROM writing_categories wc
     JOIN categories c ON c.id = wc.category_id
     WHERE wc.writing_id = ?`,
    [writing.id]
  );
  const author = writing.author_id
    ? await one(db, 'SELECT id, name, slug, portrait FROM authors WHERE id = ?', [writing.author_id])
    : null;
  return { ...writing, categories, author };
}

export const routes = [
  {
    method: 'GET',
    path: '/api/writings/featured',
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const writings = await all(
          db,
          `SELECT w.* FROM writings w
           WHERE w.status = 'published' AND (w.featured = 1 OR w.editors_pick = 1)
           ORDER BY w.updated_at DESC LIMIT 12`
        );
        const out = [];
        for (const w of writings) out.push(await enrichWriting(db, w));
        return ok(out);
      } catch {
        return fail('Failed to fetch featured writings', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/writings/random',
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const writing = await one(
          db,
          `SELECT w.* FROM writings w
           WHERE w.status = 'published' ORDER BY RANDOM() LIMIT 1`
        );
        if (!writing) return fail('No writings found', 404);
        return ok(await enrichWriting(db, writing));
      } catch {
        return fail('Failed to fetch random writing', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/writings/daily',
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const today = new Date().toISOString().split('T')[0];
        let daily = await one(
          db,
          `SELECT dw.*, w.*, dw.writing_id, dw.date
           FROM daily_words dw JOIN writings w ON w.id = dw.writing_id
           WHERE dw.date = ?`,
          [today]
        );

        if (!daily) {
          daily = await one(
            db,
            `SELECT dw.*, w.*, dw.writing_id, dw.date
             FROM daily_words dw JOIN writings w ON w.id = dw.writing_id
             ORDER BY dw.date DESC LIMIT 1`
          );
        }

        if (!daily) {
          const random = await one(
            db,
            `SELECT * FROM writings WHERE status = 'published' ORDER BY RANDOM() LIMIT 1`
          );
          if (!random) return fail('No writings found', 404);
          return ok(await enrichWriting(db, random));
        }

        return ok(await enrichWriting(db, daily));
      } catch {
        return fail('Failed to fetch daily word', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/writings',
    handler: async (ctx) => {
      const { db, query } = ctx;
      try {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '12');
        const offset = (page - 1) * limit;

        const where = ["w.status = 'published'"];
        const params = [];

        if (query.author) { where.push('a.slug = ?'); params.push(query.author); }
        if (query.type) { where.push('w.type = ?'); params.push(query.type); }
        if (query.language) { where.push('w.language = ?'); params.push(query.language); }
        if (query.featured === '1') { where.push('w.featured = 1'); }
        if (query.search) {
          where.push('(w.text LIKE ? OR w.title LIKE ? OR a.name LIKE ?)');
          const s = `%${query.search}%`;
          params.push(s, s, s);
        }
        if (query.category) {
          where.push('EXISTS (SELECT 1 FROM writing_categories wc2 JOIN categories c2 ON c2.id = wc2.category_id WHERE wc2.writing_id = w.id AND c2.slug = ?)');
          params.push(query.category);
        }

        const whereClause = `WHERE ${where.join(' AND ')}`;

        const totalRow = await one(
          db,
          `SELECT COUNT(DISTINCT w.id) as total
           FROM writings w LEFT JOIN authors a ON a.id = w.author_id
           ${whereClause}`,
          params
        );
        const total = totalRow?.total ?? 0;

        const writings = await all(
          db,
          `SELECT DISTINCT w.*, a.name as author_name, a.slug as author_slug
           FROM writings w LEFT JOIN authors a ON a.id = w.author_id
           ${whereClause}
           ORDER BY w.featured DESC, w.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        );

        const out = [];
        for (const w of writings) out.push(await enrichWriting(db, w));

        return ok({
          writings: out,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
      } catch {
        return fail('Failed to fetch writings', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/writings/admin/list',
    admin: true,
    handler: async (ctx) => {
      const { db, query } = ctx;
      try {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const offset = (page - 1) * limit;

        const where = [];
        const params = [];

        if (query.status) { where.push('w.status = ?'); params.push(query.status); }
        if (query.type) { where.push('w.type = ?'); params.push(query.type); }
        if (query.language) { where.push('w.language = ?'); params.push(query.language); }
        if (query.author) { where.push('a.id = ?'); params.push(query.author); }
        if (query.search) {
          where.push('(w.text LIKE ? OR w.title LIKE ? OR a.name LIKE ?)');
          const s = `%${query.search}%`;
          params.push(s, s, s);
        }

        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const totalRow = await one(
          db,
          `SELECT COUNT(*) as total FROM writings w LEFT JOIN authors a ON a.id = w.author_id
           ${whereClause}`,
          params
        );
        const total = totalRow?.total ?? 0;

        const writings = await all(
          db,
          `SELECT w.*, a.name as author_name,
                  GROUP_CONCAT(DISTINCT c.name) as category_names
           FROM writings w
           LEFT JOIN authors a ON a.id = w.author_id
           LEFT JOIN writing_categories wc ON wc.writing_id = w.id
           LEFT JOIN categories c ON c.id = wc.category_id
           ${whereClause}
           GROUP BY w.id
           ORDER BY w.created_at DESC
           LIMIT ? OFFSET ?`,
          [...params, limit, offset]
        );

        return ok({
          writings,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
      } catch {
        return fail('Failed to fetch writings', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/writings/slug/:slug',
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const writing = await one(db, 'SELECT w.* FROM writings w WHERE w.slug = ?', [params.slug]);
        if (!writing) return fail('Writing not found', 404);

        await run(db, 'UPDATE writings SET views = views + 1 WHERE id = ?', [writing.id]);

        const enriched = await enrichWriting(db, writing);

        const related = await all(
          db,
          `SELECT w.*, a.name as author_name, a.slug as author_slug
           FROM writings w LEFT JOIN authors a ON a.id = w.author_id
           WHERE w.status = 'published' AND w.id != ?
             AND (w.author_id = ? OR EXISTS (
               SELECT 1 FROM writing_categories wc1
               JOIN writing_categories wc2 ON wc1.category_id = wc2.category_id
               WHERE wc1.writing_id = w.id AND wc2.writing_id = ?
             ))
           ORDER BY RANDOM() LIMIT 6`,
          [writing.id, writing.author_id, writing.id]
        );

        const out = [];
        for (const w of related) out.push(await enrichWriting(db, w));

        return ok({ writing: enriched, related: out });
      } catch {
        return fail('Failed to fetch writing', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/writings/:id',
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const writing = await one(db, 'SELECT * FROM writings WHERE id = ?', [params.id]);
        if (!writing) return fail('Writing not found', 404);
        return ok(await enrichWriting(db, writing));
      } catch {
        return fail('Failed to fetch writing', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/writings',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      const body = await readBody(ctx.request);
      try {
        if (!body.text) return fail('Text is required', 400);

        const slug = await generateUniqueSlug(
          db, 'writings', slugify(body.title || body.text.substring(0, 80))
        );

        const result = await run(
          db,
          `INSERT INTO writings (author_id, title, slug, text, original_text, english_translation, bangla_translation, urdu_translation,
             type, language, direction, source, source_url, translator, source_book, source_chapter, source_page, source_notes,
             date, status, featured, editors_pick, verification_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            body.author_id || null, body.title || null, slug, body.text,
            body.original_text || null, body.english_translation || null, body.bangla_translation || null, body.urdu_translation || null,
            body.type || 'quote', body.language || 'english', body.direction || 'ltr',
            body.source || null, body.source_url || null, body.translator || null,
            body.source_book || null, body.source_chapter || null, body.source_page || null, body.source_notes || null,
            body.date || null, body.status || 'draft', body.featured ? 1 : 0, body.editors_pick ? 1 : 0, body.verification_status || 'attributed',
          ]
        );

        const writingId = result.lastInsertRowid;

        if (body.category_ids && body.category_ids.length) {
          for (const catId of body.category_ids) {
            await run(db, 'INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)', [writingId, catId]);
          }
        }
        if (body.collection_ids && body.collection_ids.length) {
          for (const collId of body.collection_ids) {
            await run(db, 'INSERT OR IGNORE INTO collection_writings (collection_id, writing_id) VALUES (?, ?)', [collId, writingId]);
          }
        }

        const writing = await one(db, 'SELECT * FROM writings WHERE id = ?', [writingId]);
        return ok(await enrichWriting(db, writing), 201);
      } catch {
        return fail('Failed to create writing', 500);
      }
    },
  },
  {
    method: 'PUT',
    path: '/api/writings/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      const body = await readBody(ctx.request);
      try {
        const id = params.id;
        const existing = await one(db, 'SELECT * FROM writings WHERE id = ?', [id]);
        if (!existing) return fail('Writing not found', 404);

        let slug = existing.slug;
        if (body.title && body.title !== existing.title) {
          slug = await generateUniqueSlug(db, 'writings', slugify(body.title), id);
        }

        await run(
          db,
          `UPDATE writings SET
             author_id=?, title=?, slug=?, text=?, original_text=?, english_translation=?, bangla_translation=?, urdu_translation=?,
             type=?, language=?, direction=?, source=?, source_url=?, translator=?, source_book=?, source_chapter=?, source_page=?, source_notes=?,
             date=?, status=?, featured=?, editors_pick=?, verification_status=?, updated_at=CURRENT_TIMESTAMP
           WHERE id=?`,
          [
            body.author_id !== undefined ? (body.author_id || null) : existing.author_id,
            body.title !== undefined ? body.title : existing.title,
            slug,
            body.text || existing.text,
            body.original_text !== undefined ? body.original_text : existing.original_text,
            body.english_translation !== undefined ? body.english_translation : existing.english_translation,
            body.bangla_translation !== undefined ? body.bangla_translation : existing.bangla_translation,
            body.urdu_translation !== undefined ? body.urdu_translation : existing.urdu_translation,
            body.type || existing.type,
            body.language || existing.language,
            body.direction || existing.direction,
            body.source !== undefined ? body.source : existing.source,
            body.source_url !== undefined ? body.source_url : existing.source_url,
            body.translator !== undefined ? body.translator : existing.translator,
            body.source_book !== undefined ? body.source_book : existing.source_book,
            body.source_chapter !== undefined ? body.source_chapter : existing.source_chapter,
            body.source_page !== undefined ? body.source_page : existing.source_page,
            body.source_notes !== undefined ? body.source_notes : existing.source_notes,
            body.date !== undefined ? (body.date || null) : existing.date,
            body.status || existing.status,
            body.featured !== undefined ? (body.featured ? 1 : 0) : existing.featured,
            body.editors_pick !== undefined ? (body.editors_pick ? 1 : 0) : existing.editors_pick,
            body.verification_status || existing.verification_status,
            id,
          ]
        );

        if (body.category_ids !== undefined) {
          await run(db, 'DELETE FROM writing_categories WHERE writing_id = ?', [id]);
          if (body.category_ids.length) {
            for (const catId of body.category_ids) {
              await run(db, 'INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)', [id, catId]);
            }
          }
        }

        if (body.collection_ids !== undefined) {
          await run(db, 'DELETE FROM collection_writings WHERE writing_id = ?', [id]);
          if (body.collection_ids.length) {
            for (const collId of body.collection_ids) {
              await run(db, 'INSERT OR IGNORE INTO collection_writings (collection_id, writing_id) VALUES (?, ?)', [collId, id]);
            }
          }
        }

        const writing = await one(db, 'SELECT * FROM writings WHERE id = ?', [id]);
        return ok(await enrichWriting(db, writing));
      } catch {
        return fail('Failed to update writing', 500);
      }
    },
  },
  {
    method: 'DELETE',
    path: '/api/writings/:id',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const result = await run(db, 'DELETE FROM writings WHERE id = ?', [params.id]);
        if (result.changes === 0) return fail('Writing not found', 404);
        return ok({ message: 'Writing deleted' });
      } catch {
        return fail('Failed to delete writing', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/writings/:id/set-daily',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const today = new Date().toISOString().split('T')[0];
        await run(db, 'INSERT OR REPLACE INTO daily_words (writing_id, date) VALUES (?, ?)', [params.id, today]);
        return ok({ message: 'Set as daily word' });
      } catch {
        return fail('Failed to set daily word', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/writings/:id/toggle-featured',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const writing = await one(db, 'SELECT featured FROM writings WHERE id = ?', [params.id]);
        if (!writing) return fail('Writing not found', 404);
        await run(db, 'UPDATE writings SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [writing.featured ? 0 : 1, params.id]);
        return ok({ featured: !writing.featured });
      } catch {
        return fail('Failed to toggle featured', 500);
      }
    },
  },
  {
    method: 'PUT',
    path: '/api/writings/:id/status',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      const body = await readBody(ctx.request);
      try {
        const { status } = body;
        if (!['draft', 'published', 'archived'].includes(status)) return fail('Invalid status', 400);
        await run(db, 'UPDATE writings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, params.id]);
        return ok({ status });
      } catch {
        return fail('Failed to update status', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/writings/:id/duplicate',
    admin: true,
    handler: async (ctx) => {
      const { db, params } = ctx;
      try {
        const original = await one(db, 'SELECT * FROM writings WHERE id = ?', [params.id]);
        if (!original) return fail('Writing not found', 404);

        const slug = await generateUniqueSlug(
          db, 'writings', slugify(original.title || original.text.substring(0, 80))
        );

        const result = await run(
          db,
          `INSERT INTO writings (author_id, title, slug, text, original_text, english_translation, bangla_translation, urdu_translation,
             type, language, direction, source, source_url, translator, source_book, source_chapter, source_page, source_notes,
             date, status, featured, editors_pick, verification_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, 0, ?)`,
          [
            original.author_id, original.title ? `${original.title} (Copy)` : null, slug, original.text,
            original.original_text, original.english_translation, original.bangla_translation, original.urdu_translation,
            original.type, original.language, original.direction,
            original.source, original.source_url, original.translator,
            original.source_book, original.source_chapter, original.source_page, original.source_notes,
            original.date, original.verification_status,
          ]
        );

        const cats = await all(db, 'SELECT category_id FROM writing_categories WHERE writing_id = ?', [original.id]);
        for (const { category_id } of cats) {
          await run(db, 'INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)', [result.lastInsertRowid, category_id]);
        }

        const writing = await one(db, 'SELECT * FROM writings WHERE id = ?', [result.lastInsertRowid]);
        return ok(await enrichWriting(db, writing), 201);
      } catch {
        return fail('Failed to duplicate writing', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/writings/bulk',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      const body = await readBody(ctx.request);
      try {
        const { ids, action } = body;
        if (!ids || !ids.length) return fail('No writings selected', 400);
        const placeholders = ids.map(() => '?').join(',');

        switch (action) {
          case 'publish':
            await run(db, `UPDATE writings SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`, ids);
            break;
          case 'archive':
            await run(db, `UPDATE writings SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`, ids);
            break;
          case 'draft':
            await run(db, `UPDATE writings SET status = 'draft', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`, ids);
            break;
          case 'delete':
            await run(db, `DELETE FROM writings WHERE id IN (${placeholders})`, ids);
            break;
          default:
            return fail('Invalid action', 400);
        }

        return ok({ message: `Bulk action '${action}' completed`, affected: ids.length });
      } catch {
        return fail('Bulk action failed', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/writings/import',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      const body = await readBody(ctx.request);
      try {
        const { writings } = body;
        if (!writings || !writings.length) return fail('No writings to import', 400);

        let imported = 0;
        for (const w of writings) {
          const slug = await generateUniqueSlug(db, 'writings', slugify(w.title || w.text?.substring(0, 80) || 'untitled'));
          let authorId = null;
          if (w.author_name) {
            const author = await one(db, 'SELECT id FROM authors WHERE name = ?', [w.author_name]);
            if (author) authorId = author.id;
          }
          await run(
            db,
            `INSERT INTO writings (author_id, title, slug, text, type, language, direction, source, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [authorId, w.title || null, slug, w.text, w.type || 'quote', w.language || 'english', w.direction || 'ltr', w.source || null]
          );
          imported++;
        }

        return ok({ message: `Imported ${imported} writings` });
      } catch {
        return fail('Import failed', 500);
      }
    },
  },
];

export default routes;