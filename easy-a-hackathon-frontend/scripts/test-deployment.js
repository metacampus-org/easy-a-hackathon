// Test script to verify deployment setup
const { ContractDeployer } = require('./deploy-contract.js');
const fs = require('fs');
const path = require('path');

async function testSetup() {
  console.log("🧪 Testing deployment setup...\n");

  // Test 1: Check if TEAL files exist
  console.log("1. Checking TEAL files...");
  const tealDir = path.join(process.cwd(), "teal");
  const approvalPath = path.join(tealDir, "approval.teal");
  const clearPath = path.join(tealDir, "clear.teal");
  const abiPath = path.join(tealDir, "contract.json");

  if (fs.existsSync(approvalPath)) {
    console.log("   ✅ approval.teal found");
  } else {
    console.log("   ❌ approval.teal missing");
    return;
  }

  if (fs.existsSync(clearPath)) {
    console.log("   ✅ clear.teal found");
  } else {
    console.log("   ❌ clear.teal missing");
    return;
  }

  if (fs.existsSync(abiPath)) {
    console.log("   ✅ contract.json found");
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    console.log(`   📋 Contract: ${abi.name}`);
    console.log(`   🔧 Methods: ${abi.methods.length}`);
  } else {
    console.log("   ❌ contract.json missing");
    return;
  }

  // Test 2: Initialize deployer
  console.log("\n2. Testing deployer initialization...");
  try {
    const deployer = new ContractDeployer();
    console.log("   ✅ ContractDeployer initialized successfully");
    
    const abi = deployer.abi;
    if (abi) {
      console.log(`   📋 ABI loaded: ${abi.name}`);
      console.log(`   🌐 Networks: ${Object.keys(abi.networks).join(', ')}`);
    }
  } catch (error) {
    console.log("   ❌ Failed to initialize deployer:", error.message);
    return;
  }

  // Test 3: Test TEAL compilation
  console.log("\n3. Testing TEAL compilation...");
  try {
    const deployer = new ContractDeployer();
    const config = await deployer.loadTEALPrograms();
    console.log("   ✅ TEAL programs compiled successfully");
    console.log(`   📊 Global ints: ${config.numGlobalInts}`);
    console.log(`   📊 Global bytes: ${config.numGlobalByteSlices}`);
  } catch (error) {
    console.log("   ❌ TEAL compilation failed:", error.message);
    return;
  }

  console.log("\n🎉 All tests passed! Ready for deployment.");
  console.log("\n📋 Next steps:");
  console.log("1. Fund the deployer account with testnet ALGOs");
  console.log("2. Run: node scripts/deploy-contract.js");
  console.log("3. The script will update your .env.local with the App ID");
  console.log("\n💰 Get testnet ALGOs from: https://bank.testnet.algorand.network/");
}

// Run tests
testSetup().catch(console.error);
