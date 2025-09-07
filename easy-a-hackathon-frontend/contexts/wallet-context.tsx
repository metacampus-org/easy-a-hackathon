"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { PeraWalletConnect } from "@perawallet/connect"
import { DeflyWalletConnect } from "@blockshake/defly-connect"

type WalletProviderType = "pera" | "defly" | "exodus" | "lute";

type UserRole = "student" | "admin"

interface WalletContextType {
  isConnected: boolean
  isConnecting: boolean
  isModalOpen: boolean
  accountAddress: string | null
  userRole: UserRole | null
  connect: () => void
  disconnect: () => void
  connectWithProvider: (provider: WalletProviderType) => Promise<void>
  setIsModalOpen: (isOpen: boolean) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Initialize wallets outside the component to avoid re-creation on re-renders
const peraWallet = new PeraWalletConnect({
  deepLink: { name: 'MetaCAMPUS' }
});
const deflyWallet = new DeflyWalletConnect();

// Browser extension wallet detection
const detectExodusWallet = () => {
  return typeof window !== 'undefined' && window.algorand && window.algorand.isExodus;
};

const detectLuteWallet = () => {
  // Check multiple possible injection points for Lute wallet
  if (typeof window === 'undefined') return false;
  
  // Check if Lute injects as window.lute
  if ((window as any).lute) return true;
  
  // Check if Lute injects as window.algorand with isLute
  if (window.algorand && (window as any).algorand.isLute) return true;
  
  // Check if Lute injects as window.LuteWallet
  if ((window as any).LuteWallet) return true;
  
  return false;
};

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [accountAddress, setAccountAddress] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const isConnected = !!accountAddress;

  const determineUserRole = useCallback((address: string) => {
    if (!isClient) return;
    
    // Main admin wallet - only this wallet can perform admin functions
    const MAIN_ADMIN_WALLET = "N4HTLJPU5CSTE475XZ42LHWPVTTR4S2L35Y2YD4VFM6V4DUJPMCWFMTNF4";
    
    // Simple whitelist: main admin wallet = admin, all others = student
    const role = address === MAIN_ADMIN_WALLET ? "admin" : "student";
    setUserRole(role);
    localStorage.setItem("userRole", role);
    
    console.log(`🔐 Role determined for ${address}: ${role}`);
    console.log(`📋 Wallet type: ${role === "admin" ? "University Administrator" : "Student"}`);
  }, [isClient]);

  const handleDisconnect = useCallback(() => {
    setAccountAddress(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("walletProvider")
      localStorage.removeItem("activeAccount")
    }
  }, []);

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    peraWallet.connector?.on("disconnect", handleDisconnect)
    deflyWallet.connector?.on("disconnect", handleDisconnect)

    const lastUsedProvider = localStorage.getItem("walletProvider") as WalletProviderType | null;
    const savedAccount = localStorage.getItem("activeAccount");
    
    if (lastUsedProvider && savedAccount) {
      setIsConnecting(true);
      
      if (lastUsedProvider === 'pera') {
        peraWallet.reconnectSession()
          .then((accounts) => {
            if (accounts && accounts.length > 0) {
              setAccountAddress(accounts[0]);
              determineUserRole(accounts[0]);
            }
          })
          .catch(e => console.log(`${lastUsedProvider} reconnect error:`, e))
          .finally(() => setIsConnecting(false));
      } else if (lastUsedProvider === 'defly') {
        deflyWallet.reconnectSession()
          .then((accounts) => {
            if (accounts && accounts.length > 0) {
              setAccountAddress(accounts[0]);
              determineUserRole(accounts[0]);
            }
          })
          .catch(e => console.log(`${lastUsedProvider} reconnect error:`, e))
          .finally(() => setIsConnecting(false));
      } else if (lastUsedProvider === 'exodus' || lastUsedProvider === 'lute') {
        // For browser extensions, just restore the saved account
        setAccountAddress(savedAccount);
        if (isConnected && userRole) {
          if (userRole === "admin") {
            router.push("/admin")
          } else {
            router.push("/student")
          }
        } else {
          setIsConnecting(false)
        }
      } else {
        setIsConnecting(false);
      }
    } else {
      setIsConnecting(false)
    }

    return () => {
      peraWallet.connector?.off("disconnect", handleDisconnect)
      deflyWallet.connector?.off("disconnect", handleDisconnect)
    }
  }, [handleDisconnect, isClient])

  const connectWithProvider = async (provider: WalletProviderType) => {
    console.log("Connecting with provider:", provider)
    setIsModalOpen(false)
    setIsConnecting(true)
    try {
      let accounts: string[] = [];
      
      if (provider === "pera") {
        accounts = await peraWallet.connect()
      } else if (provider === "defly") {
        accounts = await deflyWallet.connect()
      } else if (provider === "exodus") {
        if (!detectExodusWallet()) {
          alert("Exodus wallet extension not detected. Please install the Exodus browser extension.")
          setIsConnecting(false)
          return;
        }
        try {
          const response = await (window as any).algorand.connect()
          if (response && response.accounts && response.accounts.length > 0) {
            accounts = response.accounts.map((acc: any) => acc.address)
          }
        } catch (error) {
          console.error("Exodus wallet connection failed:", error)
          alert("Failed to connect to Exodus wallet. Please try again.")
          setIsConnecting(false)
          return;
        }
      } else if (provider === "lute") {
        console.log("Attempting to connect to Lute wallet")
        console.log("Lute detection result:", detectLuteWallet())
        console.log("Window.lute:", typeof window !== 'undefined' ? (window as any).lute : 'undefined')
        console.log("Window.LuteWallet:", typeof window !== 'undefined' ? (window as any).LuteWallet : 'undefined')
        console.log("Window.algorand:", typeof window !== 'undefined' ? window.algorand : 'undefined')
        
        if (!detectLuteWallet()) {
          alert("Lute wallet extension not detected. Please install the Lute browser extension.")
          setIsConnecting(false)
          return;
        }
        try {
          let response;
          // Try different connection methods based on what's available
          if ((window as any).lute && (window as any).lute.connect) {
            response = await (window as any).lute.connect()
          } else if ((window as any).LuteWallet && (window as any).LuteWallet.connect) {
            response = await (window as any).LuteWallet.connect()
          } else if (window.algorand && (window as any).algorand.isLute) {
            response = await (window as any).algorand.connect()
          } else {
            throw new Error("No valid Lute wallet connection method found")
          }
          
          console.log("Lute connection response:", response)
          if (response && response.accounts && response.accounts.length > 0) {
            accounts = Array.isArray(response.accounts[0]) ? response.accounts : response.accounts.map((acc: any) => acc.address || acc)
          }
        } catch (error) {
          console.error("Lute wallet connection failed:", error)
          alert("Failed to connect to Lute wallet. Please try again.")
          setIsConnecting(false)
          return;
        }
      }

      if (accounts.length > 0) {
        const address = accounts[0];
        setAccountAddress(address);
        determineUserRole(address);
        if (typeof window !== 'undefined') {
          localStorage.setItem("walletProvider", provider)
          localStorage.setItem("activeAccount", address)
        }
      }
    } catch (error: any) {
      if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.error(`Error connecting to ${provider} Wallet:`, error)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const connect = () => {
    setIsModalOpen(true)
  }

  const disconnect = async () => {
    const lastUsedProvider = localStorage.getItem("walletProvider") as WalletProviderType | null;
    try {
      if (lastUsedProvider === 'pera') {
        await peraWallet.disconnect()
      } else if (lastUsedProvider === 'defly') {
        await deflyWallet.disconnect()
      } else if (lastUsedProvider === 'exodus') {
        // Exodus doesn't require explicit disconnect for browser extension
        console.log("Disconnecting Exodus wallet")
      } else if (lastUsedProvider === 'lute') {
        // Lute doesn't require explicit disconnect for browser extension
        console.log("Disconnecting Lute wallet")
      }
    } catch (e) {
      console.error("Error during disconnect:", e);
    }
    handleDisconnect();
    setUserRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("userRole");
    }
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        isModalOpen,
        accountAddress,
        userRole,
        connect,
        disconnect,
        connectWithProvider,
        setIsModalOpen,
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
