import Database from 'better-sqlite3';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// Type definitions
export interface Course {
  name: string;
  grade: string;
  date: string;
}

export interface TranscriptRecord {
  id?: number;
  studentAddress: string;
  universityAddress: string;
  courses: Course[];
  hash: string;
  ipfs_cid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UniversitySignupRecord {
  id?: number;
  walletAddress: string;
  institutionName: string;
  contactEmail: string;
  institutionWebsite: string;
  verificationDocuments?: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

/**
 * SQLite service for managing transcripts and university signups
 */
export class SQLiteService {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'metacampus.db');
    this.initializeDatabase();
  }

  /**
   * Initialize database with tables and indexes
   */
  private initializeDatabase(): void {
    // Ensure data directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Open database connection
    this.db = new Database(this.dbPath);
    
    // Enable foreign keys and WAL mode for better performance
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('journal_mode = WAL');
    
    // Create transcripts table
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_transcripts_student 
      ON transcripts(studentAddress)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_signups_wallet 
      ON university_signups(walletAddress)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_signups_status 
      ON university_signups(status)
    `);
  }

  /**
   * Generate SHA-256 hash of data
   */
  generateHash(data: any): string {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * Validate transcript record
   */
  private validateTranscriptRecord(record: Partial<TranscriptRecord>): void {
    if (!record.studentAddress) {
      throw new Error('Student address is required');
    }
    if (!record.universityAddress) {
      throw new Error('University address is required');
    }
    if (!record.courses || !Array.isArray(record.courses)) {
      throw new Error('Courses must be an array');
    }
    
    // Validate each course
    record.courses.forEach((course, index) => {
      if (!course.name || !course.grade || !course.date) {
        throw new Error(`Course at index ${index} is missing required fields (name, grade, date)`);
      }
    });
  }

  /**
   * Validate university signup record
   */
  private validateSignupRecord(record: Partial<UniversitySignupRecord>): void {
    if (!record.walletAddress) {
      throw new Error('Wallet address is required');
    }
    if (!record.institutionName) {
      throw new Error('Institution name is required');
    }
    if (!record.contactEmail) {
      throw new Error('Contact email is required');
    }
    if (!record.institutionWebsite) {
      throw new Error('Institution website is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(record.contactEmail)) {
      throw new Error('Invalid email format');
    }
    
    // Validate website URL format
    try {
      new URL(record.institutionWebsite);
    } catch {
      throw new Error('Invalid website URL format');
    }
  }

  // Transcript CRUD Operations

  /**
   * Create a new transcript record
   */
  createTranscript(data: Omit<TranscriptRecord, 'id' | 'hash' | 'createdAt' | 'updatedAt'>): TranscriptRecord {
    this.validateTranscriptRecord(data);
    
    const now = new Date().toISOString();
    const coursesJson = JSON.stringify(data.courses);
    const hash = this.generateHash({
      studentAddress: data.studentAddress,
      universityAddress: data.universityAddress,
      courses: data.courses
    });
    
    const stmt = this.db.prepare(`
      INSERT INTO transcripts (
        studentAddress, 
        universityAddress, 
        courses, 
        hash, 
        ipfs_cid,
        createdAt, 
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    try {
      const result = stmt.run(
        data.studentAddress,
        data.universityAddress,
        coursesJson,
        hash,
        data.ipfs_cid || null,
        now,
        now
      );
      
      return {
        id: result.lastInsertRowid as number,
        ...data,
        hash,
        createdAt: now,
        updatedAt: now
      };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Transcript already exists for student address: ${data.studentAddress}`);
      }
      throw error;
    }
  }

  /**
   * Get transcript by student address
   */
  getTranscript(studentAddress: string): TranscriptRecord | null {
    if (!studentAddress) {
      throw new Error('Student address is required');
    }
    
    const stmt = this.db.prepare('SELECT * FROM transcripts WHERE studentAddress = ?');
    const row = stmt.get(studentAddress) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      ...row,
      courses: JSON.parse(row.courses)
    };
  }

  /**
   * Update transcript record
   */
  updateTranscript(studentAddress: string, updates: Partial<TranscriptRecord>): TranscriptRecord {
    if (!studentAddress) {
      throw new Error('Student address is required');
    }
    
    const existing = this.getTranscript(studentAddress);
    if (!existing) {
      throw new Error(`Transcript not found for student address: ${studentAddress}`);
    }
    
    const updatedData = { ...existing, ...updates };
    this.validateTranscriptRecord(updatedData);
    
    const now = new Date().toISOString();
    const coursesJson = JSON.stringify(updatedData.courses);
    const hash = this.generateHash({
      studentAddress: updatedData.studentAddress,
      universityAddress: updatedData.universityAddress,
      courses: updatedData.courses
    });
    
    const stmt = this.db.prepare(`
      UPDATE transcripts 
      SET universityAddress = ?, courses = ?, hash = ?, ipfs_cid = ?, updatedAt = ?
      WHERE studentAddress = ?
    `);
    
    stmt.run(
      updatedData.universityAddress,
      coursesJson,
      hash,
      updatedData.ipfs_cid || null,
      now,
      studentAddress
    );
    
    return {
      ...updatedData,
      hash,
      updatedAt: now
    };
  }

  /**
   * Add a course to existing transcript
   */
  addCourse(studentAddress: string, course: Course): TranscriptRecord {
    if (!studentAddress) {
      throw new Error('Student address is required');
    }
    
    if (!course.name || !course.grade || !course.date) {
      throw new Error('Course must have name, grade, and date');
    }
    
    const existing = this.getTranscript(studentAddress);
    if (!existing) {
      throw new Error(`Transcript not found for student address: ${studentAddress}`);
    }
    
    const updatedCourses = [...existing.courses, course];
    return this.updateTranscript(studentAddress, { courses: updatedCourses });
  }

  // University Signup Operations

  /**
   * Create university signup request
   */
  createSignupRequest(data: Omit<UniversitySignupRecord, 'id' | 'status' | 'submittedAt'>): number {
    this.validateSignupRecord(data);
    
    const now = new Date().toISOString();
    const documentsJson = data.verificationDocuments ? JSON.stringify(data.verificationDocuments) : null;
    
    const stmt = this.db.prepare(`
      INSERT INTO university_signups (
        walletAddress,
        institutionName,
        contactEmail,
        institutionWebsite,
        verificationDocuments,
        status,
        submittedAt
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `);
    
    const result = stmt.run(
      data.walletAddress,
      data.institutionName,
      data.contactEmail,
      data.institutionWebsite,
      documentsJson,
      now
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Get signup request by ID
   */
  getSignupRequest(id: number): UniversitySignupRecord | null {
    if (!id || id <= 0) {
      throw new Error('Valid signup request ID is required');
    }
    
    const stmt = this.db.prepare('SELECT * FROM university_signups WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) {
      return null;
    }
    
    return {
      ...row,
      verificationDocuments: row.verificationDocuments ? JSON.parse(row.verificationDocuments) : undefined
    };
  }

  /**
   * Get pending signup requests with optional status filter
   */
  getPendingSignups(status?: 'pending' | 'approved' | 'rejected'): UniversitySignupRecord[] {
    let query = 'SELECT * FROM university_signups';
    let params: any[] = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY submittedAt DESC';
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(row => ({
      ...row,
      verificationDocuments: row.verificationDocuments ? JSON.parse(row.verificationDocuments) : undefined
    }));
  }

  /**
   * Update signup request status
   */
  updateSignupStatus(
    id: number, 
    status: 'approved' | 'rejected', 
    reviewedBy: string, 
    rejectionReason?: string
  ): void {
    if (!id || id <= 0) {
      throw new Error('Valid signup request ID is required');
    }
    
    if (!reviewedBy) {
      throw new Error('Reviewer address is required');
    }
    
    if (status === 'rejected' && !rejectionReason) {
      throw new Error('Rejection reason is required when rejecting a request');
    }
    
    const existing = this.getSignupRequest(id);
    if (!existing) {
      throw new Error(`Signup request not found with ID: ${id}`);
    }
    
    if (existing.status !== 'pending') {
      throw new Error(`Cannot update signup request that is already ${existing.status}`);
    }
    
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      UPDATE university_signups 
      SET status = ?, reviewedAt = ?, reviewedBy = ?, rejectionReason = ?
      WHERE id = ?
    `);
    
    stmt.run(status, now, reviewedBy, rejectionReason || null, id);
  }

  /**
   * Get all signup requests for a specific wallet address
   */
  getSignupsByWallet(walletAddress: string): UniversitySignupRecord[] {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    const stmt = this.db.prepare('SELECT * FROM university_signups WHERE walletAddress = ? ORDER BY submittedAt DESC');
    const rows = stmt.all(walletAddress) as any[];
    
    return rows.map(row => ({
      ...row,
      verificationDocuments: row.verificationDocuments ? JSON.parse(row.verificationDocuments) : undefined
    }));
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }

  /**
   * Get database statistics
   */
  getStats(): { transcripts: number; signups: number; pendingSignups: number } {
    const transcriptCount = this.db.prepare('SELECT COUNT(*) as count FROM transcripts').get() as any;
    const signupCount = this.db.prepare('SELECT COUNT(*) as count FROM university_signups').get() as any;
    const pendingCount = this.db.prepare('SELECT COUNT(*) as count FROM university_signups WHERE status = ?').get('pending') as any;
    
    return {
      transcripts: transcriptCount.count,
      signups: signupCount.count,
      pendingSignups: pendingCount.count
    };
  }
}

// Export singleton instance
let sqliteService: SQLiteService | null = null;

export function getSQLiteService(dbPath?: string): SQLiteService {
  if (!sqliteService) {
    sqliteService = new SQLiteService(dbPath);
  }
  return sqliteService;
}

// Export for testing
export { SQLiteService as SQLiteServiceClass };