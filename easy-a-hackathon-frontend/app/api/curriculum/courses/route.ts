import { type NextRequest, NextResponse } from "next/server"
import type { CurriculumCourse } from "@/lib/curriculum-api"

import coursesData from '@/data/json/courses.json'

// Use imported courses data
const courses: CurriculumCourse[] = coursesData.courses as CurriculumCourse[] || [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Computer Science",
    description: "An introductory course covering basic programming concepts and problem-solving techniques.",
    credits: 3,
    department: "Computer Science",
    instructor: "Dr. Smith",
    semester: "Fall 2024",
    prerequisites: [],
    learningObjectives: [
      {
        id: "1",
        courseId: "1",
        objective: "Understand fundamental programming concepts",
        category: "knowledge",
        assessmentMethod: "Written exam and programming assignments",
        proficiencyLevel: "beginner",
        bloomsTaxonomy: "Understanding",
      },
      {
        id: "2",
        courseId: "1",
        objective: "Apply problem-solving techniques using algorithms",
        category: "application",
        assessmentMethod: "Programming projects",
        proficiencyLevel: "intermediate",
        bloomsTaxonomy: "Application",
      },
    ],
    assessmentMethods: ["Exams", "Programming Assignments", "Projects"],
    gradingCriteria: [
      {
        id: "1",
        name: "Exams",
        weight: 40,
        description: "Midterm and final examinations",
        passingGrade: 70,
      },
      {
        id: "2",
        name: "Assignments",
        weight: 35,
        description: "Programming assignments and homework",
        passingGrade: 70,
      },
      {
        id: "3",
        name: "Projects",
        weight: 25,
        description: "Final project and lab work",
        passingGrade: 70,
      },
    ],
  },
]

export async function GET() {
  try {
    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json()

    const newCourse: CurriculumCourse = {
      id: Date.now().toString(),
      ...courseData,
      learningObjectives: courseData.learningObjectives || [],
      assessmentMethods: courseData.assessmentMethods || [],
      gradingCriteria: courseData.gradingCriteria || [],
      prerequisites: courseData.prerequisites || [],
    }

    courses.push(newCourse)

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
