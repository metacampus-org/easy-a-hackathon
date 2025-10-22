import { NextRequest, NextResponse } from 'next/server'
import { getSQLiteService } from '@/lib/sqlite-service'
import { algorandClient } from '@/lib/algorand-client'

export async function POST(request: NextRequest) {
  try {
    const { studentAddress, universityAddress, course, txId } = await request.json()

    // Validate required fields
    if (!studentAddress || !universityAddress || !course || !txId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: studentAddress, universityAddress, course, txId' 
        },
        { status: 400 }
      )
    }

    // Validate course object
    if (!course.name || !course.grade || !course.date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Course must have name, grade, and date fields' 
        },
        { status: 400 }
      )
    }

    // Verify transaction via indexer
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

    // Check that the transaction sender matches the university address
    if (transactionInfo.sender !== universityAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction sender does not match university address' 
        },
        { status: 403 }
      )
    }

    // Check that sender has university role (role=1)
    try {
      const senderRole = await algorandClient.getUserRole(universityAddress)
      if (senderRole !== 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Sender does not have university role (role=1)' 
          },
          { status: 403 }
        )
      }
    } catch (error) {
      console.error('Error checking sender role:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to verify sender role' 
        },
        { status: 500 }
      )
    }

    // Get SQLite service instance
    const sqliteService = getSQLiteService()

    // Check if transcript exists, create or update accordingly
    let transcript
    try {
      const existingTranscript = sqliteService.getTranscript(studentAddress)
      
      if (existingTranscript) {
        // Add course to existing transcript
        transcript = sqliteService.addCourse(studentAddress, course)
      } else {
        // Create new transcript with the course
        transcript = sqliteService.createTranscript({
          studentAddress,
          universityAddress,
          courses: [course],
          ipfs_cid: undefined
        })
      }
    } catch (error) {
      console.error('Error updating transcript:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update transcript in database' 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transcript: {
        id: transcript.id,
        studentAddress: transcript.studentAddress,
        universityAddress: transcript.universityAddress,
        courses: transcript.courses,
        createdAt: transcript.createdAt,
        updatedAt: transcript.updatedAt
      },
      hash: transcript.hash
    })

  } catch (error) {
    console.error('Error in update-transcript API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}