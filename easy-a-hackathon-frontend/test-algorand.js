// Test script for Algorand smart contract integration
// Run with: node test-algorand.js

const algosdk = require('algosdk');

// Algorand testnet configuration
const ALGORAND_SERVER = "https://testnet-api.algonode.cloud";
const ALGORAND_PORT = 443;
const ALGORAND_TOKEN = "";

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(ALGORAND_TOKEN, ALGORAND_SERVER, ALGORAND_PORT);

// Test App ID - you'll need to set this to your deployed contract
const TEST_APP_ID = process.env.NEXT_PUBLIC_ALGORAND_APP_ID || 0;

async function testAlgorandConnection() {
  console.log("🧪 Testing Algorand Connection...\n");
  
  try {
    // Test 1: Basic connection
    console.log("1. Testing basic connection to Algorand testnet...");
    const status = await algodClient.status().do();
    console.log(`✅ Connected to Algorand testnet (Round: ${status['last-round']})\n`);
    
    // Test 2: Check if app ID is set
    console.log("2. Checking smart contract configuration...");
    if (TEST_APP_ID === 0) {
      console.log("⚠️  NEXT_PUBLIC_ALGORAND_APP_ID not set or is 0");
      console.log("   Please deploy your smart contract and set the environment variable\n");
      return;
    }
    console.log(`✅ App ID configured: ${TEST_APP_ID}\n`);
    
    // Test 3: Try to get application info
    console.log("3. Testing smart contract access...");
    try {
      const appInfo = await algodClient.getApplicationByID(TEST_APP_ID).do();
      console.log(`✅ Smart contract found!`);
      console.log(`   Creator: ${appInfo.params.creator}`);
      console.log(`   Global State: ${appInfo.params['global-state']?.length || 0} entries`);
      
      // Display global state if it exists
      if (appInfo.params['global-state'] && appInfo.params['global-state'].length > 0) {
        console.log("   Global State Keys:");
        appInfo.params['global-state'].forEach(kv => {
          const key = Buffer.from(kv.key, 'base64').toString();
          const value = kv.value.bytes ? 
            Buffer.from(kv.value.bytes, 'base64').toString() : 
            kv.value.uint || kv.value.int;
          console.log(`     ${key}: ${value}`);
        });
      }
      console.log();
      
    } catch (error) {
      console.log(`❌ Smart contract not found or not accessible`);
      console.log(`   Error: ${error.message}\n`);
      return;
    }
    
    // Test 4: Mock badge verification
    console.log("4. Testing badge verification logic...");
    const mockBadgeHash = "test-badge-hash-123";
    const mockStudentId = "student-001";
    
    try {
      // This will test the verification logic structure
      const globalState = appInfo.params["global-state"] || [];
      const badgeDataKey = `badge_data${mockBadgeHash}`;
      const keyToFind = Buffer.from(badgeDataKey).toString("base64");
      const badgeState = globalState.find(kv => kv.key === keyToFind);
      
      if (badgeState) {
        console.log("✅ Badge verification structure working");
      } else {
        console.log("ℹ️  No test badge found (expected for new contract)");
      }
      console.log();
      
    } catch (error) {
      console.log(`❌ Badge verification test failed: ${error.message}\n`);
    }
    
    console.log("🎉 Algorand integration test completed!");
    console.log("\nNext steps:");
    console.log("1. Deploy your smart contract if not already done");
    console.log("2. Set NEXT_PUBLIC_ALGORAND_APP_ID in your .env file");
    console.log("3. Test badge creation and verification through your API");
    
  } catch (error) {
    console.log(`❌ Connection test failed: ${error.message}`);
    console.log("\nTroubleshooting:");
    console.log("- Check your internet connection");
    console.log("- Verify Algorand testnet is accessible");
    console.log("- Ensure algosdk is installed: npm install algosdk");
  }
}

// Helper function to generate a test account
function generateTestAccount() {
  const account = algosdk.generateAccount();
  console.log("Generated test account:");
  console.log(`Address: ${account.addr}`);
  console.log(`Mnemonic: ${algosdk.secretKeyToMnemonic(account.sk)}`);
  return account;
}

// Run the test
if (require.main === module) {
  testAlgorandConnection().catch(console.error);
}

module.exports = { testAlgorandConnection, generateTestAccount };
