"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Shield, Users, Award, Clock, CheckCircle, XCircle, Search, ArrowLeft, Eye, Check, X, Hash } from "lucide-react"
import { badgeService } from "@/lib/badge-service"
import { useToast } from "@/components/ui/use-toast"

interface InstitutionStats {
  totalRequests: number
  pendingRequests: number
  approvedBadges: number
  rejectedRequests: number
  activeStudents: number
  totalCourses: number
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [badgeRequests, setBadgeRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isConnected, accountAddress, userRole, isUniversity, isSuperAdmin } = useWallet()
  const { toast } = useToast()

  // Load badge requests on component mount
  const loadBadgeRequests = async () => {
    try {
      const requests = await badgeService.getAllBadgeRequests()
      setBadgeRequests(requests)
    } catch (error) {
      console.error("Error loading badge requests:", error)
    }
  }

  useEffect(() => {
    loadBadgeRequests()
  }, [])


  // Approve badge request with blockchain integration
  const handleApproveBadge = async (requestId: string) => {
    if (!accountAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to approve badges.",
        variant: "destructive"
      })
      return
    }

    // Check if user has university role (1) or is super admin using smart contract
    if (!isUniversity() && !isSuperAdmin()) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to approve badges. Only university administrators and super admins can approve badge requests.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("🎓 STARTING BADGE APPROVAL PROCESS")
      console.log("Request ID:", requestId)
      console.log("Admin Wallet:", accountAddress)
      console.log("User Role:", userRole)
      console.log("Timestamp:", new Date().toISOString())

      const result = await badgeService.approveBadgeRequest(requestId, accountAddress)
      
      console.log("🏆 BADGE APPROVAL SUCCESS!")
      console.log("🔐 Badge Hash (ON-CHAIN):", result.badgeHash)
      console.log("🔒 Verification Hash:", result.verificationHash)
      console.log("📡 BLOCKCHAIN TRANSACTION ID:", result.txId)
      console.log("🌐 LORA EXPLORER LINK: https://lora.algokit.io/testnet/transaction/" + result.txId)
      console.log("✅ Badge successfully created and stored on blockchain!")

      toast({
        title: "Badge Approved Successfully!",
        description: `Badge hash: ${result.badgeHash.substring(0, 16)}... | TX ID: ${result.txId}`,
      })
      await loadBadgeRequests()
    } catch (error) {
      console.error("❌ BADGE APPROVAL FAILED:", error)
      toast({
        title: "Badge Approval Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }



  // Calculate real statistics from badge requests
  const stats: InstitutionStats = {
    totalRequests: badgeRequests.length,
    pendingRequests: badgeRequests.filter((req) => req && req.status === "pending").length,
    approvedBadges: badgeRequests.filter((req) => req && req.status === "approved").length,
    rejectedRequests: badgeRequests.filter((req) => req && req.status === "rejected").length,
    activeStudents: new Set(badgeRequests.map(req => req.walletAddress || req.studentHash)).size,
    totalCourses: new Set(badgeRequests.map(req => req.courseId)).size,
  }

  const filteredRequests = badgeRequests.filter((request) => {
    if (!request) return false
    
    const matchesSearch = searchTerm === "" || [
      request.studentHash,
      request.courseId,
      request.courseName
    ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Badge Management Dashboard</h2>
              <p className="text-muted-foreground">Review and approve student badge requests</p>
            </div>
            <div className="flex gap-3">
              <Link href="/university-admin/transcript">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Users className="mr-2 h-5 w-5" />
                  Manage Students
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending Requests
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.pendingRequests}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Approved Badges
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.approvedBadges}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Students
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.activeStudents}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Total Requests
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.totalRequests}</div>
            </CardHeader>
          </Card>
        </div>


        {/* Main Content */}
        <div className="space-y-6">
            {/* Filters */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Filter Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student name, course ID, or course name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("pending")}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={statusFilter === "approved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("approved")}
                    >
                      Approved
                    </Button>
                    <Button
                      variant={statusFilter === "rejected" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("rejected")}
                    >
                      Rejected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Badge Requests Queue</CardTitle>
                <CardDescription>
                  Review and process student badge requests ({filteredRequests.length} results)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{request.courseName}</h4>
                            <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                              {request.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-4">
                              <span>Course: {request.courseName || 'N/A'}</span>
                              <span>Request Date: {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            {request.blockchainHash && (
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                <span className="font-mono text-xs">Badge Hash: {request.blockchainHash.substring(0, 16)}...</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">Wallet:</span>
                              <span className="font-mono text-xs">{request.walletAddress || request.studentHash || 'N/A'}</span>
                            </div>
                            {request.approvalDate && (
                              <div className="text-xs text-green-600">
                                Approved: {new Date(request.approvalDate).toLocaleDateString()} by {request.adminWallet?.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex flex-col items-end gap-2">
                            <Button 
                              onClick={() => handleApproveBadge(request.id)}
                              disabled={isLoading || !isConnected}
                              className="min-w-[120px]"
                            >
                              {isLoading ? "Approving..." : "Approve Badge"}
                            </Button>
                            {(isUniversity() || isSuperAdmin()) && (
                              <span className="text-xs text-muted-foreground">
                                Role: {isSuperAdmin() ? 'Super Admin' : 'University Admin'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No badge requests found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
