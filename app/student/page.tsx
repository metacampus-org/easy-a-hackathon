"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Hash, Download, Share2, Award, BookOpen, TrendingUp, Calendar, GraduationCap, CheckCircle, Wallet, Copy, Eye, Share, Shield } from 'lucide-react'
import { WalletButton } from '@/components/wallet-button'
import { useWallet } from '@/contexts/wallet-context'
import { badgeService } from '@/lib/badge-service'
import { transcriptService, type TranscriptVerificationResult } from "@/lib/transcript-service"

export default function StudentPortalPage() {
  const [studentHash, setStudentHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transcriptData, setTranscriptData] = useState<TranscriptVerificationResult | null>(null)
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [courseName, setCourseName] = useState("")
  const [badgeStudentHash, setBadgeStudentHash] = useState("")
  const [isRequestingBadge, setIsRequestingBadge] = useState(false)
  
  // Hash lookup states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [isLookingUpHash, setIsLookingUpHash] = useState(false)
  const [foundHash, setFoundHash] = useState("")
  
  const { toast } = useToast()
  const { isConnected, accountAddress } = useWallet()

  // Load student profile when wallet is connected
  useEffect(() => {
    if (isConnected && accountAddress) {
      loadStudentProfile()
      setBadgeStudentHash(accountAddress) // Auto-populate badge request with wallet address
    } else {
      setStudentProfile(null)
      setBadgeStudentHash("")
    }
  }, [isConnected, accountAddress])

  const loadStudentProfile = async () => {
    if (!accountAddress) return
    
    try {
      const profile = await badgeService.getStudentProfile(accountAddress)
      setStudentProfile(profile)
      
      if (profile) {
        setStudentHash(accountAddress) // Auto-populate with wallet address
        toast({
          title: "Welcome Back!",
          description: `Found ${profile.totalRequests} badge requests and ${profile.approvedBadges} approved badges.`,
        })
      }
    } catch (error) {
      console.error("Error loading student profile:", error)
    }
  }

  const handleViewTranscript = async () => {
    if (!studentHash.trim()) {
      toast({
        title: "Student Hash Required",
        description: "Please enter your student hash to view your transcript.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await transcriptService.verifyTranscript(studentHash)
      setTranscriptData(result)
      
      toast({
        title: result.isValid ? "Transcript Loaded" : "Transcript Not Found",
        description: result.isValid 
          ? "Your academic transcript has been successfully loaded." 
          : "Could not find a transcript for this hash.",
        variant: result.isValid ? "default" : "destructive"
      })

    } catch (error) {
      console.error("Error loading transcript:", error)
      toast({
        title: "Error Loading Transcript",
        description: "Failed to load your transcript. Please try again.",
        variant: "destructive"
      })
      setTranscriptData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyHash = async () => {
    if (studentHash.trim()) {
      try {
        await navigator.clipboard.writeText(studentHash)
        toast({
          title: "Hash Copied!",
          description: "Student hash copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not copy hash to clipboard",
          variant: "destructive",
        })
      }
    }
  }

  const handleFindMyHash = async () => {
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to find your student hash",
        variant: "destructive",
      })
      return
    }

    setIsLookingUpHash(true)
    try {
      const hash = await badgeService.findStudentHash(firstName, lastName, dateOfBirth)
      if (hash) {
        setFoundHash(hash)
        setStudentHash(hash) // Auto-populate the transcript lookup field
        setBadgeStudentHash(hash) // Auto-populate the badge request field
        toast({
          title: "Student Hash Found!",
          description: "Your student hash has been found and auto-filled in the transcript and badge request forms below",
        })
      } else {
        toast({
          title: "Student Not Found",
          description: "No student record found with the provided information. Please check your details or contact the university.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description: "Failed to search for student hash. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLookingUpHash(false)
    }
  }

  const handleCopyFoundHash = async () => {
    if (foundHash) {
      try {
        await navigator.clipboard.writeText(foundHash)
        toast({
          title: "Hash Copied!",
          description: "Your student hash has been copied to clipboard",
        })
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Could not copy hash to clipboard",
          variant: "destructive",
        })
      }
    }
  }

  const handleShareTranscript = () => {
    if (!transcriptData) return

    const shareData = {
      studentHash: studentHash,
      verificationUrl: `${window.location.origin}/verify?hash=${studentHash}`,
      verificationInstructions: "Use this hash to verify the student's transcript at the verification portal."
    }

    const shareText = `Student Verification Hash: ${studentHash}\n\nVerification URL: ${shareData.verificationUrl}\n\n${shareData.verificationInstructions}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Student Transcript Verification',
        text: shareText,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast({
        title: "Verification Info Copied",
        description: "Verification details have been copied to clipboard.",
      })
    }
  }

  const handleRequestBadge = async () => {
    if (!isConnected || !accountAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to request a badge.",
        variant: "destructive"
      })
      return
    }

    if (!courseName.trim()) {
      toast({
        title: "Course Name Required",
        description: "Please enter a course name for your badge request.",
        variant: "destructive"
      })
      return
    }

    if (!badgeStudentHash.trim()) {
      toast({
        title: "Student Hash Required",
        description: "Please enter your student hash for the badge request.",
        variant: "destructive"
      })
      return
    }

    setIsRequestingBadge(true)
    try {
      const badgeRequest = {
        courseName: courseName.trim(),
        walletAddress: accountAddress,
        studentHash: badgeStudentHash.trim(),
        additionalInfo: `Badge request for ${courseName.trim()} - Student Hash: ${badgeStudentHash.trim()}`,
        requestDate: new Date().toISOString(),
        status: 'pending'
      }

      await badgeService.createBadgeRequest(badgeRequest)
      
      toast({
        title: "Badge Request Submitted",
        description: `Your badge request for ${courseName.trim()} has been submitted successfully.`,
      })

      setCourseName("")
      setBadgeStudentHash(accountAddress || "") // Reset to wallet address
      // Reload student profile to show new request
      await loadStudentProfile()

    } catch (error) {
      console.error("Error creating badge request:", error)
      toast({
        title: "Request Failed",
        description: "Failed to submit your badge request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRequestingBadge(false)
    }
  }

  const handleDownloadTranscript = () => {
    if (!transcriptData) return

    const transcriptExport = {
      studentHash: studentHash,
      verificationTimestamp: transcriptData.lastVerified,
      summary: {
        gpa: transcriptData.gpa,
        totalCredits: transcriptData.totalCredits,
        coursesCompleted: transcriptData.courses.length
      },
      courses: transcriptData.courses,
      verification: {
        isValid: transcriptData.isValid,
        institutionVerified: transcriptData.institutionVerified,
        transcriptHash: transcriptData.transcriptHash
      }
    }

    const dataStr = JSON.stringify(transcriptExport, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `my_transcript_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Transcript Downloaded",
      description: "Your academic transcript has been downloaded.",
    })
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const calculateGradeDistribution = () => {
    if (!transcriptData || !transcriptData.courses || !Array.isArray(transcriptData.courses) || transcriptData.courses.length === 0) return {}
    
    const distribution: { [key: string]: number } = {}
    transcriptData.courses.forEach(course => {
      if (course && course.grade) {
        const gradeCategory = course.grade.charAt(0)
        distribution[gradeCategory] = (distribution[gradeCategory] || 0) + 1
      }
    })
    
    return distribution
  }

  const gradeDistribution = calculateGradeDistribution()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Student Dashboard</h2>
        </div>

        {/* Wallet Status & Profile */}
        {!isConnected && (
          <Card className="border-amber-200 bg-amber-50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-700">
                <Wallet className="h-5 w-5" />
                <span>Connect Your Wallet</span>
              </CardTitle>
              <CardDescription>
                Connect your wallet to automatically access your student records and badges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletButton />
            </CardContent>
          </Card>
        )}

        {/* Find My Student Hash Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5" />
              <span>Find My Student Hash</span>
            </CardTitle>
            <CardDescription>
              Don't know your student hash? Enter your personal information to find it and share with your university.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={handleFindMyHash}
                disabled={isLookingUpHash || !firstName.trim() || !lastName.trim() || !dateOfBirth.trim()}
                className="min-w-[140px]"
              >
                {isLookingUpHash ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 mr-2" />
                    Find My Hash
                  </>
                )}
              </Button>
            </div>

            {foundHash && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-800">Your Student Hash Found!</h4>
                    <p className="text-sm text-green-600 mt-1">Share this hash with your university for transcript access</p>
                    <code className="block mt-2 p-2 bg-green-100 rounded text-xs break-all">{foundHash}</code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyFoundHash}
                    className="ml-4"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badge Requests Section */}
        {isConnected && studentProfile && studentProfile.badgeRequests && studentProfile.badgeRequests.length > 0 && (
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>My Badge Requests</span>
              </CardTitle>
              <CardDescription>
                Track the status of your badge requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentProfile.badgeRequests.map((request: any) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{request.courseName}</h4>
                          <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Course: {request.courseName}</div>
                          <div>Request Date: {new Date(request.requestDate).toLocaleDateString()}</div>
                          {request.blockchainHash && (
                            <div className="flex items-center space-x-2 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span className="font-mono text-xs">Badge Hash: {request.blockchainHash.substring(0, 16)}...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Your Transcript */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5" />
              <span>Access Your Transcript</span>
            </CardTitle>
            <CardDescription>
              Enter your unique student hash to view your academic record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentHash">Your Student Hash *</Label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    id="studentHash"
                    placeholder="WYD2NEUBGOYNUA3PGB6U3FXU2ETUDV57SWAIWBBISGI4JJWVO2SWKFKSNA"
                    value={studentHash}
                    onChange={(e) => setStudentHash(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={handleCopyHash}
                  disabled={!studentHash.trim()}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleViewTranscript}
                  disabled={isLoading || !studentHash.trim()}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      View Transcript
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Don't have your student hash?</h4>
              <p className="text-sm text-muted-foreground">
                Your student hash is provided by your institution when you're first onboarded to the blockchain system. 
                Contact your college's registrar office if you need assistance finding your hash.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transcript Results */}
        {transcriptData && transcriptData.isValid && (
          <div className="space-y-6">
            {/* Academic Summary */}
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Academic Summary</span>
                  </CardTitle>
                  <CardDescription>
                    Verified academic record from blockchain
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-green-600">
                  Verified ✓
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">GPA</div>
                    <div className="text-2xl font-bold text-foreground">{transcriptData.gpa}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Total Credits</div>
                    <div className="text-2xl font-bold text-foreground">{transcriptData.totalCredits}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Courses Completed</div>
                    <div className="text-2xl font-bold text-foreground">{transcriptData.courses?.length || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course List */}
            {transcriptData.courses && transcriptData.courses.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Course History</span>
                  </CardTitle>
                  <CardDescription>
                    Complete academic course record
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transcriptData.courses.map((course, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-foreground">{course.courseName}</h4>
                              <Badge variant={
                                course.grade === 'A' || course.grade === 'A+' ? 'default' :
                                course.grade === 'B' || course.grade === 'B+' || course.grade === 'B-' ? 'secondary' :
                                'outline'
                              }>
                                {course.grade}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Instructor: {course.instructor}</div>
                              <div>Department: {course.department}</div>
                              <div>Semester: {course.semester} {course.year}</div>
                              <div>Credits: {course.credits}</div>
                              <div>Completed: {new Date(course.completionDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">{course.gradePoints}</div>
                            <div className="text-xs text-muted-foreground">Grade Points</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* Blockchain Transaction Details */}
        {isConnected && studentProfile && studentProfile.approvedBadges && studentProfile.approvedBadges.length > 0 && (
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Blockchain Verification</span>
              </CardTitle>
              <CardDescription>
                View your badges on the Algorand blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentProfile.approvedBadges.map((badge: any) => (
                  <div key={badge.badgeHash} className="border rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{badge.courseName}</h4>
                        <Badge variant="default" className="bg-green-600">
                          Verified ✓
                        </Badge>
                      </div>
                      
                      {badge.blockchainTxId && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">Transaction ID</div>
                          <div className="flex items-center space-x-2">
                            <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                              {badge.blockchainTxId}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://lora.algokit.io/testnet/transaction/${badge.blockchainTxId}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View on Lora
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Issued: {new Date(badge.issueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Badge Request Section */}
        {isConnected && (
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Request New Badge</span>
              </CardTitle>
              <CardDescription>
                Submit a request for a course completion badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name *</Label>
                <Input
                  id="courseName"
                  placeholder="Enter the course name (e.g., Calculus II, Computer Science 101)"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badgeStudentHash">Student Hash *</Label>
                <Input
                  id="badgeStudentHash"
                  placeholder="WYD2NEUBGOYNUA3PGB6U3FXU2ETUDV57SWAIWBBISGI4JJWVO2SWKFKSNA"
                  value={badgeStudentHash}
                  onChange={(e) => setBadgeStudentHash(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This should be your unique student identifier used for academic records
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Badge Request Process</h4>
                    <p className="text-sm text-blue-700">
                      Your badge request will be submitted to the university for verification. 
                      Once approved, your badge will be minted on the blockchain and appear in your profile.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleRequestBadge}
                disabled={isRequestingBadge || !courseName.trim() || !badgeStudentHash.trim()}
                className="w-full"
              >
                {isRequestingBadge ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Submit Badge Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
