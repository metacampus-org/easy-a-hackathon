import { type NextRequest, NextResponse } from "next/server"
import { BlockchainService } from "@/lib/blockchain-service"

export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId, additionalInfo } = await request.json()

    if (!studentId || !courseId) {
      return NextResponse.json({ error: "Student ID and Course ID are required" }, { status: 400 })
    }

    // Submit badge request to blockchain
    const txId = await BlockchainService.submitBadgeRequest(studentId, courseId, additionalInfo)

    return NextResponse.json({
      success: true,
      txId,
      message: "Badge request submitted to blockchain",
    })
  } catch (error) {
    console.error("Error submitting badge request:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to submit badge request",
        success: false,
      },
      { status: 500 },
    )
  }
}
