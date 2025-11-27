import { NextRequest, NextResponse } from 'next/server'
import { getSQLiteService } from '@/lib/sqlite-service'

export async function POST(request: NextRequest) {
  try {
    const { 
      walletAddress, 
      institutionName, 
      contactEmail, 
      institutionWebsite, 
      verificationDocuments 
    } = await request.json()

    // Validate required fields
    if (!walletAddress || !institutionName || !contactEmail || !institutionWebsite) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: walletAddress, institutionName, contactEmail, institutionWebsite' 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      )
    }

    // Validate website URL format
    try {
      new URL(institutionWebsite)
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid website URL format' 
        },
        { status: 400 }
      )
    }

    // Validate wallet address format (basic Algorand address validation)
    if (walletAddress.length !== 58) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid wallet address format' 
        },
        { status: 400 }
      )
    }

    // Get SQLite service instance
    const sqliteService = getSQLiteService()

    // Check if there's already a pending request for this wallet
    try {
      const existingSignups = sqliteService.getSignupsByWallet(walletAddress)
      const pendingSignup = existingSignups.find(signup => signup.status === 'pending')
      
      if (pendingSignup) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A pending signup request already exists for this wallet address',
            existingRequestId: pendingSignup.id
          },
          { status: 409 }
        )
      }
    } catch (error) {
      console.error('Error checking existing signups:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check existing signup requests' 
        },
        { status: 500 }
      )
    }

    // Create signup request in SQLite
    let requestId
    try {
      requestId = sqliteService.createSignupRequest({
        walletAddress,
        institutionName,
        contactEmail,
        institutionWebsite,
        verificationDocuments: verificationDocuments || []
      })
    } catch (error) {
      console.error('Error creating signup request:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create signup request' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requestId: requestId.toString(),
      status: 'pending',
      message: 'University signup request submitted successfully. You will be notified once reviewed.'
    })

  } catch (error) {
    console.error('Error in university-signup API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}