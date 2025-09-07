"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Shield, Users, Award, Clock, CheckCircle, XCircle, Search, ArrowLeft, Eye, Check, X } from "lucide-react"

interface BadgeRequest {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  courseId: string
  courseName: string
  instructor: string
  semester: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
  enrollmentVerified: boolean
  completionVerified: boolean
  gpa?: number
}

interface InstitutionStats {
  totalRequests: number
  pendingRequests: number
  approvedBadges: number
  rejectedRequests: number
  activeStudents: number
  totalCourses: number
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Mock data for badge requests
  const [badgeRequests, setBadgeRequests] = useState<BadgeRequest[]>([
    {
      id: "1",
      studentId: "STU001",
      studentName: "John Doe",
      studentEmail: "john.doe@university.edu",
      courseId: "CS101",
      courseName: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      semester: "Fall 2024",
      requestDate: "2024-12-01",
      status: "pending",
      enrollmentVerified: true,
      completionVerified: true,
      gpa: 3.8,
    },
    {
      id: "2",
      studentId: "STU002",
      studentName: "Jane Smith",
      studentEmail: "jane.smith@university.edu",
      courseId: "MATH201",
      courseName: "Calculus II",
      instructor: "Prof. Johnson",
      semester: "Fall 2024",
      requestDate: "2024-11-28",
      status: "pending",
      enrollmentVerified: true,
      completionVerified: false,
      gpa: 3.5,
    },
    {
      id: "3",
      studentId: "STU003",
      studentName: "Mike Wilson",
      studentEmail: "mike.wilson@university.edu",
      courseId: "ENG102",
      courseName: "Advanced Writing",
      instructor: "Dr. Williams",
      semester: "Fall 2024",
      requestDate: "2024-11-25",
      status: "approved",
      enrollmentVerified: true,
      completionVerified: true,
      gpa: 3.9,
    },
  ])

  // Mock institution statistics
  const stats: InstitutionStats = {
    totalRequests: 156,
    pendingRequests: badgeRequests.filter((req) => req.status === "pending").length,
    approvedBadges: 142,
    rejectedRequests: 12,
    activeStudents: 1250,
    totalCourses: 89,
  }

  const handleApprove = (requestId: string) => {
    setBadgeRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: "approved" as const } : req)),
    )
  }

  const handleReject = (requestId: string) => {
    setBadgeRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)),
    )
  }

  const filteredRequests = badgeRequests.filter((request) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.courseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.courseName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        )
      default:
        return null
    }
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
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">University Admin</span>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Badge Management Dashboard</h2>
          <p className="text-muted-foreground">Review and approve student badge requests</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending Requests
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.pendingRequests}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Approved Badges
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.approvedBadges}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Students
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.activeStudents}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Total Requests
              </CardTitle>
              <div className="text-2xl font-bold text-foreground">{stats.totalRequests}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="requests">Badge Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Badge Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Filter Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student name, course ID, or course name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("pending")}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={statusFilter === "approved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("approved")}
                    >
                      Approved
                    </Button>
                    <Button
                      variant={statusFilter === "rejected" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("rejected")}
                    >
                      Rejected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Badge Requests Queue</CardTitle>
                <CardDescription>
                  Review and process student badge requests ({filteredRequests.length} results)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border border-border rounded-lg p-6 space-y-4">
                      {/* Request Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <h4 className="font-semibold text-foreground">{request.studentName}</h4>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Requested: {new Date(request.requestDate).toLocaleDateString()}</p>
                          <p>ID: {request.studentId}</p>
                        </div>
                      </div>

                      {/* Course Information */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-foreground mb-2">Course Details</h5>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Course:</span> {request.courseId} - {request.courseName}
                              </p>
                              <p>
                                <span className="font-medium">Instructor:</span> {request.instructor}
                              </p>
                              <p>
                                <span className="font-medium">Semester:</span> {request.semester}
                              </p>
                              {request.gpa && (
                                <p>
                                  <span className="font-medium">GPA:</span> {request.gpa}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-foreground mb-2">Verification Status</h5>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                {request.enrollmentVerified ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">Enrollment Verified</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {request.completionVerified ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">Course Completion Verified</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {request.status === "pending" && (
                        <div className="flex justify-end space-x-3">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={!request.enrollmentVerified || !request.completionVerified}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve Badge
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No badge requests found matching your criteria.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Request Trends</CardTitle>
                  <CardDescription>Badge request activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Top Courses</CardTitle>
                  <CardDescription>Most requested badge courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CS101 - Intro to Computer Science</span>
                      <Badge variant="secondary">24 requests</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">MATH201 - Calculus II</span>
                      <Badge variant="secondary">18 requests</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ENG102 - Advanced Writing</span>
                      <Badge variant="secondary">15 requests</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
