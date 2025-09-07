"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"
import { BlockchainService } from "@/lib/blockchain-service"
import type { WalletState } from "@/lib/wallet"

export function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    provider: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize wallet state
    setWalletState(BlockchainService.getWalletState())
  }, [])

  const handleConnect = async (provider: "pera" | "myalgo" | "walletconnect") => {
    setIsConnecting(true)
    setError(null)

    try {
      const success = await BlockchainService.connectWallet(provider)
      if (success) {
        setWalletState(BlockchainService.getWalletState())
      } else {
        setError("Failed to connect wallet")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await BlockchainService.disconnectWallet()
      setWalletState(BlockchainService.getWalletState())
    } catch (error) {
      setError(error instanceof Error ? error.message : "Disconnection failed")
    }
  }

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address)
    }
  }

  const formatBalance = (balance: number) => {
    return (balance / 1000000).toFixed(2) // Convert microAlgos to Algos
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (walletState.isConnected) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <CardDescription>Your Algorand wallet is connected and ready for transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Address</p>
              <p className="text-xs text-muted-foreground font-mono">
                {walletState.address && truncateAddress(walletState.address)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Balance</p>
              <p className="text-lg font-bold text-foreground">{formatBalance(walletState.balance)} ALGO</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {walletState.provider}
            </Badge>
          </div>

          <Button variant="outline" onClick={handleDisconnect} className="w-full bg-transparent">
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Algorand Wallet
        </CardTitle>
        <CardDescription>Connect your wallet to interact with the metaCAMPUS blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => handleConnect("pera")}
            disabled={isConnecting}
            className="w-full justify-start"
            variant="outline"
          >
            <div className="w-6 h-6 bg-blue-500 rounded mr-3" />
            Pera Wallet
          </Button>

          {/* <Button
            onClick={() => handleConnect("myalgo")}
            disabled={isConnecting}
            className="w-full justify-start"
            variant="outline"
          >
            <div className="w-6 h-6 bg-purple-500 rounded mr-3" />
            MyAlgo Wallet
          </Button> */}

          {/* <Button
            onClick={() => handleConnect("walletconnect")}
            disabled={isConnecting}
            className="w-full justify-start"
            variant="outline"
          >
            <div className="w-6 h-6 bg-orange-500 rounded mr-3" />
            WalletConnect
          </Button> */}
        </div>

        {isConnecting && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Connecting wallet...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
