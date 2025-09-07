/**
 * Blockchain Debugging Utility
 * 
 * This script helps you see exactly what your Algorand smart contract
 * is returning when you query it for student transcript data.
 */

import { TranscriptService } from '../lib/transcript-service';
import { algodClient } from '../lib/algorand';

// Environment check
const APP_ID = process.env.NEXT_PUBLIC_ALGORAND_APP_ID || process.env.NEXT_PUBLIC_TRANSCRIPT_APP_ID;

/**
 * Debug blockchain responses and see exactly what data is returned
 */
async function debugBlockchainQuery(studentHash: string) {
  console.log('\n🔍 BLOCKCHAIN DEBUGGING SESSION');
  console.log('='.repeat(60));
  console.log(`📊 Debugging queries for student hash: ${studentHash}`);
  
  // Step 1: Check environment configuration
  console.log('\n📋 Step 1: Environment Configuration');
  console.log(`   App ID: ${APP_ID || 'NOT_SET'}`);
  console.log(`   App ID Type: ${typeof APP_ID}`);
  console.log(`   App ID Number: ${Number(APP_ID) || 0}`);
  
  if (!APP_ID || APP_ID === '0') {
    console.log('   ⚠️  WARNING: Smart contract not deployed yet');
    console.log('   💡 Set NEXT_PUBLIC_ALGORAND_APP_ID in your .env file');
    return;
  }

  // Step 2: Test Algorand connection
  console.log('\n🌐 Step 2: Testing Algorand Connection');
  try {
    const status = await algodClient.status().do();
    console.log('   ✅ Algorand node connected');
    console.log(`   📊 Network: ${status.catchupTime ? 'Testnet' : 'Local'}`);
    console.log(`   🔗 Last Round: ${status.lastRound}`);
  } catch (error) {
    console.error('   ❌ Algorand connection failed:', error);
    return;
  }

  // Step 3: Query smart contract application
  console.log('\n🤖 Step 3: Querying Smart Contract');
  try {
    const appInfo = await algodClient.getApplicationByID(Number(APP_ID)).do();
    console.log('   ✅ Smart contract found');
    console.log('   📋 Application Info:');
    console.log(`      App ID: ${appInfo.id}`);
    console.log(`      Creator: ${appInfo.params.creator}`);
    console.log(`      Approval program length: ${appInfo.params.approvalProgram?.length || 0} bytes`);
    console.log(`      Clear program length: ${appInfo.params.clearStateProgram?.length || 0} bytes`);
    
    // Step 4: Examine global state
    console.log('\n🌐 Step 4: Reading Global State');
    const globalState = appInfo.params.globalState || [];
    console.log(`   📊 Total state entries: ${globalState.length}`);
    
    if (globalState.length === 0) {
      console.log('   ℹ️  No data stored in smart contract yet');
      console.log('   💡 Try onboarding a student first');
      return;
    }

    // Step 5: Parse each state entry
    console.log('\n🔍 Step 5: Parsing State Entries');
    let foundStudentData = false;
    
    globalState.forEach((stateItem, index) => {
      console.log(`\n   Entry ${index + 1}:`);
      
      try {
        // Decode the key
        const keyBytes = Array.from(stateItem.key);
        const key = String.fromCharCode(...keyBytes);
        console.log(`      🔑 Key: "${key}"`);
        console.log(`      🔑 Key (raw bytes): [${keyBytes.join(', ')}]`);
        
        // Decode the value based on type
        const value = stateItem.value;
        console.log(`      📊 Value type: ${value.type} (${value.type === 1 ? 'bytes' : 'uint'})`);
        
        if (value.type === 1) { // byte string
          const valueBytes = Array.from(value.bytes);
          const decodedValue = String.fromCharCode(...valueBytes);
          console.log(`      📄 Value (decoded): "${decodedValue}"`);
          console.log(`      📄 Value (raw bytes): [${valueBytes.slice(0, 20).join(', ')}${valueBytes.length > 20 ? '...' : ''}]`);
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(decodedValue);
            console.log(`      📋 Parsed JSON:`, jsonData);
            
            // Check if this matches our student hash
            if (key === `student_${studentHash}` || 
                (jsonData.studentHash && jsonData.studentHash === studentHash)) {
              console.log(`      🎯 MATCH! Found data for student hash: ${studentHash}`);
              foundStudentData = true;
            }
          } catch (jsonError) {
            console.log(`      ⚠️  Not valid JSON data`);
          }
        } else if (value.type === 2) { // uint
          console.log(`      🔢 Value (uint): ${value.uint}`);
        }
        
      } catch (parseError) {
        console.error(`      ❌ Error parsing entry: ${parseError}`);
      }
    });

    // Step 6: Specific student lookup
    console.log(`\n🎯 Step 6: Looking for Student "${studentHash}"`);
    if (foundStudentData) {
      console.log('   ✅ Student data found in global state!');
    } else {
      console.log('   ❌ Student data not found in global state');
      console.log('   💡 Possible reasons:');
      console.log('      - Student not onboarded yet');
      console.log('      - Different key format used');
      console.log('      - Hash mismatch');
    }

  } catch (contractError) {
    console.error('   ❌ Smart contract query failed:', contractError);
    console.log('   💡 Possible issues:');
    console.log('      - App ID is incorrect');
    console.log('      - Smart contract not deployed');
    console.log('      - Network connection issues');
  }
}

/**
 * Test the actual verification function and log all responses
 */
async function debugVerificationFunction(studentHash: string) {
  console.log('\n🧪 VERIFICATION FUNCTION DEBUG');
  console.log('='.repeat(60));
  
  try {
    console.log(`🔍 Calling TranscriptService.verifyTranscript("${studentHash}")`);
    
    // Call the actual verification function
    const result = await TranscriptService.verifyTranscript(studentHash);
    
    console.log('\n📊 Verification Result:');
    console.log('   ✅ Function completed successfully');
    console.log('   📋 Full result object:');
    console.log(JSON.stringify(result, null, 4));
    
    // Analyze the result
    console.log('\n🔍 Result Analysis:');
    console.log(`   Student exists: ${result.studentExists ? '✅ Yes' : '❌ No'}`);
    console.log(`   Is valid: ${result.isValid ? '✅ Yes' : '❌ No'}`);
    console.log(`   Institution verified: ${result.institutionVerified ? '✅ Yes' : '❌ No'}`);
    console.log(`   Number of courses: ${result.courses.length}`);
    console.log(`   GPA: ${result.gpa}`);
    console.log(`   Total credits: ${result.totalCredits}`);
    console.log(`   Transcript hash: ${result.transcriptHash}`);
    console.log(`   Last verified: ${result.lastVerified}`);
    
    if (result.courses.length > 0) {
      console.log('\n📚 Courses found:');
      result.courses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.courseCode}: ${course.courseName} (${course.grade})`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Verification function failed:', error);
    console.log('   Check the browser console for more details');
  }
}

/**
 * Test with both the generated test hash and a custom hash
 */
async function runComprehensiveDebug() {
  console.log('\n🧪 COMPREHENSIVE BLOCKCHAIN DEBUG SESSION');
  console.log('='.repeat(80));
  console.log('This will help you see exactly what your blockchain returns');
  console.log('='.repeat(80));
  
  // Test with the hash from our blockchain tests
  const testHash = "3bd95131cc358b7f22d34236871eabf023cdfaf34cac55e16a99aac0000fe321";
  
  console.log('\n🎯 Testing with generated test hash...');
  await debugBlockchainQuery(testHash);
  await debugVerificationFunction(testHash);
  
  // Test with a custom hash (if provided via environment)
  const customHash = process.env.CUSTOM_STUDENT_HASH;
  if (customHash) {
    console.log('\n🎯 Testing with custom hash...');
    await debugBlockchainQuery(customHash);
    await debugVerificationFunction(customHash);
  }
  
  console.log('\n✨ Debug session completed!');
  console.log('💡 Tips for next steps:');
  console.log('   1. Deploy your smart contract if APP_ID is not set');
  console.log('   2. Onboard a student using the admin interface');
  console.log('   3. Run this debug again to see the stored data');
  console.log('   4. Check browser console for additional debug info');
}

// Export for use in other files
export {
  debugBlockchainQuery,
  debugVerificationFunction,
  runComprehensiveDebug
};

// Run if called directly
if (require.main === module) {
  runComprehensiveDebug().catch(console.error);
}
