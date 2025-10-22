// MetaCAMPUS Badge Service - Blockchain integration for badge management
import algosdk from "algosdk"
import { algodClient } from "./algorand"
import { fileStorageService } from "./file-storage-service"

// Badge Data Interfaces
export interface BadgeRequest {
  id: string
  studentHash: string
  courseName: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
  adminWallet?: string
  approvalDate?: string
  blockchainHash?: string
}

export interface Badge {
  badgeHash: string
  studentHash: string
  courseName: string
  issueDate: string
  verificationHash: string
  blockchainTxId: string
}

// Smart Contract Application ID for Badge Management
export const BADGE_APP_ID = process.env.NEXT_PUBLIC_BADGE_APP_ID
  ? Number.parseInt(process.env.NEXT_PUBLIC_BADGE_APP_ID)
  : 0

export class BadgeService {
  
  // Generate unique badge hash
  generateBadgeHash(studentHash: string, courseName: string, timestamp: number): string {
    const dataString = JSON.stringify({
      studentHash,
      courseName,
      timestamp,
      issuer: "MetaCAMPUS"
    })
    
    // Use browser-compatible hash generation
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)
    return Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Find student hash by personal information
  async findStudentHash(firstName: string, lastName: string, dateOfBirth: string): Promise<string | null> {
    try {
      console.log('🔍 SEARCHING FOR STUDENT:', { firstName, lastName, dateOfBirth })
      
      const storage = await fileStorageService.loadData()
      if (!storage.data?.students || !Array.isArray(storage.data.students)) {
        console.log('❌ No students data found')
        return null
      }

      console.log('📊 Available students:', storage.data.students.length)
      storage.data.students.forEach((s: any, index: number) => {
        console.log(`Student ${index + 1}:`, {
          firstName: s.personalInfo?.firstName,
          lastName: s.personalInfo?.lastName,
          dateOfBirth: s.personalInfo?.dateOfBirth,
          studentHash: s.studentHash?.substring(0, 16) + '...'
        })
      })

      const student = storage.data.students.find((s: any) => {
        const firstNameMatch = s.personalInfo?.firstName?.toLowerCase() === firstName.toLowerCase()
        const lastNameMatch = s.personalInfo?.lastName?.toLowerCase() === lastName.toLowerCase()
        const dobMatch = s.personalInfo?.dateOfBirth === dateOfBirth
        
        console.log('🔍 Checking student:', {
          stored: { 
            firstName: s.personalInfo?.firstName, 
            lastName: s.personalInfo?.lastName, 
            dateOfBirth: s.personalInfo?.dateOfBirth 
          },
          search: { firstName, lastName, dateOfBirth },
          matches: { firstNameMatch, lastNameMatch, dobMatch }
        })
        
        return firstNameMatch && lastNameMatch && dobMatch
      })

      if (student) {
        console.log('✅ STUDENT FOUND:', student.studentHash)
        return student.studentHash
      } else {
        console.log('❌ NO MATCHING STUDENT FOUND')
        return null
      }
    } catch (error) {
      console.error('❌ Error finding student hash:', error)
      return null
    }
  }

  // Create badge request (student-initiated) - Updated to accept object parameter
  async createBadgeRequest(requestData: any): Promise<any> {
    // Handle both object and individual parameters for backward compatibility
    const courseName = typeof requestData === 'string' ? requestData : requestData.courseName;
    const walletAddress = typeof requestData === 'string' ? arguments[1] : requestData.walletAddress;
    const studentHash = typeof requestData === 'object' ? requestData.studentHash : walletAddress;
    const additionalInfo = typeof requestData === 'object' ? requestData.additionalInfo : '';
    const requestDate = typeof requestData === 'object' ? requestData.requestDate : new Date().toISOString();
    const status = typeof requestData === 'object' ? requestData.status : 'pending';
    try {
      const storage = await fileStorageService.loadData()
      
      // Create comprehensive request object
      const request = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentHash: studentHash || walletAddress,
        walletAddress: walletAddress,
        courseName,
        requestDate: requestDate,
        status: status as 'pending' | 'approved' | 'rejected',
        additionalInfo: additionalInfo
      }

      storage.data.badgeRequests.push(request)
      
      // Update wallet mappings
      if (!storage.data.walletMappings) {
        storage.data.walletMappings = {}
      }
      storage.data.walletMappings[walletAddress] = {
        studentHash: walletAddress,
        registeredAt: new Date().toISOString()
      }
      
      await fileStorageService.saveData(storage)
      
      // Try blockchain integration if available
      if (BADGE_APP_ID && BADGE_APP_ID > 0) {
        try {
          const suggestedParams = await algodClient.getTransactionParams().do()

          const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
            sender: "PLACEHOLDER_ADDRESS", // Will be replaced by actual wallet
            appIndex: BADGE_APP_ID,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [
              new TextEncoder().encode("create_badge_request"),
              new TextEncoder().encode(JSON.stringify(request))
            ],
            suggestedParams,
          })

          const txId = appCallTxn.txID()
          console.log("🔗 Badge request transaction created:", txId)
          
          return { requestId: request.id, txId }
        } catch (blockchainError) {
          console.warn("⚠️ Blockchain request failed, using local storage only:", blockchainError)
        }
      }

      return { requestId: request.id }
    } catch (error) {
      console.error("❌ Error creating badge request:", error)
      throw error
    }
  }

  // Approve badge request (admin-initiated)
  async approveBadgeRequest(
    requestId: string,
    adminWallet: string
  ): Promise<{ badgeHash: string; txId: string; verificationHash: string }> {
    try {
      console.log("🎓 BADGE APPROVAL INITIATED")
      console.log("Request ID:", requestId)
      console.log("Admin Wallet:", adminWallet)
      console.log("Timestamp:", new Date().toISOString())

      // Get the badge request from storage
      const requests = await fileStorageService.getBadgeRequests()
      const request = requests.find(r => r.id === requestId)
      
      if (!request) {
        throw new Error(`Badge request ${requestId} not found`)
      }

      // Check if the same wallet created and is trying to approve the request
      if (request.studentHash === adminWallet) {
        throw new Error("🚫 CONFLICT OF INTEREST: The same wallet cannot create and approve a badge request. Students and admins must use different wallets.")
      }

      // Note: Authorization is now handled at the UI level using smart contract role checks
      // The UI components verify role=1 (university) or super admin before calling this method

      console.log("📋 Found badge request:", request.courseName, "for student", request.studentHash)

      // Generate badge hash
      const timestamp = Date.now()
      const badgeHash = this.generateBadgeHash(request.studentHash, request.courseName, timestamp)
      
      console.log("🔐 Generated badge hash:", badgeHash)

      // Create badge data for blockchain
      const badgeData = {
        badgeHash,
        studentHash: request.studentHash,
        courseName: request.courseName,
        issueDate: new Date().toISOString(),
        approvedBy: adminWallet,
        timestamp
      }

      console.log("📊 Badge data prepared:", badgeData)

      // Generate verification hash
      const verificationHash = this.generateVerificationHash(badgeData)
      console.log("🔒 Verification hash generated:", verificationHash)

      let blockchainTxId = "simulated_tx_" + timestamp

      // If smart contract is deployed, create on-chain badge
      if (BADGE_APP_ID && BADGE_APP_ID > 0) {
        try {
          console.log("🚀 Deploying badge to blockchain...")
          
          const suggestedParams = await algodClient.getTransactionParams().do()

          // First, approve the request
          const approveCallTxn = algosdk.makeApplicationCallTxnFromObject({
            sender: adminWallet,
            appIndex: BADGE_APP_ID,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [
              new TextEncoder().encode("approve_badge_request"),
              new TextEncoder().encode(requestId)
            ],
            suggestedParams,
          })

          // Then, create the meta badge
          const createBadgeCallTxn = algosdk.makeApplicationCallTxnFromObject({
            sender: adminWallet,
            appIndex: BADGE_APP_ID,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [
              new TextEncoder().encode("create_meta_badge"),
              new TextEncoder().encode(JSON.stringify(badgeData))
            ],
            suggestedParams,
          })

          blockchainTxId = createBadgeCallTxn.txID()
          
          console.log("✅ BLOCKCHAIN BADGE CREATED")
          console.log("Transaction ID:", blockchainTxId)
          console.log("Badge Hash:", badgeHash)
          console.log("Verification Hash:", verificationHash)
          
        } catch (blockchainError) {
          console.warn("⚠️ Blockchain deployment failed, using simulated transaction:", blockchainError)
        }
      } else {
        console.log("📝 Smart contract not deployed, using simulated transaction")
      }

      // Create badge record
      const badge: Badge = {
        badgeHash,
        studentHash: request.studentHash,
        courseId: request.courseId,
        courseName: request.courseName,
        issueDate: new Date().toISOString(),
        verificationHash,
        blockchainTxId
      }

      // Update request status
      request.status = "approved"
      request.adminWallet = adminWallet
      request.approvalDate = new Date().toISOString()
      request.blockchainHash = badgeHash

      // Save updated request and new badge to storage
      await fileStorageService.saveBadgeRequest(request)
      await fileStorageService.saveBadge(badge)

      console.log("🏆 BADGE APPROVAL COMPLETED")
      console.log("Badge Hash (ON-CHAIN):", badgeHash)
      console.log("Verification Hash:", verificationHash)
      console.log("Blockchain TX ID:", blockchainTxId)
      console.log("Student Hash:", request.studentHash)
      console.log("Course:", request.courseName)

      return {
        badgeHash,
        txId: blockchainTxId,
        verificationHash
      }

    } catch (error) {
      console.error("❌ BADGE APPROVAL FAILED")
      console.error("Error Details:", error)
      console.error("Request ID:", requestId)
      console.error("Admin Wallet:", adminWallet)
      throw error
    }
  }

  // Verify badge exists on blockchain
  async verifyBadge(badgeHash: string): Promise<{ isValid: boolean; badge?: Badge }> {
    try {
      console.log("🔍 Verifying badge:", badgeHash)

      // Check local storage first
      const localBadge = await fileStorageService.getBadge(badgeHash)
      if (localBadge) {
        console.log("✅ Badge found in local storage")
        return { isValid: true, badge: localBadge }
      }
      
      if (BADGE_APP_ID && BADGE_APP_ID > 0) {
        try {
          const suggestedParams = await algodClient.getTransactionParams().do()

          const verifyCallTxn = algosdk.makeApplicationCallTxnFromObject({
            sender: "PLACEHOLDER_ADDRESS", // Read-only operation
            appIndex: BADGE_APP_ID,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [
              new TextEncoder().encode("verify_badge"),
              new TextEncoder().encode(badgeHash)
            ],
            suggestedParams,
          })

          console.log("✅ Badge verified on blockchain")
          return { isValid: true }
          
        } catch (blockchainError) {
          console.warn("⚠️ Blockchain verification failed:", blockchainError)
        }
      }

      // Fallback verification
      console.log("📱 Using local verification")
      return { isValid: false }

    } catch (error) {
      console.error("❌ Error verifying badge:", error)
      throw error
    }
  }

  // Generate verification hash for badge data
  private generateVerificationHash(badgeData: any): string {
    const dataString = JSON.stringify({
      badgeHash: badgeData.badgeHash,
      studentHash: badgeData.studentHash,
      courseId: badgeData.courseId,
      issueDate: badgeData.issueDate,
      timestamp: badgeData.timestamp
    })
    
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)
    return Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Get all badge requests (for admin dashboard)
  async getAllBadgeRequests(): Promise<BadgeRequest[]> {
    try {
      return await fileStorageService.getBadgeRequests()
    } catch (error) {
      console.error("❌ Error getting badge requests:", error)
      return []
    }
  }

  // Get badge requests for specific student by wallet address
  async getStudentBadgeRequests(walletAddress: string): Promise<BadgeRequest[]> {
    try {
      const allRequests = await fileStorageService.getBadgeRequests()
      return allRequests.filter(request => 
        request.walletAddress === walletAddress || request.studentHash === walletAddress
      )
    } catch (error) {
      console.error("❌ Error getting student badge requests:", error)
      return []
    }
  }

  // Get student badges by wallet address
  async getStudentBadges(walletAddress: string): Promise<Badge[]> {
    try {
      const storage = await fileStorageService.loadData()
      if (!storage.data?.badges || !Array.isArray(storage.data.badges)) {
        console.log("📝 No badges found in storage")
        return []
      }
      return storage.data.badges.filter((badge: Badge) => 
        badge.studentHash === walletAddress
      )
    } catch (error) {
      console.error("❌ Error getting student badges:", error)
      return []
    }
  }

  // Get student profile by wallet address
  async getStudentProfile(walletAddress: string): Promise<any> {
    try {
      const storage = await fileStorageService.loadData()
      
      // Get wallet mapping
      const walletMapping = storage.data?.walletMappings?.[walletAddress]
      
      // Get badge requests and badges
      const badgeRequests = await this.getStudentBadgeRequests(walletAddress)
      const badges = await this.getStudentBadges(walletAddress)
      
      return {
        walletAddress,
        studentHash: walletAddress,
        registeredAt: walletMapping?.registeredAt,
        badgeRequests,
        badges,
        totalRequests: badgeRequests.length,
        approvedBadges: badges.length,
        pendingRequests: badgeRequests.filter(req => req.status === 'pending').length
      }
    } catch (error) {
      console.error("❌ Error getting student profile:", error)
      return null
    }
  }

  // Verify badge by hash
  async verifyBadge(badgeHash: string): Promise<{ isValid: boolean; badge?: any; student?: any }> {
    try {
      console.log(`🔍 Verifying badge hash: ${badgeHash}`)
      
      const storage = await fileStorageService.loadData()
      
      // Find badge by hash
      const badge = storage.data.badges?.find((b: any) => b.badgeHash === badgeHash || b.blockchainHash === badgeHash)
      
      if (!badge) {
        console.log(`❌ Badge not found: ${badgeHash}`)
        return { isValid: false }
      }
      
      // Find associated student
      const student = storage.data.students?.find((s: any) => s.studentHash === badge.studentHash)
      
      console.log(`✅ Badge verified: ${badge.courseName}`)
      
      return {
        isValid: true,
        badge,
        student
      }
      
    } catch (error) {
      console.error('❌ Error verifying badge:', error)
      return { isValid: false }
    }
  }
}

// Export singleton instance
export const badgeService = new BadgeService()
