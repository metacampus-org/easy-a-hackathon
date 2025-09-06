import { type NextRequest, NextResponse } from "next/server"
import { BlockchainService } from "@/lib/blockchain-service"

export async function POST(request: NextRequest) {
  try {
    const { badgeHash, studentId } = await request.json()

    if (!badgeHash || !studentId) {
      return NextResponse.json({ error: "Badge hash and Student ID are required" }, { status: 400 })
    }

    // Verify badge on blockchain
    const verificationResult = await BlockchainService.verifyBadge(badgeHash, studentId)

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      message: "Badge verification completed",
    })
  } catch (error) {
    console.error("Error verifying badge:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to verify badge",
        success: false,
      },
      { status: 500 },
    )
  }
}
