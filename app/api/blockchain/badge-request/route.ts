import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId, additionalInfo } = await request.json()

    if (!studentId || !courseId) {
      return NextResponse.json({ error: "Student ID and Course ID are required" }, { status: 400 })
    }

    // Generate mock transaction ID for demo
    const txId = `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

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
