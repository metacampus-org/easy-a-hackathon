"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { PeraWalletConnect } from "@perawallet/connect"
import { DeflyWalletConnect } from "@blockshake/defly-connect"

type WalletProviderType = "pera" | "defly" | "exodus" | "lute";

interface WalletContextType {
  isConnected: boolean
  isConnecting: boolean
  isModalOpen: boolean
  accountAddress: string | null
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

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [accountAddress, setAccountAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const isConnected = !!accountAddress;

  const handleDisconnect = useCallback(() => {
    setAccountAddress(null)
    localStorage.removeItem("walletProvider")
    localStorage.removeItem("activeAccount")
  }, []);

  useEffect(() => {
    peraWallet.connector?.on("disconnect", handleDisconnect)
    deflyWallet.connector?.on("disconnect", handleDisconnect)

    const lastUsedProvider = localStorage.getItem("walletProvider") as WalletProviderType | null;
    
    if (lastUsedProvider) {
      setIsConnecting(true);
      let reconnectPromise;
      if (lastUsedProvider === 'pera') {
        reconnectPromise = peraWallet.reconnectSession();
      } else if (lastUsedProvider === 'defly') {
        reconnectPromise = deflyWallet.reconnectSession();
      } else {
        setIsConnecting(false);
        return;
      }

      reconnectPromise.then((accounts) => {
        if (accounts && accounts.length > 0) {
          setAccountAddress(accounts[0])
        }
      }).catch(e => console.log(`${lastUsedProvider} reconnect error:`, e)).finally(() => setIsConnecting(false));

    } else {
      setIsConnecting(false)
    }

    return () => {
      peraWallet.connector?.off("disconnect", handleDisconnect)
      deflyWallet.connector?.off("disconnect", handleDisconnect)
    }
  }, [handleDisconnect])

  const connectWithProvider = async (provider: WalletProviderType) => {
    setIsModalOpen(false)
    setIsConnecting(true)
    try {
      let accounts: string[] = [];
      if (provider === "pera") {
        accounts = await peraWallet.connect()
      } else if (provider === "defly") {
        accounts = await deflyWallet.connect()
      } else {
        alert(`Connecting with ${provider} is coming soon!`)
        setIsConnecting(false)
        return;
      }

      if (accounts.length > 0) {
        const address = accounts[0];
        setAccountAddress(address)
        localStorage.setItem("walletProvider", provider)
        localStorage.setItem("activeAccount", address)
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
      }
    } catch (e) {
      console.error("Error during disconnect:", e);
    }
    handleDisconnect();
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        isModalOpen,
        accountAddress,
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
