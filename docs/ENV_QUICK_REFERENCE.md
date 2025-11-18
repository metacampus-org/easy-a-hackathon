# Environment Variables Quick Reference

## 🚀 Quick Setup for Development

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Use these TestNet values
NEXT_PUBLIC_ALGOD_URL=https://testnet-api.4160.nodely.dev
NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.4160.nodely.dev
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
NEXT_PUBLIC_APP_ID=0
NEXT_PUBLIC_SUPER_ADMIN_WALLET=<your_pera_wallet_address>

# 3. Set database credentials
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=metacampus_db

# 4. Start dev server
npm run dev
```

---

## 📋 All Environment Variables

### ✅ Required for Basic Setup

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_ALGOD_URL` | Algorand node API URL | `https://testnet-api.4160.nodely.dev` |
| `NEXT_PUBLIC_INDEXER_URL` | Algorand indexer URL | `https://testnet-idx.4160.nodely.dev` |
| `NEXT_PUBLIC_APP_ID` | Auth contract app ID | `748159417` (or `0` before deployment) |
| `NEXT_PUBLIC_SUPER_ADMIN_WALLET` | Super admin wallet address | `ABCDEFG...` (58 characters) |
| `NEXT_PUBLIC_ALGORAND_NETWORK` | Algorand network | `testnet` or `mainnet` |

### 🗄️ Database (postgres_db_branch)

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL username | `postgres` or `metacampus` |
| `DB_PASSWORD` | PostgreSQL password | `your_secure_password` |
| `DB_NAME` | PostgreSQL database name | `metacampus_db` |

### 🔧 Optional Variables

| Variable | Description | Default | When Needed |
|----------|-------------|---------|-------------|
| `NEXT_PUBLIC_ALGOD_TOKEN` | Node auth token | (empty) | Private/local nodes |
| `NEXT_PUBLIC_INDEXER_TOKEN` | Indexer auth token | (empty) | Private indexers |
| `NEXT_PUBLIC_ALGORAND_APP_ID` | Badge contract app ID | `0` | After badge deployment |
| `NEXT_PUBLIC_BADGE_APP_ID` | Alt badge app ID | `0` | If using separate badge contract |
| `SQLITE_DB_PATH` | SQLite database path | `./data/metacampus.db` | Development/testing |
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | Web3Auth client ID | (empty) | Legacy Web3Auth integration |
| `NEXT_PUBLIC_WEB3AUTH_NETWORK` | Web3Auth network | `testnet` | Legacy Web3Auth integration |
| `NEXT_PUBLIC_ENABLE_UNIVERSITY_SIGNUP` | Allow university signup | `true` | Feature flag |
| `NEXT_PUBLIC_ENABLE_IPFS` | Enable IPFS storage | `false` | IPFS integration |
| `NEXT_PUBLIC_DEBUG_AUTH` | Auth debug logging | `false` | Debugging |

---

## 🌐 Public Node Providers

### TestNet (Free)

#### Option 1: Nodely (Recommended)
```bash
NEXT_PUBLIC_ALGOD_URL=https://testnet-api.4160.nodely.dev
NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.4160.nodely.dev
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_INDEXER_TOKEN=
```

#### Option 2: AlgoNode
```bash
NEXT_PUBLIC_ALGOD_URL=https://testnet-api.algonode.cloud
NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.algonode.cloud
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_INDEXER_TOKEN=
```

#### Option 3: PureStake (Requires API Key)
```bash
NEXT_PUBLIC_ALGOD_URL=https://testnet-algorand.api.purestake.io/ps2
NEXT_PUBLIC_INDEXER_URL=https://testnet-algorand.api.purestake.io/idx2
NEXT_PUBLIC_ALGOD_TOKEN=<your_api_key>
NEXT_PUBLIC_INDEXER_TOKEN=<your_api_key>
```
Get API key: https://developer.purestake.io/

### MainNet (Production)

#### AlgoNode MainNet
```bash
NEXT_PUBLIC_ALGOD_URL=https://mainnet-api.algonode.cloud
NEXT_PUBLIC_INDEXER_URL=https://mainnet-idx.algonode.cloud
NEXT_PUBLIC_ALGORAND_NETWORK=mainnet
```

---

## 🔑 How to Get Values

### NEXT_PUBLIC_SUPER_ADMIN_WALLET

1. Install Pera Wallet app
2. Create/import wallet
3. Switch to TestNet (Settings → Developer Settings)
4. Copy your wallet address (58 characters)

**Example**: `P7ZUQKW5WQYQY5WQYQY5WQYQY5WQYQY5WQYQY5WQYQY5WQYQY5WQY`

### NEXT_PUBLIC_APP_ID

**Before deployment**: Set to `0`

**After deployment**:
1. Go to https://lora.algokit.io/testnet
2. Deploy auth contract (see SETUP_GUIDE.md)
3. Copy Application ID from transaction result
4. Update `.env.local`

**Example**: `748159417`

### Database Credentials

**Local PostgreSQL**:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE metacampus_db;
CREATE USER metacampus WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE metacampus_db TO metacampus;
```

Then use:
```bash
DB_USER=metacampus
DB_PASSWORD=secure_password_here
DB_NAME=metacampus_db
```

**Docker PostgreSQL**:
```bash
docker run --name metacampus-postgres \
  -e POSTGRES_DB=metacampus_db \
  -e POSTGRES_USER=metacampus \
  -e POSTGRES_PASSWORD=secure_password_here \
  -p 5432:5432 \
  -d postgres:15
```

---

## 🧪 Testing Your Setup

### Test Environment Variables

```bash
# Check if .env.local exists
ls -la .env.local

# Print environment variables (Node.js)
node -e "require('dotenv').config({path: '.env.local'}); console.log('ALGOD_URL:', process.env.NEXT_PUBLIC_ALGOD_URL); console.log('DB_NAME:', process.env.DB_NAME);"
```

### Test Algorand Connection

```bash
# Test algod endpoint
curl https://testnet-api.4160.nodely.dev/v2/status

# Test indexer endpoint
curl https://testnet-idx.4160.nodely.dev/health
```

### Test Database Connection

```bash
# Test PostgreSQL
psql -U metacampus -d metacampus_db -h localhost -c "SELECT NOW();"

# Or with environment variables
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -c "SELECT NOW();"
```

### Test Application

```bash
# Start dev server
npm run dev

# Should see in console:
# ✅ Environment configuration validated successfully
# ✅ Connected to PostgreSQL database
```

---

## ⚠️ Common Mistakes

### ❌ Wrong Format

```bash
# DON'T use quotes
NEXT_PUBLIC_ALGOD_URL="https://testnet-api.4160.nodely.dev"

# DON'T use spaces
NEXT_PUBLIC_ALGOD_URL = https://testnet-api.4160.nodely.dev

# DON'T mix up variable names
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.4160.nodely.dev  # Wrong name!
```

### ✅ Correct Format

```bash
# No quotes
NEXT_PUBLIC_ALGOD_URL=https://testnet-api.4160.nodely.dev

# No spaces
NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.4160.nodely.dev

# Exact variable names
NEXT_PUBLIC_SUPER_ADMIN_WALLET=ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV
```

### ❌ Wrong Wallet Address

```bash
# Too short
NEXT_PUBLIC_SUPER_ADMIN_WALLET=ABC123

# Placeholder
NEXT_PUBLIC_SUPER_ADMIN_WALLET=YOUR_WALLET_ADDRESS_HERE
```

### ✅ Correct Wallet Address

```bash
# Exactly 58 characters
NEXT_PUBLIC_SUPER_ADMIN_WALLET=P7ZUQKW5WQYQY5WQYQY5WQYQY5WQYQY5WQYQY5WQYQY5WQYQY5WQY
```

---

## 🔄 Update After Deployment

### After Deploying Auth Contract

```bash
# Update this line in .env.local
NEXT_PUBLIC_APP_ID=<your_actual_app_id>

# Example
NEXT_PUBLIC_APP_ID=748159417

# Restart dev server
npm run dev
```

### After Deploying Badge Contract

```bash
# Update this line in .env.local
NEXT_PUBLIC_ALGORAND_APP_ID=<your_badge_app_id>

# Example
NEXT_PUBLIC_ALGORAND_APP_ID=733353489

# Restart dev server
npm run dev
```

---

## 📝 Complete .env.local Template

Copy this and fill in your values:

```bash
# ====================
# ALGORAND BLOCKCHAIN
# ====================
NEXT_PUBLIC_ALGOD_URL=https://testnet-api.4160.nodely.dev
NEXT_PUBLIC_INDEXER_URL=https://testnet-idx.4160.nodely.dev
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_INDEXER_TOKEN=
NEXT_PUBLIC_ALGORAND_NETWORK=testnet

# ====================
# SMART CONTRACTS
# ====================
NEXT_PUBLIC_APP_ID=0
NEXT_PUBLIC_ALGORAND_APP_ID=0

# ====================
# SUPER ADMIN
# ====================
NEXT_PUBLIC_SUPER_ADMIN_WALLET=YOUR_WALLET_ADDRESS_HERE

# ====================
# DATABASE
# ====================
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=metacampus_db

# ====================
# OPTIONAL
# ====================
SQLITE_DB_PATH=./data/metacampus.db
NEXT_PUBLIC_ENABLE_UNIVERSITY_SIGNUP=true
NEXT_PUBLIC_ENABLE_IPFS=false
NEXT_PUBLIC_DEBUG_AUTH=false
```

---

## 🆘 Troubleshooting

### Error: "Missing required environment variable"

**Solution**: Check that variable is set in `.env.local` with correct name (case-sensitive)

### Error: "Invalid Algorand address"

**Solution**: Wallet address must be exactly 58 characters. Get from Pera Wallet app.

### Error: "Cannot connect to database"

**Solution**: 
1. Check PostgreSQL is running: `pg_isready`
2. Test connection: `psql -U $DB_USER -d $DB_NAME`
3. Verify credentials in `.env.local`

### Error: "Smart contract not deployed"

**Solution**: Either:
1. Set `NEXT_PUBLIC_APP_ID=0` (before deployment)
2. Deploy contract and update with actual App ID

### Changes not reflecting

**Solution**: Restart dev server after changing `.env.local`
```bash
# Stop: Ctrl+C
npm run dev
```

---

## 📚 See Also

- [Complete Setup Guide](./docs/SETUP_GUIDE.md)
- [Node Setup Guide](./docs/EC2_ALGORAND_NODE_SETUP.md)
- [Full .env.example](./.env.example)
- [Contract Deployment](./docs/BADGE_CONTRACT_DEPLOYMENT.md)

---

**Quick help**: `cp .env.example .env.local` → Edit values → `npm run dev`
