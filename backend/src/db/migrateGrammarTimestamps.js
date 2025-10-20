/**
 * Migration: Add start_time and end_time columns to detected_grammar if missing
 * Works with both SQLite and PostgreSQL
 */
export async function migrateGrammarTimestamps(db, dbType = 'sqlite') {
  return new Promise((resolve, reject) => {
    // For PostgreSQL, use IF NOT EXISTS syntax
    if (dbType === 'postgresql') {
      (async () => {
        try {
          await db.query('ALTER TABLE detected_grammar ADD COLUMN IF NOT EXISTS start_time REAL');
          await db.query('ALTER TABLE detected_grammar ADD COLUMN IF NOT EXISTS end_time REAL');
          console.log('  ✓ Grammar timestamp columns ensured');
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
      return;
    }

    // SQLite path - check if columns exist first
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


