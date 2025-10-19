export const createTables = (db, dbType = 'sqlite') => {
  return new Promise((resolve, reject) => {
    // SQL differences between SQLite and PostgreSQL
    const AUTO_INCREMENT = dbType === 'postgresql' ? 'SERIAL' : 'INTEGER';
    const PRIMARY_KEY = dbType === 'postgresql' ? 'PRIMARY KEY' : 'PRIMARY KEY AUTOINCREMENT';
    
    const queries = [
      // Videos table
      `CREATE TABLE IF NOT EXISTS videos (
        id ${AUTO_INCREMENT} ${PRIMARY_KEY},
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        duration REAL,
        mime_type TEXT,
        status TEXT DEFAULT 'uploaded' CHECK(status IN ('uploaded', 'processing', 'audio_extracted', 'transcribing', 'translating', 'completed', 'error', 'downloading_youtube', 'extracting_audio', 'compressing_audio')),
        audio_path TEXT,
        youtube_url TEXT,
        error_message TEXT,
        progress INTEGER DEFAULT 0,
        status_message TEXT,
        estimated_time_remaining INTEGER,
        created_at TIMESTAMP DEFAULT ${dbType === 'postgresql' ? 'CURRENT_TIMESTAMP' : "CURRENT_TIMESTAMP"}
      )`,

      // Transcriptions table
      `CREATE TABLE IF NOT EXISTS transcriptions (
        id ${AUTO_INCREMENT} ${PRIMARY_KEY},
        video_id INTEGER NOT NULL,
        language TEXT DEFAULT 'ja',
        full_text TEXT,
        segments TEXT,
        created_at TIMESTAMP DEFAULT ${dbType === 'postgresql' ? 'CURRENT_TIMESTAMP' : "CURRENT_TIMESTAMP"},
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )`,

      // Translations table
      `CREATE TABLE IF NOT EXISTS translations (
        id ${AUTO_INCREMENT} ${PRIMARY_KEY},
        transcription_id INTEGER NOT NULL,
        language TEXT DEFAULT 'en',
        full_text TEXT,
        segments TEXT,
        created_at TIMESTAMP DEFAULT ${dbType === 'postgresql' ? 'CURRENT_TIMESTAMP' : "CURRENT_TIMESTAMP"},
        FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE
      )`,

      // JLPT Vocabulary (multi-level support)
      `CREATE TABLE IF NOT EXISTS jlpt_vocabulary (
        id ${AUTO_INCREMENT} ${PRIMARY_KEY},
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
        created_at TIMESTAMP DEFAULT ${dbType === 'postgresql' ? 'CURRENT_TIMESTAMP' : "CURRENT_TIMESTAMP"}
      )`,

      // Grammar patterns (multi-level support)
      `CREATE TABLE IF NOT EXISTS grammar_patterns (
        id ${AUTO_INCREMENT} ${PRIMARY_KEY},
        pattern_name TEXT NOT NULL,
        pattern_structure TEXT,
        pattern_regex TEXT NOT NULL,
        jlpt_level INTEGER NOT NULL CHECK(jlpt_level IN (5, 4, 3, 2, 1)),
        english_explanation TEXT,
        example_japanese TEXT,
        example_english TEXT,
        chapter TEXT,
        difficulty_rank INTEGER,
        created_at TIMESTAMP DEFAULT ${dbType === 'postgresql' ? 'CURRENT_TIMESTAMP' : "CURRENT_TIMESTAMP"}
      )`,

      // Vocabulary instances (detected in videos)
      `CREATE TABLE IF NOT EXISTS vocabulary_instances (
        id ${AUTO_INCREMENT} ${PRIMARY_KEY},
        transcription_id INTEGER NOT NULL,
        word_id INTEGER NOT NULL,
        matched_text TEXT NOT NULL,
        start_time REAL,
        end_time REAL,
        FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (word_id) REFERENCES jlpt_vocabulary(id)
      )`,

      // Detected grammar (in videos)
      `CREATE TABLE IF NOT EXISTS detected_grammar (
        id ${AUTO_INCREMENT} ${PRIMARY_KEY},
        transcription_id INTEGER NOT NULL,
        pattern_id INTEGER NOT NULL,
        matched_text TEXT NOT NULL,
        position_in_text INTEGER,
        FOREIGN KEY (transcription_id) REFERENCES transcriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (pattern_id) REFERENCES grammar_patterns(id)
      )`
    ];

    // Indexes (same for both databases)
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_jlpt_level ON jlpt_vocabulary(jlpt_level)',
      'CREATE INDEX IF NOT EXISTS idx_kanji ON jlpt_vocabulary(kanji)',
      'CREATE INDEX IF NOT EXISTS idx_hiragana ON jlpt_vocabulary(hiragana)',
      'CREATE INDEX IF NOT EXISTS idx_grammar_jlpt_level ON grammar_patterns(jlpt_level)'
    ];

    if (dbType === 'postgresql') {
      // PostgreSQL: Execute queries sequentially
      const executeQuery = async (query) => {
        return new Promise((resolve, reject) => {
          db.query(query, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      };

      (async () => {
        try {
          for (const query of queries) {
            await executeQuery(query);
          }
          for (const index of indexes) {
            await executeQuery(index);
          }
          console.log('✅ PostgreSQL tables created successfully');
          resolve();
        } catch (error) {
          reject(error);
        }
      })();

    } else {
      // SQLite: Use serialize for sequential execution
      db.serialize(() => {
        queries.forEach(query => db.run(query));
        indexes.forEach(index => db.run(index));
        
        db.run('SELECT 1', (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ SQLite tables created successfully');
            resolve();
          }
        });
      });
    }
  });
};
