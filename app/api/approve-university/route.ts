import { NextRequest, NextResponse } from 'next/server'
import { getSQLiteService } from '@/lib/sqlite-service'
import { algorandClient } from '@/lib/algorand-client'

export async function POST(request: NextRequest) {
  try {
    const { requestId, approverWallet, txId } = await request.json()

    // Validate required fields
    if (!requestId || !approverWallet || !txId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: requestId, approverWallet, txId' 
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

    // Get SQLite service instance
    const sqliteService = getSQLiteService()

    // Get the signup request to verify it exists and get the target wallet
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
            error: 'Only super admin can approve university requests' 
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

    // Verify assignUniversityRole transaction via indexer
    let transactionInfo
    try {
      const indexer = algorandClient.getIndexer()
      const txnResponse = await indexer.lookupTransactionByID(txId).do()
      transactionInfo = txnResponse.transaction
      
      if (!transactionInfo) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Transaction not found on blockchain' 
          },
          { status: 404 }
        )
      }
    } catch (error) {
      console.error('Error verifying transaction:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to verify transaction on blockchain' 
        },
        { status: 500 }
      )
    }

    // Verify transaction details
    if (transactionInfo.sender !== approverWallet) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction sender does not match approver wallet' 
        },
        { status: 403 }
      )
    }

    // Verify this is an application call transaction to the correct app
    const appId = algorandClient.getAppId()
    if (!transactionInfo['application-transaction'] || 
        transactionInfo['application-transaction']['application-id'] !== appId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction is not a valid application call to the authentication contract' 
        },
        { status: 400 }
      )
    }

    // Verify the transaction includes the target wallet address in accounts
    const accounts = transactionInfo['application-transaction'].accounts || []
    if (!accounts.includes(signupRequest.walletAddress)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction does not target the correct wallet address' 
        },
        { status: 400 }
      )
    }

    // Verify the transaction has the correct application arguments (assignUniversityRole method)
    const appArgs = transactionInfo['application-transaction']['application-args'] || []
    if (appArgs.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction missing application arguments' 
        },
        { status: 400 }
      )
    }

    // Decode the first argument to check if it's the assignUniversityRole method
    const methodName = Buffer.from(appArgs[0], 'base64').toString()
    if (methodName !== 'assignUniversityRole') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction is not an assignUniversityRole call' 
        },
        { status: 400 }
      )
    }

    // Update signup status to approved in SQLite
    try {
      sqliteService.updateSignupStatus(requestIdNum, 'approved', approverWallet)
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
      message: 'University signup request approved successfully',
      requestId: requestIdNum,
      walletAddress: signupRequest.walletAddress,
      institutionName: signupRequest.institutionName,
      transactionId: txId,
      approvedBy: approverWallet,
      approvedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in approve-university API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}