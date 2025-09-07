import { type NextRequest, NextResponse } from "next/server"
import { BlockchainService } from "@/lib/blockchain-service"

export async function POST(request: NextRequest) {
  try {
    const { studentId, courseId, learningOutcomes, institutionId } = await request.json()

    if (!studentId || !courseId || !learningOutcomes || !institutionId) {
      return NextResponse.json({ error: "All badge parameters are required" }, { status: 400 })
    }

    // Mint badge on blockchain
    const result = await BlockchainService.mintBadge(studentId, courseId, learningOutcomes, institutionId)

    return NextResponse.json({
      success: true,
      txId: result.txId,
      badgeHash: result.badgeHash,
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
