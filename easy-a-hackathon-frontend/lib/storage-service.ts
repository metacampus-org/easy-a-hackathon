// MetaCAMPUS Storage Service - IndexedDB with JSON backup
import { StudentRecord, TranscriptData, CourseRecord } from './transcript-service'

interface StorageDB extends IDBDatabase {
  // Type definitions for our database
}

class StorageService {
  private dbName = 'MetaCAMPUS_DB'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  // Initialize IndexedDB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Students store
        if (!db.objectStoreNames.contains('students')) {
          const studentStore = db.createObjectStore('students', { keyPath: 'studentHash' })
          studentStore.createIndex('institutionId', 'institutionId', { unique: false })
          studentStore.createIndex('status', 'status', { unique: false })
        }

        // Transcripts store
        if (!db.objectStoreNames.contains('transcripts')) {
          const transcriptStore = db.createObjectStore('transcripts', { keyPath: 'studentHash' })
          transcriptStore.createIndex('gpa', 'gpa', { unique: false })
          transcriptStore.createIndex('lastUpdated', 'lastUpdated', { unique: false })
        }

        // Badge requests store
        if (!db.objectStoreNames.contains('badgeRequests')) {
          const badgeStore = db.createObjectStore('badgeRequests', { keyPath: 'id', autoIncrement: true })
          badgeStore.createIndex('studentHash', 'studentHash', { unique: false })
          badgeStore.createIndex('status', 'status', { unique: false })
        }

        // Blockchain transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'txId' })
          txStore.createIndex('type', 'type', { unique: false })
          txStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  // Student operations
  async saveStudent(student: StudentRecord): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['students'], 'readwrite')
    const store = transaction.objectStore('students')
    
    return new Promise((resolve, reject) => {
      const request = store.put(student)
      request.onsuccess = () => {
        console.log('✅ Student saved to IndexedDB:', student.studentHash)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getStudent(studentHash: string): Promise<StudentRecord | null> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['students'], 'readonly')
    const store = transaction.objectStore('students')
    
    return new Promise((resolve, reject) => {
      const request = store.get(studentHash)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllStudents(): Promise<StudentRecord[]> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['students'], 'readonly')
    const store = transaction.objectStore('students')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Transcript operations
  async saveTranscript(transcript: TranscriptData): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['transcripts'], 'readwrite')
    const store = transaction.objectStore('transcripts')
    
    return new Promise((resolve, reject) => {
      const request = store.put(transcript)
      request.onsuccess = () => {
        console.log('✅ Transcript saved to IndexedDB:', transcript.studentHash)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getTranscript(studentHash: string): Promise<TranscriptData | null> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['transcripts'], 'readonly')
    const store = transaction.objectStore('transcripts')
    
    return new Promise((resolve, reject) => {
      const request = store.get(studentHash)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // Badge request operations
  async saveBadgeRequest(request: any): Promise<void> {
    if (!this.db) await this.init()
    
    const tx = this.db!.transaction(['badgeRequests'], 'readwrite')
    const store = tx.objectStore('badgeRequests')
    await store.put(request)
  }

  async getBadgeRequests(studentHash?: string): Promise<any[]> {
    if (!this.db) await this.init()
    
    const tx = this.db!.transaction(['badgeRequests'], 'readonly')
    const store = tx.objectStore('badgeRequests')
    const requests = await store.getAll()
    
    if (studentHash) {
      return requests.filter(req => req.studentHash === studentHash)
    }
    return requests
  }

  // Badge Management
  async saveBadge(badge: any): Promise<void> {
    if (!this.db) await this.init()
    
    const tx = this.db!.transaction(['badges'], 'readwrite')
    const store = tx.objectStore('badges')
    await store.put(badge)
  }

  async getBadge(badgeHash: string): Promise<any | null> {
    if (!this.db) await this.init()
    
    const tx = this.db!.transaction(['badges'], 'readonly')
    const store = tx.objectStore('badges')
    return await store.get(badgeHash)
  }

  async getBadges(studentHash?: string): Promise<any[]> {
    if (!this.db) await this.init()
    
    const tx = this.db!.transaction(['badges'], 'readonly')
    const store = tx.objectStore('badges')
    const badges = await store.getAll()
    
    if (studentHash) {
      return badges.filter(badge => badge.studentHash === studentHash)
    }
    return badges
  }

  // JSON Export/Import for backup
  async exportToJSON(): Promise<string> {
    if (!this.db) await this.init()
    
    const students = await this.getAllStudents()
    const transcripts = await this.getAllTranscripts()
    const badgeRequests = await this.getBadgeRequests()
    const badges = await this.getBadges()
    
    const exportData = {
      version: this.dbVersion,
      timestamp: new Date().toISOString(),
      exportedBy: "MetaCAMPUS Storage Service",
      summary: {
        totalStudents: students.length,
        totalTranscripts: transcripts.length,
        totalBadgeRequests: badgeRequests.length,
        totalBadges: badges.length
      },
      data: {
        students,
        transcripts,
        badgeRequests,
        badges
      }
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Export to downloadable file
  async exportToFile(filename?: string): Promise<void> {
    try {
      const jsonData = await this.exportToJSON()
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const defaultFilename = `metacampus-backup-${timestamp}.json`
      
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename || defaultFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      console.log('✅ Data exported to file:', filename || defaultFilename)
    } catch (error) {
      console.error('❌ Error exporting to file:', error)
      throw error
    }
  }

  async importFromJSON(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)
      
      // Handle both old and new format
      const importData = data.data || data
      
      console.log('📥 Starting data import...')
      console.log('Import summary:', data.summary || 'Legacy format')
      
      // Import students
      const students = importData.students || []
      for (const student of students) {
        await this.saveStudent(student)
      }
      console.log(`✅ Imported ${students.length} students`)
      
      // Import transcripts
      const transcripts = importData.transcripts || []
      for (const transcript of transcripts) {
        await this.saveTranscript(transcript)
      }
      console.log(`✅ Imported ${transcripts.length} transcripts`)
      
      // Import badge requests
      const badgeRequests = importData.badgeRequests || []
      for (const request of badgeRequests) {
        await this.saveBadgeRequest(request)
      }
      console.log(`✅ Imported ${badgeRequests.length} badge requests`)
      
      // Import badges
      const badges = importData.badges || []
      for (const badge of badges) {
        await this.saveBadge(badge)
      }
      console.log(`✅ Imported ${badges.length} badges`)
      
      console.log('🎉 Data imported successfully from JSON')
    } catch (error) {
      console.error('❌ Error importing JSON data:', error)
      throw error
    }
  }

  // Import from file upload
  async importFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (event) => {
        try {
          const jsonData = event.target?.result as string
          await this.importFromJSON(jsonData)
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  private async getAllTranscripts(): Promise<TranscriptData[]> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['transcripts'], 'readonly')
    const store = transaction.objectStore('transcripts')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    if (!this.db) await this.init()
    
    const stores = ['students', 'transcripts', 'badgeRequests', 'transactions']
    const transaction = this.db!.transaction(stores, 'readwrite')
    
    const promises = stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(storeName).clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })
    
    await Promise.all(promises)
    console.log('🗑️ All storage cleared')
  }
}

// Export singleton instance
export const storageService = new StorageService()
