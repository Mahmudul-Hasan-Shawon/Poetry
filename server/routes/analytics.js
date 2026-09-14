import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/overview', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const totalWritings = db.prepare('SELECT COUNT(*) as count FROM writings').get().count;
    const publishedWritings = db.prepare("SELECT COUNT(*) as count FROM writings WHERE status = 'published'").get().count;
    const draftWritings = db.prepare("SELECT COUNT(*) as count FROM writings WHERE status = 'draft'").get().count;
    const totalAuthors = db.prepare('SELECT COUNT(*) as count FROM authors').get().count;
    const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const totalCollections = db.prepare('SELECT COUNT(*) as count FROM collections').get().count;
    const totalViews = db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM writings').get().total;
    const totalSaves = db.prepare('SELECT COALESCE(SUM(saves), 0) as total FROM writings').get().total;

    res.json({
      totalWritings,
      publishedWritings,
      draftWritings,
      totalAuthors,
      totalCategories,
      totalCollections,
      totalViews,
      totalSaves,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/popular', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const popularWritings = db.prepare(`
      SELECT w.*, a.name as author_name
      FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      WHERE w.status = 'published'
      ORDER BY w.views DESC
      LIMIT 10
    `).all();

    const popularAuthors = db.prepare(`
      SELECT a.*, COUNT(w.id) as writing_count, COALESCE(SUM(w.views), 0) as total_views
      FROM authors a
      LEFT JOIN writings w ON w.author_id = a.id
      GROUP BY a.id
      ORDER BY total_views DESC
      LIMIT 10
    `).all();

    res.json({ popularWritings, popularAuthors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popular data' });
  }
});

export default router;
