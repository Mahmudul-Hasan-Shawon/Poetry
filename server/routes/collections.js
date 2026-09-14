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

function generateUniqueSlug(db, table, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = excludeId
      ? db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`).get(slug, excludeId)
      : db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Public: list all collections
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const collections = db.prepare(`
      SELECT co.*, COUNT(cw.writing_id) as writing_count
      FROM collections co
      LEFT JOIN collection_writings cw ON cw.collection_id = co.id
      LEFT JOIN writings w ON w.id = cw.writing_id AND w.status = 'published'
      GROUP BY co.id
      ORDER BY co.name ASC
    `).all();
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Public: get collection by slug
router.get('/:slug', (req, res) => {
  try {
    const db = getDb();
    const collection = db.prepare('SELECT * FROM collections WHERE slug = ?').get(req.params.slug);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    const writings = db.prepare(`
      SELECT w.*, a.name as author_name, a.slug as author_slug,
             GROUP_CONCAT(c.name) as category_names
      FROM collection_writings cw
      JOIN writings w ON w.id = cw.writing_id
      LEFT JOIN authors a ON a.id = w.author_id
      LEFT JOIN writing_categories wc ON wc.writing_id = w.id
      LEFT JOIN categories c ON c.id = wc.category_id
      WHERE cw.collection_id = ? AND w.status = 'published'
      GROUP BY w.id
      ORDER BY cw.position ASC, w.created_at DESC
    `).all(collection.id);

    res.json({ collection, writings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Admin: create collection
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name, description, cover_image } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const slug = generateUniqueSlug(db, 'collections', slugify(name));
    const result = db.prepare(`
      INSERT INTO collections (name, slug, description, cover_image) VALUES (?, ?, ?, ?)
    `).run(name, slug, description || null, cover_image || null);

    const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Admin: update collection
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name, description, cover_image } = req.body;
    const id = req.params.id;

    const existing = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Collection not found' });

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = generateUniqueSlug(db, 'collections', slugify(name), id);
    }

    db.prepare(`
      UPDATE collections SET name=?, slug=?, description=?, cover_image=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
    `).run(
      name || existing.name, slug,
      description !== undefined ? description : existing.description,
      cover_image !== undefined ? cover_image : existing.cover_image,
      id
    );

    const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Admin: delete collection
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM collections WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// Admin: add writing to collection
router.post('/:id/writings', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { writing_id } = req.body;
    const collection_id = req.params.id;

    const maxPos = db.prepare('SELECT MAX(position) as max FROM collection_writings WHERE collection_id = ?').get(collection_id);
    const position = (maxPos.max || 0) + 1;

    db.prepare('INSERT OR IGNORE INTO collection_writings (collection_id, writing_id, position) VALUES (?, ?, ?)')
      .run(collection_id, writing_id, position);

    res.json({ message: 'Writing added to collection' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add writing' });
  }
});

// Admin: remove writing from collection
router.delete('/:id/writings/:writingId', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM collection_writings WHERE collection_id = ? AND writing_id = ?')
      .run(req.params.id, req.params.writingId);
    res.json({ message: 'Writing removed from collection' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove writing' });
  }
});

export default router;
