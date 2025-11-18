# MetaCAMPUS Quick Setup Guide

This guide will help you set up the MetaCAMPUS project for development on the `postgres_db_branch`.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally or access to a PostgreSQL database
- Git installed
- Pera Wallet app (for blockchain testing)

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/metacampus-org/easy-a-hackathon.git
cd easy-a-hackathon

# Checkout postgres_db_branch
git checkout postgres_db_branch

# Install dependencies
npm install

# or if using pnpm
pnpm install
```

---

## Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local  # or use your preferred editor
```

### Required Environment Variables

Edit `.env.local` and fill in these values:

```bash
# ================================
# ALGORAND CONFIGURATION
# ================================

# For TestNet development (recommended)
NEXT_PUBLIC_ALGOD_URL=https://testnet-api.4160.nodely.dev
NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.4160.nodely.dev
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_INDEXER_TOKEN=
NEXT_PUBLIC_ALGORAND_NETWORK=testnet

# Smart Contract App IDs
# Set to 0 initially, update after deployment
NEXT_PUBLIC_APP_ID=0
NEXT_PUBLIC_ALGORAND_APP_ID=0

# Super Admin Wallet
# Replace with your Algorand wallet address (58 characters)
NEXT_PUBLIC_SUPER_ADMIN_WALLET=YOUR_WALLET_ADDRESS_HERE

# ================================
# DATABASE CONFIGURATION
# ================================

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=metacampus_db
```

### Where to Get Values

1. **Algorand Node URLs**: 
   - Use public nodes (free): https://testnet-api.4160.nodely.dev
   - OR set up your own node: See [EC2_ALGORAND_NODE_SETUP.md](./docs/EC2_ALGORAND_NODE_SETUP.md)

2. **Super Admin Wallet**:
   - Install Pera Wallet app on your phone
   - Create a new wallet or use existing
   - Switch to TestNet in settings
   - Copy your wallet address (58 characters starting with a letter)

3. **Database Credentials**:
   - Use your local PostgreSQL username/password
   - Or create new database user (see Step 3)

---

## Step 3: Set Up PostgreSQL Database

### Option A: Create Local Database

```bash
# Start PostgreSQL (macOS)
brew services start postgresql

# Or on Linux
sudo systemctl start postgresql

# Create database and user
psql -U postgres

# In psql prompt:
CREATE DATABASE metacampus_db;
CREATE USER metacampus WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE metacampus_db TO metacampus;
\q
```

Update your `.env.local`:
```bash
DB_USER=metacampus
DB_PASSWORD=your_secure_password
DB_NAME=metacampus_db
```

### Option B: Use Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name metacampus-postgres \
  -e POSTGRES_DB=metacampus_db \
  -e POSTGRES_USER=metacampus \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

### Initialize Database Schema

```bash
# Run the database initialization script
cd database
bash metacampus_db.sh

# Or run SQL directly
psql -U metacampus -d metacampus_db -f database/metacampus_db.sh
```

---

## Step 4: Get TestNet ALGO (For Blockchain Testing)

1. **Install Pera Wallet** (if not already):
   - iOS: https://apps.apple.com/app/id1459898525
   - Android: https://play.google.com/store/apps/details?id=com.algorand.android

2. **Switch to TestNet**:
   - Open Pera Wallet
   - Go to Settings → Developer Settings
   - Enable TestNet
   - Restart app

3. **Get Free TestNet ALGO**:
   - Copy your wallet address from Pera Wallet
   - Visit: https://bank.testnet.algorand.network/
   - Paste your address and dispense ALGO
   - Wait 30 seconds for confirmation

---

## Step 5: Deploy Smart Contracts

You need to deploy two smart contracts to Algorand TestNet.

### Deploy Authentication Contract

1. **Go to Lora Transaction Wizard**:
   - URL: https://lora.algokit.io/testnet
   - Click "Txn Wizard" → "Application Call" → "Create"

2. **Paste Base64 Programs**:
   - **Approval Program**: Copy from `docs/AUTH_CONTRACT_BASE64.txt`
   - **Clear Program**: `BoEBQw==`

3. **Set State Schema**:
   ```
   Global Byte Slices: 5
   Global Integers: 1
   Local Byte Slices: 2
   Local Integers: 1
   ```

4. **Deploy**:
   - Click "Build Transaction"
   - Connect Pera Wallet (scan QR with phone)
   - Approve transaction
   - **COPY THE APPLICATION ID** (you'll need this!)

5. **Update .env.local**:
   ```bash
   NEXT_PUBLIC_APP_ID=<your_auth_app_id>
   ```

### Deploy Badge Contract (Optional)

Follow the same steps using `docs/BADGE_CONTRACT_BASE64.txt`

See detailed guide: [BADGE_CONTRACT_DEPLOYMENT.md](./docs/BADGE_CONTRACT_DEPLOYMENT.md)

State Schema for Badge Contract:
```
Global Byte Slices: 10
Global Integers: 2
Local Byte Slices: 0
Local Integers: 0
```

Update `.env.local`:
```bash
NEXT_PUBLIC_ALGORAND_APP_ID=<your_badge_app_id>
```

---

## Step 6: Start Development Server

```bash
# Start Next.js development server
npm run dev

# or
pnpm dev
```

Open your browser to: http://localhost:3000

---

## Step 7: Test the Application

### Connect Wallet

1. Click "Connect Wallet" in the app
2. Scan QR code with Pera Wallet app
3. Approve connection
4. Your wallet address should appear in header

### Test as Super Admin

Since you set `NEXT_PUBLIC_SUPER_ADMIN_WALLET` to your wallet address, you have super admin privileges.

1. Navigate to: http://localhost:3000/super-admin
2. You should see the super admin dashboard
3. Try approving university signups or viewing statistics

### Test Database Connection

```bash
# Test PostgreSQL connection
npm run test:db

# Or manually test
node -e "const pool = require('./database/db.ts').default; pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows); pool.end(); });"
```

---

## Troubleshooting

### Issue: "Environment Configuration Errors"

**Solution**: Make sure you copied `.env.example` to `.env.local` and filled in all required values.

```bash
# Verify file exists
ls -la .env.local

# Check contents
cat .env.local
```

### Issue: "Cannot connect to database"

**Solutions**:

1. **Check PostgreSQL is running**:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify credentials**:
   ```bash
   # Test connection
   psql -U metacampus -d metacampus_db -h localhost
   ```

3. **Check environment variables**:
   ```bash
   # Print DB config (from Node.js)
   node -e "require('dotenv').config({path: '.env.local'}); console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME);"
   ```

### Issue: "Smart contract not deployed"

**Solution**: Make sure you deployed the contracts and updated `.env.local` with the App IDs.

1. Check if App ID is set:
   ```bash
   grep NEXT_PUBLIC_APP_ID .env.local
   ```

2. Should show a number, not `0`:
   ```bash
   NEXT_PUBLIC_APP_ID=748159417
   ```

### Issue: "Wallet connection failed"

**Solutions**:

1. **Ensure TestNet is selected** in Pera Wallet settings
2. **Check network matches**:
   ```bash
   grep NEXT_PUBLIC_ALGORAND_NETWORK .env.local
   # Should be: NEXT_PUBLIC_ALGORAND_NETWORK=testnet
   ```

3. **Restart dev server** after changing `.env.local`

### Issue: Port 3000 already in use

**Solution**: Kill the process or use a different port

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

---

## Project Structure

```
easy-a-hackathon/
├── .env.example          # Environment variable template (NEW!)
├── .env.local            # Your local config (create this)
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── student/         # Student portal
│   ├── university-admin/ # University admin portal
│   └── super-admin/     # Super admin dashboard
├── components/          # React components
├── database/            # PostgreSQL configuration
│   ├── db.ts           # Database connection
│   ├── crud.ts         # Database operations
│   └── metacampus_db.sh # Database schema
├── docs/                # Documentation
│   ├── EC2_ALGORAND_NODE_SETUP.md (NEW!)
│   ├── BADGE_CONTRACT_DEPLOYMENT.md
│   ├── auth-contract.app.json (NEW!)
│   └── badge-contract.app.json (NEW!)
├── lib/                 # Core business logic
│   ├── env-validation.ts # Environment validation
│   └── algorand-client.ts # Blockchain client
└── README.md            # Project overview
```

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Configure PostgreSQL database
3. ✅ Get TestNet ALGO
4. ✅ Deploy smart contracts
5. ✅ Start development server
6. 🎯 Test all features
7. 🎯 Read the full documentation in `/docs`
8. 🎯 Start building!

---

## Additional Resources

- **Full Node Setup**: [EC2_ALGORAND_NODE_SETUP.md](./docs/EC2_ALGORAND_NODE_SETUP.md)
- **Smart Contract Deployment**: [BADGE_CONTRACT_DEPLOYMENT.md](./docs/BADGE_CONTRACT_DEPLOYMENT.md)
- **Environment Variables**: [.env.example](./.env.example)
- **Contract Specs**: 
  - [auth-contract.app.json](./docs/auth-contract.app.json)
  - [badge-contract.app.json](./docs/badge-contract.app.json)

---

## Getting Help

If you're stuck:

1. Check this guide thoroughly
2. Review error messages in browser console and terminal
3. Verify all environment variables are set correctly
4. Check PostgreSQL logs: `tail -f /usr/local/var/log/postgresql@14.log`
5. Check Algorand transactions: https://lora.algokit.io/testnet
6. Open a GitHub issue with detailed error information

---

**Happy Coding! 🚀**
