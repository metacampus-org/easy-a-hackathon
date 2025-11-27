// MetaCAMPUS Browser Storage Service - localStorage with JSON backup
import { StudentRecord, TranscriptData, CourseRecord } from './transcript-service'
import { UserRecord, UniversitySignupRequest } from './auth-service'

interface SystemConfig {
  superAdminWallet?: string
  version: string
  lastUpdated: string
}

interface StorageData {
  version: number
  timestamp: string
  exportedBy: string
  summary: {
    totalStudents: number
    totalTranscripts: number
    totalBadgeRequests: number
    totalBadges: number
  }
  data: {
    students: StudentRecord[]
    transcripts: TranscriptData[]
    badgeRequests: any[]
    badges: any[]
    users: UserRecord[]
    universitySignups: UniversitySignupRequest[]
  }
  systemConfig: SystemConfig
}

class FileStorageService {
  private storageKey = 'metacampus_storage'
  private version = 1

  // Check if running in browser
  private get isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  // Initialize storage with default data
  private getDefaultData(): StorageData {
    return {
      version: this.version,
      timestamp: new Date().toISOString(),
      exportedBy: "MetaCAMPUS Storage Service",
      summary: {
        totalStudents: 0,
        totalTranscripts: 0,
        totalBadgeRequests: 0,
        totalBadges: 0
      },
      data: {
        students: [],
        transcripts: [],
        badgeRequests: [],
        badges: [],
        users: [],
        universitySignups: []
      },
      systemConfig: {
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Read data from localStorage and JSON file
  private async readData(): Promise<StorageData> {
    try {
      if (!this.isBrowser) {
        return this.getDefaultData()
      }

      // First try to load from the JSON file
      let fileData: StorageData | null = null
      try {
        const response = await fetch('/api/storage/load')
        if (response.ok) {
          fileData = await response.json()
          console.log('✅ Loaded data from storage.json file')
        }
      } catch (error) {
        console.log('📝 No existing storage.json file found, will create new one')
      }

      // Then check localStorage
      const stored = localStorage.getItem(this.storageKey)
      let localData: StorageData | null = null
      
      if (stored) {
        try {
          localData = JSON.parse(stored)
        } catch (error) {
          console.error('❌ Error parsing localStorage data:', error)
        }
      }

      // Compare timestamps and use the most recent data
      if (fileData && (!localData || fileData.timestamp > localData.timestamp)) {
        console.log('🔄 Using file data (more recent)')
        await this.writeData(fileData) // Sync localStorage with file
        return fileData
      } else {
        console.log('🔄 Using localStorage data (more recent)')
        // Check if localStorage data has valid student personalInfo
        if (localData?.data?.students?.length > 0) {
          const hasValidPersonalInfo = localData.data.students.some((s: any) => 
            s.personalInfo && s.personalInfo.firstName && s.personalInfo.lastName
          )
          if (!hasValidPersonalInfo && fileData) {
            console.log('⚠️ localStorage missing personalInfo, using file data instead')
            await this.writeData(fileData) // Sync localStorage with file
            return fileData
          }
        }
        return localData || this.getDefaultData()
      }
    } catch (error) {
      console.error('❌ Error reading storage data:', error)
      return this.getDefaultData()
    }
  }

  // Write data to localStorage
  private async writeData(data: StorageData): Promise<void> {
    try {
      if (!this.isBrowser) {
        console.warn('⚠️ Cannot write to localStorage in server environment')
        return
      }

      // Update summary
      data.summary = {
        totalStudents: data.data.students.length,
        totalTranscripts: data.data.transcripts.length,
        totalBadgeRequests: data.data.badgeRequests.length,
        totalBadges: data.data.badges.length
      }
      data.timestamp = new Date().toISOString()

      await this.saveData(data)
    } catch (error) {
      console.error('❌ Error writing storage data:', error)
      throw error
    }
  }

  // Student operations
  async saveStudent(student: StudentRecord): Promise<void> {
    try {
      const data = await this.readData()
      const existingIndex = data.data.students.findIndex(s => s.studentHash === student.studentHash)
      
      if (existingIndex >= 0) {
        data.data.students[existingIndex] = student
        console.log('📝 Updated existing student:', student.personalInfo.firstName, student.personalInfo.lastName)
      } else {
        data.data.students.push(student)
        console.log('➕ Added new student:', student.personalInfo.firstName, student.personalInfo.lastName)
      }
      
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error saving student:', error)
      throw error
    }
  }

  async getStudent(studentHash: string): Promise<StudentRecord | null> {
    try {
      const data = await this.readData()
      return data.data.students.find(s => s.studentHash === studentHash) || null
    } catch (error) {
      console.error('❌ Error getting student:', error)
      return null
    }
  }

  async getAllStudents(): Promise<StudentRecord[]> {
    try {
      const data = await this.readData()
      return data.data.students
    } catch (error) {
      console.error('❌ Error getting all students:', error)
      return []
    }
  }

  // Transcript operations
  async saveTranscript(transcript: TranscriptData): Promise<void> {
    try {
      const data = await this.readData()
      const existingIndex = data.data.transcripts.findIndex(t => t.studentHash === transcript.studentHash)
      
      if (existingIndex >= 0) {
        data.data.transcripts[existingIndex] = transcript
        console.log('📝 Updated existing transcript for student:', transcript.studentHash.substring(0, 16) + '...')
      } else {
        data.data.transcripts.push(transcript)
        console.log('➕ Added new transcript for student:', transcript.studentHash.substring(0, 16) + '...')
      }
      
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error saving transcript:', error)
      throw error
    }
  }

  async getTranscript(studentHash: string): Promise<TranscriptData | null> {
    try {
      const data = await this.readData()
      return data.data.transcripts.find(t => t.studentHash === studentHash) || null
    } catch (error) {
      console.error('❌ Error getting transcript:', error)
      return null
    }
  }

  async getAllTranscripts(): Promise<TranscriptData[]> {
    try {
      const data = await this.readData()
      return data.data.transcripts
    } catch (error) {
      console.error('❌ Error getting all transcripts:', error)
      return []
    }
  }

  // Badge request operations
  async saveBadgeRequest(request: any): Promise<void> {
    try {
      const data = await this.readData()
      const existingIndex = data.data.badgeRequests.findIndex(r => r.id === request.id)
      
      if (existingIndex >= 0) {
        data.data.badgeRequests[existingIndex] = request
        console.log('📝 Updated existing badge request:', request.id)
      } else {
        data.data.badgeRequests.push(request)
        console.log('➕ Added new badge request:', request.id)
      }
      
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error saving badge request:', error)
      throw error
    }
  }

  async getBadgeRequests(studentHash?: string): Promise<any[]> {
    try {
      const data = await this.readData()
      const requests = data.data.badgeRequests
      
      if (studentHash) {
        return requests.filter(req => req.studentHash === studentHash)
      }
      return requests
    } catch (error) {
      console.error('❌ Error getting badge requests:', error)
      return []
    }
  }

  // Badge operations
  async saveBadge(badge: any): Promise<void> {
    try {
      const data = await this.readData()
      const existingIndex = data.data.badges.findIndex(b => b.badgeHash === badge.badgeHash)
      
      if (existingIndex >= 0) {
        data.data.badges[existingIndex] = badge
        console.log('📝 Updated existing badge:', badge.badgeHash.substring(0, 16) + '...')
      } else {
        data.data.badges.push(badge)
        console.log('➕ Added new badge:', badge.badgeHash.substring(0, 16) + '...')
      }
      
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error saving badge:', error)
      throw error
    }
  }

  async getBadge(badgeHash: string): Promise<any | null> {
    try {
      const data = await this.readData()
      return data.data.badges.find(b => b.badgeHash === badgeHash) || null
    } catch (error) {
      console.error('❌ Error getting badge:', error)
      return null
    }
  }

  async getBadges(studentHash?: string): Promise<any[]> {
    try {
      const data = await this.readData()
      const badges = data.data.badges
      
      if (studentHash) {
        return badges.filter(badge => badge.studentHash === studentHash)
      }
      return badges
    } catch (error) {
      console.error('❌ Error getting badges:', error)
      return []
    }
  }

  // User operations
  async saveUser(user: UserRecord): Promise<void> {
    try {
      // Validate user record
      if (!user.walletAddress || !user.role) {
        throw new Error('Invalid user record: walletAddress and role are required')
      }

      if (!['student', 'admin', 'super_admin'].includes(user.role)) {
        throw new Error(`Invalid user role: ${user.role}`)
      }

      const data = await this.readData()
      const existingIndex = data.data.users.findIndex(u => u.walletAddress === user.walletAddress)
      
      if (existingIndex >= 0) {
        data.data.users[existingIndex] = user
        console.log('📝 Updated existing user:', user.walletAddress)
      } else {
        data.data.users.push(user)
        console.log('➕ Added new user:', user.walletAddress)
      }
      
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error saving user:', error)
      throw error
    }
  }

  async getUser(walletAddress: string): Promise<UserRecord | null> {
    try {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      const data = await this.readData()
      return data.data.users.find(u => u.walletAddress === walletAddress) || null
    } catch (error) {
      console.error('❌ Error getting user:', error)
      return null
    }
  }

  async getAllUsers(): Promise<UserRecord[]> {
    try {
      const data = await this.readData()
      return data.data.users
    } catch (error) {
      console.error('❌ Error getting all users:', error)
      return []
    }
  }

  async updateUser(walletAddress: string, updates: Partial<UserRecord>): Promise<void> {
    try {
      if (!walletAddress) {
        throw new Error('Wallet address is required')
      }

      // Validate role if being updated
      if (updates.role && !['student', 'admin', 'super_admin'].includes(updates.role)) {
        throw new Error(`Invalid user role: ${updates.role}`)
      }

      const data = await this.readData()
      const userIndex = data.data.users.findIndex(u => u.walletAddress === walletAddress)
      
      if (userIndex < 0) {
        throw new Error('User not found')
      }

      // Update user with new values
      data.data.users[userIndex] = {
        ...data.data.users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      console.log('📝 Updated user:', walletAddress)
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error updating user:', error)
      throw error
    }
  }

  // University signup operations
  async saveUniversitySignup(signup: UniversitySignupRequest): Promise<void> {
    try {
      // Validate signup request
      if (!signup.id || !signup.walletAddress || !signup.institutionName || !signup.contactEmail) {
        throw new Error('Invalid signup request: id, walletAddress, institutionName, and contactEmail are required')
      }

      if (!signup.status || !['pending', 'approved', 'rejected'].includes(signup.status)) {
        throw new Error(`Invalid signup status: ${signup.status}`)
      }

      const data = await this.readData()
      const existingIndex = data.data.universitySignups.findIndex(s => s.id === signup.id)
      
      if (existingIndex >= 0) {
        data.data.universitySignups[existingIndex] = signup
        console.log('📝 Updated existing university signup:', signup.id)
      } else {
        data.data.universitySignups.push(signup)
        console.log('➕ Added new university signup:', signup.id)
      }
      
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error saving university signup:', error)
      throw error
    }
  }

  async getUniversitySignup(id: string): Promise<UniversitySignupRequest | null> {
    try {
      if (!id) {
        throw new Error('Signup ID is required')
      }

      const data = await this.readData()
      return data.data.universitySignups.find(s => s.id === id) || null
    } catch (error) {
      console.error('❌ Error getting university signup:', error)
      return null
    }
  }

  async getAllUniversitySignups(): Promise<UniversitySignupRequest[]> {
    try {
      const data = await this.readData()
      return data.data.universitySignups
    } catch (error) {
      console.error('❌ Error getting all university signups:', error)
      return []
    }
  }

  async updateUniversitySignup(id: string, updates: Partial<UniversitySignupRequest>): Promise<void> {
    try {
      if (!id) {
        throw new Error('Signup ID is required')
      }

      // Validate status if being updated
      if (updates.status && !['pending', 'approved', 'rejected'].includes(updates.status)) {
        throw new Error(`Invalid signup status: ${updates.status}`)
      }

      const data = await this.readData()
      const signupIndex = data.data.universitySignups.findIndex(s => s.id === id)
      
      if (signupIndex < 0) {
        throw new Error('University signup not found')
      }

      // Update signup with new values
      data.data.universitySignups[signupIndex] = {
        ...data.data.universitySignups[signupIndex],
        ...updates
      }
      
      console.log('📝 Updated university signup:', id)
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error updating university signup:', error)
      throw error
    }
  }

  async getUniversitySignupsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<UniversitySignupRequest[]> {
    try {
      const data = await this.readData()
      return data.data.universitySignups.filter(s => s.status === status)
    } catch (error) {
      console.error('❌ Error getting university signups by status:', error)
      return []
    }
  }

  // System config operations
  async getSystemConfig(): Promise<SystemConfig> {
    try {
      const data = await this.readData()
      return data.systemConfig
    } catch (error) {
      console.error('❌ Error getting system config:', error)
      return {
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    }
  }

  async updateSystemConfig(config: Partial<SystemConfig>): Promise<void> {
    try {
      const data = await this.readData()
      data.systemConfig = {
        ...data.systemConfig,
        ...config,
        lastUpdated: new Date().toISOString()
      }
      
      console.log('📝 Updated system config')
      await this.writeData(data)
    } catch (error) {
      console.error('❌ Error updating system config:', error)
      throw error
    }
  }

  // Save data to localStorage and JSON file
  private async saveData(data: StorageData): Promise<void> {
    if (!this.isBrowser) return
    
    try {
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      console.log('✅ Data saved to localStorage')
      
      // Also save to JSON file
      await this.saveToJsonFile(data)
    } catch (error) {
      console.error('❌ Failed to save data:', error)
      throw error
    }
  }

  // Save data to the physical JSON file
  private async saveToJsonFile(data: StorageData): Promise<void> {
    try {
      const response = await fetch('/api/storage/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to save to JSON file: ${response.statusText}`)
      }
      
      console.log('✅ Data saved to storage.json file')
    } catch (error) {
      console.error('❌ Could not save to JSON file:', error)
      throw error // Re-throw the error to notify the caller
    }
  }

  async exportToFile(filename?: string): Promise<void> {
    try {
      const jsonData = await this.exportToJSON()
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const defaultFilename = filename || `metacampus-backup-${timestamp}.json`
      
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = defaultFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      console.log('✅ Data exported to file:', defaultFilename)
    } catch (error) {
      console.error('❌ Error exporting to file:', error)
      throw error
    }
  }

  async importFromJSON(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData)
      const data = importData.data || importData
      
      console.log('📥 Starting data import...')
      console.log('Import summary:', importData.summary || 'Legacy format')
      
      const currentData = await this.readData()
      
      // Import students
      const students = data.students || []
      for (const student of students) {
        const existingIndex = currentData.data.students.findIndex(s => s.studentHash === student.studentHash)
        if (existingIndex >= 0) {
          currentData.data.students[existingIndex] = student
        } else {
          currentData.data.students.push(student)
        }
      }
      console.log(`✅ Imported ${students.length} students`)
      
      // Import transcripts
      const transcripts = data.transcripts || []
      for (const transcript of transcripts) {
        const existingIndex = currentData.data.transcripts.findIndex(t => t.studentHash === transcript.studentHash)
        if (existingIndex >= 0) {
          currentData.data.transcripts[existingIndex] = transcript
        } else {
          currentData.data.transcripts.push(transcript)
        }
      }
      console.log(`✅ Imported ${transcripts.length} transcripts`)
      
      // Import badge requests
      const badgeRequests = data.badgeRequests || []
      for (const request of badgeRequests) {
        const existingIndex = currentData.data.badgeRequests.findIndex(r => r.id === request.id)
        if (existingIndex >= 0) {
          currentData.data.badgeRequests[existingIndex] = request
        } else {
          currentData.data.badgeRequests.push(request)
        }
      }
      console.log(`✅ Imported ${badgeRequests.length} badge requests`)
      
      // Import badges
      const badges = data.badges || []
      for (const badge of badges) {
        const existingIndex = currentData.data.badges.findIndex(b => b.badgeHash === badge.badgeHash)
        if (existingIndex >= 0) {
          currentData.data.badges[existingIndex] = badge
        } else {
          currentData.data.badges.push(badge)
        }
      }
      console.log(`✅ Imported ${badges.length} badges`)
      
      this.writeData(currentData)
      console.log('🎉 Data imported successfully from JSON')
    } catch (error) {
      console.error('❌ Error importing JSON data:', error)
      throw error
    }
  }

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

  // Load all data (public method)
  async loadData(): Promise<StorageData> {
    return await this.readData()
  }

  // Export data as JSON string
  async exportToJSON(): Promise<string> {
    try {
      const data = await this.readData()
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('❌ Error exporting to JSON:', error)
      throw error
    }
  }

  // Get storage statistics
  async getStats(): Promise<any> {
    try {
      const data = await this.readData()
      const jsonString = JSON.stringify(data)
      return {
        version: data.version,
        lastUpdated: data.timestamp,
        summary: data.summary,
        storageKey: this.storageKey,
        dataSize: new Blob([jsonString]).size
      }
    } catch (error) {
      console.error('❌ Error getting storage stats:', error)
      return null
    }
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService()

// Export types
export type { SystemConfig, StorageData }
