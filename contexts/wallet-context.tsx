"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'
import { algorandClient } from '@/lib/algorand-client'
import { toast } from '@/hooks/use-toast'

interface WalletContextType {
  isConnected: boolean
  isConnecting: boolean
  accountAddress: string | null
  userRole: number | null // 0 = student, 1 = university
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  optInToContract: () => Promise<void>
  checkUserRole: (address: string) => Promise<number>
  refreshRole: () => Promise<void>
  isStudent: () => boolean
  isUniversity: () => boolean
  isSuperAdmin: () => boolean
  signTransactions: (txns: any[]) => Promise<Uint8Array[]>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null)
  const [accountAddress, setAccountAddress] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const isConnected = !!accountAddress

  // Initialize Pera Wallet and restore session - only once
  useEffect(() => {
    // Prevent re-initialization
    if (isInitialized) {
      return
    }

    const init = async () => {
      try {
        setIsClient(true)
        
        // Initialize Pera Wallet Connect
        const peraWalletInstance = new PeraWalletConnect({
          shouldShowSignTxnToast: false,
        })
        
        setPeraWallet(peraWalletInstance)

        // Try to restore session from Pera Wallet
        try {
          // Reconnect to existing Pera Wallet session if available
          const accounts = await peraWalletInstance.reconnectSession()
          
          if (accounts.length > 0) {
            const address = accounts[0]
            setAccountAddress(address)
            
            // Save to localStorage
            localStorage.setItem("metacampus_wallet_address", address)
            
            // Try to get saved role first, then verify from contract in background
            const savedRole = localStorage.getItem("metacampus_user_role")
            if (savedRole) {
              setUserRole(parseInt(savedRole))
            }
            
            // Verify role in background without blocking
            algorandClient.getUserRole(address).then(currentRole => {
              if (currentRole !== parseInt(savedRole || "-1")) {
                setUserRole(currentRole)
                localStorage.setItem("metacampus_user_role", currentRole.toString())
                console.log(`🔄 Role updated to ${currentRole}`)
              }
            }).catch(roleError => {
              console.warn("Could not verify role from contract:", roleError)
            })
            
            console.log("✅ Restored Pera Wallet session")
          }
        } catch (error) {
          // No existing session to restore, this is normal for first-time users
          console.log("No existing Pera Wallet session to restore")
          // Clear any stale localStorage data
          localStorage.removeItem("metacampus_wallet_address")
          localStorage.removeItem("metacampus_user_role")
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error("❌ Error initializing Pera Wallet:", error)
        setIsInitialized(true)
      }
    }

    init()
  }, [isInitialized])

  // Connect wallet using Pera Wallet
  const connectWallet = async () => {
    if (!peraWallet) {
      console.error("❌ Pera Wallet not initialized")
      toast({
        title: "Connection Error",
        description: "Pera Wallet is not initialized. Please refresh the page.",
        variant: "destructive",
      })
      return
    }

    // Check if already connected
    if (isConnected && accountAddress) {
      console.log("✅ Wallet already connected:", accountAddress)
      toast({
        title: "Already Connected",
        description: "Your wallet is already connected.",
      })
      return
    }

    try {
      setIsConnecting(true)
      
      // Connect to Pera Wallet
      const accounts = await peraWallet.connect()
      
      if (accounts.length > 0) {
        const address = accounts[0]
        
        // Set state first before any async operations
        setAccountAddress(address)
        localStorage.setItem("metacampus_wallet_address", address)
        
        console.log("✅ Pera Wallet connected successfully")
        
        // Show success notification
        toast({
          title: "Connected Successfully",
          description: "Your Pera Wallet is now connected to MetaCAMPUS.",
        })
        
        // Try to check opt-in status and role (non-blocking)
        try {
          const isOptedIn = await algorandClient.isOptedIn(address)
          
          if (!isOptedIn) {
            console.log("🔄 User not opted in")
            // Don't auto opt-in, let user do it manually
            toast({
              title: "Action Required",
              description: "Please opt-in to the MetaCAMPUS smart contract to continue.",
              variant: "default",
            })
          } else {
            // Query user role if already opted in
            await checkUserRole(address)
          }
        } catch (error) {
          console.warn("Could not check opt-in status (node may be offline):", error)
          // Set default role so UI can still work
          setUserRole(0)
          localStorage.setItem("metacampus_user_role", "0")
        }
      }
    } catch (error) {
      console.error("❌ Error during wallet connection:", error)
      
      // Handle specific Pera Wallet errors
      let errorMessage = "Failed to connect wallet. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMessage = "Connection was cancelled. Please try again when ready."
        } else if (error.message.includes('No wallet')) {
          errorMessage = "Pera Wallet not found. Please install the Pera Wallet app."
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (!peraWallet) {
      console.error("❌ Pera Wallet not initialized")
      return
    }

    try {
      await peraWallet.disconnect()
      
      // Clear state
      setAccountAddress(null)
      setUserRole(null)
      
      // Clear localStorage on disconnect
      localStorage.removeItem("metacampus_wallet_address")
      localStorage.removeItem("metacampus_user_role")
      
      console.log("✅ Wallet disconnected successfully")
      
      // Show disconnect notification
      toast({
        title: "Disconnected",
        description: "Your wallet has been disconnected successfully.",
      })

      // Redirect to landing page after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }, 500)
    } catch (error) {
      console.error("❌ Error during wallet disconnect:", error)
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Opt into smart contract
  const optInToContract = async () => {
    // Get the current account address from state or localStorage
    const currentAddress = accountAddress || localStorage.getItem("metacampus_wallet_address")
    
    if (!peraWallet || !currentAddress) {
      console.error("❌ Pera Wallet or account address not available")
      toast({
        title: "Opt-in Failed",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if user is already opted in
      const isOptedIn = await algorandClient.isOptedIn(currentAddress)
      if (isOptedIn) {
        console.log("✅ User already opted in to smart contract")
        toast({
          title: "Already Opted In",
          description: "You are already opted into the smart contract.",
        })
        return
      }

      console.log("🔄 Creating opt-in transaction...")
      
      // Generate opt-in transaction
      const optInTxn = await algorandClient.optInToApp(currentAddress)
      
      // Request signature from Pera Wallet
      // Pera Wallet expects transactions in format: [[{ txn }]]
      const signedTxnArray = await peraWallet.signTransaction([[{ txn: optInTxn }]])
      
      console.log("🔐 Signed transaction array:", signedTxnArray)
      console.log("🔐 First element:", signedTxnArray[0])
      console.log("🔐 Is Uint8Array?", signedTxnArray[0] instanceof Uint8Array)
      
      // Submit transaction and wait for confirmation
      const { txId, confirmation } = await algorandClient.submitAndWait(signedTxnArray[0])
      
      console.log(`✅ Opt-in transaction confirmed: ${txId}`)
      
      // Show success notification
      toast({
        title: "Opt-in Successful",
        description: `Transaction confirmed: ${txId.substring(0, 8)}...`,
      })
      
      // Query and set initial role (should be 0 for student)
      await checkUserRole(currentAddress)
      
    } catch (error) {
      console.error("❌ Error during opt-in:", error)
      
      let errorMessage = "Failed to opt into smart contract."
      
      if (error instanceof Error) {
        // Check if user is already opted in
        if (error.message.includes('has already opted in')) {
          console.log("✅ User already opted in to smart contract")
          toast({
            title: "Already Opted In",
            description: "You are already opted into the smart contract.",
          })
          // Set default student role and refresh after a delay to allow blockchain state to propagate
          setUserRole(0)
          localStorage.setItem("metacampus_user_role", "0")
          // Try to refresh role after a short delay
          setTimeout(async () => {
            await checkUserRole(currentAddress)
          }, 2000)
          return
        }
        
        if (error.message.includes('User rejected')) {
          errorMessage = "Transaction was cancelled."
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient ALGO balance. Please add funds to your wallet."
        } else if (error.message.includes('connect to the server') || error.message.includes('Load failed')) {
          errorMessage = "Cannot connect to Algorand node. Please check your network connection."
        }
      }
      
      toast({
        title: "Opt-in Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Check user role from smart contract
  const checkUserRole = async (address: string): Promise<number> => {
    try {
      const role = await algorandClient.getUserRole(address)
      
      // Handle different role states
      if (role === -1) {
        // User not opted in, default to student role (0)
        console.log("🔄 User not opted in, defaulting to student role")
        setUserRole(0)
        localStorage.setItem("metacampus_user_role", "0")
        return 0
      }
      
      // Cache role in context state
      setUserRole(role)
      localStorage.setItem("metacampus_user_role", role.toString())
      
      console.log(`🔐 Role queried for ${address}: ${role}`)
      return role
    } catch (error) {
      console.error("❌ Error checking user role:", error)
      // Default to student role on error
      const defaultRole = 0
      setUserRole(defaultRole)
      localStorage.setItem("metacampus_user_role", defaultRole.toString())
      return defaultRole
    }
  }

  // Refresh role method
  const refreshRole = async () => {
    if (!accountAddress) return
    
    try {
      const previousRole = userRole
      const role = await checkUserRole(accountAddress)
      
      // Show notification if role changed
      if (previousRole !== null && previousRole !== role) {
        const roleLabels: Record<number, string> = {
          0: "Student",
          1: "University Administrator"
        }
        
        toast({
          title: "Role Updated",
          description: `Your role has been updated to ${roleLabels[role] || 'Unknown'}.`,
        })
      }
    } catch (error) {
      console.error("❌ Error refreshing role:", error)
    }
  }

  // Role helper methods
  const isStudent = (): boolean => {
    return userRole === 0
  }

  const isUniversity = (): boolean => {
    return userRole === 1
  }

  const isSuperAdmin = (): boolean => {
    if (!accountAddress) return false
    
    // Check if current address matches the super admin address from environment
    const superAdminAddress = process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET
    return superAdminAddress === accountAddress
  }

  // Sign transactions using the connected Pera Wallet
  const signTransactions = async (txns: any[]): Promise<Uint8Array[]> => {
    if (!peraWallet) {
      throw new Error('Pera Wallet not initialized')
    }
    
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    console.log('🔐 signTransactions called with:', txns)
    console.log('🔐 txns is array?', Array.isArray(txns))
    console.log('🔐 txns length:', txns.length)
    console.log('🔐 First txn:', txns[0])
    
    // Pera Wallet expects transactions in a specific format
    // For single transactions or transaction groups, wrap each transaction
    const txnsToSign = txns.map(txn => [{ txn }])
    
    console.log('🔐 Formatted txnsToSign:', txnsToSign)
    
    // Sign transactions using Pera Wallet
    const signedTxns = await peraWallet.signTransaction(txnsToSign)
    return signedTxns
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        accountAddress,
        userRole,
        connectWallet,
        disconnectWallet,
        optInToContract,
        checkUserRole,
        refreshRole,
        isStudent,
        isUniversity,
        isSuperAdmin,
        signTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
