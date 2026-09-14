import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/json', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const authors = db.prepare('SELECT * FROM authors').all();
    const writings = db.prepare('SELECT * FROM writings').all();
    const categories = db.prepare('SELECT * FROM categories').all();
    const collections = db.prepare('SELECT * FROM collections').all();

    const writingCategories = db.prepare('SELECT * FROM writing_categories').all();
    const collectionWritings = db.prepare('SELECT * FROM collection_writings').all();

    const data = {
      exported_at: new Date().toISOString(),
      authors,
      writings,
      categories,
      collections,
      writing_categories: writingCategories,
      collection_writings: collectionWritings,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="poetry-archive-export.json"');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

router.get('/csv', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const writings = db.prepare(`
      SELECT w.*, a.name as author_name
      FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      ORDER BY w.id
    `).all();

    const headers = ['id', 'title', 'text', 'author_name', 'type', 'language', 'status', 'source', 'featured', 'created_at'];
    const csvRows = [headers.join(',')];

    for (const w of writings) {
      const row = headers.map(h => {
        const val = w[h] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="poetry-archive-writings.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    res.status(500).json({ error: 'CSV export failed' });
  }
});

export default router;
