"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Award, Plus, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react"

interface BadgeRequest {
  id: string
  courseId: string
  courseName: string
  instructor: string
  semester: string
  status: "pending" | "approved" | "rejected"
  requestDate: string
  completionDate?: string
}

interface EarnedBadge {
  id: string
  courseId: string
  courseName: string
  instructor: string
  semester: string
  learningOutcomes: string[]
  issueDate: string
  badgeHash: string
}

export default function StudentDashboard() {
  const [badgeRequests, setBadgeRequests] = useState<BadgeRequest[]>([
    {
      id: "1",
      courseId: "CS101",
      courseName: "Introduction to Computer Science",
      instructor: "Dr. Smith",
      semester: "Fall 2024",
      status: "pending",
      requestDate: "2024-12-01",
    },
    {
      id: "2",
      courseId: "MATH201",
      courseName: "Calculus II",
      instructor: "Prof. Johnson",
      semester: "Fall 2024",
      status: "approved",
      requestDate: "2024-11-15",
      completionDate: "2024-12-05",
    },
  ])

  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([
    {
      id: "1",
      courseId: "MATH201",
      courseName: "Calculus II",
      instructor: "Prof. Johnson",
      semester: "Fall 2024",
      learningOutcomes: [
        "Apply integration techniques to solve complex problems",
        "Understand sequences and series convergence",
        "Solve differential equations using various methods",
      ],
      issueDate: "2024-12-05",
      badgeHash: "a1b2c3d4e5f6...",
    },
  ])

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
              <h1 className="text-xl font-bold text-foreground">Student Portal</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, John Doe</span>
            <Button variant="outline" size="sm">
              Disconnect Wallet
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">My Credentials Dashboard</h2>
          <p className="text-muted-foreground">Manage your educational badge requests and view earned credentials</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Badges</CardTitle>
              <div className="text-2xl font-bold text-foreground">{earnedBadges.length}</div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
              <div className="text-2xl font-bold text-foreground">
                {badgeRequests.filter((req) => req.status === "pending").length}
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Semester</CardTitle>
              <div className="text-2xl font-bold text-foreground">
                {earnedBadges.filter((badge) => badge.semester === "Fall 2024").length}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="requests">Badge Requests</TabsTrigger>
              <TabsTrigger value="badges">My Badges</TabsTrigger>
            </TabsList>

            <Link href="/student/request">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Badge Request
              </Button>
            </Link>
          </div>

          {/* Badge Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Recent Badge Requests</CardTitle>
                <CardDescription>Track the status of your submitted badge requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {badgeRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(request.status)}
                        <div>
                          <h4 className="font-medium text-foreground">{request.courseName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {request.courseId} • {request.instructor} • {request.semester}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(request.status)}
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
                <CardDescription>Your verified educational credentials on the Algorand blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {earnedBadges.map((badge) => (
                    <Card key={badge.id} className="border-border bg-muted/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <Award className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{badge.courseName}</CardTitle>
                              <CardDescription>
                                {badge.courseId} • {badge.instructor} • {badge.semester}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-foreground mb-2">Learning Outcomes Achieved:</h5>
                            <ul className="space-y-1">
                              {badge.learningOutcomes.map((outcome, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {outcome}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                              <p>Issued: {new Date(badge.issueDate).toLocaleDateString()}</p>
                              <p className="font-mono">Hash: {badge.badgeHash}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                Share
                              </Button>
                              <Button variant="outline" size="sm">
                                Verify
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
