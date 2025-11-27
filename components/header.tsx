"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, GraduationCap, User, Wifi, WifiOff } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { WalletButton } from "@/components/wallet-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const { userRole, isConnected, isSuperAdmin, accountAddress } = useWallet()

  // Get role display information
  const getRoleInfo = () => {
    if (!isConnected) return null
    
    if (isSuperAdmin()) {
      return { label: "Super Admin", variant: "destructive" as const }
    }
    
    switch (userRole) {
      case 1:
        return { label: "University Admin", variant: "default" as const }
      case 0:
        return { label: "Student", variant: "secondary" as const }
      default:
        return null
    }
  }

  const roleInfo = getRoleInfo()

  // Determine which navigation links to show based on user role
  const getNavLinks = () => {
    if (!isConnected) {
      // Show all links for unauthenticated users (they'll be redirected by route guards)
      return [
        { href: "/student", label: "Student Portal", icon: User },
        { href: "/admin", label: "University Portal", icon: GraduationCap },
      ]
    }

    const links = []

    // Students see only student portal
    if (userRole === 0) {
      links.push({ href: "/student", label: "Student Portal", icon: User })
    }

    // University admins see admin portal
    if (userRole === 1) {
      links.push({ href: "/university-admin", label: "University Portal", icon: GraduationCap })
    }

    // Super admins see both admin portal and super admin dashboard
    if (isSuperAdmin()) {
      links.push({ href: "/university-admin", label: "University Portal", icon: GraduationCap })
      links.push({ href: "/super-admin", label: "Super Admin", icon: Shield })
    }

    return links
  }

  const navLinks = getNavLinks()

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Shield className="h-7 w-7 text-primary" />
            <span className="hidden sm:inline">MetaCAMPUS</span>
          </Link>
        </div>

        <nav className="flex-2 flex justify-center items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2",
                  pathname === link.href && "text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            )
          })}
          
          {/* Show university signup link for unauthenticated users */}
          {!isConnected && (
            <Link
              href="/university-signup"
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-2",
                pathname === "/university-signup" && "text-foreground"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">University Signup</span>
            </Link>
          )}
        </nav>

        <div className="flex-1 flex justify-end items-center gap-3">
          {/* Connection Status Indicator */}
          <div className="hidden md:flex items-center gap-2">
            {isConnected ? (
              <>
                {/* Connection Status Icon */}
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Connected</span>
                </div>
                {/* Wallet Address Display */}
                <span className="text-xs text-muted-foreground font-mono">
                  {formatWalletAddress(accountAddress || "")}
                </span>
                {/* Role Badge Display */}
                {roleInfo && (
                  <Badge variant={roleInfo.variant}>
                    {roleInfo.label}
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">
                <WifiOff className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Not Connected
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile Connection Status */}
          <div className="md:hidden flex items-center">
            {isConnected ? (
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                {roleInfo && (
                  <Badge variant={roleInfo.variant} className="text-xs">
                    {roleInfo.label}
                  </Badge>
                )}
              </div>
            ) : (
              <WifiOff className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
