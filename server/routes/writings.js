import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\p{L}\p{M}\p{N}\-]+/gu, '')
    .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
    .substring(0, 200);
}

function generateUniqueSlug(db, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = excludeId
      ? db.prepare('SELECT id FROM writings WHERE slug = ? AND id != ?').get(slug, excludeId)
      : db.prepare('SELECT id FROM writings WHERE slug = ?').get(slug);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

function enrichWriting(db, writing) {
  if (!writing) return null;
  const categories = db.prepare(`
    SELECT c.id, c.name, c.slug
    FROM writing_categories wc
    JOIN categories c ON c.id = wc.category_id
    WHERE wc.writing_id = ?
  `).all(writing.id);
  const author = writing.author_id
    ? db.prepare('SELECT id, name, slug, portrait FROM authors WHERE id = ?').get(writing.author_id)
    : null;
  return { ...writing, categories, author };
}

// Public: featured writings
router.get('/featured', (req, res) => {
  try {
    const db = getDb();
    const writings = db.prepare(`
      SELECT w.* FROM writings w
      WHERE w.status = 'published' AND (w.featured = 1 OR w.editors_pick = 1)
      ORDER BY w.updated_at DESC LIMIT 12
    `).all();
    res.json(writings.map(w => enrichWriting(db, w)));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch featured writings' });
  }
});

// Public: random writing
router.get('/random', (req, res) => {
  try {
    const db = getDb();
    const writing = db.prepare(`
      SELECT w.* FROM writings w
      WHERE w.status = 'published'
      ORDER BY RANDOM() LIMIT 1
    `).get();
    if (!writing) return res.status(404).json({ error: 'No writings found' });
    res.json(enrichWriting(db, writing));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch random writing' });
  }
});

// Public: daily word
router.get('/daily', (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    let daily = db.prepare(`
      SELECT dw.*, w.*, dw.writing_id, dw.date
      FROM daily_words dw
      JOIN writings w ON w.id = dw.writing_id
      WHERE dw.date = ?
    `).get(today);

    if (!daily) {
      daily = db.prepare(`
        SELECT dw.*, w.*, dw.writing_id, dw.date
        FROM daily_words dw
        JOIN writings w ON w.id = dw.writing_id
        ORDER BY dw.date DESC LIMIT 1
      `).get();
    }

    if (!daily) {
      const random = db.prepare(`
        SELECT * FROM writings WHERE status = 'published' ORDER BY RANDOM() LIMIT 1
      `).get();
      if (!random) return res.status(404).json({ error: 'No writings found' });
      return res.json(enrichWriting(db, random));
    }

    res.json(enrichWriting(db, daily));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch daily word' });
  }
});

// Public: list writings
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 12, author, category, type, language, status = 'published', featured, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ['w.status = ?'];
    let params = [status];

    if (author) { where.push('a.slug = ?'); params.push(author); }
    if (type) { where.push('w.type = ?'); params.push(type); }
    if (language) { where.push('w.language = ?'); params.push(language); }
    if (featured === '1') { where.push('w.featured = 1'); }
    if (search) {
      where.push("(w.text LIKE ? OR w.title LIKE ? OR a.name LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) {
      where.push(' EXISTS (SELECT 1 FROM writing_categories wc2 JOIN categories c2 ON c2.id = wc2.category_id WHERE wc2.writing_id = w.id AND c2.slug = ?)');
      params.push(category);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(DISTINCT w.id) as total
      FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      ${whereClause}
    `;
    const total = db.prepare(countQuery).get(...params).total;

    const writingsQuery = `
      SELECT DISTINCT w.*, a.name as author_name, a.slug as author_slug
      FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      ${whereClause}
      ORDER BY w.featured DESC, w.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const writings = db.prepare(writingsQuery).all(...params, parseInt(limit), offset);

    res.json({
      writings: writings.map(w => enrichWriting(db, w)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch writings' });
  }
});

// Admin: list all writings
router.get('/admin/list', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20, status, type, language, author, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = [];
    let params = [];

    if (status) { where.push('w.status = ?'); params.push(status); }
    if (type) { where.push('w.type = ?'); params.push(type); }
    if (language) { where.push('w.language = ?'); params.push(language); }
    if (author) { where.push('a.id = ?'); params.push(author); }
    if (search) {
      where.push("(w.text LIKE ? OR w.title LIKE ? OR a.name LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = db.prepare(`
      SELECT COUNT(*) as total FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      ${whereClause}
    `).get(...params).total;

    const writings = db.prepare(`
      SELECT w.*, a.name as author_name,
             GROUP_CONCAT(DISTINCT c.name) as category_names
      FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      LEFT JOIN writing_categories wc ON wc.writing_id = w.id
      LEFT JOIN categories c ON c.id = wc.category_id
      ${whereClause}
      GROUP BY w.id
      ORDER BY w.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      writings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch writings' });
  }
});

// Public: get single writing by slug
router.get('/slug/:slug', (req, res) => {
  try {
    const db = getDb();
    const writing = db.prepare(`
      SELECT w.* FROM writings w WHERE w.slug = ?
    `).get(req.params.slug);

    if (!writing) return res.status(404).json({ error: 'Writing not found' });

    db.prepare('UPDATE writings SET views = views + 1 WHERE id = ?').run(writing.id);

    const enriched = enrichWriting(db, writing);

    const related = db.prepare(`
      SELECT w.*, a.name as author_name, a.slug as author_slug
      FROM writings w
      LEFT JOIN authors a ON a.id = w.author_id
      WHERE w.status = 'published' AND w.id != ?
        AND (w.author_id = ? OR EXISTS (
          SELECT 1 FROM writing_categories wc1
          JOIN writing_categories wc2 ON wc1.category_id = wc2.category_id
          WHERE wc1.writing_id = w.id AND wc2.writing_id = ?
        ))
      ORDER BY RANDOM()
      LIMIT 6
    `).all(writing.id, writing.author_id, writing.id);

    res.json({ writing: enriched, related: related.map(w => enrichWriting(db, w)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch writing' });
  }
});

// Public: get writing by ID
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const writing = db.prepare('SELECT * FROM writings WHERE id = ?').get(req.params.id);
    if (!writing) return res.status(404).json({ error: 'Writing not found' });
    res.json(enrichWriting(db, writing));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch writing' });
  }
});

// Admin: create writing
router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const {
      author_id, title, text, original_text, english_translation, bangla_translation, urdu_translation,
      type, language, direction, source, source_url, translator, source_book, source_chapter, source_page, source_notes,
      date, status, featured, editors_pick, verification_status, category_ids, collection_ids
    } = req.body;

    if (!text) return res.status(400).json({ error: 'Text is required' });

    const slug = generateUniqueSlug(db, slugify(title || text.substring(0, 80)));

    const result = db.prepare(`
      INSERT INTO writings (author_id, title, slug, text, original_text, english_translation, bangla_translation, urdu_translation,
        type, language, direction, source, source_url, translator, source_book, source_chapter, source_page, source_notes,
        date, status, featured, editors_pick, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      author_id || null, title || null, slug, text,
      original_text || null, english_translation || null, bangla_translation || null, urdu_translation || null,
      type || 'quote', language || 'english', direction || 'ltr',
      source || null, source_url || null, translator || null,
      source_book || null, source_chapter || null, source_page || null, source_notes || null,
      date || null, status || 'draft', featured ? 1 : 0, editors_pick ? 1 : 0, verification_status || 'attributed'
    );

    const writingId = result.lastInsertRowid;

    if (category_ids && category_ids.length) {
      const insertCat = db.prepare('INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)');
      for (const catId of category_ids) {
        insertCat.run(writingId, catId);
      }
    }

    if (collection_ids && collection_ids.length) {
      const insertColl = db.prepare('INSERT OR IGNORE INTO collection_writings (collection_id, writing_id) VALUES (?, ?)');
      for (const collId of collection_ids) {
        insertColl.run(collId, writingId);
      }
    }

    const writing = db.prepare('SELECT * FROM writings WHERE id = ?').get(writingId);
    res.status(201).json(enrichWriting(db, writing));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create writing' });
  }
});

// Admin: update writing
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM writings WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Writing not found' });

    const {
      author_id, title, text, original_text, english_translation, bangla_translation, urdu_translation,
      type, language, direction, source, source_url, translator, source_book, source_chapter, source_page, source_notes,
      date, status, featured, editors_pick, verification_status, category_ids, collection_ids
    } = req.body;

    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = generateUniqueSlug(db, slugify(title), id);
    }

    db.prepare(`
      UPDATE writings SET
        author_id=?, title=?, slug=?, text=?, original_text=?, english_translation=?, bangla_translation=?, urdu_translation=?,
        type=?, language=?, direction=?, source=?, source_url=?, translator=?, source_book=?, source_chapter=?, source_page=?, source_notes=?,
        date=?, status=?, featured=?, editors_pick=?, verification_status=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(
      author_id !== undefined ? (author_id || null) : existing.author_id,
      title !== undefined ? title : existing.title,
      slug,
      text || existing.text,
      original_text !== undefined ? original_text : existing.original_text,
      english_translation !== undefined ? english_translation : existing.english_translation,
      bangla_translation !== undefined ? bangla_translation : existing.bangla_translation,
      urdu_translation !== undefined ? urdu_translation : existing.urdu_translation,
      type || existing.type,
      language || existing.language,
      direction || existing.direction,
      source !== undefined ? source : existing.source,
      source_url !== undefined ? source_url : existing.source_url,
      translator !== undefined ? translator : existing.translator,
      source_book !== undefined ? source_book : existing.source_book,
      source_chapter !== undefined ? source_chapter : existing.source_chapter,
      source_page !== undefined ? source_page : existing.source_page,
      source_notes !== undefined ? source_notes : existing.source_notes,
      date !== undefined ? (date || null) : existing.date,
      status || existing.status,
      featured !== undefined ? (featured ? 1 : 0) : existing.featured,
      editors_pick !== undefined ? (editors_pick ? 1 : 0) : existing.editors_pick,
      verification_status || existing.verification_status,
      id
    );

    if (category_ids !== undefined) {
      db.prepare('DELETE FROM writing_categories WHERE writing_id = ?').run(id);
      if (category_ids.length) {
        const insertCat = db.prepare('INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)');
        for (const catId of category_ids) {
          insertCat.run(id, catId);
        }
      }
    }

    if (collection_ids !== undefined) {
      db.prepare('DELETE FROM collection_writings WHERE writing_id = ?').run(id);
      if (collection_ids.length) {
        const insertColl = db.prepare('INSERT OR IGNORE INTO collection_writings (collection_id, writing_id) VALUES (?, ?)');
        for (const collId of collection_ids) {
          insertColl.run(collId, id);
        }
      }
    }

    const writing = db.prepare('SELECT * FROM writings WHERE id = ?').get(id);
    res.json(enrichWriting(db, writing));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update writing' });
  }
});

// Admin: delete writing
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM writings WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Writing not found' });
    res.json({ message: 'Writing deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete writing' });
  }
});

// Admin: set as daily word
router.post('/:id/set-daily', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    db.prepare('INSERT OR REPLACE INTO daily_words (writing_id, date) VALUES (?, ?)').run(req.params.id, today);
    res.json({ message: 'Set as daily word' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set daily word' });
  }
});

// Admin: toggle featured
router.post('/:id/toggle-featured', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const writing = db.prepare('SELECT featured FROM writings WHERE id = ?').get(req.params.id);
    if (!writing) return res.status(404).json({ error: 'Writing not found' });
    db.prepare('UPDATE writings SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(writing.featured ? 0 : 1, req.params.id);
    res.json({ featured: !writing.featured });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle featured' });
  }
});

// Admin: set status
router.put('/:id/status', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    db.prepare('UPDATE writings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Admin: duplicate writing
router.post('/:id/duplicate', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const original = db.prepare('SELECT * FROM writings WHERE id = ?').get(req.params.id);
    if (!original) return res.status(404).json({ error: 'Writing not found' });

    const slug = generateUniqueSlug(db, slugify(original.title || original.text.substring(0, 80)));

    const result = db.prepare(`
      INSERT INTO writings (author_id, title, slug, text, original_text, english_translation, bangla_translation, urdu_translation,
        type, language, direction, source, source_url, translator, source_book, source_chapter, source_page, source_notes,
        date, status, featured, editors_pick, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, 0, ?)
    `).run(
      original.author_id, original.title ? `${original.title} (Copy)` : null, slug, original.text,
      original.original_text, original.english_translation, original.bangla_translation, original.urdu_translation,
      original.type, original.language, original.direction,
      original.source, original.source_url, original.translator,
      original.source_book, original.source_chapter, original.source_page, original.source_notes,
      original.date, 'draft', 0, 0, original.verification_status
    );

    const cats = db.prepare('SELECT category_id FROM writing_categories WHERE writing_id = ?').all(original.id);
    const insertCat = db.prepare('INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)');
    for (const { category_id } of cats) {
      insertCat.run(result.lastInsertRowid, category_id);
    }

    const writing = db.prepare('SELECT * FROM writings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(enrichWriting(db, writing));
  } catch (err) {
    res.status(500).json({ error: 'Failed to duplicate writing' });
  }
});

// Admin: bulk actions
router.post('/bulk', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { ids, action } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: 'No writings selected' });

    const placeholders = ids.map(() => '?').join(',');

    switch (action) {
      case 'publish':
        db.prepare(`UPDATE writings SET status = 'published', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
        break;
      case 'archive':
        db.prepare(`UPDATE writings SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
        break;
      case 'draft':
        db.prepare(`UPDATE writings SET status = 'draft', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...ids);
        break;
      case 'delete':
        db.prepare(`DELETE FROM writings WHERE id IN (${placeholders})`).run(...ids);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `Bulk action '${action}' completed`, affected: ids.length });
  } catch (err) {
    res.status(500).json({ error: 'Bulk action failed' });
  }
});

// Admin: import writings
router.post('/import', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { writings } = req.body;
    if (!writings || !writings.length) return res.status(400).json({ error: 'No writings to import' });

    let imported = 0;
    const insertWriting = db.prepare(`
      INSERT INTO writings (author_id, title, slug, text, type, language, direction, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `);

    const insertTransaction = db.transaction((items) => {
      for (const w of items) {
        const slug = generateUniqueSlug(db, slugify(w.title || w.text?.substring(0, 80) || 'untitled'));
        let authorId = null;
        if (w.author_name) {
          const author = db.prepare('SELECT id FROM authors WHERE name = ?').get(w.author_name);
          if (author) authorId = author.id;
        }
        insertWriting.run(authorId, w.title || null, slug, w.text, w.type || 'quote', w.language || 'english', w.direction || 'ltr', w.source || null);
        imported++;
      }
    });

    insertTransaction(writings);
    res.json({ message: `Imported ${imported} writings` });
  } catch (err) {
    res.status(500).json({ error: 'Import failed' });
  }
});

export default router;
