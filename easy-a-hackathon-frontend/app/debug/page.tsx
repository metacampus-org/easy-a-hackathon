/**
 * Blockchain Debug Page
 * 
 * Access this page to see exactly what your smart contract returns
 * when queried for student transcript data.
 */

import BlockchainDebugger from '@/components/blockchain-debugger'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">🔍 Blockchain Debug Console</h1>
          <p className="text-muted-foreground mt-2">
            Test your smart contract verification and see exactly what the blockchain returns
          </p>
        </div>
        
        <BlockchainDebugger />
      </div>
    </div>
  )
}
