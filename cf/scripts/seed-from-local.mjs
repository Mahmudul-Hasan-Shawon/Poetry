import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '..', '..', 'server', 'package.json'));
const Database = require('better-sqlite3');

const dbPath = join(here, '..', '..', 'server', 'db', 'poetry.db');
const db = new Database(dbPath, { readonly: true, fileMustExist: true });

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

const tables = [
  'admin',
  'authors',
  'categories',
  'writings',
  'writing_categories',
  'collections',
  'collection_writings',
  'daily_words',
];

let sql = '-- Generated from local poetry.db\n\n';
let wroteAny = false;

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  if (!rows.length) continue;
  const cols = Object.keys(rows[0]);
  const colList = cols.join(', ');
  for (const row of rows) {
    const vals = cols.map((c) => esc(row[c])).join(', ');
    sql += `INSERT INTO ${table} (${colList}) VALUES (${vals});\n`;
    wroteAny = true;
  }
  sql += '\n';
}

const outPath = join(here, '..', 'seed.sql');
writeFileSync(outPath, sql);

db.close();

if (!wroteAny) {
  console.log('Local DB is empty — nothing exported.');
  process.exit(1);
}
console.log(`Wrote ${outPath}`);