export const createTables = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Videos table
      db.run(`
        CREATE TABLE IF NOT EXISTS videos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          duration REAL,
          mime_type TEXT,
          status TEXT DEFAULT 'uploaded' CHECK(status IN ('uploaded', 'processing', 'completed', 'failed')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Transcriptions table
      db.run(`
        CREATE TABLE IF NOT EXISTS transcriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          video_id INTEGER NOT NULL,
          language TEXT DEFAULT 'ja',
          full_text TEXT,
          segments TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
        )
      `);

      // Translations table
      db.run(`
        CREATE TABLE IF NOT EXISTS translations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transcription_id INTEGER NOT NULL,
          language TEXT DEFAULT 'en',
          full_text TEXT,
          segments TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE
        )
      `);

      // JLPT Vocabulary (multi-level support)
      db.run(`
        CREATE TABLE IF NOT EXISTS jlpt_vocabulary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kanji TEXT,
          hiragana TEXT NOT NULL,
          romaji TEXT,
          english TEXT NOT NULL,
          part_of_speech TEXT,
          jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)),
          chapter TEXT,
          variants TEXT,
          reading TEXT,
          frequency_rank INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Indexes for vocabulary
      db.run(`CREATE INDEX IF NOT EXISTS idx_jlpt_level ON jlpt_vocabulary(jlpt_level)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_kanji ON jlpt_vocabulary(kanji)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_hiragana ON jlpt_vocabulary(hiragana)`);

      // Grammar patterns (multi-level support)
      db.run(`
        CREATE TABLE IF NOT EXISTS grammar_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pattern_name TEXT NOT NULL,
          pattern_structure TEXT,
          pattern_regex TEXT NOT NULL,
          jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)),
          english_explanation TEXT,
          example_japanese TEXT,
          example_english TEXT,
          chapter TEXT,
          difficulty_rank INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Indexes for grammar
      db.run(`CREATE INDEX IF NOT EXISTS idx_grammar_jlpt_level ON grammar_patterns(jlpt_level)`);

      // Vocabulary instances (detected in videos)
      db.run(`
        CREATE TABLE IF NOT EXISTS vocabulary_instances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transcription_id INTEGER NOT NULL,
          word_id INTEGER NOT NULL,
          matched_text TEXT NOT NULL,
          start_time REAL,
          end_time REAL,
          FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
          FOREIGN KEY (word_id) REFERENCES jlpt_vocabulary(id)
        )
      `);

      // Detected grammar (in videos)
      db.run(`
        CREATE TABLE IF NOT EXISTS detected_grammar (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transcription_id INTEGER NOT NULL,
          pattern_id INTEGER NOT NULL,
          matched_text TEXT NOT NULL,
          position_in_text INTEGER,
          FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
          FOREIGN KEY (pattern_id) REFERENCES grammar_patterns(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables created successfully');
          resolve();
        }
      });
    });
  });
};

