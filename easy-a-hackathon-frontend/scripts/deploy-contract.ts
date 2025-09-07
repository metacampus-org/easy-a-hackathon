// TypeScript deployment script for MetaCAMPUS Badge Manager
// Uses compiled TEAL files and ABI specification

import algosdk from "algosdk"
import fs from "fs"
import path from "path"

// Lora network testnet configuration
const ALGORAND_SERVER = "https://testnet-api.4160.nodely.dev"
const ALGORAND_PORT = 443
const ALGORAND_TOKEN = ""

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(ALGORAND_TOKEN, ALGORAND_SERVER, ALGORAND_PORT)

interface DeploymentConfig {
  approvalProgram: Uint8Array
  clearProgram: Uint8Array
  numLocalInts: number
  numLocalByteSlices: number
  numGlobalInts: number
  numGlobalByteSlices: number
}

interface DeploymentResult {
  appId: number
  txId: string
  address: string
  abi: any
}

export class ContractDeployer {
  private deployerAccount: algosdk.Account | null = null
  private abi: any = null

  constructor() {
    this.loadABI()
  }

  private loadABI() {
    try {
      const abiPath = path.join(process.cwd(), "teal", "contract.json")
      const abiContent = fs.readFileSync(abiPath, "utf8")
      this.abi = JSON.parse(abiContent)
      console.log(`✅ Loaded ABI specification: ${this.abi.name}`)
    } catch (error) {
      console.error("❌ Failed to load ABI specification:", error)
      throw error
    }
  }

  async loadTEALPrograms(): Promise<DeploymentConfig> {
    try {
      // Load TEAL files
      const approvalPath = path.join(process.cwd(), "teal", "approval.teal")
      const clearPath = path.join(process.cwd(), "teal", "clear.teal")

      const approvalTeal = fs.readFileSync(approvalPath, "utf8")
      const clearTeal = fs.readFileSync(clearPath, "utf8")

      console.log("📝 Compiling TEAL programs...")

      // Compile TEAL to bytecode
      const compiledApproval = await algodClient.compile(approvalTeal).do()
      const compiledClear = await algodClient.compile(clearTeal).do()

      console.log(`✅ Approval program compiled (hash: ${compiledApproval.hash})`)
      console.log(`✅ Clear program compiled (hash: ${compiledClear.hash})`)

      return {
        approvalProgram: new Uint8Array(Buffer.from(compiledApproval.result, "base64")),
        clearProgram: new Uint8Array(Buffer.from(compiledClear.result, "base64")),
        numLocalInts: 0,
        numLocalByteSlices: 0,
        numGlobalInts: 2, // total_badges, total_requests
        numGlobalByteSlices: 10 // contract_version + badge data
      }
    } catch (error) {
      console.error("❌ Failed to compile TEAL programs:", error)
      throw error
    }
  }

  generateAccount(): algosdk.Account {
    const account = algosdk.generateAccount()
    this.deployerAccount = account
    console.log(`🔑 Generated deployer account: ${account.addr}`)
    console.log(`🔐 Mnemonic: ${algosdk.secretKeyToMnemonic(account.sk)}`)
    return account
  }

  async checkAccountBalance(address: string): Promise<number> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      const balance = accountInfo.amount / 1000000 // Convert microAlgos to Algos
      console.log(`💰 Account balance: ${balance} ALGOs`)
      return balance
    } catch (error) {
      console.log("❌ Account not found or not funded")
      return 0
    }
  }

  async deployContract(deployerAccount?: algosdk.Account): Promise<DeploymentResult> {
    try {
      const account = deployerAccount || this.deployerAccount
      if (!account) {
        throw new Error("No deployer account provided")
      }

      console.log("🚀 Starting contract deployment...")

      // Check account balance
      const balance = await this.checkAccountBalance(account.addr)
      if (balance < 0.1) {
        throw new Error(`Insufficient balance. Need at least 0.1 ALGOs, have ${balance}`)
      }

      // Load and compile TEAL programs
      const config = await this.loadTEALPrograms()

      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do()

      // Create application creation transaction
      const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
        from: account.addr,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: config.approvalProgram,
        clearProgram: config.clearProgram,
        numLocalInts: config.numLocalInts,
        numLocalByteSlices: config.numLocalByteSlices,
        numGlobalInts: config.numGlobalInts,
        numGlobalByteSlices: config.numGlobalByteSlices
      })

      // Sign transaction
      const signedTxn = appCreateTxn.signTxn(account.sk)

      // Submit transaction
      console.log("📤 Submitting deployment transaction...")
      const txResult = await algodClient.sendRawTransaction(signedTxn).do()

      // Wait for confirmation
      console.log("⏳ Waiting for confirmation...")
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txResult.txId, 4)

      const appId = confirmedTxn["application-index"]
      if (!appId) {
        throw new Error("Failed to get application ID from transaction")
      }

      console.log(`🎉 Contract deployed successfully!`)
      console.log(`   App ID: ${appId}`)
      console.log(`   Transaction ID: ${txResult.txId}`)
      console.log(`   Block: ${confirmedTxn["confirmed-round"]}`)

      // Update ABI with app ID
      this.abi.networks["lora-testnet"].appID = appId

      // Save updated ABI
      const abiPath = path.join(process.cwd(), "teal", "contract.json")
      fs.writeFileSync(abiPath, JSON.stringify(this.abi, null, 2))

      return {
        appId,
        txId: txResult.txId,
        address: account.addr,
        abi: this.abi
      }
    } catch (error) {
      console.error("❌ Deployment failed:", error)
      throw error
    }
  }

  async updateEnvironment(appId: number) {
    try {
      const envPath = path.join(process.cwd(), ".env.local")
      let envContent = ""

      // Read existing .env.local if it exists
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8")
      }

      // Update or add the app ID
      const appIdLine = `NEXT_PUBLIC_ALGORAND_APP_ID=${appId}`
      
      if (envContent.includes("NEXT_PUBLIC_ALGORAND_APP_ID=")) {
        envContent = envContent.replace(/NEXT_PUBLIC_ALGORAND_APP_ID=\d+/, appIdLine)
      } else {
        envContent += `\n${appIdLine}\n`
      }

      fs.writeFileSync(envPath, envContent)
      console.log(`✅ Updated .env.local with App ID: ${appId}`)
    } catch (error) {
      console.error("⚠️  Failed to update environment file:", error)
    }
  }
}

// CLI interface
async function main() {
  try {
    const deployer = new ContractDeployer()

    // Generate account for deployment
    const account = deployer.generateAccount()

    console.log("\n⚠️  IMPORTANT: Fund this account with testnet ALGOs before proceeding!")
    console.log("   Get testnet ALGOs from: https://bank.testnet.algorand.network/")
    console.log("   Minimum required: 0.1 ALGOs\n")

    // Check if we should proceed (in a real scenario, you'd wait for user input)
    const balance = await deployer.checkAccountBalance(account.addr)
    if (balance < 0.1) {
      console.log("❌ Please fund the account and run the deployment again.")
      return
    }

    // Deploy contract
    const result = await deployer.deployContract(account)

    // Update environment
    await deployer.updateEnvironment(result.appId)

    console.log("\n🎉 Deployment completed successfully!")
    console.log(`   App ID: ${result.appId}`)
    console.log(`   Ready for integration with your Next.js app`)

  } catch (error) {
    console.error("❌ Deployment script failed:", error)
    process.exit(1)
  }
}

// Export for use in other scripts
export { ContractDeployer }

// Run if called directly
if (require.main === module) {
  main()
}
