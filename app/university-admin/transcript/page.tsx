"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Trash2, 
  Eye,
  UserPlus,
  BookOpen,
  Hash,
  CheckCircle,
  Award,
  Save
} from "lucide-react"
import { transcriptService, CourseRecord } from "@/lib/transcript-service"
import { fileStorageService } from "@/lib/file-storage-service"
import { useToast } from "@/components/ui/use-toast"

interface OnboardStudentForm {
  firstName: string
  lastName: string
  dateOfBirth: string
  degreeProgram: string
}

interface CourseForm {
  courseName: string
  credits: number
  semester: string
  year: number
  grade: string
  instructor: string
  department: string
  completionDate: string
  gradePoints?: number
}

export default function TranscriptManagementPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [studentHash, setStudentHash] = useState("")
  const [showStudentHash, setShowStudentHash] = useState(false)
  const [searchStudentHash, setSearchStudentHash] = useState("")
  const [courses, setCourses] = useState<CourseForm[]>([])
  const [verifiedStudent, setVerifiedStudent] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  const [studentForm, setStudentForm] = useState<OnboardStudentForm>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    degreeProgram: ""
  })

  const [courseForm, setCourseForm] = useState<CourseForm>({
    courseName: "",
    credits: 3,
    semester: "",
    year: new Date().getFullYear(),
    grade: "",
    instructor: "",
    department: "",
    completionDate: ""
  })

  const { isConnected, accountAddress } = useWallet()

  const handleVerifyStudent = async () => {
    if (!searchStudentHash.trim()) {
      toast({
        title: "Student Hash Required",
        description: "Please enter a student hash to verify.",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    try {
      const verificationResult = await transcriptService.verifyTranscript(searchStudentHash)
      
      if (verificationResult.studentExists) {
        const studentDetails = await fileStorageService.getStudent(searchStudentHash)
        
        setVerifiedStudent({
          hash: searchStudentHash,
          details: studentDetails,
          verification: verificationResult
        })
        
        toast({
          title: "Student Verified!",
          description: `Found ${verificationResult.courses?.length || 0} courses with GPA ${verificationResult.gpa}`,
        })
      } else {
        setVerifiedStudent(null)
        toast({
          title: "Student Not Found",
          description: "No student found with this hash.",
          variant: "destructive"
        })
      }
    } catch (error) {
      setVerifiedStudent(null)
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleOnboardStudentWithCourse = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to onboard students.",
        variant: "destructive"
      })
      return
    }

    if (!studentForm.firstName || !studentForm.lastName || !studentForm.dateOfBirth) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required student information fields.",
        variant: "destructive"
      })
      return
    }

    if (!courseForm.courseName || !courseForm.grade || !courseForm.credits) {
      toast({
        title: "Course Information Required",
        description: "Please fill in course name, grade, and credits.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await transcriptService.onboardStudent(
        {
          firstName: studentForm.firstName,
          lastName: studentForm.lastName,
          dateOfBirth: studentForm.dateOfBirth,
          nationalId: ""
        },
        {
          id: "UNIV001",
          name: "University College"
        },
        accountAddress!
      )

      setStudentHash(result.studentHash)
      
      const gradePoints = transcriptService.calculateGradePoints(courseForm.grade)
      const courseWithGradePoints = { ...courseForm, gradePoints }
      
      await transcriptService.updateTranscript(
        result.studentHash,
        [courseWithGradePoints],
        accountAddress!
      )
      
      toast({
        title: "Student Onboarded with Course Successfully!",
        description: `Student and course ${courseForm.courseName} added to blockchain`,
      })

      setStudentForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        degreeProgram: ""
      })
      
      setCourseForm({
        courseName: "",
        credits: 3,
        semester: "",
        year: new Date().getFullYear(),
        grade: "",
        instructor: "",
        department: "",
        completionDate: ""
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to onboard student. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index))
    toast({
      title: "Course Removed",
      description: "Course has been removed from the transcript.",
    })
  }

  const handleUpdateTranscript = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to update transcripts.",
        variant: "destructive"
      })
      return
    }

    if (!searchStudentHash) {
      toast({
        title: "Student Hash Required",
        description: "Please enter the student hash to update their transcript.",
        variant: "destructive"
      })
      return
    }

    if (courses.length === 0) {
      toast({
        title: "No Courses Added",
        description: "Please add at least one course before updating the transcript.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const courseRecords: CourseRecord[] = courses.map(course => ({
        ...course,
        gradePoints: transcriptService.calculateGradePoints(course.grade)
      }))

      const result = await transcriptService.updateTranscript(
        searchStudentHash,
        courseRecords,
        accountAddress!
      )

      toast({
        title: "Transcript Updated Successfully",
        description: `Transaction ID: ${result.txId}`,
      })

      setCourses([])

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transcript. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateGPA = () => {
    if (courses.length === 0) return "0.00"
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
    const weightedSum = courses.reduce((sum, course) => {
      const gradePoints = transcriptService.calculateGradePoints(course.grade)
      return sum + (gradePoints * course.credits)
    }, 0)
    return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-foreground">Transcript Management</h2>
          
          <div className="flex space-x-2">
            <Link href="/university-admin">
              <Button variant="outline" className="min-w-[140px]">
                <Award className="h-4 w-4 mr-2" />
                Badge Management
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Student Lookup</span>
              </CardTitle>
              <CardDescription>
                Enter the student's blockchain hash to manage their transcript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter student hash..."
                    value={searchStudentHash}
                    onChange={(e) => setSearchStudentHash(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={handleVerifyStudent}
                  disabled={isVerifying || !searchStudentHash.trim()}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isVerifying ? "Verifying..." : "Verify Student"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {verifiedStudent && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Student Verified</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-700">Student Name</p>
                      <p className="text-green-600">
                        {verifiedStudent.details?.personalInfo?.firstName} {verifiedStudent.details?.personalInfo?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Degree Program</p>
                      <p className="text-green-600">{verifiedStudent.details?.personalInfo?.degreeProgram}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-700">Current GPA</p>
                      <p className="text-lg font-semibold text-green-600">{verifiedStudent.verification.gpa}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Total Credits</p>
                      <p className="text-lg font-semibold text-green-600">{verifiedStudent.verification.totalCredits}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">Courses Completed</p>
                      <p className="text-lg font-semibold text-green-600">{verifiedStudent.verification.courses?.length || 0}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Student Hash</p>
                    <p className="font-mono text-xs text-green-600 break-all">{verifiedStudent.hash}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Onboard New Student with Course</span>
              </CardTitle>
              <CardDescription>
                Create a new student record and add their first course completion to the Algorand blockchain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({...studentForm, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({...studentForm, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={studentForm.dateOfBirth}
                    onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="degreeProgram">Degree Program (Optional)</Label>
                  <Select 
                    value={studentForm.degreeProgram} 
                    onValueChange={(value) => setStudentForm({...studentForm, degreeProgram: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="software-engineering">Software Engineering</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="business">Business Administration</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>First Course Completion</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courseName">Course Name *</Label>
                      <Input
                        id="courseName"
                        placeholder="e.g., Introduction to Computer Science"
                        value={courseForm.courseName}
                        onChange={(e) => setCourseForm({...courseForm, courseName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="credits">Credits *</Label>
                      <Input
                        id="credits"
                        type="number"
                        min="1"
                        max="10"
                        value={courseForm.credits || ""}
                        onChange={(e) => setCourseForm({...courseForm, credits: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grade">Grade *</Label>
                      <Select 
                        value={courseForm.grade} 
                        onValueChange={(value) => setCourseForm({...courseForm, grade: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="C+">C+</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C-">C-</SelectItem>
                          <SelectItem value="D+">D+</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="semester">Semester (Optional)</Label>
                      <Select 
                        value={courseForm.semester} 
                        onValueChange={(value) => setCourseForm({...courseForm, semester: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fall">Fall</SelectItem>
                          <SelectItem value="Spring">Spring</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                          <SelectItem value="Winter">Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="instructor">Instructor (Optional)</Label>
                      <Input
                        id="instructor"
                        placeholder="e.g., Dr. Smith"
                        value={courseForm.instructor}
                        onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department (Optional)</Label>
                      <Input
                        id="department"
                        placeholder="e.g., Computer Science"
                        value={courseForm.department}
                        onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="completionDate">Completion Date (Optional)</Label>
                      <Input
                        id="completionDate"
                        type="date"
                        value={courseForm.completionDate}
                        onChange={(e) => setCourseForm({...courseForm, completionDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleOnboardStudentWithCourse} 
                  disabled={isLoading || !isConnected}
                  className="min-w-[250px]"
                >
                  {isLoading ? "Onboarding..." : "Onboard Student with Course"}
                </Button>
              </div>

              {studentHash && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">Student Successfully Onboarded!</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowStudentHash(!showStudentHash)}
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            {showStudentHash ? "Hide" : "View"} Student Hash
                          </Button>
                          {showStudentHash && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(studentHash)
                                toast({
                                  title: "Copied!",
                                  description: "Student hash copied to clipboard",
                                })
                              }}
                            >
                              Copy
                            </Button>
                          )}
                        </div>
                        {showStudentHash && (
                          <div className="bg-green-100 px-3 py-2 rounded">
                            <p className="text-xs font-medium text-green-700 mb-1">Student Hash:</p>
                            <code className="text-xs font-mono text-green-800 break-all">
                              {studentHash}
                            </code>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-green-600 mt-2">
                        {showStudentHash 
                          ? "This is the unique identifier for this student on the blockchain." 
                          : "Student record created successfully. You can view the blockchain hash above if needed."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {courses.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Pending Courses</CardTitle>
                <CardDescription>
                  Courses to be added to the transcript (GPA: {calculateGPA()})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-sm text-muted-foreground">
                          Grade: {course.grade} | Credits: {course.credits} | {course.semester} {course.year}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCourse(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button onClick={handleUpdateTranscript} disabled={isLoading || !isConnected}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Updating..." : "Update Transcript"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
