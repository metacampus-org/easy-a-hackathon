import algosdk from "algosdk"
const crypto = require("crypto")

// Lora network testnet configuration
const ALGORAND_SERVER = "https://testnet-api.4160.nodely.dev"
const ALGORAND_PORT = 443
const ALGORAND_TOKEN = ""

// Initialize Algorand client
export const algodClient = new algosdk.Algodv2(ALGORAND_TOKEN, ALGORAND_SERVER, ALGORAND_PORT)

// Load ABI specification (server-side only)
let contractABI: any = null

async function loadContractABI() {
  if (typeof window === 'undefined' && !contractABI) {
    try {
      const fs = await import("fs")
      const path = await import("path")
      const abiPath = path.join(process.cwd(), "teal", "contract.json")
      if (fs.existsSync(abiPath)) {
        const abiContent = fs.readFileSync(abiPath, "utf8")
        contractABI = JSON.parse(abiContent)
      }
    } catch (error) {
      console.warn("Could not load contract ABI:", error)
    }
  }
  return contractABI
}

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
  // Get contract ABI for method calls
  static async getContractABI() {
    return await loadContractABI()
  }

  // Create ATC (Atomic Transaction Composer) for ABI method calls
  static createATC() {
    return new algosdk.AtomicTransactionComposer()
  }

  static async getAccountInfo(address: string) {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      return {
        address: accountInfo.address,
        balance: accountInfo.amount / 1000000, // Convert microAlgos to Algos
        minBalance: accountInfo["min-balance"] / 1000000,
        assets: accountInfo.assets || [],
        appsLocalState: accountInfo["apps-local-state"] || [],
        appsOptedIn: accountInfo["apps-total-opted-in"] || 0,
      }
    } catch (error) {
      console.error("Error fetching account info:", error)
      throw error
    }
  }

  static async createBadgeRequest(request: BadgeRequest, senderAccount: algosdk.Account) {
    try {
      const abi = await loadContractABI()
      if (!abi) {
        throw new Error("Contract ABI not loaded")
      }

      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Use ABI method call
      atc.addMethodCall({
        appID: METACAMPUS_APP_ID,
        method: algosdk.getMethodByName(abi.methods, "create_badge_request"),
        methodArgs: [
          request.studentId,
          request.courseId,
          request.institutionId
        ],
        sender: senderAccount.addr,
        suggestedParams,
        signer: algosdk.makeBasicAccountTransactionSigner(senderAccount)
      })

      const result = await atc.execute(algodClient, 3)
      return result.txIDs[0]
    } catch (error) {
      console.error("Error creating badge request:", error)
      throw error
    }
  }

  static async approveBadgeRequest(requestId: string, adminAccount: algosdk.Account) {
    try {
      const abi = await loadContractABI()
      if (!abi) {
        throw new Error("Contract ABI not loaded")
      }

      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Use ABI method call
      atc.addMethodCall({
        appID: METACAMPUS_APP_ID,
        method: algosdk.getMethodByName(abi.methods, "approve_badge_request"),
        methodArgs: [requestId],
        sender: adminAccount.addr,
        suggestedParams,
        signer: algosdk.makeBasicAccountTransactionSigner(adminAccount)
      })

      const result = await atc.execute(algodClient, 3)
      return result.txIDs[0]
    } catch (error) {
      console.error("Error approving badge request:", error)
      throw error
    }
  }

  static async verifyBadge(badgeHash: string, studentId: string): Promise<{ verified: boolean; badge?: MetaBadge }> {
    try {
      if (METACAMPUS_APP_ID === 0) {
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_ALGORAND_APP_ID environment variable.")
      }

      // For client-side calls, skip ABI and go directly to state reading
      if (typeof window !== 'undefined') {
        return await this.verifyBadgeFromState(badgeHash, studentId)
      }

      const abi = await loadContractABI()
      if (!abi) {
        console.warn("Contract ABI not loaded, falling back to state reading")
        return await this.verifyBadgeFromState(badgeHash, studentId)
      }

      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Use ABI method call for verification (read-only)
      atc.addMethodCall({
        appID: METACAMPUS_APP_ID,
        method: algosdk.getMethodByName(abi.methods, "verify_badge"),
        methodArgs: [badgeHash, studentId],
        sender: algosdk.getApplicationAddress(METACAMPUS_APP_ID), // Use app address for read-only calls
        suggestedParams,
        signer: algosdk.makeLogicSigAccountTransactionSigner({
          lsig: new algosdk.LogicSigAccount(new Uint8Array(0))
        }, algosdk.getApplicationAddress(METACAMPUS_APP_ID))
      })

      try {
        const result = await atc.execute(algodClient, 3)
        const returnValue = result.methodResults[0].returnValue
        
        if (returnValue && returnValue.length > 0) {
          const badgeData = JSON.parse(Buffer.from(returnValue).toString())
          return { verified: true, badge: badgeData }
        }
      } catch (error) {
        // If ABI call fails, fall back to direct state reading
        console.warn("ABI call failed, falling back to state reading:", error)
      }

      return await this.verifyBadgeFromState(badgeHash, studentId)
    } catch (error) {
      console.error("Error verifying badge:", error)
      throw error
    }
  }

  private static async verifyBadgeFromState(badgeHash: string, studentId: string): Promise<{ verified: boolean; badge?: MetaBadge }> {
    try {
      // Fallback: Read global state directly
      const appInfo = await algodClient.getApplicationByID(METACAMPUS_APP_ID).do()
      const globalState = appInfo.params["global-state"]

      if (!globalState) {
        return { verified: false }
      }

      // Look for badge data using the badge_data key prefix
      const badgeDataKey = `badge_data${badgeHash}`
      const keyToFind = Buffer.from(badgeDataKey).toString("base64")
      const badgeState = globalState.find(kv => kv.key === keyToFind)

      if (!badgeState || !badgeState.value.bytes) {
        return { verified: false }
      }

      const badgeDataString = Buffer.from(badgeState.value.bytes, "base64").toString()
      const badgeData: MetaBadge = JSON.parse(badgeDataString)

      // Verify the badge hash matches and belongs to the correct student
      const expectedHash = this.generateBadgeHash(badgeData)
      if (badgeData.badgeHash === badgeHash && badgeData.studentId === studentId && expectedHash === badgeHash) {
        return { verified: true, badge: badgeData }
      }

      return { verified: false }
    } catch (error) {
      console.error("Error reading badge state:", error)
      return { verified: false }
    }
  }

  static async getBadgeRequestStatus(requestId: string): Promise<{ exists: boolean; approved: boolean; timestamp?: number }> {
    try {
      if (METACAMPUS_APP_ID === 0) {
        throw new Error("Smart contract not deployed. Please set NEXT_PUBLIC_ALGORAND_APP_ID environment variable.")
      }

      const appInfo = await algodClient.getApplicationByID(METACAMPUS_APP_ID).do()
      const globalState = appInfo.params["global-state"]

      if (!globalState) {
        return { exists: false, approved: false }
      }

      // Check if request exists
      const requestKey = `badge_request${requestId}`
      const requestKeyBase64 = Buffer.from(requestKey).toString("base64")
      const requestState = globalState.find(kv => kv.key === requestKeyBase64)

      if (!requestState) {
        return { exists: false, approved: false }
      }

      // Check if request is approved
      const approvedKey = `approved${requestId}`
      const approvedKeyBase64 = Buffer.from(approvedKey).toString("base64")
      const approvedState = globalState.find(kv => kv.key === approvedKeyBase64)

      const approved = approvedState && approvedState.value.bytes ? 
        Buffer.from(approvedState.value.bytes, "base64").toString() === "approved" : false

      // Get timestamp if available
      const timestampKey = `timestamp${requestId}`
      const timestampKeyBase64 = Buffer.from(timestampKey).toString("base64")
      const timestampState = globalState.find(kv => kv.key === timestampKeyBase64)
      const timestamp = timestampState && timestampState.value.uint ? timestampState.value.uint : undefined

      return { exists: true, approved, timestamp }
    } catch (error) {
      console.error("Error getting badge request status:", error)
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
