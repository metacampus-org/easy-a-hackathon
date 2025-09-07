import type algosdk from "algosdk"

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  provider: "pera" | "myalgo" | "walletconnect" | null
}

export interface Transaction {
  id: string
  type: "badge_request" | "badge_approval" | "badge_mint" | "verification"
  status: "pending" | "confirmed" | "failed"
  txId: string
  timestamp: string
  details: {
    studentId?: string
    courseId?: string
    badgeHash?: string
    amount?: number
  }
}

// Wallet Management Service
export class WalletService {
  private static instance: WalletService
  private walletState: WalletState = {
    isConnected: false,
    address: null,
    balance: 0,
    provider: null,
  }
  private transactions: Transaction[] = []

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
      // Mock Pera Wallet connection
      // In production, this would use @perawallet/connect
      const mockAddress = "PERA7XVLKAG5YXID47PSDN5IKBCXPPVE4KLXFEYNYFU7SFEWJJQ4B5Q"

      this.walletState = {
        isConnected: true,
        address: mockAddress,
        balance: 1000000, // 1 ALGO in microAlgos
        provider: "pera",
      }

      return true
    } catch (error) {
      console.error("Pera wallet connection failed:", error)
      return false
    }
  }

  private async connectMyAlgo(): Promise<boolean> {
    try {
      // Mock MyAlgo connection
      // In production, this would use @randlabs/myalgo-connect
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
      // Mock WalletConnect connection
      // In production, this would use @walletconnect/client
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
    this.walletState = {
      isConnected: false,
      address: null,
      balance: 0,
      provider: null,
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
      // Mock transaction signing
      // In production, this would use the actual wallet provider's signing method
      const mockSignedTxn = new Uint8Array(64) // Mock signature
      return mockSignedTxn
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
}
