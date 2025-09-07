"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { accountAddress, userRole, isConnecting } = useWallet()
  const router = useRouter()

  useEffect(() => {
    // Wait for wallet connection to complete
    if (isConnecting) return

    // Check if user is connected
    if (!accountAddress) {
      router.push("/")
      return
    }

    // Check if user has admin role (university administrator)
    if (userRole !== "admin") {
      router.push("/student")
      return
    }

    // Additional security: verify the exact admin wallet address
    const MAIN_ADMIN_WALLET = "N4HTLJPU5CSTE475XZ42LHWPVTTR4S2L35Y2YD4VFM6V4DUJPMCWFMTNF4"
    if (accountAddress !== MAIN_ADMIN_WALLET) {
      router.push("/student")
      return
    }
  }, [accountAddress, userRole, isConnecting, router])

  // Show loading while checking authentication
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render admin content if not authenticated as admin
  if (!accountAddress || userRole !== "admin") {
    return null
  }

  return <>{children}</>
}
