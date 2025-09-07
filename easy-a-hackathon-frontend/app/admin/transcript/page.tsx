"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  GraduationCap, 
  Plus, 
  ArrowLeft, 
  Save, 
  Trash2, 
  Eye,
  UserPlus,
  BookOpen,
  Hash,
  CheckCircle
} from "lucide-react"
import { TranscriptService, type StudentRecord, type CourseRecord } from "@/lib/transcript-service"
import { useToast } from "@/components/ui/use-toast"
import { WalletButton } from "@/components/wallet-button"

interface OnboardStudentForm {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationalId: string
  degreeProgram: string
}

interface CourseForm {
  courseId: string
  courseName: string
  courseCode: string
  credits: number
  semester: string
  year: number
  grade: string
  instructor: string
  department: string
  completionDate: string
  gradePoints?: number
}

export default function CollegeAdminPage() {
  const [activeTab, setActiveTab] = useState("onboard")
  const [isLoading, setIsLoading] = useState(false)
  const [studentHash, setStudentHash] = useState("")
  const [searchStudentHash, setSearchStudentHash] = useState("")
  const [courses, setCourses] = useState<CourseForm[]>([])
  const { toast } = useToast()

  // Student onboarding form state
  const [studentForm, setStudentForm] = useState<OnboardStudentForm>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationalId: "",
    degreeProgram: ""
  })

  // Course form state
  const [courseForm, setCourseForm] = useState<CourseForm>({
    courseId: "",
    courseName: "",
    courseCode: "",
    credits: 0,
    semester: "",
    year: new Date().getFullYear(),
    grade: "",
    instructor: "",
    department: "",
    completionDate: ""
  })

  const walletState = TranscriptService.getWalletState()

  const handleOnboardStudent = async () => {
    if (!walletState.isConnected) {
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

    setIsLoading(true)
    try {
      const result = await TranscriptService.onboardStudent(
        {
          firstName: studentForm.firstName,
          lastName: studentForm.lastName,
          dateOfBirth: studentForm.dateOfBirth,
          nationalId: studentForm.nationalId
        },
        {
          id: "UNIV001",
          name: "University College"
        },
        walletState.address!
      )

      setStudentHash(result.studentHash)
      
      toast({
        title: "Student Onboarded Successfully",
        description: `Student hash: ${result.studentHash.substring(0, 16)}...`,
      })

      // Reset form
      setStudentForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationalId: "",
        degreeProgram: ""
      })

    } catch (error) {
      console.error("Error onboarding student:", error)
      toast({
        title: "Error",
        description: "Failed to onboard student. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourse = () => {
    if (!courseForm.courseId || !courseForm.courseName || !courseForm.grade) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in course ID, name, and grade.",
        variant: "destructive"
      })
      return
    }

    const gradePoints = TranscriptService.calculateGradePoints(courseForm.grade)
    const newCourse: CourseForm = {
      ...courseForm,
      gradePoints
    }

    setCourses([...courses, newCourse])
    
    // Reset course form
    setCourseForm({
      courseId: "",
      courseName: "",
      courseCode: "",
      credits: 0,
      semester: "",
      year: new Date().getFullYear(),
      grade: "",
      instructor: "",
      department: "",
      completionDate: ""
    })

    toast({
      title: "Course Added",
      description: `${courseForm.courseId} has been added to the transcript.`,
    })
  }

  const handleRemoveCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index))
    toast({
      title: "Course Removed",
      description: "Course has been removed from the transcript.",
    })
  }

  const handleUpdateTranscript = async () => {
    if (!walletState.isConnected) {
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
      // Convert courses to the required format
      const courseRecords: CourseRecord[] = courses.map(course => ({
        ...course,
        gradePoints: TranscriptService.calculateGradePoints(course.grade)
      }))

      const result = await TranscriptService.updateTranscript(
        searchStudentHash,
        courseRecords,
        walletState.address!
      )

      toast({
        title: "Transcript Updated Successfully",
        description: `Transaction ID: ${result.txId}`,
      })

      // Clear the courses
      setCourses([])

    } catch (error) {
      console.error("Error updating transcript:", error)
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
    if (courses.length === 0) return 0
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
    const weightedSum = courses.reduce((sum, course) => {
      const gradePoints = TranscriptService.calculateGradePoints(course.grade)
      return sum + (gradePoints * course.credits)
    }, 0)
    return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00"
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Transcript Management</h2>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="onboard">Onboard Student</TabsTrigger>
            <TabsTrigger value="transcript">Manage Transcript</TabsTrigger>
          </TabsList>

          {/* Onboard Student Tab */}
          <TabsContent value="onboard" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Onboard New Student</span>
                </CardTitle>
                <CardDescription>
                  Create a new student record on the Algorand blockchain. This generates a unique, verifiable identifier.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
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
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={studentForm.dateOfBirth}
                        onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nationalId">National ID</Label>
                      <Input
                        id="nationalId"
                        placeholder="Enter national ID (optional)"
                        value={studentForm.nationalId}
                        onChange={(e) => setStudentForm({...studentForm, nationalId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="degreeProgram">Degree Program</Label>
                      <Select 
                        value={studentForm.degreeProgram} 
                        onValueChange={(value) => setStudentForm({...studentForm, degreeProgram: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select degree program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="computer-science">Computer Science</SelectItem>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="business">Business Administration</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleOnboardStudent} 
                    disabled={isLoading || !walletState.isConnected}
                    className="min-w-[200px]"
                  >
                    {isLoading ? "Onboarding..." : "Onboard Student"}
                  </Button>
                </div>

                {studentHash && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">Student Successfully Onboarded!</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-green-700">
                            <span className="font-medium">Student Hash:</span>
                          </p>
                          <div className="flex items-center space-x-2">
                            <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono text-green-800">
                              {studentHash}
                            </code>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigator.clipboard.writeText(studentHash)}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-green-600 mt-2">
                          Save this hash - it's the unique identifier for this student on the blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Transcript Tab */}
          <TabsContent value="transcript" className="space-y-6">
            {/* Student Search */}
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
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Verify Student
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Course */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Add Course to Transcript</span>
                </CardTitle>
                <CardDescription>
                  Add course completion records to the student's transcript
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="courseId">Course ID *</Label>
                    <Input
                      id="courseId"
                      placeholder="e.g., CS101"
                      value={courseForm.courseId}
                      onChange={(e) => setCourseForm({...courseForm, courseId: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseCode">Course Code *</Label>
                    <Input
                      id="courseCode"
                      placeholder="e.g., CS101"
                      value={courseForm.courseCode}
                      onChange={(e) => setCourseForm({...courseForm, courseCode: e.target.value})}
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

                <div>
                  <Label htmlFor="courseName">Course Name *</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Introduction to Computer Science"
                    value={courseForm.courseName}
                    onChange={(e) => setCourseForm({...courseForm, courseName: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="semester">Semester *</Label>
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
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="2020"
                      max="2030"
                      value={courseForm.year || ""}
                      onChange={(e) => setCourseForm({...courseForm, year: parseInt(e.target.value) || new Date().getFullYear()})}
                    />
                  </div>
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
                        <SelectItem value="D-">D-</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instructor">Instructor *</Label>
                    <Input
                      id="instructor"
                      placeholder="e.g., Dr. Smith"
                      value={courseForm.instructor}
                      onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      placeholder="e.g., Computer Science"
                      value={courseForm.department}
                      onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="completionDate">Completion Date *</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={courseForm.completionDate}
                    onChange={(e) => setCourseForm({...courseForm, completionDate: e.target.value})}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleAddCourse}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course List */}
            {courses.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Current Transcript ({courses.length} courses)</CardTitle>
                  <CardDescription>
                    Courses to be added to the blockchain transcript. Current GPA: {calculateGPA()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{course.courseId} - {course.courseName}</h4>
                              <Badge variant={course.grade.startsWith('A') ? 'default' : course.grade.startsWith('B') ? 'secondary' : 'outline'}>
                                {course.grade}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground grid md:grid-cols-2 gap-2">
                              <span>Credits: {course.credits}</span>
                              <span>Semester: {course.semester} {course.year}</span>
                              <span>Instructor: {course.instructor}</span>
                              <span>Department: {course.department}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveCourse(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={handleUpdateTranscript}
                      disabled={isLoading || !walletState.isConnected || !searchStudentHash}
                      className="min-w-[200px]"
                    >
                      {isLoading ? "Updating..." : "Update Transcript on Blockchain"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
