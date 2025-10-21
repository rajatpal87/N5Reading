/**
 * Migration: Add Kuromoji metadata columns to vocabulary_instances table
 * Adds: pos, basic_form, reading, conjugation_type, conjugation_form
 */

export async function migrateVocabularyMetadata(db, dbType = 'sqlite') {
  console.log('🔄 Running migration: Add Kuromoji metadata to vocabulary_instances...');

  const columns = [
    { name: 'pos', type: 'TEXT' },
    { name: 'basic_form', type: 'TEXT' },
    { name: 'reading', type: 'TEXT' },
    { name: 'conjugation_type', type: 'TEXT' },
    { name: 'conjugation_form', type: 'TEXT' }
  ];

  try {
    if (dbType === 'postgresql') {
      // PostgreSQL: Use ALTER TABLE IF NOT EXISTS
      for (const col of columns) {
        const query = `ALTER TABLE vocabulary_instances ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
        await new Promise((resolve, reject) => {
          db.query(query, (err) => {
            if (err) reject(err);
            else {
              console.log(`  ✓ Column '${col.name}' added/verified`);
              resolve();
            }
          });
        });
      }
    } else {
      // SQLite: Check if columns exist first
      const tableInfo = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(vocabulary_instances)', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const existingColumns = tableInfo.map(row => row.name);

      for (const col of columns) {
        if (!existingColumns.includes(col.name)) {
          const query = `ALTER TABLE vocabulary_instances ADD COLUMN ${col.name} ${col.type}`;
          await new Promise((resolve, reject) => {
            db.run(query, (err) => {
              if (err) reject(err);
              else {
                console.log(`  ✓ Column '${col.name}' added`);
                resolve();
              }
            });
          });
        } else {
          console.log(`  ✓ Column '${col.name}' already exists, skipping`);
        }
      }
    }

    console.log('✅ Vocabulary metadata migration complete');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}


