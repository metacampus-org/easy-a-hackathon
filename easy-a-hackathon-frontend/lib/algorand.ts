import algosdk from "algosdk"
const crypto = require("crypto")

// Algorand network configuration
const ALGORAND_SERVER = "https://testnet-api.algonode.cloud"
const ALGORAND_PORT = 443
const ALGORAND_TOKEN = ""

// Initialize Algorand client
export const algodClient = new algosdk.Algodv2(ALGORAND_TOKEN, ALGORAND_SERVER, ALGORAND_PORT)

// Smart contract application ID (will be set after deployment)
export const METACAMPUS_APP_ID = process.env.NEXT_PUBLIC_ALGORAND_APP_ID
  ? Number.parseInt(process.env.NEXT_PUBLIC_ALGORAND_APP_ID)
  : 0

// Badge smart contract interface
export interface BadgeRequest {
  studentId: string
  courseId: string
  institutionId: string
  requestTimestamp: number
  status: "pending" | "approved" | "rejected"
}

export interface MetaBadge {
  id: string
  studentId: string
  courseId: string
  institutionId: string
  learningOutcomes: string[]
  issueTimestamp: number
  badgeHash: string
}

// Utility functions for Algorand operations
export class AlgorandService {
  static async getAccountInfo(address: string) {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      return accountInfo
    } catch (error) {
      console.error("Error fetching account info:", error)
      throw error
    }
  }

  static async createBadgeRequest(request: BadgeRequest, senderAccount: algosdk.Account) {
    try {
      // Create application call transaction for badge request
      const suggestedParams = await algodClient.getTransactionParams().do()

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAccount.addr,
        appIndex: METACAMPUS_APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new Uint8Array(Buffer.from("create_badge_request")),
          new Uint8Array(Buffer.from(JSON.stringify(request))),
        ],
        suggestedParams,
      })

      const signedTxn = appCallTxn.signTxn(senderAccount.sk)
      const txId = await algodClient.sendRawTransaction(signedTxn).do()

      return txId
    } catch (error) {
      console.error("Error creating badge request:", error)
      throw error
    }
  }

  static async approveBadgeRequest(requestId: string, adminAccount: algosdk.Account) {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: adminAccount.addr,
        appIndex: METACAMPUS_APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new Uint8Array(Buffer.from("approve_badge_request")), new Uint8Array(Buffer.from(requestId))],
        suggestedParams,
      })

      const signedTxn = appCallTxn.signTxn(adminAccount.sk)
      const txId = await algodClient.sendRawTransaction(signedTxn).do()

      return txId
    } catch (error) {
      console.error("Error approving badge request:", error)
      throw error
    }
  }

  static async createMetaBadge(badge: MetaBadge, issuerAccount: algosdk.Account) {
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: issuerAccount.addr,
        appIndex: METACAMPUS_APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new Uint8Array(Buffer.from("create_meta_badge")), new Uint8Array(Buffer.from(JSON.stringify(badge)))],
        suggestedParams,
      })

      const signedTxn = appCallTxn.signTxn(issuerAccount.sk)
      const txId = await algodClient.sendRawTransaction(signedTxn).do()

      return txId
    } catch (error) {
      console.error("Error creating meta badge:", error)
      throw error
    }
  }

  static generateBadgeHash(badge: Omit<MetaBadge, "badgeHash">): string {
    const badgeData = JSON.stringify({
      studentId: badge.studentId,
      courseId: badge.courseId,
      institutionId: badge.institutionId,
      learningOutcomes: badge.learningOutcomes,
      issueTimestamp: badge.issueTimestamp,
    })

    // Create SHA-256 hash of badge data
    return crypto.createHash("sha256").update(badgeData).digest("hex")
  }
}
