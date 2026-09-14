import Database from 'better-sqlite3';
const db = new Database('db/poetry.db');
const rows = db.prepare("SELECT writings.id, writings.source, writings.language, substr(writings.text, 1, 45) AS preview FROM writings JOIN authors ON authors.id = writings.author_id WHERE authors.name = 'Rumi'").all();
console.log(JSON.stringify(rows, null, 2));