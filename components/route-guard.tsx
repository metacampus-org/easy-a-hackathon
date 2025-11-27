"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"
import { toast } from "@/hooks/use-toast"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: number | number[] // 0 = student, 1 = university
  fallbackPath?: string
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireRole,
  fallbackPath = "/",
}: RouteGuardProps) {
  const { accountAddress, userRole, isConnecting, isSuperAdmin, checkUserRole } = useWallet()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuthorization = async () => {
      setIsCheckingAuth(true)
      
      // Wait for wallet connection check to complete
      if (isConnecting) {
        return
      }

      // Check authentication requirement
      if (requireAuth && !accountAddress) {
        console.log("🚫 Authentication required, redirecting to:", fallbackPath)
        toast({
          title: "Authentication Required",
          description: "Please connect your wallet to access this page.",
          variant: "destructive",
        })
        router.push(fallbackPath)
        setIsCheckingAuth(false)
        return
      }

      // If user is authenticated, ensure we have their role
      if (accountAddress && userRole === null) {
        console.log("🔄 Querying user role from smart contract...")
        try {
          await checkUserRole(accountAddress)
        } catch (error) {
          console.error("❌ Error checking user role:", error)
          // Continue with null role, will be handled below
        }
      }

      // Check role requirement
      if (requireRole !== undefined && accountAddress) {
        const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole]
        const hasRequiredRole = userRole !== null && requiredRoles.includes(userRole)
        const isSuperAdminAccess = isSuperAdmin() && requiredRoles.includes(1) // Super admin can access university features

        if (!hasRequiredRole && !isSuperAdminAccess) {
          console.log(`🚫 Role ${userRole} not authorized. Required: ${requiredRoles.join(" or ")}`)
          
          // Get role labels for better error messages
          const roleLabels: Record<number, string> = {
            0: "Student",
            1: "University Administrator"
          }
          
          const requiredRoleLabels = requiredRoles.map(r => roleLabels[r] || 'Unknown').join(" or ")
          const currentRoleLabel = isSuperAdmin() ? "Super Admin" : (userRole !== null ? roleLabels[userRole] : 'Unknown')
          
          toast({
            title: "Access Denied",
            description: `This page requires ${requiredRoleLabels} access. Your current role is ${currentRoleLabel}.`,
            variant: "destructive",
          })
          
          // Determine redirect based on current role
          if (userRole === 0) {
            router.push("/student")
          } else if (userRole === 1 || isSuperAdmin()) {
            router.push("/university-admin")
          } else {
            router.push(fallbackPath)
          }
          setIsCheckingAuth(false)
          return
        }
      }

      // User is authorized
      setIsAuthorized(true)
      setIsCheckingAuth(false)
    }

    checkAuthorization()
  }, [accountAddress, userRole, isConnecting, requireAuth, requireRole, fallbackPath, router, isSuperAdmin, checkUserRole])

  // Show loading state during authentication verification
  if (isConnecting || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authorized
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
