import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'poetry.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb();
  }
  return db;
}

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_bio TEXT,
      full_bio TEXT,
      portrait TEXT,
      birth_date TEXT,
      death_date TEXT,
      country TEXT,
      primary_language TEXT,
      other_languages TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS writings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER,
      title TEXT,
      slug TEXT UNIQUE NOT NULL,
      text TEXT NOT NULL,
      original_text TEXT,
      english_translation TEXT,
      bangla_translation TEXT,
      urdu_translation TEXT,
      type TEXT DEFAULT 'quote',
      language TEXT DEFAULT 'english',
      direction TEXT DEFAULT 'ltr',
      source TEXT,
      source_url TEXT,
      translator TEXT,
      source_book TEXT,
      source_chapter TEXT,
      source_page TEXT,
      source_notes TEXT,
      date TEXT,
      status TEXT DEFAULT 'draft',
      featured INTEGER DEFAULT 0,
      editors_pick INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'attributed',
      views INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS writing_categories (
      writing_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (writing_id, category_id),
      FOREIGN KEY (writing_id) REFERENCES writings(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      cover_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS collection_writings (
      collection_id INTEGER NOT NULL,
      writing_id INTEGER NOT NULL,
      position INTEGER DEFAULT 0,
      PRIMARY KEY (collection_id, writing_id),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (writing_id) REFERENCES writings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      writing_id INTEGER NOT NULL,
      date TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (writing_id) REFERENCES writings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_writings_author ON writings(author_id);
    CREATE INDEX IF NOT EXISTS idx_writings_status ON writings(status);
    CREATE INDEX IF NOT EXISTS idx_writings_featured ON writings(featured);
    CREATE INDEX IF NOT EXISTS idx_writings_type ON writings(type);
    CREATE INDEX IF NOT EXISTS idx_writings_language ON writings(language);
    CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
    CREATE INDEX IF NOT EXISTS idx_daily_words_date ON daily_words(date);
  `);

  const writingCols = db.prepare(`PRAGMA table_info(writings)`).all();
  if (!writingCols.some((c) => c.name === 'date')) {
    db.exec(`ALTER TABLE writings ADD COLUMN date TEXT;`);
  }

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get();
  if (adminCount.count === 0) {
    const hash = bcrypt.hashSync('[REDACTED]', 10);
    db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('Default admin created: admin / [REDACTED]');
  }

  seedCategories();
  seedAuthors();
}

function seedCategories() {
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (count.count > 0) return;

  const cats = [
    'Love', 'Life', 'Sorrow', 'Hope', 'Wisdom', 'Spirituality',
    'Nature', 'Friendship', 'Death', 'Loneliness', 'Humanity',
    'Faith', 'Desire', 'Time', 'Beauty', 'Peace', 'Courage', 'Loss'
  ];

  const insert = db.prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
  for (const cat of cats) {
    const slug = cat.toLowerCase().replace(/\s+/g, '-');
    insert.run(cat, slug);
  }
}

function seedAuthors() {
  const count = db.prepare('SELECT COUNT(*) as count FROM authors').get();
  if (count.count > 0) return;

  const authors = [
    { name: 'Rumi', slug: 'rumi', short_bio: 'Persian poet, jurist, Islamic scholar, theologian, and Sufi mystic.', birth_date: '1207', death_date: '1273', country: 'Persia (modern-day Afghanistan/Turkey)', primary_language: 'Persian' },
    { name: 'Mirza Ghalib', slug: 'mirza-ghalib', short_bio: 'The last great poet of the Mughal era, renowned for his Urdu and Persian poetry.', birth_date: '1797', death_date: '1869', country: 'India', primary_language: 'Urdu' },
    { name: 'Rabindranath Tagore', slug: 'rabindranath-tagore', short_bio: 'Bengali polymath who reshaped Bengali literature and music.', birth_date: '1861', death_date: '1941', country: 'India', primary_language: 'Bengali' },
    { name: 'Kazi Nazrul Islam', slug: 'kazi-nazrul-islam', short_bio: 'The rebel poet of Bengal, known for his activism and literary works.', birth_date: '1899', death_date: '1976', country: 'Bangladesh', primary_language: 'Bengali' },
    { name: 'Hafiz', slug: 'hafiz', short_bio: 'Persian poet whose collected works are regarded as a pinnacle of Persian literature.', birth_date: '1315', death_date: '1390', country: 'Persia (modern-day Iran)', primary_language: 'Persian' },
    { name: 'Saadi', slug: 'saadi', short_bio: 'Persian poet known for his moral wit and depth of human understanding.', birth_date: '1210', death_date: '1291', country: 'Persia (modern-day Iran)', primary_language: 'Persian' },
    { name: 'Omar Khayyam', slug: 'omar-khayyam', short_bio: 'Persian mathematician, astronomer, and poet.', birth_date: '1048', death_date: '1131', country: 'Persia (modern-day Iran)', primary_language: 'Persian' },
    { name: 'William Shakespeare', slug: 'william-shakespeare', short_bio: 'English playwright and poet, widely regarded as the greatest writer in the English language.', birth_date: '1564', death_date: '1616', country: 'England', primary_language: 'English' },
    { name: 'Pablo Neruda', slug: 'pablo-neruda', short_bio: 'Chilean poet-diplomat and politician who won the Nobel Prize in Literature.', birth_date: '1904', death_date: '1973', country: 'Chile', primary_language: 'Spanish' },
    { name: 'Khalil Gibran', slug: 'khalil-gibran', short_bio: 'Lebanese-American writer, poet, and visual artist.', birth_date: '1883', death_date: '1931', country: 'Lebanon', primary_language: 'Arabic' },
  ];

  const insert = db.prepare(`
    INSERT INTO authors (name, slug, short_bio, birth_date, death_date, country, primary_language)
    VALUES (@name, @slug, @short_bio, @birth_date, @death_date, @country, @primary_language)
  `);

  for (const author of authors) {
    insert.run(author);
  }
}
