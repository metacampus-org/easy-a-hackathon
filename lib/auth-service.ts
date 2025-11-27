// University Signup Service for MetaCAMPUS
// Note: Role management is handled by the smart contract (algorand-client.ts)
// This service only manages the university signup workflow
import { fileStorageService } from './file-storage-service'

// Legacy type exports for backward compatibility
// TODO: Remove these once all imports are updated
export type UserRole = "student" | "admin" | "super_admin"

export interface UserRecord {
  walletAddress: string
  role: UserRole
  createdAt: string
  updatedAt: string
  email?: string
  institutionName?: string
}

export interface UniversitySignupRequest {
  id: string
  walletAddress: string
  institutionName: string
  contactEmail: string
  institutionWebsite: string
  verificationDocuments?: string[]
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

class UniversitySignupService {
  private superAdminWallet: string | null = null

  constructor() {
    // Load super admin wallet from environment variable
    if (typeof window !== 'undefined') {
      this.superAdminWallet = process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET || null
      if (!this.superAdminWallet) {
        console.warn('⚠️ Super admin wallet not configured. Set NEXT_PUBLIC_SUPER_ADMIN_WALLET in .env.local')
      }
    }
  }

  // ============================================================================
  // University Signup Workflow
  // ============================================================================

  /**
   * Submit a university signup request
   */
  async submitUniversitySignup(
    request: Omit<UniversitySignupRequest, 'id' | 'status' | 'submittedAt'>
  ): Promise<string> {
    try {
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const id = `signup_${timestamp}_${randomStr}`

      const signupRequest: UniversitySignupRequest = {
        ...request,
        id,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      }

      const data = await fileStorageService.loadData()
      if (!data.data.universitySignups) {
        data.data.universitySignups = []
      }

      data.data.universitySignups.push(signupRequest)
      await this.saveStorageData(data)

      console.log(`✅ University signup request submitted:`, id)
      return id
    } catch (error) {
      console.error('❌ Error submitting university signup:', error)
      throw error
    }
  }

  /**
   * Get a specific university signup request by ID
   */
  async getUniversitySignupRequest(requestId: string): Promise<UniversitySignupRequest | null> {
    try {
      const data = await fileStorageService.loadData()
      const signups = data.data.universitySignups || []
      return signups.find((s: UniversitySignupRequest) => s.id === requestId) || null
    } catch (error) {
      console.error('❌ Error getting university signup request:', error)
      return null
    }
  }

  /**
   * Get all pending university signup requests
   */
  async getAllPendingSignups(): Promise<UniversitySignupRequest[]> {
    try {
      const data = await fileStorageService.loadData()
      const signups = data.data.universitySignups || []
      return signups.filter((s: UniversitySignupRequest) => s.status === 'pending')
    } catch (error) {
      console.error('❌ Error getting pending signups:', error)
      return []
    }
  }

  /**
   * Get all university signup requests (all statuses)
   */
  async getAllUniversitySignups(): Promise<UniversitySignupRequest[]> {
    try {
      const data = await fileStorageService.loadData()
      return data.data.universitySignups || []
    } catch (error) {
      console.error('❌ Error getting all university signups:', error)
      return []
    }
  }

  /**
   * Approve a university signup request
   * Note: Role assignment is done via smart contract transaction separately
   */
  async approveUniversitySignup(requestId: string, superAdminWallet: string): Promise<void> {
    try {
      // Verify super admin permissions
      if (!this.isSuperAdmin(superAdminWallet)) {
        throw new Error('Only super admin can approve university signups')
      }

      const data = await fileStorageService.loadData()
      if (!data.data.universitySignups) {
        throw new Error('No signup requests found')
      }

      const signupIndex = data.data.universitySignups.findIndex(
        (s: UniversitySignupRequest) => s.id === requestId
      )

      if (signupIndex < 0) {
        throw new Error('Signup request not found')
      }

      const signup = data.data.universitySignups[signupIndex]

      // Update signup request status
      signup.status = 'approved'
      signup.reviewedAt = new Date().toISOString()
      signup.reviewedBy = superAdminWallet

      await this.saveStorageData(data)
      console.log(`✅ Approved university signup:`, signup.walletAddress)
      console.log(`⚠️ Note: Role must be assigned via smart contract transaction`)
    } catch (error) {
      console.error('❌ Error approving university signup:', error)
      throw error
    }
  }

  /**
   * Reject a university signup request
   */
  async rejectUniversitySignup(
    requestId: string,
    superAdminWallet: string,
    reason: string
  ): Promise<void> {
    try {
      // Verify super admin permissions
      if (!this.isSuperAdmin(superAdminWallet)) {
        throw new Error('Only super admin can reject university signups')
      }

      const data = await fileStorageService.loadData()
      if (!data.data.universitySignups) {
        throw new Error('No signup requests found')
      }

      const signupIndex = data.data.universitySignups.findIndex(
        (s: UniversitySignupRequest) => s.id === requestId
      )

      if (signupIndex < 0) {
        throw new Error('Signup request not found')
      }

      // Update signup request status
      data.data.universitySignups[signupIndex].status = 'rejected'
      data.data.universitySignups[signupIndex].reviewedAt = new Date().toISOString()
      data.data.universitySignups[signupIndex].reviewedBy = superAdminWallet
      data.data.universitySignups[signupIndex].rejectionReason = reason

      await this.saveStorageData(data)
      console.log(`✅ Rejected university signup:`, requestId)
    } catch (error) {
      console.error('❌ Error rejecting university signup:', error)
      throw error
    }
  }

  // ============================================================================
  // Super Admin Management
  // ============================================================================

  /**
   * Get the configured super admin wallet address
   */
  getSuperAdminWallet(): string {
    return this.superAdminWallet || ''
  }

  /**
   * Check if a wallet address is the super admin
   * Note: This checks environment variable only. For production, query smart contract global state.
   */
  isSuperAdmin(walletAddress: string): boolean {
    if (!this.superAdminWallet) {
      console.warn('⚠️ Super admin wallet not configured')
      return false
    }
    return walletAddress.toLowerCase() === this.superAdminWallet.toLowerCase()
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Save storage data (helper to maintain consistency)
   */
  private async saveStorageData(data: any): Promise<void> {
    // Update timestamp
    data.timestamp = new Date().toISOString()
    
    // Update summary
    data.summary = {
      ...data.summary,
      totalStudents: data.data.students?.length || 0,
      totalTranscripts: data.data.transcripts?.length || 0,
      totalBadgeRequests: data.data.badgeRequests?.length || 0,
      totalBadges: data.data.badges?.length || 0,
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('metacampus_storage', JSON.stringify(data))
    }

    // Save to file
    try {
      const response = await fetch('/api/storage/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to save to JSON file: ${response.statusText}`)
      }
    } catch (error) {
      console.error('❌ Could not save to JSON file:', error)
      throw error
    }
  }
}

// Export singleton instance
export const universitySignupService = new UniversitySignupService()

// Legacy export for backward compatibility
// TODO: Update all imports to use universitySignupService
export const authService = universitySignupService
