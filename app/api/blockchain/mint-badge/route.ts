import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId, learningOutcomes, institutionId } = await request.json()

    if (!studentId || !courseId || !learningOutcomes || !institutionId) {
      return NextResponse.json({ error: "All badge parameters are required" }, { status: 400 })
    }

    // Generate mock transaction ID and badge hash for demo
    const txId = `mint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const badgeHash = `badge-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`

    return NextResponse.json({
      success: true,
      txId,
      badgeHash,
      message: "Badge minted successfully on blockchain",
    })
  } catch (error) {
    console.error("Error minting badge:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to mint badge",
        success: false,
      },
      { status: 500 },
    )
  }
}
