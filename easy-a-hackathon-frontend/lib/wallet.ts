import type algosdk from "algosdk"
import { PeraWalletConnect } from "@perawallet/connect"

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  provider: "pera" | "myalgo" | "walletconnect" | null
}

export interface Transaction {
  id: string
  type: "badge_request" | "badge_approval" | "badge_mint" | "verification" | "student_onboard" | "transcript_update" | "transcript_verify"
  status: "pending" | "confirmed" | "failed"
  txId: string
  timestamp: string
  details: {
    studentId?: string
    courseId?: string
    badgeHash?: string
    amount?: number
    studentHash?: string
    institutionId?: string
    transcriptHash?: string
    coursesCount?: number
  }
}

// Wallet Management Service
export class WalletService {
  private static instance: WalletService
  private peraWallet: PeraWalletConnect
  private walletState: WalletState = {
    isConnected: false,
    address: null,
    balance: 0,
    provider: null,
  }
  private transactions: Transaction[] = []

  constructor() {
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: false,
    })
  }

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  // Wallet Connection Methods
  async connectWallet(provider: "pera" | "myalgo" | "walletconnect"): Promise<boolean> {
    try {
      switch (provider) {
        case "pera":
          return await this.connectPera()
        case "myalgo":
          return await this.connectMyAlgo()
        case "walletconnect":
          return await this.connectWalletConnect()
        default:
          throw new Error("Unsupported wallet provider")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      return false
    }
  }

  private async connectPera(): Promise<boolean> {
    try {
      // Connect to Pera Wallet
      const accounts = await this.peraWallet.connect()
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        
        this.walletState = {
          isConnected: true,
          address: address,
          balance: 1000000, // Mock balance - in production, fetch from Algorand
          provider: "pera",
        }

        // Set up event listeners
        this.peraWallet.connector?.on("disconnect", () => {
          this.disconnectWallet()
        })

        return true
      }
      
      return false
    } catch (error) {
      console.error("Pera wallet connection failed:", error)
      return false
    }
  }

  private async connectMyAlgo(): Promise<boolean> {
    try {
      // Mock MyAlgo connection for demo
      // In production, use @randlabs/myalgo-connect
      const mockAddress = "MYALGO7XVLKAG5YXID47PSDN5IKBCXPPVE4KLXFEYNYFU7SFEWJJQ4B5Q"

      this.walletState = {
        isConnected: true,
        address: mockAddress,
        balance: 2000000, // 2 ALGO in microAlgos
        provider: "myalgo",
      }

      return true
    } catch (error) {
      console.error("MyAlgo wallet connection failed:", error)
      return false
    }
  }

  private async connectWalletConnect(): Promise<boolean> {
    try {
      // Mock WalletConnect connection for demo
      // In production, use @walletconnect/client v2
      const mockAddress = "WC7XVLKAG5YXID47PSDN5IKBCXPPVE4KLXFEYNYFU7SFEWJJQ4B5Q"

      this.walletState = {
        isConnected: true,
        address: mockAddress,
        balance: 1500000, // 1.5 ALGO in microAlgos
        provider: "walletconnect",
      }

      return true
    } catch (error) {
      console.error("WalletConnect connection failed:", error)
      return false
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      // Disconnect from Pera Wallet if connected
      if (this.walletState.provider === "pera") {
        await this.peraWallet.disconnect()
      }
      
      this.walletState = {
        isConnected: false,
        address: null,
        balance: 0,
        provider: null,
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      // Force disconnect even if there's an error
      this.walletState = {
        isConnected: false,
        address: null,
        balance: 0,
        provider: null,
      }
    }
  }

  getWalletState(): WalletState {
    return { ...this.walletState }
  }

  // Transaction Methods
  async signTransaction(txn: algosdk.Transaction): Promise<Uint8Array> {
    if (!this.walletState.isConnected || !this.walletState.address) {
      throw new Error("Wallet not connected")
    }

    try {
      if (this.walletState.provider === "pera") {
        // Use Pera Wallet to sign the transaction
        const signedTxn = await this.peraWallet.signTransaction([[{
          txn: txn,
          signers: [this.walletState.address]
        }]])
        return signedTxn[0]
      } else {
        // Mock transaction signing for other wallets
        const mockSignedTxn = new Uint8Array(64) // Mock signature
        return mockSignedTxn
      }
    } catch (error) {
      console.error("Error signing transaction:", error)
      throw error
    }
  }

  addTransaction(transaction: Omit<Transaction, "id" | "timestamp">): void {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...transaction,
    }
    this.transactions.unshift(newTransaction)
  }

  getTransactions(): Transaction[] {
    return [...this.transactions]
  }

  updateTransactionStatus(txId: string, status: Transaction["status"]): void {
    const transaction = this.transactions.find((tx) => tx.txId === txId)
    if (transaction) {
      transaction.status = status
    }
  }

  // Get Pera Wallet instance for direct access if needed
  getPeraWallet(): PeraWalletConnect {
    return this.peraWallet
  }
}
