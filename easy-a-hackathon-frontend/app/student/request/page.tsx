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

interface Course {
  id: string
  name: string
  instructor: string
  semester: string
  completed: boolean
}

export default function BadgeRequestPage() {
  const router = useRouter()
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
      // Simulate API call to submit badge request
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real implementation, this would call AlgorandService.createBadgeRequest
      console.log("Badge request submitted for course:", selectedCourse)

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
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/student" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">New Badge Request</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Request a Badge</h2>
          <p className="text-muted-foreground">
            Submit a request to verify your course completion and receive a blockchain-verified credential
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Badge Request Form</CardTitle>
            <CardDescription>
              Select a completed course and provide any additional information for verification
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

              {/* Additional Information */}
              <div className="space-y-2">
                <Label htmlFor="additional-info">Additional Information (Optional)</Label>
                <Textarea
                  id="additional-info"
                  placeholder="Provide any additional context or special circumstances for this badge request..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Information Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your badge request will be verified against your enrollment records and course completion status.
                  Processing typically takes 1-3 business days.
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Process Information */}
        <Card className="mt-8 border-border">
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Your request will be verified against institutional records
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-accent">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Approval</h4>
                  <p className="text-sm text-muted-foreground">
                    Institution administrators will review and approve your request
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Badge Creation</h4>
                  <p className="text-sm text-muted-foreground">
                    Your verified badge will be minted on the Algorand blockchain
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
