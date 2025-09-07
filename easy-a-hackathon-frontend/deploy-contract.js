// Smart Contract Deployment Script for MetaCAMPUS Badge Management
// Run with: node deploy-contract.js

const algosdk = require('algosdk');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' }); // Load environment variables from .env.local

// Algorand testnet configuration
const ALGORAND_SERVER = "https://testnet-api.algonode.cloud";
const ALGORAND_PORT = 443;
const ALGORAND_TOKEN = "";

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(ALGORAND_TOKEN, ALGORAND_SERVER, ALGORAND_PORT);

// TEAL programs (compiled from PyTeal)
const APPROVAL_PROGRAM = `#pragma version 8
txn ApplicationID
int 0
==
bnz main_l10
txna ApplicationArgs 0
byte "create_badge_request"
==
bnz main_l9
txna ApplicationArgs 0
byte "approve_badge_request"
==
bnz main_l8
txna ApplicationArgs 0
byte "create_meta_badge"
==
bnz main_l7
txna ApplicationArgs 0
byte "verify_badge"
==
bnz main_l6
err
main_l6:
txn NumAppArgs
int 2
==
assert
int 1
return
main_l7:
txn Sender
global CreatorAddress
==
assert
txn NumAppArgs
int 2
==
assert
byte "badge_data"
txna ApplicationArgs 1
concat
txna ApplicationArgs 1
app_global_put
byte "timestamp"
txna ApplicationArgs 1
concat
global LatestTimestamp
app_global_put
byte "total_badges"
byte "total_badges"
app_global_get
int 1
+
app_global_put
int 1
return
main_l8:
txn Sender
global CreatorAddress
==
assert
txn NumAppArgs
int 2
==
assert
byte "approved"
txna ApplicationArgs 1
concat
byte "approved"
app_global_put
byte "approved_at"
txna ApplicationArgs 1
concat
global LatestTimestamp
app_global_put
int 1
return
main_l9:
txn NumAppArgs
int 2
==
assert
byte "badge_request"
txna ApplicationArgs 1
concat
txna ApplicationArgs 1
app_global_put
byte "timestamp"
txna ApplicationArgs 1
concat
global LatestTimestamp
app_global_put
byte "total_requests"
byte "total_requests"
app_global_get
int 1
+
app_global_put
int 1
return
main_l10:
byte "contract_version"
byte "2.0"
app_global_put
byte "total_badges"
int 0
app_global_put
byte "total_requests"
int 0
app_global_put
int 1
return`;

const CLEAR_STATE_PROGRAM = `#pragma version 8
int 1
return`;

async function deployContract() {
  console.log("🚀 Deploying MetaCAMPUS Badge Management Smart Contract...\n");
  
  try {
    // 1) Load and validate the deployer mnemonic from env
  console.log("1. Setting up deployment account...");

  // Expect the mnemonic in .env.local as ALGORAND_MNEMONIC="word1 word2 ... word25"
  const rawMnemonic = process.env.ALGORAND_MNEMONIC || "";
  // Normalize whitespace and quotes that sometimes sneak in from copy/paste
  const deployerMnemonic = rawMnemonic
    .replace(/[“”]/g, '"')        // smart quotes -> straight
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")         // collapse multiple spaces/newlines/tabs
    .trim();

  if (!deployerMnemonic) {
    throw new Error(
      "ALGORAND_MNEMONIC is missing. Put your 25-word testnet mnemonic in .env.local as ALGORAND_MNEMONIC."
    );
  }

  const words = deployerMnemonic.split(" ");
  if (words.length !== 25) {
    throw new Error(
      `ALGORAND_MNEMONIC must have 25 words, found ${words.length}. Check for missing or extra words/spaces.`
    );
  }

  let deployerAccount;
  try {
    deployerAccount = algosdk.mnemonicToSecretKey(deployerMnemonic);
  } catch (e) {
    throw new Error(
      "Failed to decode ALGORAND_MNEMONIC. One or more words may be invalid. Re-copy your 25-word phrase."
    );
  }

  console.log(`   Deployer Address: ${deployerAccount.addr}`);

  // Optional: verify against the address you expect
  const expectedAddress = "SCQ735PTYORIKD5YQJ4XXYCKEO34DJIGS7LOAZFFSALHF6B5KAUXCS7SUM";
  if (deployerAccount.addr !== expectedAddress) {
    throw new Error(
      `Address mismatch. Derived ${deployerAccount.addr} != expected ${expectedAddress}. Check the mnemonic.`
    );
  }

  console.log(`   ⚠️  IMPORTANT: Fund this account with testnet ALGOs before deployment!`);
  console.log("   Get testnet ALGOs from the official dispenser.\n");

    
    // Check account balance
    try {
      const accountInfo = await algodClient.accountInformation(deployerAccount.addr).do();
      const balance = accountInfo.amount / 1000000; // Convert microAlgos to Algos
      console.log(`   Current balance: ${balance} ALGOs`);
      
      if (balance < 0.1) {
        console.log("   ❌ Insufficient balance for deployment. Please fund the account first.");
        console.log("   Minimum required: 0.1 ALGOs\n");
        return;
      }
    } catch (error) {
      console.log("   ❌ Account not found or not funded. Please fund the account first.\n");
      return;
    }
    
    // Step 2: Compile TEAL programs
    console.log("2. Compiling TEAL programs...");
    let approvalProgram, clearProgram;
    try {
      const compiledApproval = await algodClient.compile(APPROVAL_PROGRAM).do();
      const compiledClear = await algodClient.compile(CLEAR_STATE_PROGRAM).do();
      
      if (!compiledApproval.result || !compiledClear.result) {
        throw new Error("Failed to compile TEAL programs");
      }
      
      approvalProgram = new Uint8Array(Buffer.from(compiledApproval.result, "base64"));
      clearProgram = new Uint8Array(Buffer.from(compiledClear.result, "base64"));
      console.log("   ✅ Programs compiled successfully\n");
    } catch (error) {
      console.error("   ❌ Failed to compile TEAL programs:", error);
      throw error;
    }
    
    // Step 3: Get suggested transaction parameters
    console.log("3. Preparing deployment transaction...");
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Step 4: Create application creation transaction
    const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
      from: deployerAccount.addr,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram,
      clearProgram,
      numLocalInts: 0,
      numLocalByteSlices: 0,
      numGlobalInts: 2, // total_badges, total_requests
      numGlobalByteSlices: 10, // contract_version + badge data
    });
    
    // Step 5: Sign and submit transaction
    console.log("4. Deploying contract to Algorand testnet...");
    const signedTxn = appCreateTxn.signTxn(deployerAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    console.log(`   Transaction ID: ${txId.txId}`);
    
    // Step 6: Wait for confirmation
    console.log("5. Waiting for transaction confirmation...");
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId.txId, 4);
    const appId = confirmedTxn['application-index'];
    
    console.log(`   ✅ Contract deployed successfully!`);
    console.log(`   Application ID: ${appId}`);
    console.log(`   Block: ${confirmedTxn['confirmed-round']}\n`);
    
    // Step 7: Create .env file
    console.log("6. Creating environment configuration...");
    const envContent = `# MetaCAMPUS Algorand Configuration
NEXT_PUBLIC_ALGORAND_APP_ID=${appId}
ALGORAND_DEPLOYER_ADDRESS=${deployerAccount.addr}
ALGORAND_DEPLOYER_MNEMONIC="${algosdk.secretKeyToMnemonic(deployerAccount.sk)}"

# Add other environment variables as needed
# NEXT_PUBLIC_API_URL=http://localhost:3000
`;
    
    fs.writeFileSync('.env.local', envContent);
    console.log("   ✅ Environment file created: .env.local\n");
    
    // Step 8: Test the deployed contract
    console.log("7. Testing deployed contract...");
    const appInfo = await algodClient.getApplicationByID(appId).do();
    console.log(`   Contract Version: ${Buffer.from(appInfo.params['global-state'].find(kv => Buffer.from(kv.key, 'base64').toString() === 'contract_version').value.bytes, 'base64').toString()}`);
    console.log("   ✅ Contract is accessible and working\n");
    
    console.log("🎉 Deployment completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Restart your development server to load new environment variables");
    console.log("2. Run: npm run dev");
    console.log("3. Test badge verification through your API");
    console.log("4. Keep the deployer account funded for contract operations");
    
    return appId;
    
  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    console.log("\nTroubleshooting:");
    console.log("- Ensure the deployer account is funded with testnet ALGOs");
    console.log("- Check your internet connection");
    console.log("- Verify Algorand testnet is accessible");
    throw error;
  }
}

// Helper function to fund account (for testing)
async function checkAccountFunding(address) {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const balance = accountInfo.amount / 1000000;
    console.log(`Account ${address} balance: ${balance} ALGOs`);
    return balance;
  } catch (error) {
    console.log(`Account ${address} not found or not funded`);
    return 0;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployContract().catch(console.error);
}

module.exports = { deployContract, checkAccountFunding };
