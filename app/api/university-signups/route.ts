import { NextRequest, NextResponse } from 'next/server'
import { getSQLiteService } from '@/lib/sqlite-service'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    // Validate status filter if provided
    if (statusFilter && !['pending', 'approved', 'rejected'].includes(statusFilter)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status filter. Must be one of: pending, approved, rejected' 
        },
        { status: 400 }
      )
    }

    // Get SQLite service instance
    const sqliteService = getSQLiteService()

    // Fetch signups from SQLite with optional status filter
    let signups
    try {
      signups = sqliteService.getPendingSignups(statusFilter || undefined)
    } catch (error) {
      console.error('Error fetching signup requests:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch signup requests' 
        },
        { status: 500 }
      )
    }

    // Format the response to include all relevant information
    const formattedSignups = signups.map(signup => ({
      id: signup.id,
      walletAddress: signup.walletAddress,
      institutionName: signup.institutionName,
      contactEmail: signup.contactEmail,
      institutionWebsite: signup.institutionWebsite,
      verificationDocuments: signup.verificationDocuments || [],
      status: signup.status,
      submittedAt: signup.submittedAt,
      reviewedAt: signup.reviewedAt || null,
      reviewedBy: signup.reviewedBy || null,
      rejectionReason: signup.rejectionReason || null
    }))

    return NextResponse.json({
      success: true,
      signups: formattedSignups,
      count: formattedSignups.length,
      filter: statusFilter || 'all'
    })

  } catch (error) {
    console.error('Error in university-signups API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}