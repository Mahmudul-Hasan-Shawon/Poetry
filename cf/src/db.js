export function stmt(db, sql, params = []) {
  const s = db.prepare(sql);
  return params.length ? s.bind(...params) : s;
}

export async function all(db, sql, params = []) {
  const { results } = await stmt(db, sql, params).all();
  return results;
}

export async function one(db, sql, params = []) {
  const row = await stmt(db, sql, params).first();
  return row ?? null;
}

export async function run(db, sql, params = []) {
  const res = await stmt(db, sql, params).run();
  return {
    lastInsertRowid: Number(res.meta.last_row_id ?? 0),
    changes: res.meta.changes ?? 0,
  };
}