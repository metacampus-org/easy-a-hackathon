import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { requestId, adminAddress } = await request.json()

    if (!requestId || !adminAddress) {
      return NextResponse.json({ error: "Request ID and Admin address are required" }, { status: 400 })
    }

    // Generate mock transaction ID for demo
    const txId = `approve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      txId,
      message: "Badge request approved on blockchain",
    })
  } catch (error) {
    console.error("Error approving badge request:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to approve badge request",
        success: false,
      },
      { status: 500 },
    )
  }
}
