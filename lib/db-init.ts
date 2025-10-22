import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * Initialize SQLite database with required tables and indexes
 */
export function initializeDatabase(dbPath?: string): Database.Database {
  // Use provided path or default to data/metacampus.db
  const finalPath = dbPath || path.join(process.cwd(), 'data', 'metacampus.db');
  
  // Ensure data directory exists
  const dir = path.dirname(finalPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Open database connection
  const db = new Database(finalPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create transcripts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transcripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentAddress TEXT UNIQUE NOT NULL,
      universityAddress TEXT NOT NULL,
      courses TEXT NOT NULL,
      hash TEXT NOT NULL,
      ipfs_cid TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  
  // Create university_signups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS university_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      walletAddress TEXT NOT NULL,
      institutionName TEXT NOT NULL,
      contactEmail TEXT NOT NULL,
      institutionWebsite TEXT NOT NULL,
      verificationDocuments TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      submittedAt TEXT NOT NULL,
      reviewedAt TEXT,
      reviewedBy TEXT,
      rejectionReason TEXT
    )
  `);
  
  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transcripts_student 
    ON transcripts(studentAddress)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_signups_wallet 
    ON university_signups(walletAddress)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_signups_status 
    ON university_signups(status)
  `);
  
  console.log('Database initialized successfully at:', finalPath);
  
  return db;
}

/**
 * Test database operations
 */
export function testDatabase(db: Database.Database): void {
  console.log('Testing database operations...');
  
  try {
    // Test transcript insert
    const insertTranscript = db.prepare(`
      INSERT INTO transcripts (
        studentAddress, 
        universityAddress, 
        courses, 
        hash, 
        createdAt, 
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const testCourses = JSON.stringify([
      { name: 'Test Course', grade: 'A', date: '2025-01-01' }
    ]);
    
    const now = new Date().toISOString();
    
    insertTranscript.run(
      'TEST_STUDENT_ADDRESS',
      'TEST_UNIVERSITY_ADDRESS',
      testCourses,
      'test_hash_123',
      now,
      now
    );
    
    console.log('✓ Transcript insert successful');
    
    // Test transcript query
    const selectTranscript = db.prepare(
      'SELECT * FROM transcripts WHERE studentAddress = ?'
    );
    const transcript = selectTranscript.get('TEST_STUDENT_ADDRESS');
    
    if (transcript) {
      console.log('✓ Transcript query successful');
    }
    
    // Test university signup insert
    const insertSignup = db.prepare(`
      INSERT INTO university_signups (
        walletAddress,
        institutionName,
        contactEmail,
        institutionWebsite,
        submittedAt
      ) VALUES (?, ?, ?, ?, ?)
    `);
    
    insertSignup.run(
      'TEST_WALLET_ADDRESS',
      'Test University',
      'test@university.edu',
      'https://test.edu',
      now
    );
    
    console.log('✓ University signup insert successful');
    
    // Test signup query
    const selectSignup = db.prepare(
      'SELECT * FROM university_signups WHERE walletAddress = ?'
    );
    const signup = selectSignup.get('TEST_WALLET_ADDRESS');
    
    if (signup) {
      console.log('✓ University signup query successful');
    }
    
    // Clean up test data
    db.prepare('DELETE FROM transcripts WHERE studentAddress = ?')
      .run('TEST_STUDENT_ADDRESS');
    db.prepare('DELETE FROM university_signups WHERE walletAddress = ?')
      .run('TEST_WALLET_ADDRESS');
    
    console.log('✓ Test data cleanup successful');
    console.log('\nAll database tests passed! ✓');
    
  } catch (error) {
    console.error('Database test failed:', error);
    throw error;
  }
}

// Run initialization and tests if executed directly
if (require.main === module) {
  const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'metacampus.db');
  const db = initializeDatabase(dbPath);
  testDatabase(db);
  db.close();
}
