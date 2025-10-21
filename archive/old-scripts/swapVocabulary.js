import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const OLD_VOCAB_PATH = path.join(__dirname, '../src/db/data/n5_vocabulary.json');
const NEW_VOCAB_PATH = path.join(__dirname, '../src/db/data/n5_vocabulary_new.json');
const BACKUP_PATH = path.join(__dirname, '../src/db/data/n5_vocabulary_backup.json');

console.log('🔄 Swapping Vocabulary Files...\n');

// Step 1: Check if new vocabulary exists
if (!fs.existsSync(NEW_VOCAB_PATH)) {
  console.error('❌ Error: New vocabulary file not found!');
  console.error(`   Expected at: ${NEW_VOCAB_PATH}`);
  process.exit(1);
}

// Step 2: Backup old vocabulary
console.log('💾 Step 1: Backing up old vocabulary...');
if (fs.existsSync(OLD_VOCAB_PATH)) {
  fs.copyFileSync(OLD_VOCAB_PATH, BACKUP_PATH);
  console.log(`✅ Backup created at: ${BACKUP_PATH}`);
  
  // Verify backup
  const oldData = JSON.parse(fs.readFileSync(OLD_VOCAB_PATH, 'utf-8'));
  const backupData = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8'));
  
  if (oldData.length === backupData.length) {
    console.log(`✅ Backup verified: ${backupData.length} entries\n`);
  } else {
    console.error('❌ Backup verification failed!');
    process.exit(1);
  }
} else {
  console.log('⚠️  No old vocabulary found, skipping backup\n');
}

// Step 3: Replace with new vocabulary
console.log('🔄 Step 2: Replacing with new vocabulary...');
fs.copyFileSync(NEW_VOCAB_PATH, OLD_VOCAB_PATH);
console.log(`✅ New vocabulary copied to: ${OLD_VOCAB_PATH}`);

// Verify the replacement
const newData = JSON.parse(fs.readFileSync(OLD_VOCAB_PATH, 'utf-8'));
console.log(`✅ Verification: ${newData.length} entries now active\n`);

// Summary
console.log('📊 Summary:');
console.log('─────────────────────────────────────────');
if (fs.existsSync(BACKUP_PATH)) {
  const backupData = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8'));
  console.log(`   Old vocabulary: ${backupData.length} entries (backed up)`);
}
console.log(`   New vocabulary: ${newData.length} entries (active)`);
console.log(`   Improvement: +${newData.length - (fs.existsSync(BACKUP_PATH) ? JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8')).length : 0)} entries`);
console.log('─────────────────────────────────────────\n');

console.log('✅ Vocabulary swap complete!\n');
console.log('📝 Files:');
console.log(`   ✅ Active: ${OLD_VOCAB_PATH}`);
console.log(`   💾 Backup: ${BACKUP_PATH}`);
console.log(`   📄 Source: ${NEW_VOCAB_PATH} (can be deleted)`);

console.log('\n🔄 Next steps:');
console.log('   1. Restart your backend server');
console.log('   2. The auto-seed will use the new vocabulary on next startup');
console.log('   3. Re-analyze existing videos to detect new vocabulary');
console.log('\n💡 To revert: copy the backup file back to n5_vocabulary.json');


