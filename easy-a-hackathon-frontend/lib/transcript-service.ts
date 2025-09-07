import algosdk from "algosdk"
import { algodClient } from "./algorand"
import { WalletService } from "./wallet"

// Transcript Data Interfaces
export interface StudentRecord {
  studentHash: string // Unique blockchain identifier
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationalId?: string
  }
  institutionId: string
  institutionName: string
  enrollmentDate: string
  status: "active" | "graduated" | "transferred" | "suspended"
  createdAt: number
  updatedAt: number
}

export interface CourseRecord {
  courseId: string
  courseName: string
  courseCode: string
  credits: number
  semester: string
  year: number
  grade: string
  gradePoints: number
  instructor: string
  department: string
  completionDate: string
}

export interface TranscriptData {
  studentHash: string
  courses: CourseRecord[]
  gpa: number
  totalCredits: number
  degreeProgram?: string
  graduationDate?: string
  honors?: string[]
  lastUpdated: number
}

export interface TranscriptVerificationResult {
  isValid: boolean
  studentExists: boolean
  transcriptHash: string
  institutionVerified: boolean
  lastVerified: string
  courses: CourseRecord[]
  gpa: number
  totalCredits: number
}

export interface BlockchainTransaction {
  txId: string
  type: "student_onboard" | "transcript_update" | "transcript_verify"
  status: "pending" | "confirmed" | "failed"
  timestamp: string
  details: any
}

// Smart Contract Application ID for Transcript Management
export const TRANSCRIPT_APP_ID = process.env.NEXT_PUBLIC_TRANSCRIPT_APP_ID
  ? Number.parseInt(process.env.NEXT_PUBLIC_TRANSCRIPT_APP_ID)
  : 0

export class TranscriptService {
  private static walletService = WalletService.getInstance()

  // Generate unique student hash
  static generateStudentHash(personalInfo: StudentRecord['personalInfo'], institutionId: string): string {
    const dataString = JSON.stringify({
      firstName: personalInfo.firstName.toLowerCase(),
      lastName: personalInfo.lastName.toLowerCase(),
      dateOfBirth: personalInfo.dateOfBirth,
      nationalId: personalInfo.nationalId,
      institutionId,
      timestamp: Date.now()
    })
    
    // Use browser-compatible hash generation
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)
    return Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Generate transcript hash for verification
  static generateTranscriptHash(transcriptData: TranscriptData): string {
    const dataString = JSON.stringify({
      studentHash: transcriptData.studentHash,
      courses: transcriptData.courses.sort((a, b) => a.courseId.localeCompare(b.courseId)),
      gpa: transcriptData.gpa,
      totalCredits: transcriptData.totalCredits,
      lastUpdated: transcriptData.lastUpdated
    })
    
    // Use browser-compatible hash generation
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)
    return Array.from(data).map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Onboard new student to blockchain
  static async onboardStudent(
    personalInfo: StudentRecord['personalInfo'],
    institutionInfo: { id: string; name: string },
    signerAddress: string
  ): Promise<{ txId: string; studentHash: string }> {
    try {
      const walletState = this.walletService.getWalletState()
      if (!walletState.isConnected) {
        throw new Error("Wallet not connected")
      }

      // Generate unique student hash
      const studentHash = this.generateStudentHash(personalInfo, institutionInfo.id)

      // Create student record
      const studentRecord: StudentRecord = {
        studentHash,
        personalInfo,
        institutionId: institutionInfo.id,
        institutionName: institutionInfo.name,
        enrollmentDate: new Date().toISOString(),
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      // Create application call transaction
      const suggestedParams = await algodClient.getTransactionParams().do()

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: signerAddress,
        appIndex: TRANSCRIPT_APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode("onboard_student"),
          new TextEncoder().encode(JSON.stringify(studentRecord))
        ],
        suggestedParams,
      })

      // For demo purposes - in production this would be signed by connected wallet
      const txId = appCallTxn.txID()

      // Record transaction
      this.walletService.addTransaction({
        type: "student_onboard",
        status: "pending",
        txId,
        details: { studentHash, institutionId: institutionInfo.id }
      })

      return { txId, studentHash }
    } catch (error) {
      console.error("Error onboarding student:", error)
      throw error
    }
  }

  // Add or update transcript data
  static async updateTranscript(
    studentHash: string,
    courses: CourseRecord[],
    signerAddress: string
  ): Promise<{ txId: string; transcriptHash: string }> {
    try {
      const walletState = this.walletService.getWalletState()
      if (!walletState.isConnected) {
        throw new Error("Wallet not connected")
      }

      // Calculate GPA and total credits
      const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
      const weightedSum = courses.reduce((sum, course) => sum + (course.gradePoints * course.credits), 0)
      const gpa = totalCredits > 0 ? Number((weightedSum / totalCredits).toFixed(2)) : 0

      // Create transcript data
      const transcriptData: TranscriptData = {
        studentHash,
        courses,
        gpa,
        totalCredits,
        lastUpdated: Date.now()
      }

      // Generate transcript hash
      const transcriptHash = this.generateTranscriptHash(transcriptData)

      // Create application call transaction
      const suggestedParams = await algodClient.getTransactionParams().do()

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: signerAddress,
        appIndex: TRANSCRIPT_APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode("update_transcript"),
          new TextEncoder().encode(JSON.stringify(transcriptData))
        ],
        suggestedParams,
      })

      // For demo purposes - in production this would be signed by connected wallet
      const txId = appCallTxn.txID()

      // Record transaction
      this.walletService.addTransaction({
        type: "transcript_update",
        status: "pending",
        txId,
        details: { studentHash, transcriptHash, coursesCount: courses.length }
      })

      return { txId, transcriptHash }
    } catch (error) {
      console.error("Error updating transcript:", error)
      throw error
    }
  }

  // Verify transcript by student hash
  static async verifyTranscript(studentHash: string): Promise<TranscriptVerificationResult> {
    try {
      // In production, this would query the Algorand smart contract
      // For demo, we'll simulate the verification process

      // Mock data - in production this would come from blockchain
      const mockTranscriptData: TranscriptData = {
        studentHash,
        courses: [
          {
            courseId: "CS101",
            courseName: "Introduction to Computer Science",
            courseCode: "CS101",
            credits: 3,
            semester: "Fall",
            year: 2023,
            grade: "A",
            gradePoints: 4.0,
            instructor: "Dr. Smith",
            department: "Computer Science",
            completionDate: "2023-12-15"
          },
          {
            courseId: "MATH201",
            courseName: "Calculus II",
            courseCode: "MATH201",
            credits: 4,
            semester: "Spring",
            year: 2024,
            grade: "B+",
            gradePoints: 3.3,
            instructor: "Prof. Johnson",
            department: "Mathematics",
            completionDate: "2024-05-15"
          }
        ],
        gpa: 3.65,
        totalCredits: 7,
        lastUpdated: Date.now()
      }

      const transcriptHash = this.generateTranscriptHash(mockTranscriptData)

      const verificationResult: TranscriptVerificationResult = {
        isValid: true,
        studentExists: true,
        transcriptHash,
        institutionVerified: true,
        lastVerified: new Date().toISOString(),
        courses: mockTranscriptData.courses,
        gpa: mockTranscriptData.gpa,
        totalCredits: mockTranscriptData.totalCredits
      }

      // Record verification transaction
      this.walletService.addTransaction({
        type: "transcript_verify",
        status: "confirmed",
        txId: `verify-${Date.now()}`,
        details: { studentHash, transcriptHash }
      })

      return verificationResult
    } catch (error) {
      console.error("Error verifying transcript:", error)
      throw error
    }
  }

  // Get all transactions related to transcripts
  static getTranscriptTransactions(): any[] {
    return this.walletService.getTransactions().filter(tx => 
      ['student_onboard', 'transcript_update', 'transcript_verify'].includes(tx.type)
    )
  }

  // Calculate grade points from letter grade
  static calculateGradePoints(grade: string): number {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    }
    return gradeMap[grade.toUpperCase()] || 0.0
  }

  // Validate course data
  static validateCourseData(course: Partial<CourseRecord>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!course.courseId?.trim()) errors.push("Course ID is required")
    if (!course.courseName?.trim()) errors.push("Course name is required")
    if (!course.courseCode?.trim()) errors.push("Course code is required")
    if (!course.credits || course.credits <= 0) errors.push("Valid credits value is required")
    if (!course.semester?.trim()) errors.push("Semester is required")
    if (!course.year || course.year < 1900 || course.year > 2100) errors.push("Valid year is required")
    if (!course.grade?.trim()) errors.push("Grade is required")
    if (!course.instructor?.trim()) errors.push("Instructor is required")
    if (!course.department?.trim()) errors.push("Department is required")
    if (!course.completionDate?.trim()) errors.push("Completion date is required")

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get wallet connection status
  static getWalletState() {
    return this.walletService.getWalletState()
  }

  // Connect wallet
  static async connectWallet(provider: "pera" | "myalgo" | "walletconnect"): Promise<boolean> {
    return await this.walletService.connectWallet(provider)
  }

  // Disconnect wallet
  static async disconnectWallet(): Promise<void> {
    await this.walletService.disconnectWallet()
  }
}
