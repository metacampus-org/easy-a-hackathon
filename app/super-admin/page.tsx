"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"
import { algorandClient } from "@/lib/algorand-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Shield, Clock, CheckCircle, XCircle, ExternalLink, Mail, Globe, Calendar, User, AlertCircle } from "lucide-react"

interface UniversitySignup {
  id: number
  walletAddress: string
  institutionName: string
  contactEmail: string
  institutionWebsite: string
  verificationDocuments: string[]
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export default function SuperAdminPage() {
  const { isConnected, accountAddress, isSuperAdmin, signTransactions } = useWallet()
  const router = useRouter()
  
  const [signups, setSignups] = useState<UniversitySignup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [processingApproval, setProcessingApproval] = useState<number | null>(null)
  const [rejectionDialog, setRejectionDialog] = useState<{
    isOpen: boolean
    signup: UniversitySignup | null
    reason: string
    isSubmitting: boolean
  }>({
    isOpen: false,
    signup: null,
    reason: "",
    isSubmitting: false
  })

  // Check authorization
  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to access the super admin dashboard.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    if (!isSuperAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have super admin privileges to access this page.",
        variant: "destructive",
      })
      router.push("/")
      return
    }
  }, [isConnected, isSuperAdmin, router])

  // Fetch signup requests
  const fetchSignups = async (status?: string) => {
    try {
      setIsLoading(true)
      const url = status ? `/api/university-signups?status=${status}` : '/api/university-signups'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch signups: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSignups(data.signups || [])
    } catch (error) {
      console.error("Error fetching signups:", error)
      toast({
        title: "Failed to Load Signups",
        description: "Could not load university signup requests. Please try again.",
        variant: "destructive",
      })
      setSignups([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load signups on component mount and tab change
  useEffect(() => {
    if (isConnected && isSuperAdmin()) {
      fetchSignups(activeTab === 'all' ? undefined : activeTab)
    }
  }, [isConnected, isSuperAdmin, activeTab])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline'
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'approved':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
        return <XCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  // Filter signups by status
  const filteredSignups = signups.filter(signup => {
    if (activeTab === 'all') return true
    return signup.status === activeTab
  })

  // Count signups by status
  const pendingCount = signups.filter(s => s.status === 'pending').length
  const approvedCount = signups.filter(s => s.status === 'approved').length
  const rejectedCount = signups.filter(s => s.status === 'rejected').length

  // Handle university approval
  const handleApproval = async (signup: UniversitySignup) => {
    if (!accountAddress) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to approve requests.",
        variant: "destructive",
      })
      return
    }

    // Validate that signup has a wallet address
    if (!signup.walletAddress || signup.walletAddress.trim() === '') {
      toast({
        title: "Invalid Signup Data",
        description: "This signup request is missing a wallet address. Please contact the applicant to resubmit their application.",
        variant: "destructive",
      })
      return
    }

    setProcessingApproval(signup.id)

    try {
      // Generate assignUniversityRole transaction
      const assignRoleTxn = await algorandClient.assignUniversityRole(
        accountAddress,
        signup.walletAddress
      )

      // Request signature from super admin via Pera Wallet (from wallet context)
      const signedTxnArray = await signTransactions([assignRoleTxn])
      console.log('✅ Transaction signed:', signedTxnArray)

      // The result is an array of signed transactions (Uint8Array)
      // Submit transaction and wait for confirmation
      const { txId, confirmation } = await algorandClient.submitAndWait(signedTxnArray[0])

      console.log(`✅ Role assignment transaction confirmed: ${txId}`)

      // Show transaction confirmation notification
      toast({
        title: "Transaction Confirmed",
        description: `Role assignment transaction confirmed: ${txId.substring(0, 8)}...`,
      })

      // Call API to update signup status with transaction ID
      const response = await fetch("/api/approve-university", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: signup.id.toString(),
          approverWallet: accountAddress,
          txId: txId
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update local state to reflect approval
        setSignups(prev => prev.map(s => 
          s.id === signup.id 
            ? { 
                ...s, 
                status: 'approved' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: accountAddress
              }
            : s
        ))

        toast({
          title: "University Approved",
          description: `${signup.institutionName} has been approved and granted university administrator access.`,
        })

        // Refresh the signups list to get updated data
        await fetchSignups(activeTab === 'all' ? undefined : activeTab)
      } else {
        // Blockchain transaction succeeded but database update failed
        // This is okay - the important part (blockchain) worked
        console.warn('Database update failed but blockchain transaction succeeded:', result)
        
        toast({
          title: "Blockchain Transaction Successful",
          description: `${signup.institutionName} has been granted university role on the blockchain. Database will be updated manually.`,
        })
        
        // Still refresh to show any changes
        await fetchSignups(activeTab === 'all' ? undefined : activeTab)
      }
    } catch (error) {
      console.error("Error during approval process:", error)
      
      let errorMessage = "Failed to approve university request. Please try again."
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMessage = "Transaction was cancelled. Please try again when ready."
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient ALGO balance. Please add funds to your wallet."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setProcessingApproval(null)
    }
  }

  // Handle university rejection
  const handleRejection = async () => {
    if (!accountAddress || !rejectionDialog.signup) {
      return
    }

    if (!rejectionDialog.reason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this university request.",
        variant: "destructive",
      })
      return
    }

    setRejectionDialog(prev => ({ ...prev, isSubmitting: true }))

    try {
      // Call API to reject university with reason
      const response = await fetch("/api/reject-university", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: rejectionDialog.signup.id.toString(),
          approverWallet: accountAddress,
          rejectionReason: rejectionDialog.reason.trim()
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update local state to reflect rejection
        setSignups(prev => prev.map(s => 
          s.id === rejectionDialog.signup!.id 
            ? { 
                ...s, 
                status: 'rejected' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: accountAddress,
                rejectionReason: rejectionDialog.reason.trim()
              }
            : s
        ))

        toast({
          title: "University Rejected",
          description: `${rejectionDialog.signup.institutionName} request has been rejected.`,
        })

        // Close dialog and reset state
        setRejectionDialog({
          isOpen: false,
          signup: null,
          reason: "",
          isSubmitting: false
        })

        // Refresh the signups list to get updated data
        await fetchSignups(activeTab === 'all' ? undefined : activeTab)
      } else {
        throw new Error(result.message || "Failed to reject university request")
      }
    } catch (error) {
      console.error("Error during rejection process:", error)
      
      let errorMessage = "Failed to reject university request. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast({
        title: "Rejection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setRejectionDialog(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Open rejection dialog
  const openRejectionDialog = (signup: UniversitySignup) => {
    setRejectionDialog({
      isOpen: true,
      signup,
      reason: "",
      isSubmitting: false
    })
  }

  // Close rejection dialog
  const closeRejectionDialog = () => {
    setRejectionDialog({
      isOpen: false,
      signup: null,
      reason: "",
      isSubmitting: false
    })
  }

  // Don't render if not authorized
  if (!isConnected || !isSuperAdmin()) {
    return null
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Super Admin Dashboard
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage university signup requests and system administration
          </p>
          
          {/* Connected wallet info */}
          <div className="mt-4 bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Connected as Super Admin:</p>
            <p className="font-mono text-sm font-medium">{accountAddress}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{signups.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Signup Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>University Signup Requests</CardTitle>
            <CardDescription>
              Review and manage university registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedCount})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedCount})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({signups.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <span className="ml-2 text-muted-foreground">Loading signup requests...</span>
                  </div>
                ) : filteredSignups.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      No {activeTab === 'all' ? '' : activeTab} requests found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === 'pending' 
                        ? "There are no pending university signup requests at this time."
                        : `No ${activeTab} requests to display.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Institution</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Website</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSignups.map((signup) => (
                          <TableRow key={signup.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{signup.institutionName}</p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {signup.id}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{signup.contactEmail}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                <a 
                                  href={signup.institutionWebsite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center"
                                >
                                  Visit
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell>
                              {signup.walletAddress ? (
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                  {signup.walletAddress.slice(0, 8)}...{signup.walletAddress.slice(-6)}
                                </code>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Missing
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(signup.status)}>
                                {getStatusIcon(signup.status)}
                                {signup.status.charAt(0).toUpperCase() + signup.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(signup.submittedAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {signup.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleApproval(signup)}
                                      disabled={processingApproval === signup.id}
                                    >
                                      {processingApproval === signup.id ? (
                                        <>
                                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                                          Approving...
                                        </>
                                      ) : (
                                        "Approve"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => openRejectionDialog(signup)}
                                      disabled={processingApproval === signup.id}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                
                                {signup.status === 'approved' && signup.reviewedAt && (
                                  <div className="text-xs text-muted-foreground">
                                    <p>Approved: {formatDate(signup.reviewedAt)}</p>
                                    {signup.reviewedBy && (
                                      <p>By: {signup.reviewedBy.slice(0, 8)}...</p>
                                    )}
                                  </div>
                                )}
                                
                                {signup.status === 'rejected' && (
                                  <div className="text-xs text-muted-foreground">
                                    <p>Rejected: {signup.reviewedAt ? formatDate(signup.reviewedAt) : 'N/A'}</p>
                                    {signup.rejectionReason && (
                                      <p className="text-red-600 mt-1">
                                        Reason: {signup.rejectionReason}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Verification Documents Section */}
        {filteredSignups.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
              <CardDescription>
                Review verification documents provided by institutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSignups
                  .filter(signup => signup.verificationDocuments && signup.verificationDocuments.length > 0)
                  .map((signup) => (
                    <div key={signup.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{signup.institutionName}</h4>
                        <Badge variant={getStatusBadgeVariant(signup.status)}>
                          {signup.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-2">Verification Documents:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {signup.verificationDocuments.map((doc, index) => (
                            <li key={index}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Dialog */}
        <Dialog open={rejectionDialog.isOpen} onOpenChange={(open) => {
          if (!open && !rejectionDialog.isSubmitting) {
            closeRejectionDialog()
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject University Request</DialogTitle>
              <DialogDescription>
                You are about to reject the university registration request from{" "}
                <strong>{rejectionDialog.signup?.institutionName}</strong>.
                Please provide a reason for the rejection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please explain why this university request is being rejected..."
                  value={rejectionDialog.reason}
                  onChange={(e) => setRejectionDialog(prev => ({ 
                    ...prev, 
                    reason: e.target.value 
                  }))}
                  className="min-h-[100px]"
                  disabled={rejectionDialog.isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be stored and may be shared with the applicant.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeRejectionDialog}
                disabled={rejectionDialog.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejection}
                disabled={rejectionDialog.isSubmitting || !rejectionDialog.reason.trim()}
              >
                {rejectionDialog.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Request"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}