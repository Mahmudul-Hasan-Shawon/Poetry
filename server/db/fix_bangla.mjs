import { getDb } from './index.js';

const db = getDb();

const updates = [
  {
    id: 11,
    text: `বল বীর—
বল উন্নত মম শির!
শির নেহারি আমারি, নতশির ওই শিখর হিমাদ্রির!`,
    english_translation: `Proclaim, brave one—
proclaim my head held high!
Seeing my head, that Himalayan summit bows low.`,
    source: 'বিদ্রোহী (The Rebel)',
    categories: ['Courage', 'Humanity'],
  },
  {
    id: 12,
    text: `গাহি সাম্যের গান—
যেখানে আসিয়া এক হয়ে গেছে সব বাধা-ব্যবধান,
যেখানে মিলিত হিন্দু-বৌদ্ধ-মুসলিম-খ্রীষ্টান।`,
    english_translation: `I sing the song of equality—
Where all barriers have melted into one,
Where Hindu, Buddhist, Muslim, and Christian are united.`,
    source: 'সাম্যবাদী (The Equalizer)',
    categories: ['Humanity', 'Peace', 'Faith'],
  },
];

const updateStmt = db.prepare(`
  UPDATE writings SET text = ?, english_translation = ?, source = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
`);

const catInsertStmt = db.prepare('INSERT OR IGNORE INTO writing_categories (writing_id, category_id) VALUES (?, ?)');

for (const u of updates) {
  const w = db.prepare('SELECT id FROM writings WHERE id = ?').get(u.id);
  if (!w) { console.log(`Writing ${u.id} not found, skipping`); continue; }
  updateStmt.run(u.text, u.english_translation, u.source, u.id);
  db.prepare('DELETE FROM writing_categories WHERE writing_id = ?').run(u.id);
  for (const catName of u.categories) {
    const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(catName);
    if (cat) catInsertStmt.run(u.id, cat.id);
  }
  console.log(`Updated writing ${u.id}`);
}

// Add a third authentic Nazrul poem: চল্ চল্ চল্
const nazrul = db.prepare("SELECT id FROM authors WHERE name = 'Kazi Nazrul Islam'").get();
if (nazrul) {
  const existing = db.prepare("SELECT id FROM writings WHERE slug = 'chal-chal-chal'").get();
  if (!existing) {
    const courageCat = db.prepare("SELECT id FROM categories WHERE name = 'Courage'").get();
    const hopeCat = db.prepare("SELECT id FROM categories WHERE name = 'Hope'").get();
    db.prepare(`
      INSERT INTO writings (author_id, slug, text, english_translation, type, language, direction, source, status, featured, verification_status)
      VALUES (?, ?, ?, ?, 'poetry', 'bangla', 'ltr', 'চল্ চল্ চল্ (March On)', 'published', 1, 'verified')
    `).run(
      nazrul.id,
      'chal-chal-chal',
      `চল্ চল্ চল্,
ঊর্ধ্ব গগনে বাজে মাদল,
নিম্নে উতলা ধরণী তল,
অরুণ প্রাতের তরুণ দল,
চল্ চল্ চল্।`,
      `March on, march on, march on!
The drums resound in the heavens above,
Below, the restless earth—
the youthful band of the crimson dawn,
march on, march on, march on!`
    );
    const newId = db.prepare("SELECT id FROM writings WHERE slug = 'chal-chal-chal'").get().id;
    if (courageCat) catInsertStmt.run(newId, courageCat.id);
    if (hopeCat) catInsertStmt.run(newId, hopeCat.id);
    console.log(`Added new writing ${newId} (চল্ চল্ চল্)`);
  }
}

// Verify
console.log('\nVerification:');
const verifications = db.prepare(`
  SELECT w.id, w.text, w.language FROM writings w
  JOIN authors a ON a.id = w.author_id
  WHERE a.name = 'Kazi Nazrul Islam'
`).all();
for (const v of verifications) {
  console.log(`ID ${v.id} [${v.language}]: ${v.text.split('\n')[0].substring(0, 50)}`);
}

process.exit(0);