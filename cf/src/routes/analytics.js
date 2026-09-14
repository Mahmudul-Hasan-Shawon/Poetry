import { all, one } from '../db.js';
import { ok, fail } from '../util.js';

export const routes = [
  {
    method: 'GET',
    path: '/api/analytics/overview',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const totalWritings = (await one(db, 'SELECT COUNT(*) as count FROM writings'))?.count ?? 0;
        const publishedWritings = (await one(db, "SELECT COUNT(*) as count FROM writings WHERE status = 'published'"))?.count ?? 0;
        const draftWritings = (await one(db, "SELECT COUNT(*) as count FROM writings WHERE status = 'draft'"))?.count ?? 0;
        const totalAuthors = (await one(db, 'SELECT COUNT(*) as count FROM authors'))?.count ?? 0;
        const totalCategories = (await one(db, 'SELECT COUNT(*) as count FROM categories'))?.count ?? 0;
        const totalCollections = (await one(db, 'SELECT COUNT(*) as count FROM collections'))?.count ?? 0;
        const totalViews = (await one(db, 'SELECT COALESCE(SUM(views), 0) as total FROM writings'))?.total ?? 0;
        const totalSaves = (await one(db, 'SELECT COALESCE(SUM(saves), 0) as total FROM writings'))?.total ?? 0;

        return ok({
          totalWritings, publishedWritings, draftWritings,
          totalAuthors, totalCategories, totalCollections, totalViews, totalSaves,
        });
      } catch {
        return fail('Failed to fetch analytics', 500);
      }
    },
  },
  {
    method: 'GET',
    path: '/api/analytics/popular',
    admin: true,
    handler: async (ctx) => {
      const { db } = ctx;
      try {
        const popularWritings = await all(
          db,
          `SELECT w.*, a.name as author_name
           FROM writings w
           LEFT JOIN authors a ON a.id = w.author_id
           WHERE w.status = 'published'
           ORDER BY w.views DESC
           LIMIT 10`
        );

        const popularAuthors = await all(
          db,
          `SELECT a.*, COUNT(w.id) as writing_count, COALESCE(SUM(w.views), 0) as total_views
           FROM authors a
           LEFT JOIN writings w ON w.author_id = a.id
           GROUP BY a.id
           ORDER BY total_views DESC
           LIMIT 10`
        );

        return ok({ popularWritings, popularAuthors });
      } catch {
        return fail('Failed to fetch popular data', 500);
      }
    },
  },
];

export default routes;