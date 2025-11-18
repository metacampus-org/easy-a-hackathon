# How to Deploy Smart Contracts on Lora - Quick Visual Guide

## What You Need (Already Created!)

✅ **JSON App Spec Files** (located in `/docs/`):
- `auth-contract.app.json` - Authentication contract specification
- `badge-contract.app.json` - Badge management contract specification

✅ **Base64 Contract Files** (located in `/docs/`):
- `AUTH_CONTRACT_BASE64.txt` - Compiled auth contract
- `BADGE_CONTRACT_BASE64.txt` - Compiled badge contract

✅ **Deployment Guide**:
- `BADGE_CONTRACT_DEPLOYMENT.md` - Step-by-step instructions

---

## Step-by-Step: Deploy on Lora TestNet

### 🎯 Goal
Deploy the Badge Management Contract and get an **Application ID** to use in your `.env.local`

---

### Step 1: Open Lora Transaction Wizard

**URL**: https://lora.algokit.io/testnet

1. Click **"Txn Wizard"** (top menu)
2. Select **"Application Call"**
3. Choose **"Create"** for "On Complete" dropdown

---

### Step 2: Get State Schema from JSON

Open `docs/badge-contract.app.json` and find the state schema:

```json
"state": {
  "global": {
    "numByteSlices": 10,  // ← Use this number
    "numUints": 2          // ← Use this number
  },
  "local": {
    "numByteSlices": 0,   // ← Use this number
    "numUints": 0         // ← Use this number
  }
}
```

**Enter in Lora:**
```
Global State Schema:
  - Byte Slices: 10
  - Integers: 2

Local State Schema:
  - Byte Slices: 0
  - Integers: 0
```

---

### Step 3: Paste Contract Code

**Approval Program:**
1. Open `docs/BADGE_CONTRACT_BASE64.txt`
2. Copy the entire base64 string
3. Paste into Lora's "Approval Program (base64)" field

**Clear Program:**
```
BoEBQw==
```
(This is the same for all contracts - just paste it)

---

### Step 4: Deploy the Contract

1. Click **"Build Transaction"** button
2. **Connect Pera Wallet**:
   - Scan QR code with Pera Wallet app on your phone
   - Make sure you're on **TestNet** in Pera Wallet settings
3. Review transaction in Pera Wallet
4. Click **"Approve"** in Pera Wallet
5. Wait ~10 seconds for confirmation

---

### Step 5: Get Your Application ID

After successful deployment, you'll see:

```
✅ Transaction Confirmed
Application ID: 123456789  ← COPY THIS NUMBER!
```

**Update your `.env.local`:**
```bash
NEXT_PUBLIC_ALGORAND_APP_ID=123456789
```

---

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Read JSON Spec                                          │
│     docs/badge-contract.app.json                            │
│     ↓                                                        │
│     Get state schema numbers                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Open Lora                                               │
│     https://lora.algokit.io/testnet                         │
│     → Txn Wizard → Application Call → Create               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Enter State Schema                                      │
│     Global: 10 byte slices, 2 integers                      │
│     Local:  0 byte slices, 0 integers                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Paste Base64 Code                                       │
│     Approval: From BADGE_CONTRACT_BASE64.txt                │
│     Clear: BoEBQw==                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Connect Pera Wallet & Approve                           │
│     Scan QR → Review → Approve                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Get Application ID                                      │
│     Copy the number (e.g., 123456789)                       │
│     Update .env.local                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## What Each JSON File Contains

### `auth-contract.app.json`

**For Deploying Authentication Contract:**

```json
{
  "state": {
    "global": {
      "numByteSlices": 5,   // ← Enter in Lora
      "numUints": 1         // ← Enter in Lora
    },
    "local": {
      "numByteSlices": 2,   // ← Enter in Lora
      "numUints": 1         // ← Enter in Lora
    }
  }
}
```

**Methods documented:**
- `register_user(address, role, university_name)`
- `get_user_role(address)`
- `update_user_status(address, is_active)`
- `verify_auth(address, required_role)`

**Use this App ID for:**
```bash
NEXT_PUBLIC_APP_ID=<your_auth_app_id>
```

---

### `badge-contract.app.json`

**For Deploying Badge Management Contract:**

```json
{
  "state": {
    "global": {
      "numByteSlices": 10,  // ← Enter in Lora
      "numUints": 2         // ← Enter in Lora
    },
    "local": {
      "numByteSlices": 0,   // ← Enter in Lora
      "numUints": 0         // ← Enter in Lora
    }
  }
}
```

**Methods documented:**
- `create_badge_request(...)`
- `approve_badge_request(...)`
- `create_meta_badge(...)`
- `verify_badge(...)`

**Use this App ID for:**
```bash
NEXT_PUBLIC_ALGORAND_APP_ID=<your_badge_app_id>
```

---

## Example: Complete Lora Deployment

### Auth Contract Deployment

1. **Open**: https://lora.algokit.io/testnet
2. **Txn Wizard** → Application Call → Create
3. **State Schema**:
   ```
   Global Byte Slices: 5
   Global Integers: 1
   Local Byte Slices: 2
   Local Integers: 1
   ```
4. **Approval Program**: Paste from `docs/AUTH_CONTRACT_BASE64.txt`
5. **Clear Program**: `BoEBQw==`
6. **Deploy** → Get App ID → Update `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_ID=748159417
   ```

### Badge Contract Deployment

1. **Open**: https://lora.algokit.io/testnet
2. **Txn Wizard** → Application Call → Create
3. **State Schema**:
   ```
   Global Byte Slices: 10
   Global Integers: 2
   Local Byte Slices: 0
   Local Integers: 0
   ```
4. **Approval Program**: Paste from `docs/BADGE_CONTRACT_BASE64.txt`
5. **Clear Program**: `BoEBQw==`
6. **Deploy** → Get App ID → Update `.env.local`:
   ```bash
   NEXT_PUBLIC_ALGORAND_APP_ID=733353489
   ```

---

## Troubleshooting

### ❌ Error: "Invalid state schema"
**Solution**: Double-check numbers from JSON file match exactly what you entered in Lora

### ❌ Error: "Transaction failed"
**Solution**: 
- Make sure you have TestNet ALGO in your wallet (get from https://bank.testnet.algorand.network/)
- Verify Pera Wallet is on TestNet (Settings → Developer Settings)

### ❌ Error: "Invalid base64"
**Solution**: 
- Copy the ENTIRE content from `.txt` file
- Don't add extra spaces or newlines
- Use the clear program: `BoEBQw==` exactly as shown

### ❌ Can't connect Pera Wallet
**Solution**:
- Make sure Pera Wallet app is installed on your phone
- Check you're on TestNet in Pera Wallet settings
- Try refreshing the QR code in Lora

---

## After Deployment Checklist

- [ ] Deployed auth contract and got Application ID
- [ ] Updated `NEXT_PUBLIC_APP_ID` in `.env.local`
- [ ] Deployed badge contract and got Application ID
- [ ] Updated `NEXT_PUBLIC_ALGORAND_APP_ID` in `.env.local`
- [ ] Verified both App IDs are numbers (not 0)
- [ ] Restarted dev server: `npm run dev`
- [ ] Checked console for: `✅ Environment configuration validated successfully`

---

## Quick Reference

| What | Where | Use For |
|------|-------|---------|
| State Schema | `*.app.json` → `state` section | Lora deployment |
| Base64 Code | `*_CONTRACT_BASE64.txt` | Lora approval program |
| Clear Program | Always `BoEBQw==` | Lora clear program |
| Application ID | Lora after deployment | `.env.local` |
| Method Signatures | `*.app.json` → `methods` | Frontend integration |

---

## Need Help?

1. Read `docs/BADGE_CONTRACT_DEPLOYMENT.md` for detailed instructions
2. Check `docs/SETUP_GUIDE.md` for complete setup walkthrough
3. Review `docs/EC2_ALGORAND_NODE_SETUP.md` if you need your own node

**Files are in the `/docs/` directory and ready to use!** 🚀
