"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { GraduationCap, Upload, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react"

interface FormData {
  institutionName: string
  contactEmail: string
  institutionWebsite: string
  verificationDocuments: string
}

interface FormErrors {
  institutionName?: string
  contactEmail?: string
  institutionWebsite?: string
  verificationDocuments?: string
}

interface ExistingSignup {
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

export default function UniversitySignupPage() {
  const { isConnected, accountAddress, connectWallet, optInToContract } = useWallet()
  const router = useRouter()
  const [isOptingIn, setIsOptingIn] = useState(false)

  // Check for existing signup when wallet connects
  useEffect(() => {
    if (isConnected && accountAddress) {
      checkExistingSignup()
    }
  }, [isConnected, accountAddress])

  // Check if user has an existing signup
  const checkExistingSignup = async () => {
    if (!accountAddress) return
    
    setIsLoadingStatus(true)
    try {
      const response = await fetch('/api/university-signups')
      if (response.ok) {
        const data = await response.json()
        const userSignup = data.signups?.find((signup: ExistingSignup) => 
          signup.walletAddress === accountAddress
        )
        setExistingSignup(userSignup || null)
      }
    } catch (error) {
      console.error('Error checking existing signup:', error)
    } finally {
      setIsLoadingStatus(false)
    }
  }
  
  const [formData, setFormData] = useState<FormData>({
    institutionName: "",
    contactEmail: "",
    institutionWebsite: "",
    verificationDocuments: ""
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [requestId, setRequestId] = useState<string>("")
  const [existingSignup, setExistingSignup] = useState<ExistingSignup | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.institutionName.trim()) {
      newErrors.institutionName = "Institution name is required"
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address"
    }
    
    if (!formData.institutionWebsite.trim()) {
      newErrors.institutionWebsite = "Institution website is required"
    } else if (!/^https?:\/\/.+\..+/.test(formData.institutionWebsite)) {
      newErrors.institutionWebsite = "Please enter a valid website URL (including http:// or https://)"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Get status badge information
  const getStatusBadgeInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          variant: 'outline' as const, 
          icon: <Clock className="h-3 w-3" />, 
          label: 'Pending Review' 
        }
      case 'approved':
        return { 
          variant: 'default' as const, 
          icon: <CheckCircle className="h-3 w-3" />, 
          label: 'Approved' 
        }
      case 'rejected':
        return { 
          variant: 'destructive' as const, 
          icon: <XCircle className="h-3 w-3" />, 
          label: 'Rejected' 
        }
      default:
        return { 
          variant: 'secondary' as const, 
          icon: null, 
          label: 'Unknown' 
        }
    }
  }

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !accountAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet before submitting the form.",
        variant: "destructive",
      })
      return
    }
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/university-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: accountAddress,
          institutionName: formData.institutionName.trim(),
          contactEmail: formData.contactEmail.trim(),
          institutionWebsite: formData.institutionWebsite.trim(),
          verificationDocuments: formData.verificationDocuments.trim() ? 
            formData.verificationDocuments.split('\n').map(doc => doc.trim()).filter(doc => doc) : 
            []
        }),
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setRequestId(result.requestId)
        setIsSubmitted(true)
        
        toast({
          title: "Application Submitted",
          description: "Your university signup request has been submitted successfully.",
        })
      } else {
        throw new Error(result.message || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If form is submitted successfully, show confirmation
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                Application Submitted Successfully
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your university signup request has been received and is pending review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Request ID:</p>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {requestId}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800 dark:text-green-200">What happens next?</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Your application will be reviewed by our administrators</li>
                  <li>• You will be notified of the decision via the contact email provided</li>
                  <li>• If approved, your wallet will be granted university administrator privileges</li>
                  <li>• You can then access the admin panel to manage student records</li>
                </ul>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  Return to Home
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({
                      institutionName: "",
                      contactEmail: "",
                      institutionWebsite: "",
                      verificationDocuments: ""
                    })
                    setRequestId("")
                  }}
                  className="flex-1"
                >
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">University Registration</CardTitle>
            <CardDescription className="text-lg">
              Apply for administrative access to manage student records on MetaCAMPUS
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isConnected ? (
              <div className="text-center space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Wallet Connection Required
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    Please connect your Algorand wallet to proceed with the university registration.
                  </p>
                </div>
                
                <Button onClick={connectWallet} size="lg" className="w-full">
                  Connect Pera Wallet
                </Button>
                
                <div className="text-left space-y-4 pt-6 border-t">
                  <h4 className="font-semibold">Requirements for University Registration:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Valid Algorand wallet address</li>
                    <li>• Official institution name and contact information</li>
                    <li>• Institutional website for verification</li>
                    <li>• Administrative approval from MetaCAMPUS team</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Existing Signup Status */}
                {isLoadingStatus ? (
                  <div className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Checking signup status...</span>
                    </div>
                  </div>
                ) : existingSignup ? (
                  <Card className={`border-2 ${
                    existingSignup.status === 'pending' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' :
                    existingSignup.status === 'approved' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
                    'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Existing Application</CardTitle>
                        <Badge variant={getStatusBadgeInfo(existingSignup.status).variant}>
                          {getStatusBadgeInfo(existingSignup.status).icon}
                          <span className="ml-1">{getStatusBadgeInfo(existingSignup.status).label}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        You have already submitted a university registration request.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Institution</p>
                          <p className="text-sm">{existingSignup.institutionName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                          <p className="text-sm">{existingSignup.contactEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Website</p>
                          <p className="text-sm">{existingSignup.institutionWebsite}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                          <p className="text-sm">{formatDate(existingSignup.submittedAt)}</p>
                        </div>
                      </div>

                      {existingSignup.status === 'pending' && (
                        <div className="space-y-3">
                          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                              Your application is under review
                            </p>
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                              Our administrators are reviewing your request. You will be notified once a decision is made.
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                              ⚠️ Action Required: Opt-in to Smart Contract
                            </p>
                            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                              Before your application can be approved, you must opt-in to the MetaCAMPUS smart contract. This is a one-time blockchain transaction.
                            </p>
                            <Button
                              onClick={async () => {
                                setIsOptingIn(true)
                                try {
                                  await optInToContract()
                                } finally {
                                  setIsOptingIn(false)
                                }
                              }}
                              disabled={isOptingIn}
                              className="mt-3 w-full"
                              size="sm"
                            >
                              {isOptingIn ? 'Processing Opt-In...' : 'Opt-In to Smart Contract'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {existingSignup.status === 'approved' && (
                        <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                            Congratulations! Your application has been approved
                          </p>
                          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                            You now have university administrator privileges. You can access the admin panel to manage student records.
                          </p>
                          {existingSignup.reviewedAt && (
                            <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                              Approved on {formatDate(existingSignup.reviewedAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {existingSignup.status === 'rejected' && (
                        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                            Your application has been rejected
                          </p>
                          {existingSignup.rejectionReason && (
                            <div className="mt-2">
                              <p className="text-red-700 dark:text-red-300 text-sm font-medium">Reason:</p>
                              <p className="text-red-700 dark:text-red-300 text-sm">{existingSignup.rejectionReason}</p>
                            </div>
                          )}
                          {existingSignup.reviewedAt && (
                            <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                              Rejected on {formatDate(existingSignup.reviewedAt)}
                            </p>
                          )}
                          <div className="mt-3">
                            <p className="text-red-700 dark:text-red-300 text-sm font-medium">What you can do:</p>
                            <ul className="text-red-700 dark:text-red-300 text-sm mt-1 space-y-1">
                              <li>• Review the rejection reason above</li>
                              <li>• Address the issues mentioned</li>
                              <li>• Submit a new application with corrected information</li>
                              <li>• Contact support if you need clarification</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={checkExistingSignup}
                          disabled={isLoadingStatus}
                        >
                          <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                          Refresh Status
                        </Button>
                        {existingSignup.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => router.push('/university-admin')}
                          >
                            Go to Admin Panel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {/* Show form only if no existing signup or if rejected */}
                {(!existingSignup || existingSignup.status === 'rejected') && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Connected Wallet:</strong> {accountAddress}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institutionName">
                    Institution Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institutionName"
                    type="text"
                    placeholder="e.g., University of Technology"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange("institutionName", e.target.value)}
                    className={errors.institutionName ? "border-red-500" : ""}
                  />
                  {errors.institutionName && (
                    <p className="text-red-500 text-sm">{errors.institutionName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    Contact Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="admin@university.edu"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    className={errors.contactEmail ? "border-red-500" : ""}
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="institutionWebsite">
                    Institution Website <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="institutionWebsite"
                    type="url"
                    placeholder="https://www.university.edu"
                    value={formData.institutionWebsite}
                    onChange={(e) => handleInputChange("institutionWebsite", e.target.value)}
                    className={errors.institutionWebsite ? "border-red-500" : ""}
                  />
                  {errors.institutionWebsite && (
                    <p className="text-red-500 text-sm">{errors.institutionWebsite}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verificationDocuments">
                    Verification Documents (Optional)
                  </Label>
                  <Textarea
                    id="verificationDocuments"
                    placeholder="List any verification documents or additional information (one per line)&#10;e.g.:&#10;Accreditation Certificate&#10;Official Registration Document&#10;Contact Person: Dr. Smith, Registrar"
                    value={formData.verificationDocuments}
                    onChange={(e) => handleInputChange("verificationDocuments", e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    <Upload className="h-3 w-3 inline mr-1" />
                    Document upload functionality will be available in a future update
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Review Process</h4>
                  <p className="text-sm text-muted-foreground">
                    Your application will be reviewed by our administrators. You will receive a notification 
                    once your request has been approved or if additional information is needed.
                  </p>
                </div>
                
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting Application..." : "Submit University Application"}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}