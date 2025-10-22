import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Path to the storage.json file
    const filePath = join(process.cwd(), 'data', 'storage.json')
    
    // Read the data from the file
    const fileContent = await readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error loading from storage.json:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load data' },
      { status: 404 }
    )
  }
}
