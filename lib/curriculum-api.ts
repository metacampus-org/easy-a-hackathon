export interface StudentLearningObjective {
  id: string
  courseId: string
  objective: string
  category: "knowledge" | "skills" | "application" | "analysis" | "synthesis" | "evaluation"
  assessmentMethod: string
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert"
  bloomsTaxonomy: string
}

export interface CurriculumCourse {
  id: string
  code: string
  name: string
  description: string
  credits: number
  department: string
  instructor: string
  semester: string
  prerequisites: string[]
  learningObjectives: StudentLearningObjective[]
  assessmentMethods: string[]
  gradingCriteria: GradingCriteria[]
}

export interface GradingCriteria {
  id: string
  name: string
  weight: number
  description: string
  passingGrade: number
}

export interface StudentEnrollment {
  studentId: string
  courseId: string
  enrollmentDate: string
  status: "enrolled" | "completed" | "withdrawn" | "failed"
  finalGrade?: number
  completionDate?: string
  transcriptVerified: boolean
}

export interface CurriculumValidationResult {
  isValid: boolean
  enrollmentVerified: boolean
  completionVerified: boolean
  gradeVerified: boolean
  learningObjectivesMet: boolean
  errors: string[]
  warnings: string[]
}

// Curriculum Management Service
export class CurriculumService {
  private static baseUrl = process.env.NEXT_PUBLIC_CURRICULUM_API_URL || "/api/curriculum"

  // Course Management
  static async getCourses(): Promise<CurriculumCourse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/courses`)
      if (!response.ok) throw new Error("Failed to fetch courses")
      return await response.json()
    } catch (error) {
      console.error("Error fetching courses:", error)
      throw error
    }
  }

  static async getCourse(courseId: string): Promise<CurriculumCourse> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${courseId}`)
      if (!response.ok) throw new Error("Failed to fetch course")
      return await response.json()
    } catch (error) {
      console.error("Error fetching course:", error)
      throw error
    }
  }

  static async createCourse(course: Omit<CurriculumCourse, "id">): Promise<CurriculumCourse> {
    try {
      const response = await fetch(`${this.baseUrl}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      })
      if (!response.ok) throw new Error("Failed to create course")
      return await response.json()
    } catch (error) {
      console.error("Error creating course:", error)
      throw error
    }
  }

  static async updateCourse(courseId: string, course: Partial<CurriculumCourse>): Promise<CurriculumCourse> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      })
      if (!response.ok) throw new Error("Failed to update course")
      return await response.json()
    } catch (error) {
      console.error("Error updating course:", error)
      throw error
    }
  }

  // Student Learning Objectives Management
  static async getCourseLearningObjectives(courseId: string): Promise<StudentLearningObjective[]> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${courseId}/objectives`)
      if (!response.ok) throw new Error("Failed to fetch learning objectives")
      return await response.json()
    } catch (error) {
      console.error("Error fetching learning objectives:", error)
      throw error
    }
  }

  static async createLearningObjective(
    courseId: string,
    objective: Omit<StudentLearningObjective, "id" | "courseId">,
  ): Promise<StudentLearningObjective> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${courseId}/objectives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...objective, courseId }),
      })
      if (!response.ok) throw new Error("Failed to create learning objective")
      return await response.json()
    } catch (error) {
      console.error("Error creating learning objective:", error)
      throw error
    }
  }

  // Student Enrollment and Validation
  static async validateStudentEnrollment(studentId: string, courseId: string): Promise<CurriculumValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/validate/enrollment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId }),
      })
      if (!response.ok) throw new Error("Failed to validate enrollment")
      return await response.json()
    } catch (error) {
      console.error("Error validating enrollment:", error)
      throw error
    }
  }

  static async getStudentEnrollment(studentId: string, courseId: string): Promise<StudentEnrollment | null> {
    try {
      const response = await fetch(`${this.baseUrl}/enrollment/${studentId}/${courseId}`)
      if (response.status === 404) return null
      if (!response.ok) throw new Error("Failed to fetch enrollment")
      return await response.json()
    } catch (error) {
      console.error("Error fetching enrollment:", error)
      throw error
    }
  }

  static async validateCourseCompletion(studentId: string, courseId: string): Promise<CurriculumValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/validate/completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId }),
      })
      if (!response.ok) throw new Error("Failed to validate completion")
      return await response.json()
    } catch (error) {
      console.error("Error validating completion:", error)
      throw error
    }
  }

  // External CMS Integration
  static async syncWithExternalCMS(cmsType: "curriqunet" | "koali" | "other"): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sync/${cmsType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) throw new Error("Failed to sync with external CMS")
    } catch (error) {
      console.error("Error syncing with external CMS:", error)
      throw error
    }
  }

  // Badge Validation Integration
  static async validateBadgeRequest(studentId: string, courseId: string): Promise<CurriculumValidationResult> {
    try {
      // Comprehensive validation for badge requests
      const [enrollmentResult, completionResult] = await Promise.all([
        this.validateStudentEnrollment(studentId, courseId),
        this.validateCourseCompletion(studentId, courseId),
      ])

      const combinedResult: CurriculumValidationResult = {
        isValid: enrollmentResult.isValid && completionResult.isValid,
        enrollmentVerified: enrollmentResult.enrollmentVerified,
        completionVerified: completionResult.completionVerified,
        gradeVerified: completionResult.gradeVerified,
        learningObjectivesMet: completionResult.learningObjectivesMet,
        errors: [...enrollmentResult.errors, ...completionResult.errors],
        warnings: [...enrollmentResult.warnings, ...completionResult.warnings],
      }

      return combinedResult
    } catch (error) {
      console.error("Error validating badge request:", error)
      throw error
    }
  }
}
