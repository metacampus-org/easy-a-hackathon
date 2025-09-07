"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  ArrowLeft, 
  Download,
  Share,
  Hash,
  GraduationCap,
  Award,
  Eye,
  Copy,
  CheckCircle
} from "lucide-react"
import { transcriptService, type TranscriptVerificationResult } from "@/lib/transcript-service"
import { useToast } from "@/components/ui/use-toast"
import { WalletButton } from "@/components/wallet-button"

export default function StudentPortalPage() {
  const [studentHash, setStudentHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transcriptData, setTranscriptData] = useState<TranscriptVerificationResult | null>(null)
  const { toast } = useToast()

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

  const handleCopyHash = () => {
    navigator.clipboard.writeText(studentHash)
    toast({
      title: "Hash Copied",
      description: "Your student hash has been copied to clipboard.",
    })
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
    if (!transcriptData || transcriptData.courses.length === 0) return {}
    
    const distribution: { [key: string]: number } = {}
    transcriptData.courses.forEach(course => {
      const gradeCategory = course.grade.charAt(0)
      distribution[gradeCategory] = (distribution[gradeCategory] || 0) + 1
    })
    
    return distribution
  }

  const gradeDistribution = calculateGradeDistribution()

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">My Transcript</h2>
          <Link href="/student/request">
            <Button className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Request New Badge
            </Button>
          </Link>
        </div>

        {/* Access Form */}
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
                    placeholder="Enter your student blockchain hash..."
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
                    Your verified academic performance overview
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleShareTranscript} variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share for Verification
                  </Button>
                  <Button onClick={handleDownloadTranscript} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{transcriptData.gpa}</div>
                    <div className="text-sm text-muted-foreground">Cumulative GPA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{transcriptData.totalCredits}</div>
                    <div className="text-sm text-muted-foreground">Total Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{transcriptData.courses.length}</div>
                    <div className="text-sm text-muted-foreground">Courses Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {transcriptData.courses.filter(c => c.grade.startsWith('A')).length}
                    </div>
                    <div className="text-sm text-muted-foreground">A Grades</div>
                  </div>
                </div>

                {/* Grade Distribution */}
                {Object.keys(gradeDistribution).length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Grade Distribution</h4>
                    <div className="flex space-x-4">
                      {Object.entries(gradeDistribution).map(([grade, count]) => (
                        <div key={grade} className="flex items-center space-x-2">
                          <Badge className={getGradeColor(grade)}>{grade}</Badge>
                          <span className="text-sm text-muted-foreground">{count} courses</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Blockchain Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Record verified on Algorand blockchain</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Institution digitally signed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Immutable and tamper-proof</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Last Verified:</span> {new Date(transcriptData.lastVerified).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Verification Hash:</span>
                      <code className="ml-2 bg-muted px-2 py-1 rounded text-xs font-mono">
                        {transcriptData.transcriptHash.substring(0, 16)}...
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course History */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Course History</span>
                </CardTitle>
                <CardDescription>
                  Complete record of your academic coursework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transcriptData.courses
                    .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime())
                    .map((course, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{course.courseCode} - {course.courseName}</h4>
                            <Badge className={getGradeColor(course.grade)}>
                              {course.grade}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Credits:</span> {course.credits}
                            </div>
                            <div>
                              <span className="font-medium">Semester:</span> {course.semester} {course.year}
                            </div>
                            <div>
                              <span className="font-medium">Instructor:</span> {course.instructor}
                            </div>
                            <div>
                              <span className="font-medium">Department:</span> {course.department}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Completed:</span> {new Date(course.completionDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">{course.gradePoints}</div>
                          <div className="text-xs text-muted-foreground">Grade Points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {transcriptData.courses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No courses found in your transcript.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="border-border mt-8">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">About Your Blockchain Transcript:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your academic record is permanently stored on the Algorand blockchain</li>
                  <li>• Records cannot be modified or deleted once written to the blockchain</li>
                  <li>• You can share your student hash with any institution for instant verification</li>
                  <li>• All data is cryptographically secured and timestamped</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Sharing Your Transcript:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use the "Share for Verification" button to get verification instructions</li>
                  <li>• Provide your student hash to institutions for instant verification</li>
                  <li>• Download your transcript data for offline access</li>
                  <li>• Your hash never expires and remains permanently valid</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
