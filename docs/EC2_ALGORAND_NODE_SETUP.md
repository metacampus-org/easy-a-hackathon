# EC2 Algorand Node Setup Guide

This guide walks you through setting up an Algorand node on AWS EC2 for the MetaCAMPUS project.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start (Use Public Nodes)](#quick-start-use-public-nodes)
- [Option 1: Launch EC2 Instance](#option-1-launch-ec2-instance)
- [Option 2: Use Public Nodes (Recommended for Development)](#option-2-use-public-nodes-recommended-for-development)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS Account with EC2 access
- Basic knowledge of Linux/Ubuntu
- SSH client installed on your local machine
- Pera Wallet app installed (iOS/Android)
- Algorand wallet with TestNet ALGO (from [TestNet Faucet](https://bank.testnet.algorand.network/))

---

## Quick Start (Use Public Nodes)

**Recommended for Development** - Skip EC2 setup and use free public nodes:

### 1. Update your `.env.local`:

```bash
# Copy example file
cp .env.example .env.local

# Edit with these values for TestNet
NEXT_PUBLIC_ALGOD_URL=https://testnet-api.4160.nodely.dev
NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.4160.nodely.dev
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_INDEXER_TOKEN=
NEXT_PUBLIC_ALGORAND_NETWORK=testnet

# Other public TestNet nodes you can use:
# AlgoNode: https://testnet-api.algonode.cloud
# Nodely: https://testnet-api.4160.nodely.dev (used above)
# PureStake: https://testnet-algorand.api.purestake.io/ps2 (requires API key)
```

### 2. Skip to [Smart Contract Deployment](#smart-contract-deployment)

---

## Option 1: Launch EC2 Instance

### Step 1: Create EC2 Instance

1. **Log in to AWS Console**
   - Go to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance:**
   - **Name**: `metacampus-algorand-node`
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier eligible)
   - **Instance Type**: `t2.medium` (minimum) or `t2.large` (recommended)
   - **Key Pair**: Create new or use existing SSH key
   - **Storage**: 100 GB gp3 SSD minimum (TestNet needs ~50GB, MainNet needs 200GB+)

3. **Security Group Rules:**
   ```
   SSH (22) - Your IP only
   HTTP (80) - Your IP only
   HTTPS (443) - Your IP only
   Custom TCP (4001) - Your IP only (Algorand Node API)
   Custom TCP (8980) - Your IP only (Indexer API)
   ```

4. **Launch Instance**

### Step 2: Connect to EC2 Instance

```bash
# SSH into your instance
ssh -i /path/to/your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Update system packages
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Algorand Node

```bash
# Install dependencies
sudo apt install -y gnupg2 curl software-properties-common

# Add Algorand package repository
curl -o - https://releases.algorand.com/key.pub | sudo tee /etc/apt/trusted.gpg.d/algorand.asc
sudo add-apt-repository "deb [arch=amd64] https://releases.algorand.com/deb/ stable main"

# Update package list
sudo apt update

# Install Algorand Node
sudo apt install -y algorand

# Start Algorand service
sudo systemctl start algorand
sudo systemctl enable algorand
```

### Step 4: Configure Node for TestNet

```bash
# Stop the node
sudo systemctl stop algorand

# Switch to TestNet
sudo -u algorand -s
cd /var/lib/algorand
./goal node stop -d data
./goal node clone -n testnet -d data
exit

# Start the node
sudo systemctl start algorand

# Check node status
goal node status -d /var/lib/algorand/data

# Check sync progress (may take several hours)
goal node status -d /var/lib/algorand/data
```

### Step 5: Install Algorand Indexer (Optional but Recommended)

```bash
# Install indexer
sudo apt install -y algorand-indexer

# Configure indexer for PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql -c "CREATE DATABASE algorand_indexer;"
sudo -u postgres psql -c "CREATE USER algorand WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE algorand_indexer TO algorand;"

# Configure indexer
sudo mkdir -p /var/lib/algorand-indexer
sudo chown algorand:algorand /var/lib/algorand-indexer

# Start indexer (this will take time to sync)
sudo -u algorand algorand-indexer daemon \
  --data-dir /var/lib/algorand/data \
  --postgres "host=localhost user=algorand password=your_password dbname=algorand_indexer port=5432 sslmode=disable" \
  --server :8980 &
```

### Step 6: Configure API Access

```bash
# Get API token
sudo cat /var/lib/algorand/data/algod.token

# Get node URL (use EC2 public IP)
echo "http://<EC2_PUBLIC_IP>:4001"

# Test API access
curl -H "X-Algo-API-Token: $(cat /var/lib/algorand/data/algod.token)" \
  http://localhost:4001/v2/status
```

### Step 7: Update MetaCAMPUS Environment

Update your `.env.local`:

```bash
NEXT_PUBLIC_ALGOD_URL=http://<EC2_PUBLIC_IP>:4001
NEXT_PUBLIC_INDEXER_URL=http://<EC2_PUBLIC_IP>:8980
NEXT_PUBLIC_ALGOD_TOKEN=<your_algod_token>
NEXT_PUBLIC_INDEXER_TOKEN=
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
```

---

## Option 2: Use Public Nodes (Recommended for Development)

### Public TestNet Nodes (Free)

1. **AlgoNode (Recommended)**
   ```bash
   NEXT_PUBLIC_ALGOD_URL=https://testnet-api.algonode.cloud
   NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.algonode.cloud
   NEXT_PUBLIC_ALGOD_TOKEN=
   NEXT_PUBLIC_INDEXER_TOKEN=
   ```

2. **Nodely**
   ```bash
   NEXT_PUBLIC_ALGOD_URL=https://testnet-api.4160.nodely.dev
   NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.4160.nodely.dev
   NEXT_PUBLIC_ALGOD_TOKEN=
   NEXT_PUBLIC_INDEXER_TOKEN=
   ```

3. **PureStake (Requires Free API Key)**
   - Sign up at: https://developer.purestake.io/
   - Get free API key
   ```bash
   NEXT_PUBLIC_ALGOD_URL=https://testnet-algorand.api.purestake.io/ps2
   NEXT_PUBLIC_INDEXER_URL=https://testnet-algorand.api.purestake.io/idx2
   NEXT_PUBLIC_ALGOD_TOKEN=<your_api_key>
   NEXT_PUBLIC_INDEXER_TOKEN=<your_api_key>
   ```

### Public MainNet Nodes

⚠️ **For Production Only**

```bash
# AlgoNode MainNet
NEXT_PUBLIC_ALGOD_URL=https://mainnet-api.algonode.cloud
NEXT_PUBLIC_INDEXER_URL=https://mainnet-idx.algonode.cloud
NEXT_PUBLIC_ALGORAND_NETWORK=mainnet
```

---

## Smart Contract Deployment

### Prerequisites

1. **Pera Wallet with TestNet ALGO:**
   - Install Pera Wallet app
   - Switch to TestNet in settings
   - Get free ALGO: https://bank.testnet.algorand.network/

2. **Contract Base64 Files:**
   - Located in `/docs/AUTH_CONTRACT_BASE64.txt`
   - Located in `/docs/BADGE_CONTRACT_BASE64.txt`

### Deploy Authentication Contract

1. **Go to Lora Transaction Wizard:**
   - URL: https://lora.algokit.io/testnet
   - Click "Txn Wizard" → "Application Call"
   - Select "Create" for On Complete

2. **Paste Approval Program:**
   - Copy content from `/docs/AUTH_CONTRACT_BASE64.txt`
   - Paste in "Approval Program (base64)" field

3. **Set Clear Program:**
   ```
   BoEBQw==
   ```

4. **Set State Schema:**
   ```
   Global Byte Slices: 5
   Global Integers: 1
   Local Byte Slices: 2
   Local Integers: 1
   ```

5. **Deploy:**
   - Click "Build Transaction"
   - Connect Pera Wallet (scan QR)
   - Approve transaction
   - Copy the **Application ID**

6. **Update Environment:**
   ```bash
   NEXT_PUBLIC_APP_ID=<your_auth_app_id>
   ```

### Deploy Badge Contract (Optional)

Follow same steps using `/docs/BADGE_CONTRACT_BASE64.txt`

See detailed guide: [docs/BADGE_CONTRACT_DEPLOYMENT.md](./BADGE_CONTRACT_DEPLOYMENT.md)

---

## Verification

### Test Node Connection

```bash
# Test from your local machine
curl $NEXT_PUBLIC_ALGOD_URL/v2/status

# Should return JSON with node status
```

### Test MetaCAMPUS App

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Click "Connect Wallet"
# Should connect successfully
```

---

## Troubleshooting

### Node Sync Issues

```bash
# Check sync status
goal node status -d /var/lib/algorand/data

# If stuck, restart node
sudo systemctl restart algorand

# Check logs
sudo journalctl -u algorand -f
```

### API Connection Errors

1. **Check Security Group Rules:**
   - Ensure ports 4001 and 8980 are open to your IP

2. **Check Node Status:**
   ```bash
   sudo systemctl status algorand
   ```

3. **Test Local Connection:**
   ```bash
   curl http://localhost:4001/v2/status
   ```

### Indexer Issues

```bash
# Check indexer status
ps aux | grep algorand-indexer

# Restart indexer
pkill algorand-indexer
# Then restart with command from Step 5
```

### Environment Variable Issues

1. **Verify `.env.local` exists:**
   ```bash
   ls -la .env.local
   ```

2. **Check for typos:**
   - Variable names must be exact (case-sensitive)
   - No spaces around `=`
   - No quotes around values

3. **Restart dev server after changes:**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

---

## Cost Estimation (AWS EC2)

### TestNet Development
- **Instance**: t2.medium ($0.046/hour = ~$33/month)
- **Storage**: 100 GB gp3 ($8/month)
- **Data Transfer**: Minimal (~$1-2/month)
- **Total**: ~$42-43/month

### MainNet Production
- **Instance**: t2.large ($0.092/hour = ~$67/month)
- **Storage**: 250 GB gp3 ($20/month)
- **Data Transfer**: Variable ($5-20/month)
- **Total**: ~$92-107/month

### Free Alternatives
- **Public Nodes**: $0/month (recommended for development)
- **AlgoNode/Nodely**: Free tier available

---

## Security Best Practices

1. **Never commit private keys or mnemonics to Git**
2. **Use environment variables for all sensitive data**
3. **Restrict EC2 security group to your IP only**
4. **Use strong passwords for database**
5. **Enable 2FA on AWS account**
6. **Regularly update system packages**
7. **Monitor AWS billing alerts**

---

## Additional Resources

- **Algorand Developer Docs**: https://developer.algorand.org/
- **Algorand Node Setup**: https://developer.algorand.org/docs/run-a-node/setup/install/
- **Lora Explorer**: https://lora.algokit.io/
- **Pera Wallet**: https://perawallet.app/
- **AlgoNode Public API**: https://algonode.io/api/
- **TestNet Faucet**: https://bank.testnet.algorand.network/

---

## Support

If you encounter issues:

1. Check troubleshooting section above
2. Review Algorand documentation
3. Open an issue on GitHub
4. Join Algorand Discord: https://discord.gg/algorand

---

**Last Updated**: November 17, 2025
