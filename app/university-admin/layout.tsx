"use client"

import { RouteGuard } from "@/components/route-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard requireAuth={true} requireRole={1} fallbackPath="/student">
      {children}
    </RouteGuard>
  )
}
