import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Path to the storage.json file
    const filePath = join(process.cwd(), 'data', 'storage.json')
    
    // Write the data to the file
    await writeFile(filePath, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved to storage.json successfully' 
    })
  } catch (error) {
    console.error('Error saving to storage.json:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    )
  }
}
