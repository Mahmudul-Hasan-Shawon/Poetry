import { all } from '../db.js';
import { fail } from '../util.js';

export const routes = [
  {
    method: 'GET',
    path: '/api/export/json',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const authors = await all(db, 'SELECT * FROM authors');
        const writings = await all(db, 'SELECT * FROM writings');
        const categories = await all(db, 'SELECT * FROM categories');
        const collections = await all(db, 'SELECT * FROM collections');
        const writing_categories = await all(db, 'SELECT * FROM writing_categories');
        const collection_writings = await all(db, 'SELECT * FROM collection_writings');

        const data = {
          exported_at: new Date().toISOString(),
          authors, writings, categories, collections, writing_categories, collection_writings,
        };

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="poetry-archive-export.json"',
          },
        });
      } catch {
        return fail('Export failed', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/export/csv',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const writings = await all(
          db,
          `SELECT w.*, a.name as author_name
           FROM writings w
           LEFT JOIN authors a ON a.id = w.author_id
           ORDER BY w.id`
        );

        const headers = ['id', 'title', 'text', 'author_name', 'type', 'language', 'status', 'source', 'featured', 'created_at'];
        const csvRows = [headers.join(',')];

        for (const w of writings) {
          const row = headers.map((h) => {
            const val = w[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          });
          csvRows.push(row.join(','));
        }

        return new Response(csvRows.join('\n'), {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="poetry-archive-writings.csv"',
          },
        });
      } catch {
        return fail('CSV export failed', 500);
      }
    },
  },
];

export default routes;