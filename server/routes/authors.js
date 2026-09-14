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

// Public: list all authors
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const authors = db.prepare(`
      SELECT a.*, COUNT(w.id) as writing_count
      FROM authors a
      LEFT JOIN writings w ON w.author_id = a.id AND w.status = 'published'
      GROUP BY a.id
      ORDER BY a.name ASC
    `).all();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch authors' });
  }
});

// Public: get author by slug
router.get('/:slug', (req, res) => {
  try {
    const db = getDb();
    const author = db.prepare('SELECT * FROM authors WHERE slug = ?').get(req.params.slug);
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const writings = db.prepare(`
      SELECT w.*, GROUP_CONCAT(c.name) as category_names
      FROM writings w
      LEFT JOIN writing_categories wc ON wc.writing_id = w.id
      LEFT JOIN categories c ON c.id = wc.category_id
      WHERE w.author_id = ? AND w.status = 'published'
      GROUP BY w.id
      ORDER BY w.featured DESC, w.created_at DESC
    `).all(author.id);

    res.json({ author, writings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch author' });
  }
});

// Admin: create author
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name, short_bio, full_bio, portrait, birth_date, death_date, country, primary_language, other_languages, tags } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    const slug = generateUniqueSlug(db, 'authors', slugify(name));

    const result = db.prepare(`
      INSERT INTO authors (name, slug, short_bio, full_bio, portrait, birth_date, death_date, country, primary_language, other_languages, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, slug, short_bio || null, full_bio || null, portrait || null, birth_date || null, death_date || null, country || null, primary_language || null, other_languages || null, tags || null);

    const author = db.prepare('SELECT * FROM authors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(author);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create author' });
  }
});

// Admin: update author
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name, short_bio, full_bio, portrait, birth_date, death_date, country, primary_language, other_languages, tags } = req.body;
    const id = req.params.id;

    const existing = db.prepare('SELECT * FROM authors WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Author not found' });

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = generateUniqueSlug(db, 'authors', slugify(name), id);
    }

    db.prepare(`
      UPDATE authors SET name=?, slug=?, short_bio=?, full_bio=?, portrait=?, birth_date=?, death_date=?, country=?, primary_language=?, other_languages=?, tags=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(
      name || existing.name, slug,
      short_bio !== undefined ? short_bio : existing.short_bio,
      full_bio !== undefined ? full_bio : existing.full_bio,
      portrait !== undefined ? portrait : existing.portrait,
      birth_date !== undefined ? birth_date : existing.birth_date,
      death_date !== undefined ? death_date : existing.death_date,
      country !== undefined ? country : existing.country,
      primary_language !== undefined ? primary_language : existing.primary_language,
      other_languages !== undefined ? other_languages : existing.other_languages,
      tags !== undefined ? tags : existing.tags,
      id
    );

    const author = db.prepare('SELECT * FROM authors WHERE id = ?').get(id);
    res.json(author);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// Admin: delete author
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM authors WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Author not found' });
    res.json({ message: 'Author deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete author' });
  }
});

export default router;
