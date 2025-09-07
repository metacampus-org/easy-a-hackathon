# Smart Contract Deployment Guide

This guide explains how to deploy the Student Transcript Management smart contract to Algorand Testnet.

## Prerequisites

1. **Python Environment with PyTeal**
   ```bash
   pip install pyteal
   ```

2. **Algorand Goal CLI**
   - Install from [Algorand Developer Portal](https://developer.algorand.org/docs/get-details/dapps/smart-contracts/frontend/smartsigs/)
   - Or use AlgoSDK for programmatic deployment

3. **Testnet Account with ALGO**
   - Create account: `goal account new`
   - Fund from [Testnet Dispenser](https://testnet.algoexplorer.io/dispenser)

## Compilation

1. **Generate TEAL Code**
   ```bash
   cd contracts/
   python transcript_manager.py > approval.teal
   ```

2. **Create Clear State Program**
   ```teal
   #pragma version 8
   int 1
   return
   ```
   Save as `clear.teal`

## Deployment Options

### Option 1: Using Goal CLI

1. **Deploy Contract**
   ```bash
   goal app create \
     --creator $CREATOR_ADDRESS \
     --approval-prog approval.teal \
     --clear-prog clear.teal \
     --global-byteslices 64 \
     --global-ints 16 \
     --local-byteslices 0 \
     --local-ints 0
   ```

2. **Note the Application ID**
   ```bash
   # Example output:
   # Created app with app index 123456789
   ```

### Option 2: Using AlgoSDK (Recommended)

```javascript
import algosdk from 'algosdk'
import fs from 'fs'

async function deployContract() {
  // Initialize client
  const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443)
  
  // Read compiled programs
  const approvalProgram = fs.readFileSync('approval.teal', 'utf8')
  const clearProgram = fs.readFileSync('clear.teal', 'utf8')
  
  // Compile programs
  const approvalResult = await algodClient.compile(approvalProgram).do()
  const clearResult = await algodClient.compile(clearProgram).do()
  
  // Get suggested parameters
  const suggestedParams = await algodClient.getTransactionParams().do()
  
  // Create deployment transaction
  const txn = algosdk.makeApplicationCreateTxnFromObject({
    from: creatorAddress,
    suggestedParams,
    approvalProgram: new Uint8Array(Buffer.from(approvalResult.result, 'base64')),
    clearProgram: new Uint8Array(Buffer.from(clearResult.result, 'base64')),
    numLocalInts: 0,
    numLocalByteSlices: 0,
    numGlobalInts: 16,
    numGlobalByteSlices: 64,
    onComplete: algosdk.OnApplicationComplete.NoOpOC
  })
  
  // Sign and submit
  const signedTxn = txn.signTxn(creatorAccount.sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  
  // Wait for confirmation
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4)
  const appId = confirmedTxn['application-index']
  
  console.log('Contract deployed with App ID:', appId)
  return appId
}
```

## Configuration

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_TRANSCRIPT_APP_ID=123456789
   ```

2. **Update Frontend Configuration**
   ```typescript
   // lib/transcript-service.ts
   export const TRANSCRIPT_APP_ID = 123456789
   ```

## Testing

1. **Test Student Onboarding**
   ```bash
   goal app call \
     --app-id 123456789 \
     --from $ADMIN_ADDRESS \
     --app-arg "str:onboard_student" \
     --app-arg "str:{\"studentHash\":\"test123\",\"institutionId\":\"UNIV001\"}"
   ```

2. **Test Transcript Update**
   ```bash
   goal app call \
     --app-id 123456789 \
     --from $ADMIN_ADDRESS \
     --app-arg "str:update_transcript" \
     --app-arg "str:{\"studentHash\":\"test123\",\"courses\":[...]}"
   ```

3. **Test Verification**
   ```bash
   goal app call \
     --app-id 123456789 \
     --from $ANY_ADDRESS \
     --app-arg "str:verify_transcript" \
     --app-arg "str:test123"
   ```

## Production Deployment

### Mainnet Considerations

1. **Security Audit**
   - Review contract logic
   - Test edge cases
   - Validate access controls

2. **Gas Optimization**
   - Minimize global state usage
   - Use box storage for large data
   - Batch operations where possible

3. **Access Control**
   - Implement proper admin controls
   - Multi-signature for critical operations
   - Emergency pause functionality

4. **Monitoring**
   - Set up transaction monitoring
   - Error handling and logging
   - Performance metrics

### Deployment Checklist

- [ ] Contract compiled and tested
- [ ] Testnet deployment successful
- [ ] Frontend integration tested
- [ ] Access controls verified
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Mainnet deployment approved
- [ ] Application ID configured
- [ ] Production testing completed

## Troubleshooting

### Common Issues

1. **Compilation Errors**
   ```bash
   # Check PyTeal version
   pip show pyteal
   
   # Update if needed
   pip install --upgrade pyteal
   ```

2. **Deployment Failures**
   ```bash
   # Check account balance
   goal account balance -a $CREATOR_ADDRESS
   
   # Verify network connection
   goal node status
   ```

3. **Application Calls Failing**
   ```bash
   # Check application exists
   goal app info --app-id 123456789
   
   # Review transaction logs
   goal app call --help
   ```

### Logs and Debugging

1. **Application Logs**
   ```bash
   # View application global state
   goal app read --app-id 123456789 --global
   
   # Check recent transactions
   goal account transactions -a $APP_ADDRESS
   ```

2. **Frontend Debugging**
   ```javascript
   // Enable verbose logging
   localStorage.setItem('debug', 'algorand:*')
   
   // Monitor transactions
   console.log('Transaction:', txn)
   ```

## Support

- **Algorand Developer Discord**: [discord.gg/algorand](https://discord.gg/algorand)
- **Documentation**: [developer.algorand.org](https://developer.algorand.org)
- **PyTeal Reference**: [pyteal.readthedocs.io](https://pyteal.readthedocs.io)

---

Remember to keep your private keys secure and never commit them to version control!
