import algosdk from 'algosdk'

/**
 * Algorand Client Service
 * 
 * Provides a centralized interface for interacting with the Algorand blockchain
 * via EC2-hosted node endpoints. Implements singleton pattern for efficient
 * client management and includes comprehensive error handling.
 */
export class AlgorandClient {
  private static instance: AlgorandClient
  private algodClient: algosdk.Algodv2
  private indexer: algosdk.Indexer
  private appId: number

  private constructor() {
    // Initialize algod client with EC2 endpoint
    const algodUrl = process.env.NEXT_PUBLIC_ALGOD_URL || 'http://localhost:8080'
    const algodToken = process.env.NEXT_PUBLIC_ALGOD_TOKEN || ''
    
    this.algodClient = new algosdk.Algodv2(algodToken, algodUrl, '')

    // Initialize indexer with EC2 endpoint
    const indexerUrl = process.env.NEXT_PUBLIC_INDEXER_URL || 'http://localhost:8980'
    const indexerToken = process.env.NEXT_PUBLIC_INDEXER_TOKEN || ''
    
    this.indexer = new algosdk.Indexer(indexerToken, indexerUrl, '')

    // Load app ID from environment variables
    this.appId = parseInt(process.env.NEXT_PUBLIC_APP_ID || '0')
    
    if (this.appId === 0) {
      console.warn('NEXT_PUBLIC_APP_ID not set or is 0. Smart contract interactions will fail.')
    }
  }

  /**
   * Get singleton instance of AlgorandClient
   */
  public static getInstance(): AlgorandClient {
    if (!AlgorandClient.instance) {
      AlgorandClient.instance = new AlgorandClient()
    }
    return AlgorandClient.instance
  }

  /**
   * Get the algod client instance
   */
  public getAlgodClient(): algosdk.Algodv2 {
    return this.algodClient
  }

  /**
   * Get the indexer client instance
   */
  public getIndexer(): algosdk.Indexer {
    return this.indexer
  }

  /**
   * Get the smart contract application ID
   */
  public getAppId(): number {
    return this.appId
  }

  /**
   * Test connection to Algorand node
   * @returns Promise<boolean> - true if connection successful
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.algodClient.status().do()
      return true
    } catch (error) {
      console.error('Failed to connect to Algorand node:', error)
      return false
    }
  }

  /**
   * Test connection to indexer
   * @returns Promise<boolean> - true if connection successful
   */
  public async testIndexerConnection(): Promise<boolean> {
    try {
      await this.indexer.makeHealthCheck().do()
      return true
    } catch (error) {
      console.error('Failed to connect to Algorand indexer:', error)
      return false
    }
  }

  /**
   * Handle network failures with retry logic
   * @param operation - Function to retry
   * @param maxRetries - Maximum number of retry attempts
   * @param delay - Delay between retries in milliseconds
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`)
        }

        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }

    throw lastError!
  }

  /**
   * Execute operation with network error handling
   * @param operation - Function to execute
   */
  public async executeWithErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await this.withRetry(operation)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
        throw new Error('Unable to connect to Algorand node. Please check your network connection and node configuration.')
      }
      
      if (errorMessage.includes('timeout')) {
        throw new Error('Request timed out. The Algorand node may be overloaded or unreachable.')
      }
      
      throw error
    }
  }

  // ============================================================================
  // Transaction Helper Methods
  // ============================================================================

  /**
   * Get suggested transaction parameters from the network
   * @returns Promise<algosdk.SuggestedParams> - Network transaction parameters
   */
  public async getTransactionParams(): Promise<algosdk.SuggestedParams> {
    return this.executeWithErrorHandling(async () => {
      return await this.algodClient.getTransactionParams().do()
    })
  }

  /**
   * Submit a signed transaction to the network
   * @param signedTxn - Signed transaction bytes
   * @returns Promise<string> - Transaction ID
   */
  public async submitTransaction(signedTxn: Uint8Array): Promise<string> {
    return this.executeWithErrorHandling(async () => {
      console.log('📤 Submitting transaction, size:', signedTxn.length, 'bytes')
      const response = await this.algodClient.sendRawTransaction(signedTxn).do()
      console.log('📥 Transaction response:', response)
      // In algosdk v3, the property is 'txid' (lowercase), not 'txId'
      const txId = response.txid || response.txId
      console.log('📥 Transaction ID:', txId)
      return txId
    })
  }

  /**
   * Wait for transaction confirmation with polling
   * @param txId - Transaction ID to wait for
   * @param maxRounds - Maximum number of rounds to wait (default: 10)
   * @returns Promise<any> - Transaction confirmation details
   */
  public async waitForConfirmation(txId: string, maxRounds: number = 10): Promise<any> {
    return this.executeWithErrorHandling(async () => {
      console.log(`⏳ Waiting for confirmation of transaction: ${txId}`)
      // Use algosdk's built-in waitForConfirmation which handles algosdk v3 properly
      const confirmation = await algosdk.waitForConfirmation(this.algodClient, txId, maxRounds)
      console.log(`✅ Transaction confirmed in round: ${confirmation['confirmed-round']}`)
      return confirmation
    })
  }

  /**
   * Submit transaction and wait for confirmation
   * @param signedTxn - Signed transaction bytes
   * @param maxRounds - Maximum number of rounds to wait
   * @returns Promise<{txId: string, confirmation: any}> - Transaction ID and confirmation
   */
  public async submitAndWait(signedTxn: Uint8Array, maxRounds: number = 20): Promise<{txId: string, confirmation: any}> {
    console.log('🚀 submitAndWait called with transaction size:', signedTxn.length)
    const txId = await this.submitTransaction(signedTxn)
    console.log('🚀 Transaction submitted, txId:', txId)
    const confirmation = await this.waitForConfirmation(txId, maxRounds)
    console.log('🚀 Transaction confirmed')
    return { txId, confirmation }
  }

  /**
   * Handle transaction errors with user-friendly messages
   * @param error - Error from transaction operation
   * @returns Error - Formatted error with user-friendly message
   */
  public handleTransactionError(error: any): Error {
    const errorMessage = error instanceof Error ? error.message : 'Unknown transaction error'
    
    if (errorMessage.includes('insufficient funds')) {
      return new Error('Insufficient ALGO balance to complete transaction. Please add funds to your wallet.')
    }
    
    if (errorMessage.includes('overspend')) {
      return new Error('Transaction would exceed available balance. Please check your ALGO balance.')
    }
    
    if (errorMessage.includes('logic eval error')) {
      return new Error('Smart contract rejected the transaction. Please check your permissions and try again.')
    }
    
    if (errorMessage.includes('application does not exist')) {
      return new Error('Smart contract not found. Please check the application ID configuration.')
    }
    
    if (errorMessage.includes('not opted in')) {
      return new Error('Account not opted into the smart contract. Please opt in first.')
    }
    
    if (errorMessage.includes('invalid signature')) {
      return new Error('Transaction signature is invalid. Please try signing again.')
    }
    
    return new Error(`Transaction failed: ${errorMessage}`)
  }

  // ============================================================================
  // Smart Contract Interaction Methods
  // ============================================================================

  /**
   * Create an opt-in transaction for the authentication smart contract
   * @param address - User's wallet address
   * @returns Promise<algosdk.Transaction> - Unsigned opt-in transaction
   */
  public async optInToApp(address: string): Promise<algosdk.Transaction> {
    if (this.appId === 0) {
      throw new Error('Smart contract application ID not configured. Please set NEXT_PUBLIC_APP_ID.')
    }

    return this.executeWithErrorHandling(async () => {
      const suggestedParams = await this.getTransactionParams()
      
      // Note: algosdk v3 uses 'sender' instead of 'from'
      return algosdk.makeApplicationOptInTxnFromObject({
        sender: address,  // Changed from 'from' to 'sender' for algosdk v3
        appIndex: this.appId,
        suggestedParams,
      })
    })
  }

  /**
   * Create a transaction to assign university role to a wallet address
   * @param creatorAddress - Super admin (contract creator) wallet address
   * @param targetAddress - Address to assign university role to
   * @returns Promise<algosdk.Transaction> - Unsigned role assignment transaction
   */
  public async assignUniversityRole(creatorAddress: string, targetAddress: string): Promise<algosdk.Transaction> {
    if (this.appId === 0) {
      throw new Error('Smart contract application ID not configured. Please set NEXT_PUBLIC_APP_ID.')
    }

    // Validate addresses
    if (!creatorAddress || creatorAddress.trim() === '') {
      throw new Error('Creator address must not be null or undefined')
    }
    
    if (!targetAddress || targetAddress.trim() === '') {
      throw new Error('Target address must not be null or undefined')
    }

    return this.executeWithErrorHandling(async () => {
      const suggestedParams = await this.getTransactionParams()
      const decodedAddress = algosdk.decodeAddress(targetAddress)
      
      console.log('🔧 Creating assignUniversityRole transaction:')
      console.log('  - Creator:', creatorAddress)
      console.log('  - Target:', targetAddress)
      console.log('  - App ID:', this.appId)
      console.log('  - Decoded public key:', decodedAddress.publicKey)
      
      // Create application call transaction with assignUniversityRole method
      // Note: algosdk v3 uses 'sender' instead of 'from' and 'accounts' for the accounts array
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: creatorAddress,
        appIndex: this.appId,
        appArgs: [
          new Uint8Array(Buffer.from('assignUniversityRole')),
          decodedAddress.publicKey
        ],
        accounts: [targetAddress], // In algosdk v3, this is still 'accounts', not 'appAccounts'
        suggestedParams,
      })
      
      console.log('🔧 Transaction created:', txn)
      console.log('🔧 App accounts (appAccounts):', txn.appAccounts)
      console.log('🔧 App accounts (accounts):', (txn as any).accounts)
      console.log('🔧 Full transaction object keys:', Object.keys(txn))
      
      return txn
    })
  }

  /**
   * Query user's role from smart contract local state via indexer
   * @param address - User's wallet address
   * @returns Promise<number> - User role (0 = student, 1 = university, -1 = not opted in)
   */
  public async getUserRole(address: string): Promise<number> {
    if (this.appId === 0) {
      throw new Error('Smart contract application ID not configured. Please set NEXT_PUBLIC_APP_ID.')
    }

    return this.executeWithErrorHandling(async () => {
      try {
        console.log('🔍 Querying role from indexer for:', address)
        const accountInfo = await this.indexer.lookupAccountByID(address).do()
        
        console.log('🔍 Indexer account info:', accountInfo.account?.['apps-local-state'])
        
        if (!accountInfo.account || !accountInfo.account['apps-local-state']) {
          console.log('❌ No apps-local-state in indexer, falling back to algod')
          // Indexer might be out of sync, try algod directly
          return await this.getUserRoleFromAlgod(address)
        }

        const localState = accountInfo.account['apps-local-state'].find(
          (app: any) => app.id === this.appId
        )

        console.log('🔍 Local state from indexer:', localState)

        if (!localState || !localState['key-value']) {
          console.log('❌ No local state for app in indexer')
          return -1 // Not opted in to this app
        }

        // Look for the 'Role' key in local state
        const roleKeyBase64 = Buffer.from('Role').toString('base64')
        const roleKeyBytes = new Uint8Array(Buffer.from('Role'))
        
        // In algosdk v3, keys can be Uint8Arrays instead of base64 strings
        const roleState = localState['key-value'].find((kv: any) => {
          if (kv.key instanceof Uint8Array) {
            // Compare as Uint8Arrays
            return kv.key.length === roleKeyBytes.length && 
                   kv.key.every((byte: number, i: number) => byte === roleKeyBytes[i])
          }
          // Fallback to base64 comparison
          return kv.key === roleKeyBase64
        })

        console.log('🔍 Role state from indexer:', roleState)

        if (!roleState || roleState.value.type !== 2) { // type 2 = uint
          console.log('❌ No role state or wrong type in indexer')
          return 0 // Default to student role if Role key not found
        }

        console.log('✅ Role from indexer:', roleState.value.uint)
        // Convert bigint to number for consistency
        return Number(roleState.value.uint)
      } catch (error) {
        // If indexer query fails, try direct algod query
        console.warn('⚠️ Indexer query failed, trying algod:', error)
        return await this.getUserRoleFromAlgod(address)
      }
    })
  }

  /**
   * Fallback method to query user role directly from algod
   * @param address - User's wallet address
   * @returns Promise<number> - User role
   */
  private async getUserRoleFromAlgod(address: string): Promise<number> {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do()
      
      console.log('🔍 Full account info keys:', Object.keys(accountInfo))
      console.log('🔍 Account info apps-local-state:', accountInfo['apps-local-state'])
      console.log('🔍 Account info appsLocalState:', accountInfo['appsLocalState'])
      
      // Try both property names (algosdk v3 might use camelCase)
      const appsLocalState = accountInfo['apps-local-state'] || accountInfo['appsLocalState']
      
      if (!appsLocalState) {
        console.log('❌ No apps-local-state found')
        return -1 // Not opted in
      }

      console.log('🔍 Apps local state array:', appsLocalState)
      
      // Check if array is empty before accessing first element
      if (!Array.isArray(appsLocalState) || appsLocalState.length === 0) {
        console.log('❌ Apps local state is empty - user not opted into any apps')
        return -1 // Not opted in
      }
      
      console.log('🔍 First app structure:', appsLocalState[0])
      console.log('🔍 First app keys:', Object.keys(appsLocalState[0]))
      console.log('🔍 First app id:', appsLocalState[0].id, 'type:', typeof appsLocalState[0].id)
      console.log('🔍 Looking for app ID:', this.appId, 'type:', typeof this.appId)
      console.log('🔍 Comparison:', appsLocalState[0].id === this.appId, 'vs', appsLocalState[0].id == this.appId)
      
      const localState = appsLocalState.find(
        (app: any) => app.id == this.appId  // Use == for type coercion
      )

      console.log('🔍 Local state for app', this.appId, ':', localState)

      // Try both property names for key-value (algosdk v3 uses camelCase)
      const keyValue = localState?.['key-value'] || localState?.['keyValue']
      
      if (!localState || !keyValue) {
        console.log('❌ No local state or key-value for this app')
        return -1 // Not opted in to this app
      }

      // Look for the 'Role' key in local state
      const roleKeyBase64 = Buffer.from('Role').toString('base64')
      const roleKeyBytes = new Uint8Array(Buffer.from('Role'))
      
      console.log('🔍 Looking for role key (base64):', roleKeyBase64)
      console.log('🔍 Looking for role key (bytes):', roleKeyBytes)
      console.log('🔍 Available keys:', keyValue.map((kv: any) => {
        if (kv.key instanceof Uint8Array) {
          return `Uint8Array[${Array.from(kv.key)}]`
        }
        return kv.key
      }))
      
      // In algosdk v3, keys can be Uint8Arrays instead of base64 strings
      const roleState = keyValue.find((kv: any) => {
        if (kv.key instanceof Uint8Array) {
          // Compare as Uint8Arrays
          return kv.key.length === roleKeyBytes.length && 
                 kv.key.every((byte: number, i: number) => byte === roleKeyBytes[i])
        }
        // Fallback to base64 comparison for older versions
        return kv.key === roleKeyBase64
      })

      console.log('🔍 Role state found:', roleState)

      if (!roleState || roleState.value.type !== 2) { // type 2 = uint
        console.log('❌ No role state or wrong type')
        return 0 // Default to student role
      }

      console.log('✅ Role value:', roleState.value.uint)
      // Convert bigint to number for consistency
      return Number(roleState.value.uint)
    } catch (error) {
      console.error('Failed to query user role from algod:', error)
      return -1 // Error state
    }
  }

  /**
   * Get account information from the blockchain
   * @param address - Wallet address to query
   * @returns Promise<any> - Account information
   */
  public async getAccountInfo(address: string): Promise<any> {
    return this.executeWithErrorHandling(async () => {
      return await this.algodClient.accountInformation(address).do()
    })
  }

  /**
   * Get application local state for a specific account
   * @param address - Account address
   * @param appId - Application ID (optional, uses configured app ID if not provided)
   * @returns Promise<any> - Local state data or null if not opted in
   */
  public async getApplicationLocalState(address: string, appId?: number): Promise<any> {
    const targetAppId = appId || this.appId
    
    if (targetAppId === 0) {
      throw new Error('Application ID not provided and not configured.')
    }

    return this.executeWithErrorHandling(async () => {
      try {
        const accountInfo = await this.getAccountInfo(address)
        
        if (!accountInfo['apps-local-state']) {
          return null
        }

        const localState = accountInfo['apps-local-state'].find(
          (app: any) => app.id === targetAppId
        )

        return localState || null
      } catch (error) {
        console.error('Failed to get application local state:', error)
        return null
      }
    })
  }

  /**
   * Check if an account is opted into the smart contract
   * @param address - Account address to check
   * @returns Promise<boolean> - True if opted in, false otherwise
   */
  public async isOptedIn(address: string): Promise<boolean> {
    try {
      const localState = await this.getApplicationLocalState(address)
      return localState !== null
    } catch (error) {
      console.error('Failed to check opt-in status:', error)
      return false
    }
  }

  /**
   * Get the super admin wallet address from smart contract global state
   * @returns Promise<string | null> - Super admin address or null if not found
   */
  public async getSuperAdminAddress(): Promise<string | null> {
    if (this.appId === 0) {
      return null
    }

    return this.executeWithErrorHandling(async () => {
      try {
        const appInfo = await this.algodClient.getApplicationByID(this.appId).do()
        const globalState = appInfo.params['global-state']

        if (!globalState) {
          return null
        }

        // Look for the 'Creator' key in global state
        const creatorKey = Buffer.from('Creator').toString('base64')
        const creatorState = globalState.find((kv: any) => kv.key === creatorKey)

        if (!creatorState || !creatorState.value.bytes) {
          return null
        }

        // Decode the address from bytes
        const addressBytes = new Uint8Array(Buffer.from(creatorState.value.bytes, 'base64'))
        return algosdk.encodeAddress(addressBytes)
      } catch (error) {
        console.error('Failed to get super admin address:', error)
        return null
      }
    })
  }
}

// Export singleton instance for convenience
export const algorandClient = AlgorandClient.getInstance()