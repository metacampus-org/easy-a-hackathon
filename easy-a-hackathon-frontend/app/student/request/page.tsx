"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, Send, AlertCircle } from "lucide-react"
import { badgeService } from "@/lib/badge-service"
import { useWallet } from "@/contexts/wallet-context"

interface Course {
  id: string
  name: string
  instructor: string
  semester: string
  completed: boolean
}

export default function BadgeRequestPage() {
  const router = useRouter()
  const { accountAddress, userRole } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")

  // Mock completed courses data
  const completedCourses: Course[] = [
    {
      id: "CS101",
      name: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      semester: "Fall 2024",
      completed: true,
    },
    {
      id: "MATH201",
      name: "Calculus II",
      instructor: "Prof. Johnson",
      semester: "Fall 2024",
      completed: true,
    },
    {
      id: "ENG102",
      name: "Advanced Writing",
      instructor: "Dr. Williams",
      semester: "Fall 2024",
      completed: true,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourse) {
      return
    }

    setIsSubmitting(true)

    try {
      if (!accountAddress) {
        alert("Please connect your wallet to submit a badge request.")
        setIsSubmitting(false)
        return
      }

      // Check if user is trying to use admin wallet for student request
      const MAIN_ADMIN_WALLET = "N4HTLJPU5CSTE475XZ42LHWPVTTR4S2L35Y2YD4VFM6V4DUJPMCWFMTNF4";
      if (accountAddress === MAIN_ADMIN_WALLET) {
        alert("Access Denied: The main admin wallet cannot create badge requests. Please use a different wallet for student activities.")
        setIsSubmitting(false)
        return
      }

      console.log(`🎓 Student badge request initiated by: ${accountAddress}`)
      console.log(`📚 Course: ${selectedCourse} - ${selectedCourseData?.name}`)

      // Create badge request using BadgeService
      const { requestId, txId } = await badgeService.createBadgeRequest(
        accountAddress, // Use actual wallet address as student hash
        selectedCourse,
        selectedCourseData?.name || "Unknown Course",
        additionalInfo
      )

      console.log("Badge request submitted for course:", selectedCourse)
      console.log("Request ID:", requestId)
      if (txId) console.log("Blockchain TX ID:", txId)

      // Redirect back to dashboard
      router.push("/student?tab=requests")
    } catch (error) {
      console.error("Error submitting badge request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCourseData = completedCourses.find((course) => course.id === selectedCourse)

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Decentralized Proof of Knowledge</h2>
          <p className="text-muted-foreground mb-4">
            Generate zero-knowledge proofs of your academic achievements without revealing sensitive information
          </p>
          
          {/* ZKP Information Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Zero-Knowledge Verification</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Prove your knowledge and course completion without exposing personal data or sensitive academic records.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="font-semibold text-blue-900">Completeness</div>
                      <div className="text-blue-700">If you completed the course, you can always prove it</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="font-semibold text-blue-900">Soundness</div>
                      <div className="text-blue-700">False claims cannot convince the verifier</div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <div className="font-semibold text-blue-900">Zero-Knowledge</div>
                      <div className="text-blue-700">Only proof validity is revealed, nothing more</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Generate Knowledge Proof</CardTitle>
            <CardDescription>
              Create a cryptographic proof of your course completion that maintains privacy while enabling verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Selection */}
              <div className="space-y-2">
                <Label htmlFor="course">Select Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a completed course" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.id} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Details Display */}
              {selectedCourseData && (
                <Card className="bg-muted/30 border-border">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Course:</span>
                        <span className="text-muted-foreground">{selectedCourseData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Instructor:</span>
                        <span className="text-muted-foreground">{selectedCourseData.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Semester:</span>
                        <span className="text-muted-foreground">{selectedCourseData.semester}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ZKP Witness Information */}
              <div className="space-y-2">
                <Label htmlFor="additional-info">Proof Context (Optional)</Label>
                <Textarea
                  id="additional-info"
                  placeholder="Provide additional context that supports your knowledge claim without revealing sensitive details..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                />
              </div>

              {/* ZKP Process Alert */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your proof will be cryptographically verified without exposing your private academic data. 
                  The verifier will only learn that you completed the course, nothing more.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push("/student")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedCourse || isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating Proof...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Generate ZK Proof
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ZKP Process Information */}
        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Zero-Knowledge Proof Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Statement Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Your wallet creates a cryptographic statement: "I completed this course"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-green-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Witness Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    Your private academic data (the "witness") remains encrypted and hidden
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Cryptographic Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Verifiers confirm your proof without accessing your sensitive information
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-orange-600">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Blockchain Attestation</h4>
                  <p className="text-sm text-muted-foreground">
                    Your verified knowledge proof is permanently recorded on Algorand
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Privacy Guaranteed</span>
              </div>
              <p className="text-sm text-green-700">
                Your academic records, grades, and personal information remain completely private. 
                Only the mathematical proof of your knowledge is shared.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
