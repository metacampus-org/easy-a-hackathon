"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
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
  CheckCircle,
  Download,
  Upload
} from "lucide-react"
import { transcriptService, CourseRecord } from "@/lib/transcript-service"
import { badgeService } from "@/lib/badge-service"
import { fileStorageService } from "@/lib/file-storage-service"
import { useToast } from "@/components/ui/use-toast"
import { WalletButton } from "@/components/wallet-button"

interface OnboardStudentForm {
  firstName: string
  lastName: string
  dateOfBirth: string
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
  const [badgeRequests, setBadgeRequests] = useState<any[]>([])
  const [verifiedStudent, setVerifiedStudent] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  // Student onboarding form state
  const [studentForm, setStudentForm] = useState<OnboardStudentForm>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
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

  const { isConnected, accountAddress, userRole } = useWallet()

  // Load badge requests on component mount
  const loadBadgeRequests = async () => {
    try {
      const requests = await badgeService.getAllBadgeRequests()
      setBadgeRequests(requests)
    } catch (error) {
      console.error("Error loading badge requests:", error)
    }
  }

  // Load badge requests when tab changes to badge management
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "badges") {
      loadBadgeRequests()
    }
  }

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

    // Check if user has admin role and is using the main admin wallet
    const MAIN_ADMIN_WALLET = "N4HTLJPU5CSTE475XZ42LHWPVTTR4S2L35Y2YD4VFM6V4DUJPMCWFMTNF4";
    if (accountAddress !== MAIN_ADMIN_WALLET) {
      toast({
        title: "Access Denied",
        description: "Only the main university administrator wallet can approve badge requests.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("🎓 STARTING BADGE APPROVAL PROCESS")
      console.log("Request ID:", requestId)
      console.log("Admin Wallet:", accountAddress)
      console.log("Admin Role:", userRole)
      console.log("Timestamp:", new Date().toISOString())

      const result = await badgeService.approveBadgeRequest(requestId, accountAddress)
      
      console.log("🏆 BADGE APPROVAL SUCCESS!")
      console.log("🔐 Badge Hash (ON-CHAIN):", result.badgeHash)
      console.log("🔒 Verification Hash:", result.verificationHash)
      console.log("📡 Blockchain Transaction ID:", result.txId)
      console.log("✅ Badge successfully created and stored on blockchain!")

      toast({
        title: "Badge Approved Successfully!",
        description: `Badge hash: ${result.badgeHash.substring(0, 16)}...`,
      })

      // Reload badge requests to show updated status
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

  // Verify student by hash
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
      console.log("🔍 VERIFYING STUDENT")
      console.log("Student Hash:", searchStudentHash)
      console.log("Timestamp:", new Date().toISOString())

      // Use transcript service to verify student
      const verificationResult = await transcriptService.verifyTranscript(searchStudentHash)
      
      console.log("📋 Verification Result:", verificationResult)
      
      if (verificationResult.studentExists) {
        // Get student details from storage
        const studentDetails = await fileStorageService.getStudent(searchStudentHash)
        
        setVerifiedStudent({
          hash: searchStudentHash,
          details: studentDetails,
          verification: verificationResult
        })
        
        console.log("✅ STUDENT VERIFIED SUCCESSFULLY")
        console.log("Student Name:", studentDetails?.personalInfo?.firstName, studentDetails?.personalInfo?.lastName)
        console.log("GPA:", verificationResult.gpa)
        console.log("Total Credits:", verificationResult.totalCredits)
        console.log("Courses:", verificationResult.courses?.length || 0)
        
        toast({
          title: "Student Verified!",
          description: `Found ${verificationResult.courses?.length || 0} courses with GPA ${verificationResult.gpa}`,
        })
      } else {
        setVerifiedStudent(null)
        console.log("❌ STUDENT NOT FOUND")
        console.log("Hash searched:", searchStudentHash)
        
        toast({
          title: "Student Not Found",
          description: "No student found with this hash. Please check the hash or onboard the student first.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("❌ STUDENT VERIFICATION FAILED:", error)
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

  // Export data to JSON file
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      console.log("📤 STARTING DATA EXPORT")
      console.log("Timestamp:", new Date().toISOString())
      
      await fileStorageService.exportToFile()
      
      console.log("✅ DATA EXPORT COMPLETED")
      toast({
        title: "Data Exported Successfully!",
        description: "Your MetaCAMPUS data has been downloaded as a JSON file.",
      })
    } catch (error) {
      console.error("❌ DATA EXPORT FAILED:", error)
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Import data from JSON file
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      console.log("📥 STARTING DATA IMPORT")
      console.log("File:", file.name)
      console.log("Size:", file.size, "bytes")
      console.log("Timestamp:", new Date().toISOString())
      
      await fileStorageService.importFromFile(file)
      
      console.log("✅ DATA IMPORT COMPLETED")
      toast({
        title: "Data Imported Successfully!",
        description: `Data from ${file.name} has been imported into MetaCAMPUS.`,
      })

      // Refresh badge requests if on badges tab
      if (activeTab === "badges") {
        await loadBadgeRequests()
      }
    } catch (error) {
      console.error("❌ DATA IMPORT FAILED:", error)
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleOnboardStudent = async () => {
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

    // Log the onboarding attempt
    console.log("🎓 STUDENT ONBOARDING INITIATED")
    console.log("Admin Wallet:", accountAddress)
    console.log("Student Data:", {
      firstName: studentForm.firstName,
      lastName: studentForm.lastName,
      dateOfBirth: studentForm.dateOfBirth,
      nationalId: "",
      degreeProgram: studentForm.degreeProgram || "N/A"
    })
    console.log("Timestamp:", new Date().toISOString())

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
      
      // Log successful onboarding
      console.log("✅ STUDENT ONBOARDING SUCCESS")
      console.log("Generated Student Hash:", result.studentHash)
      console.log("Student Name:", `${studentForm.firstName} ${studentForm.lastName}`)
      console.log("Blockchain Transaction:", result.txId || "Simulated")
      
      toast({
        title: "Student Onboarded Successfully",
        description: `Student hash: ${result.studentHash.substring(0, 16)}...`,
      })

      // Reset form
      setStudentForm({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        degreeProgram: ""
      })

    } catch (error) {
      // Log the error
      console.error("❌ STUDENT ONBOARDING FAILED")
      console.error("Error Details:", error)
      console.error("Student Data:", studentForm)
      console.error("Admin Wallet:", accountAddress)
      
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

    const gradePoints = transcriptService.calculateGradePoints(courseForm.grade)
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
      // Convert courses to the required format
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
          
          {/* Data Management Controls */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={isExporting}
              className="min-w-[120px]"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button 
                variant="outline"
                disabled={isImporting}
                className="min-w-[120px]"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? "Importing..." : "Import Data"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="onboard">Student Onboarding</TabsTrigger>
            <TabsTrigger value="transcript">Transcript Management</TabsTrigger>
            <TabsTrigger value="badges">Badge Approval</TabsTrigger>
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
                <div className="grid md:grid-cols-3 gap-6">
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
                
                <div className="max-w-md">
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
                      <SelectItem value="software-engineering">Software Engineering</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="artificial-intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="statistics">Statistics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="electrical-engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                      <SelectItem value="chemical-engineering">Chemical Engineering</SelectItem>
                      <SelectItem value="biomedical-engineering">Biomedical Engineering</SelectItem>
                      <SelectItem value="business">Business Administration</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="accounting">Accounting</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="economics">Economics</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="psychology">Psychology</SelectItem>
                      <SelectItem value="sociology">Sociology</SelectItem>
                      <SelectItem value="political-science">Political Science</SelectItem>
                      <SelectItem value="international-relations">International Relations</SelectItem>
                      <SelectItem value="english">English Literature</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="philosophy">Philosophy</SelectItem>
                      <SelectItem value="art">Fine Arts</SelectItem>
                      <SelectItem value="graphic-design">Graphic Design</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="theater">Theater Arts</SelectItem>
                      <SelectItem value="communications">Communications</SelectItem>
                      <SelectItem value="journalism">Journalism</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="nursing">Nursing</SelectItem>
                      <SelectItem value="medicine">Medicine</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="law">Law</SelectItem>
                      <SelectItem value="architecture">Architecture</SelectItem>
                      <SelectItem value="environmental-science">Environmental Science</SelectItem>
                      <SelectItem value="geology">Geology</SelectItem>
                      <SelectItem value="anthropology">Anthropology</SelectItem>
                      <SelectItem value="linguistics">Linguistics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleOnboardStudent} 
                    disabled={isLoading || !isConnected}
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
                          <div className="flex items-start space-x-2">
                            <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono text-green-800 break-all max-w-full overflow-wrap-anywhere">
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

            {/* Student Verification Result */}
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
                      disabled={isLoading || !isConnected || !searchStudentHash}
                      className="min-w-[200px]"
                    >
                      {isLoading ? "Updating..." : "Update Transcript on Blockchain"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Badge Approval Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Badge Request Approval</span>
                </CardTitle>
                <CardDescription>
                  Review and approve student badge requests. Approved badges will be created on the blockchain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badgeRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No badge requests found</p>
                    <p className="text-sm">Students can request badges from their dashboard</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {badgeRequests.map((request) => (
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
                                <span>Course ID: {request.courseId}</span>
                                <span>Request Date: {new Date(request.requestDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Hash className="h-3 w-3" />
                                <span className="font-mono text-xs">{request.studentHash.substring(0, 16)}...</span>
                              </div>
                              {request.blockchainHash && (
                                <div className="flex items-center space-x-2 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span className="font-mono text-xs">Badge Hash: {request.blockchainHash.substring(0, 16)}...</span>
                                </div>
                              )}
                              {request.approvalDate && (
                                <div className="text-xs text-green-600">
                                  Approved: {new Date(request.approvalDate).toLocaleDateString()} by {request.adminWallet?.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          </div>
                          {request.status === 'pending' && (
                            <Button 
                              onClick={() => handleApproveBadge(request.id)}
                              disabled={isLoading || !isConnected}
                              className="min-w-[120px]"
                            >
                              {isLoading ? "Approving..." : "Approve Badge"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
