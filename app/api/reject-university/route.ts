import { NextRequest, NextResponse } from 'next/server'
import { getSQLiteService } from '@/lib/sqlite-service'
import { algorandClient } from '@/lib/algorand-client'

export async function POST(request: NextRequest) {
  try {
    const { requestId, approverWallet, rejectionReason } = await request.json()

    // Validate required fields
    if (!requestId || !approverWallet || !rejectionReason) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: requestId, approverWallet, rejectionReason' 
        },
        { status: 400 }
      )
    }

    // Validate requestId is a valid number
    const requestIdNum = parseInt(requestId)
    if (isNaN(requestIdNum) || requestIdNum <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request ID format' 
        },
        { status: 400 }
      )
    }

    // Validate rejection reason is not empty
    if (typeof rejectionReason !== 'string' || rejectionReason.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rejection reason cannot be empty' 
        },
        { status: 400 }
      )
    }

    // Validate rejection reason length (reasonable limit)
    if (rejectionReason.length > 1000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rejection reason is too long (maximum 1000 characters)' 
        },
        { status: 400 }
      )
    }

    // Get SQLite service instance
    const sqliteService = getSQLiteService()

    // Get the signup request to verify it exists
    let signupRequest
    try {
      signupRequest = sqliteService.getSignupRequest(requestIdNum)
      if (!signupRequest) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Signup request not found' 
          },
          { status: 404 }
        )
      }

      if (signupRequest.status !== 'pending') {
        return NextResponse.json(
          { 
            success: false, 
            error: `Signup request is already ${signupRequest.status}` 
          },
          { status: 409 }
        )
      }
    } catch (error) {
      console.error('Error fetching signup request:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch signup request' 
        },
        { status: 500 }
      )
    }

    // Verify approver is super admin
    try {
      const superAdminAddress = await algorandClient.getSuperAdminAddress()
      if (!superAdminAddress || approverWallet !== superAdminAddress) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Only super admin can reject university requests' 
          },
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('Error verifying super admin:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to verify super admin status' 
        },
        { status: 500 }
      )
    }

    // Update signup status to rejected in SQLite with rejection reason
    try {
      sqliteService.updateSignupStatus(requestIdNum, 'rejected', approverWallet, rejectionReason.trim())
    } catch (error) {
      console.error('Error updating signup status:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update signup status' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'University signup request rejected successfully',
      requestId: requestIdNum,
      walletAddress: signupRequest.walletAddress,
      institutionName: signupRequest.institutionName,
      rejectionReason: rejectionReason.trim(),
      rejectedBy: approverWallet,
      rejectedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in reject-university API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}