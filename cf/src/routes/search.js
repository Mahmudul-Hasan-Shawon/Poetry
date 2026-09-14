import { all } from '../db.js';
import { ok, fail, parseQuery } from '../util.js';

export const routes = [
  {
    method: 'GET',
    path: '/api/search',
    handler: async (ctx) => {
      const { db } = ctx;
      const query = parseQuery(ctx.url);
      try {
        const q = query.q;
        const searchTerm = q ? `%${q}%` : null;

        const writingsWhere = ["w.status = 'published'"];
        const writingsParams = [];

        if (searchTerm) {
          writingsWhere.push('(w.text LIKE ? OR w.title LIKE ? OR a.name LIKE ? OR w.source LIKE ?)');
          writingsParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (query.type) { writingsWhere.push('w.type = ?'); writingsParams.push(query.type); }
        if (query.language) { writingsWhere.push('w.language = ?'); writingsParams.push(query.language); }
        if (query.author) { writingsWhere.push('a.slug = ?'); writingsParams.push(query.author); }
        if (query.category) {
          writingsWhere.push('EXISTS (SELECT 1 FROM writing_categories wc2 JOIN categories c2 ON c2.id = wc2.category_id WHERE wc2.writing_id = w.id AND c2.slug = ?)');
          writingsParams.push(query.category);
        }

        const writingsClause = `WHERE ${writingsWhere.join(' AND ')}`;

        const writings = await all(
          db,
          `SELECT w.*, a.name as author_name, a.slug as author_slug
           FROM writings w
           LEFT JOIN authors a ON a.id = w.author_id
           ${writingsClause}
           ORDER BY w.featured DESC, w.created_at DESC
           LIMIT 50`,
          writingsParams
        );

        let authors = [];
        if (searchTerm) {
          authors = await all(
            db,
            `SELECT a.*, COUNT(w.id) as writing_count
             FROM authors a
             LEFT JOIN writings w ON w.author_id = a.id AND w.status = 'published'
             WHERE a.name LIKE ?
             GROUP BY a.id
             ORDER BY a.name ASC
             LIMIT 20`,
            [searchTerm]
          );
        }

        const categories = await all(
          db,
          `SELECT c.*, COUNT(wc.writing_id) as writing_count
           FROM categories c
           LEFT JOIN writing_categories wc ON wc.category_id = c.id
           LEFT JOIN writings w ON w.id = wc.writing_id AND w.status = 'published'
           ${searchTerm ? 'WHERE c.name LIKE ?' : ''}
           GROUP BY c.id
           ORDER BY writing_count DESC
           LIMIT 20`,
          searchTerm ? [searchTerm] : []
        );

        let collections = [];
        if (searchTerm) {
          collections = await all(
            db,
            `SELECT co.*, COUNT(cw.writing_id) as writing_count
             FROM collections co
             LEFT JOIN collection_writings cw ON cw.collection_id = co.id
             WHERE co.name LIKE ? OR co.description LIKE ?
             GROUP BY co.id
             LIMIT 10`,
            [searchTerm, searchTerm]
          );
        }

        return ok({ writings, authors, categories, collections });
      } catch {
        return fail('Search failed', 500);
      }
    },
  },
];

export default routes;