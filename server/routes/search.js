import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Search
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { q, type, category, author, language } = req.query;
    const searchTerm = q ? `%${q}%` : null;

    let writingsWhere = ["w.status = 'published'"];
    let writingsParams = [];

    if (searchTerm) {
      writingsWhere.push("(w.text LIKE ? OR w.title LIKE ? OR a.name LIKE ? OR w.source LIKE ?)");
      writingsParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (type) { writingsWhere.push('w.type = ?'); writingsParams.push(type); }
    if (language) { writingsWhere.push('w.language = ?'); writingsParams.push(language); }
    if (author) { writingsWhere.push('a.slug = ?'); writingsParams.push(author); }
    if (category) {
      writingsWhere.push("EXISTS (SELECT 1 FROM writing_categories wc2 JOIN categories c2 ON c2.id = wc2.category_id WHERE wc2.writing_id = w.id AND c2.slug = ?)");
      writingsParams.push(category);
    }

    const writingsClause = writingsWhere.length ? `WHERE ${writingsWhere.join(' AND ')}` : '';

    const writings = db.prepare(`
      SELECT w.*, a.name as author_name, a.slug as author_slug
      FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      ${writingsClause}
      ORDER BY w.featured DESC, w.created_at DESC
      LIMIT 50
    `).all(...writingsParams);

    let authors = [];
    if (searchTerm) {
      authors = db.prepare(`
        SELECT a.*, COUNT(w.id) as writing_count
        FROM authors a
        LEFT JOIN writings w ON w.author_id = a.id AND w.status = 'published'
        WHERE a.name LIKE ?
        GROUP BY a.id
        ORDER BY a.name ASC
        LIMIT 20
      `).all(searchTerm);
    }

    let categories = db.prepare(`
      SELECT c.*, COUNT(wc.writing_id) as writing_count
      FROM categories c
      LEFT JOIN writing_categories wc ON wc.category_id = c.id
      LEFT JOIN writings w ON w.id = wc.writing_id AND w.status = 'published'
      ${searchTerm ? 'WHERE c.name LIKE ?' : ''}
      GROUP BY c.id
      ORDER BY writing_count DESC
      LIMIT 20
    `).all(...(searchTerm ? [searchTerm] : []));

    let collections = [];
    if (searchTerm) {
      collections = db.prepare(`
        SELECT co.*, COUNT(cw.writing_id) as writing_count
        FROM collections co
        LEFT JOIN collection_writings cw ON cw.collection_id = co.id
        WHERE co.name LIKE ? OR co.description LIKE ?
        GROUP BY co.id
        LIMIT 10
      `).all(searchTerm, searchTerm);
    }

    res.json({ writings, authors, categories, collections });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
