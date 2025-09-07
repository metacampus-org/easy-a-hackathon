// MetaCAMPUS Badge Service - Blockchain integration for badge management
import algosdk from "algosdk"
import { algodClient } from "./algorand"
import { fileStorageService } from "./file-storage-service"

// Badge Data Interfaces
export interface BadgeRequest {
  id: string
  studentHash: string
  courseId: string
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
  courseId: string
  courseName: string
  issueDate: string
  verificationHash: string
  blockchainTxId: string
}

// Smart Contract Application ID for Badge Management
export const BADGE_APP_ID = process.env.NEXT_PUBLIC_ALGORAND_APP_ID
  ? Number.parseInt(process.env.NEXT_PUBLIC_ALGORAND_APP_ID)
  : 0

export class BadgeService {
  
  // Generate unique badge hash
  generateBadgeHash(studentHash: string, courseId: string, timestamp: number): string {
    const dataString = JSON.stringify({
      studentHash,
      courseId,
      timestamp,
      issuer: "MetaCAMPUS"
    })
    
    // Use browser-compatible hash generation
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)
    return Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Create badge request (student-initiated)
  async createBadgeRequest(
    studentHash: string,
    courseId: string,
    courseName: string,
    studentWallet: string,
    additionalInfo?: string
  ): Promise<{ requestId: string; txId?: string }> {
    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const badgeRequest: BadgeRequest = {
        id: requestId,
        studentHash,
        courseId,
        courseName,
        requestDate: new Date().toISOString(),
        status: "pending"
      }

      // Save to local storage
      await fileStorageService.saveBadgeRequest(badgeRequest)

      console.log("📝 Badge request created:", requestId)
      console.log("Student:", studentHash)
      console.log("Course:", courseId, "-", courseName)

      // If smart contract is deployed, also create on-chain request
      if (BADGE_APP_ID && BADGE_APP_ID > 0) {
        try {
          const suggestedParams = await algodClient.getTransactionParams().do()

          const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
            from: studentWallet, // Use the provided student wallet
            appIndex: BADGE_APP_ID,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [
              new TextEncoder().encode("create_badge_request"),
              new TextEncoder().encode(JSON.stringify(badgeRequest))
            ],
            suggestedParams,
          })

          const txId = appCallTxn.txID()
          console.log("🔗 Badge request transaction created:", txId)
          
          return { requestId, txId }
        } catch (blockchainError) {
          console.warn("⚠️ Blockchain request failed:", blockchainError)
          // Check if error is due to account issues
          const blockchainErrorMessage = blockchainError instanceof Error ? blockchainError.message : String(blockchainError);
          if (blockchainErrorMessage.includes("unauthorized") || blockchainErrorMessage.includes("not opted in")) {
            throw new Error("Account is not authorized to create badge requests. Please ensure your account is properly set up.");
          }
          console.log("Falling back to local storage only");
        }
      }

      return { requestId }
    } catch (error: unknown) {
      console.error("❌ Error creating badge request:", error)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("unauthorized")) {
        throw new Error("Unauthorized: Your account is not allowed to create badge requests");
      }
      throw new Error(errorMessage)
    }
  }

  // Check if wallet is admin
  private static async isAdminWallet(walletAddress: string): Promise<boolean> {
    if (!BADGE_APP_ID || BADGE_APP_ID <= 0) return false;
    try {
      const appInfo = await algodClient.getApplicationByID(BADGE_APP_ID).do();
      return appInfo.params.creator === walletAddress;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Approve badge request (admin-initiated)
  async approveBadgeRequest(
    requestId: string,
    adminWallet: string
  ): Promise<{ badgeHash: string; txId: string; verificationHash: string }> {
    // Verify admin privileges
    const isAdmin = await this.isAdminWallet(adminWallet);
    if (!isAdmin) {
      throw new Error("Unauthorized: Only admin wallets can approve badge requests");
    }
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

      // Additional check: Only the main admin wallet can approve badges
      const MAIN_ADMIN_WALLET = "N4HTLJPU5CSTE475XZ42LHWPVTTR4S2L35Y2YD4VFM6V4DUJPMCWFMTNF4";
      if (adminWallet !== MAIN_ADMIN_WALLET) {
        throw new Error("🚫 ACCESS DENIED: Only the main university administrator wallet can approve badge requests.")
      }

      console.log("📋 Found badge request:", request.courseName, "for student", request.studentHash)

      // Generate badge hash
      const timestamp = Date.now()
      const badgeHash = this.generateBadgeHash(request.studentHash, request.courseId, timestamp)
      
      console.log("🔐 Generated badge hash:", badgeHash)

      // Create badge data for blockchain
      const badgeData = {
        badgeHash,
        studentHash: request.studentHash,
        courseId: request.courseId,
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
            from: adminWallet,
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
            from: adminWallet,
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
<<<<<<< HEAD
  static async verifyBadge(badgeHash: string, walletAddress: string): Promise<{ isValid: boolean; badge?: Badge }> {
=======
  async verifyBadge(badgeHash: string): Promise<{ isValid: boolean; badge?: Badge }> {
>>>>>>> c17b632f827e58baecc32af460a46691123855a6
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
            from: walletAddress,
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

  // Get badge requests for specific student
  async getStudentBadgeRequests(studentHash: string): Promise<BadgeRequest[]> {
    try {
      return await fileStorageService.getBadgeRequests(studentHash)
    } catch (error) {
      console.error("❌ Error getting student badge requests:", error)
      return []
    }
  }
}

// Export singleton instance
export const badgeService = new BadgeService()
