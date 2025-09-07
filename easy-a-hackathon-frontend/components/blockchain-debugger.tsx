/**
 * Blockchain Debug Component
 * 
 * This component shows you exactly what your blockchain returns
 * when you query for student transcript data.
 */

'use client'

import { useState } from 'react'
import { TranscriptService } from '@/lib/transcript-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface DebugResponse {
  timestamp: string
  studentHash: string
  response: any
  error?: string
  source: 'blockchain' | 'fallback'
}

export default function BlockchainDebugger() {
  const [studentHash, setStudentHash] = useState('3bd95131cc358b7f22d34236871eabf023cdfaf34cac55e16a99aac0000fe321') // Test hash
  const [isLoading, setIsLoading] = useState(false)
  const [debugResponses, setDebugResponses] = useState<DebugResponse[]>([])

  // Test the verification function and capture all responses
  const testVerification = async () => {
    if (!studentHash.trim()) {
      alert('Please enter a student hash')
      return
    }

    setIsLoading(true)
    
    try {
      console.log(`🔍 Testing verification for hash: ${studentHash}`)
      
      // Call the verification function
      const response = await TranscriptService.verifyTranscript(studentHash)
      
      // Capture the response
      const debugData: DebugResponse = {
        timestamp: new Date().toISOString(),
        studentHash,
        response,
        source: response.courses.length > 0 ? 'blockchain' : 'fallback'
      }
      
      console.log('📊 Verification Response:', response)
      
      // Add to debug responses (keep last 5)
      setDebugResponses(prev => [debugData, ...prev].slice(0, 5))
      
    } catch (error) {
      console.error('❌ Verification Error:', error)
      
      const errorData: DebugResponse = {
        timestamp: new Date().toISOString(),
        studentHash,
        response: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'fallback'
      }
      
      setDebugResponses(prev => [errorData, ...prev].slice(0, 5))
    } finally {
      setIsLoading(false)
    }
  }

  // Clear debug history
  const clearDebugData = () => {
    setDebugResponses([])
    console.clear()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Blockchain Response Debugger
          </CardTitle>
          <CardDescription>
            Test your smart contract verification function and see exactly what data is returned.
            Check the browser console for detailed logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter student hash to verify"
              value={studentHash}
              onChange={(e) => setStudentHash(e.target.value)}
              className="font-mono text-sm"
            />
            <Button 
              onClick={testVerification} 
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? 'Testing...' : 'Test Verification'}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearDebugData}
              className="whitespace-nowrap"
            >
              Clear Debug
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Open your browser's developer console (F12) to see detailed blockchain query logs
          </div>
        </CardContent>
      </Card>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🌐 Environment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>App ID:</strong> {process.env.NEXT_PUBLIC_ALGORAND_APP_ID || 'NOT_SET'}
            </div>
            <div>
              <strong>Network:</strong> {process.env.NEXT_PUBLIC_ALGORAND_NODE_URL?.includes('testnet') ? 'Testnet' : 'Local/Unknown'}
            </div>
            <div>
              <strong>Smart Contract:</strong> 
              <Badge variant={process.env.NEXT_PUBLIC_ALGORAND_APP_ID ? 'default' : 'destructive'} className="ml-2">
                {process.env.NEXT_PUBLIC_ALGORAND_APP_ID ? 'Configured' : 'Not Deployed'}
              </Badge>
            </div>
            <div>
              <strong>Debug Mode:</strong> 
              <Badge variant="secondary" className="ml-2">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Responses */}
      {debugResponses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">📊 Recent Verification Responses</h3>
          
          {debugResponses.map((debug, index) => (
            <Card key={index} className={debug.error ? 'border-red-200' : 'border-green-200'}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Query #{debugResponses.length - index}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={debug.error ? 'destructive' : 'default'}>
                      {debug.error ? 'Error' : 'Success'}
                    </Badge>
                    <Badge variant="outline">
                      {debug.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(debug.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <strong className="text-sm">Student Hash:</strong>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {debug.studentHash}
                  </code>
                </div>
                
                <Separator />
                
                {debug.error ? (
                  <div>
                    <strong className="text-sm text-red-600">Error:</strong>
                    <code className="block mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                      {debug.error}
                    </code>
                  </div>
                ) : (
                  <div>
                    <strong className="text-sm">Blockchain Response:</strong>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Student Exists:</span>
                          <Badge variant={debug.response.studentExists ? 'default' : 'secondary'} className="ml-2">
                            {debug.response.studentExists ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Is Valid:</span>
                          <Badge variant={debug.response.isValid ? 'default' : 'secondary'} className="ml-2">
                            {debug.response.isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Courses:</span>
                          <Badge variant="outline" className="ml-2">
                            {debug.response.courses?.length || 0}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">GPA:</span>
                          <Badge variant="outline" className="ml-2">
                            {debug.response.gpa?.toFixed(2) || '0.00'}
                          </Badge>
                        </div>
                      </div>
                      
                      {debug.response.courses?.length > 0 && (
                        <div>
                          <strong className="text-sm">Courses Found:</strong>
                          <div className="mt-1 space-y-1">
                            {debug.response.courses.map((course: any, courseIndex: number) => (
                              <div key={courseIndex} className="flex items-center gap-2 text-xs">
                                <Badge variant="outline">{course.courseCode}</Badge>
                                <span>{course.courseName}</span>
                                <Badge variant="secondary">{course.grade}</Badge>
                                <span className="text-muted-foreground">({course.credits} cr)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <details className="mt-3">
                        <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                          View Raw Response JSON
                        </summary>
                        <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(debug.response, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 How to Use This Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Test with Sample Hash:</strong> Use the pre-filled test hash to see fallback verification
          </div>
          <div>
            <strong>2. Deploy Smart Contract:</strong> Follow the DEPLOYMENT.md guide to deploy your contract
          </div>
          <div>
            <strong>3. Update Environment:</strong> Set NEXT_PUBLIC_ALGORAND_APP_ID after deployment
          </div>
          <div>
            <strong>4. Onboard Student:</strong> Use the admin interface to add a student to the blockchain
          </div>
          <div>
            <strong>5. Test Real Data:</strong> Use the student hash from onboarding to see live blockchain data
          </div>
          <div className="pt-2 border-t">
            <strong>🔍 Console Logs:</strong> Open browser DevTools (F12) → Console to see detailed blockchain query logs
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
