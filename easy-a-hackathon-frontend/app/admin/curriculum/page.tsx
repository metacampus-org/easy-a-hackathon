"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, ArrowLeft, Plus, BookOpen, Edit, Trash2, Save, X } from "lucide-react"
import { CurriculumSync } from "@/components/curriculum-sync"

interface Course {
  id: string
  name: string
  code: string
  instructor: string
  department: string
  credits: number
  semester: string
  learningOutcomes: string[]
  description: string
}

interface LearningOutcome {
  id: string
  courseId: string
  outcome: string
  category: string
}

export default function CurriculumManagement() {
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [editingCourse, setEditingCourse] = useState<string | null>(null)

  // Import courses from JSON
  const [courses, setCourses] = useState<Course[]>(coursesData.courses as Course[] || [
    {
      id: "1",
      name: "Introduction to Computer Science",
      code: "CS101",
      instructor: "Dr. Smith",
      department: "Computer Science",
      credits: 3,
      semester: "Fall 2024",
      learningOutcomes: [
        "Understand fundamental programming concepts",
        "Apply problem-solving techniques using algorithms",
        "Demonstrate proficiency in a programming language",
      ],
      description: "An introductory course covering basic programming concepts and problem-solving techniques.",
    },
    {
      id: "2",
      name: "Calculus II",
      code: "MATH201",
      instructor: "Prof. Johnson",
      department: "Mathematics",
      credits: 4,
      semester: "Fall 2024",
      learningOutcomes: [
        "Apply integration techniques to solve complex problems",
        "Understand sequences and series convergence",
        "Solve differential equations using various methods",
      ],
      description: "Advanced calculus covering integration techniques, sequences, series, and differential equations.",
    },
  ])

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    learningOutcomes: [],
  })

  const handleAddCourse = () => {
    if (newCourse.name && newCourse.code && newCourse.instructor) {
      const course: Course = {
        id: Date.now().toString(),
        name: newCourse.name,
        code: newCourse.code,
        instructor: newCourse.instructor,
        department: newCourse.department || "",
        credits: newCourse.credits || 3,
        semester: newCourse.semester || "",
        learningOutcomes: newCourse.learningOutcomes || [],
        description: newCourse.description || "",
      }

      setCourses((prev) => [...prev, course])
      setNewCourse({ learningOutcomes: [] })
      setIsAddingCourse(false)
    }
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId))
  }

  const addLearningOutcome = (courseData: Partial<Course>, outcome: string) => {
    if (outcome.trim()) {
      const outcomes = courseData.learningOutcomes || []
      return { ...courseData, learningOutcomes: [...outcomes, outcome.trim()] }
    }
    return courseData
  }

  const removeLearningOutcome = (courseData: Partial<Course>, index: number) => {
    const outcomes = courseData.learningOutcomes || []
    return { ...courseData, learningOutcomes: outcomes.filter((_, i) => i !== index) }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Curriculum Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Course & Learning Outcomes</h2>
            <p className="text-muted-foreground">Manage curriculum data for badge verification</p>
          </div>
          <Button onClick={() => setIsAddingCourse(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        <div className="mb-8">
          <CurriculumSync />
        </div>

        {/* Add Course Form */}
        {isAddingCourse && (
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle>Add New Course</CardTitle>
              <CardDescription>Enter course details and learning outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    placeholder="e.g., Introduction to Computer Science"
                    value={newCourse.name || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    placeholder="e.g., CS101"
                    value={newCourse.code || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    placeholder="e.g., Dr. Smith"
                    value={newCourse.instructor || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, instructor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={newCourse.department || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    placeholder="3"
                    value={newCourse.credits || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, credits: Number.parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    placeholder="e.g., Fall 2024"
                    value={newCourse.semester || ""}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, semester: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the course..."
                  value={newCourse.description || ""}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label>Learning Outcomes</Label>
                <div className="space-y-2">
                  {(newCourse.learningOutcomes || []).map((outcome, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={outcome} readOnly className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewCourse((prev) => removeLearningOutcome(prev, index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a learning outcome..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement
                          setNewCourse((prev) => addLearningOutcome(prev, target.value))
                          target.value = ""
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector("input")
                        if (input?.value) {
                          setNewCourse((prev) => addLearningOutcome(prev, input.value))
                          input.value = ""
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCourse}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Course
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses List */}
        <div className="space-y-6">
          {courses.map((course) => (
            <Card key={course.id} className="border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <CardDescription>
                        {course.code} • {course.instructor} • {course.department}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{course.credits} Credits</Badge>
                    <Badge variant="outline">{course.semester}</Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{course.description}</p>

                  <div>
                    <h5 className="font-medium text-foreground mb-2">Learning Outcomes:</h5>
                    <ul className="space-y-1">
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <Card className="border-border">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first course to the curriculum.</p>
              <Button onClick={() => setIsAddingCourse(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
