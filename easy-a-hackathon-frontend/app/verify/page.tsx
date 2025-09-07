"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Shield, 
  Search,
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Hash,
  GraduationCap,
  Calendar,
  User,
  Award
} from "lucide-react"
import { TranscriptService, type TranscriptVerificationResult } from "@/lib/transcript-service"
import { useToast } from "@/components/ui/use-toast"

export default function VerifyTranscriptPage() {
  const [studentHash, setStudentHash] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<TranscriptVerificationResult | null>(null)
  const { toast } = useToast()

  const handleVerifyTranscript = async () => {
    if (!studentHash.trim()) {
      toast({
        title: "Student Hash Required",
        description: "Please enter a valid student hash to verify.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await TranscriptService.verifyTranscript(studentHash)
      setVerificationResult(result)
      
      toast({
        title: result.isValid ? "Verification Successful" : "Verification Failed",
        description: result.isValid 
          ? "Student transcript has been successfully verified." 
          : "Could not verify the student transcript.",
        variant: result.isValid ? "default" : "destructive"
      })

    } catch (error) {
      console.error("Error verifying transcript:", error)
      toast({
        title: "Verification Error",
        description: "Failed to verify transcript. Please try again.",
        variant: "destructive"
      })
      setVerificationResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTranscript = () => {
    if (!verificationResult) return

    const transcriptData = {
      studentHash: verificationResult.transcriptHash,
      verificationTimestamp: verificationResult.lastVerified,
      institutionVerified: verificationResult.institutionVerified,
      gpa: verificationResult.gpa,
      totalCredits: verificationResult.totalCredits,
      courses: verificationResult.courses
    }

    const dataStr = JSON.stringify(transcriptData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `transcript_${studentHash.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Transcript Downloaded",
      description: "The verified transcript has been downloaded as JSON.",
    })
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">External Institution Portal</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Verification Portal</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Student Transcript Verification</h2>
          <p className="text-muted-foreground">
            Verify student academic records directly from the Algorand blockchain using their unique hash identifier
          </p>
        </div>

        {/* Verification Form */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5" />
              <span>Verify Student Transcript</span>
            </CardTitle>
            <CardDescription>
              Enter the student's unique blockchain hash to retrieve their verified academic record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentHash">Student Hash *</Label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    id="studentHash"
                    placeholder="Enter student blockchain hash (e.g., a1b2c3d4e5f6...)"
                    value={studentHash}
                    onChange={(e) => setStudentHash(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleVerifyTranscript}
                  disabled={isLoading || !studentHash.trim()}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">How it works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each student has a unique hash identifier generated when they're onboarded</li>
                <li>• This hash is linked to their immutable academic record on the Algorand blockchain</li>
                <li>• Verification ensures the data hasn't been tampered with and comes from authorized institutions</li>
                <li>• All academic records are cryptographically signed and timestamped</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Verification Results */}
        {verificationResult && (
          <div className="space-y-6">
            {/* Verification Status */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {verificationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Verification {verificationResult.isValid ? 'Successful' : 'Failed'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    {verificationResult.studentExists ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Student Record Exists</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {verificationResult.institutionVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Institution Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Blockchain Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      {new Date(verificationResult.lastVerified).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Transcript Hash:</span>
                    <code className="ml-2 bg-muted px-2 py-1 rounded text-xs font-mono">
                      {verificationResult.transcriptHash}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Summary */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Academic Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{verificationResult.gpa}</div>
                    <div className="text-sm text-muted-foreground">Cumulative GPA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{verificationResult.totalCredits}</div>
                    <div className="text-sm text-muted-foreground">Total Credits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{verificationResult.courses.length}</div>
                    <div className="text-sm text-muted-foreground">Courses Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Details */}
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Course Records</span>
                  </CardTitle>
                  <CardDescription>
                    Complete academic transcript with course details and grades
                  </CardDescription>
                </div>
                <Button onClick={handleDownloadTranscript} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Transcript
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verificationResult.courses.map((course, index) => (
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
                          <div className="text-sm font-medium">{course.gradePoints} pts</div>
                          <div className="text-xs text-muted-foreground">Grade Points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {verificationResult.courses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No courses found for this student.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="border-border mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Need Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">How to get a student hash:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Contact the issuing institution directly</li>
                  <li>• Students can provide their hash from their academic portal</li>
                  <li>• The hash is generated when a student is first onboarded to the blockchain</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Verification guarantees:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All data is cryptographically verified on the Algorand blockchain</li>
                  <li>• Records cannot be modified once written to the blockchain</li>
                  <li>• Institution signatures ensure authenticity</li>
                  <li>• Timestamps provide immutable audit trails</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
