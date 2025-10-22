"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { Wallet, LogOut, Loader2, Copy, CheckCircle2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function WalletButton() {
  const { isConnected, accountAddress, userRole, connectWallet, disconnectWallet, isConnecting, isSuperAdmin } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    if (accountAddress) {
      navigator.clipboard.writeText(accountAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getRoleLabel = () => {
    if (isSuperAdmin()) {
      return "Super Admin"
    }
    switch (userRole) {
      case 1:
        return "University Admin"
      case 0:
        return "Student"
      default:
        return "Unknown"
    }
  }

  const getRoleVariant = () => {
    if (isSuperAdmin()) {
      return "destructive" as const
    }
    switch (userRole) {
      case 1:
        return "default" as const
      case 0:
        return "secondary" as const
      default:
        return "outline" as const
    }
  }

  if (isConnecting) {
    return (
      <Button disabled variant="outline" size="sm">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && accountAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="hidden sm:inline">
              {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
            </span>
            <span className="sm:hidden">Connected</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Account Details</DropdownMenuLabel>
          <DropdownMenuSeparator />
          

          
          <div className="px-2 py-1.5 text-sm">
            <div className="text-muted-foreground text-xs mb-1">Role</div>
            <Badge variant={getRoleVariant()}>
              {getRoleLabel()}
            </Badge>
          </div>
          
          <div className="px-2 py-1.5 text-sm">
            <div className="text-muted-foreground text-xs mb-1">Wallet Address</div>
            <div className="font-mono text-xs break-all">
              {accountAddress}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCopyAddress}>
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={disconnectWallet}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={connectWallet} variant="default" size="sm" className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
