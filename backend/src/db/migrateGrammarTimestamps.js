/**
 * Migration: Add start_time and end_time columns to detected_grammar if missing (SQLite only)
 */
export async function migrateGrammarTimestamps(db) {
  return new Promise((resolve, reject) => {
    // Only for SQLite (db.run/db.all exist on sqlite3 Database)
    if (typeof db.all !== 'function') {
      resolve();
      return;
    }

    db.all("PRAGMA table_info(detected_grammar)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }

      const names = (columns || []).map((c) => c.name);
      const tasks = [];

      if (!names.includes('start_time')) {
        tasks.push(
          new Promise((res, rej) =>
            db.run('ALTER TABLE detected_grammar ADD COLUMN start_time REAL', (e) => (e ? rej(e) : res()))
          )
        );
      }

      if (!names.includes('end_time')) {
        tasks.push(
          new Promise((res, rej) =>
            db.run('ALTER TABLE detected_grammar ADD COLUMN end_time REAL', (e) => (e ? rej(e) : res()))
          )
        );
      }

      Promise.all(tasks)
        .then(() => resolve())
        .catch(reject);
    });
  });
}


