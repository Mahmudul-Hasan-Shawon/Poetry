import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
    .substring(0, 200);
}

// Public: list categories
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT c.*, COUNT(wc.writing_id) as writing_count
      FROM categories c
      LEFT JOIN writing_categories wc ON wc.category_id = c.id
      LEFT JOIN writings w ON w.id = wc.writing_id AND w.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Admin: create category
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name);
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existing) return res.status(409).json({ error: 'Category already exists' });

    const result = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)').run(name, slug);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Admin: update category
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name } = req.body;
    const slug = slugify(name);
    db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name, slug, req.params.id);
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Admin: delete category
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
