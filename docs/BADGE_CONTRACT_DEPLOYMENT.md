# Badge Management Contract Deployment Guide

## Contract Details

**Purpose**: Manages student badges and academic credentials on Algorand blockchain

**Features**:
- Create badge requests
- Approve badge requests (admin only)
- Mint/create badges
- Verify badges

## Deployment via Lora

### Step 1: Go to Lora Txn Wizard
https://lora.algokit.io/testnet

Click "Txn Wizard" → "Application Call" → Select "Create" for On Complete

### Step 2: Paste Base64 Programs

**Approval Program (base64):**
```
BiADAQIAJgQMdG90YWxfYmFkZ2VzDnRvdGFsX3JlcXVlc3RzCXRpbWVzdGFtcAhhcHByb3ZlZDEYJBJAAPU2GgCAFGNyZWF0ZV9iYWRnZV9yZXF1ZXN0EkAArDYaAIAVYXBwcm92ZV9iYWRnZV9yZXF1ZXN0EkAAZjYaAIARY3JlYXRlX21ldGFfYmFkZ2USQAAdNhoAgAx2ZXJpZnlfYmFkZ2USQAABADEbIxJEIkMxADIJEkQxGyMSRIAKYmFkZ2VfZGF0YTYaAVA2GgFnKjYaAVAyB2coKGQiCGciQzEAMgkSRDEbIxJEKzYaAVArZ4ALYXBwcm92ZWRfYXQ2GgFQMgdnIkMxGyMSRIANYmFkZ2VfcmVxdWVzdDYaAVA2GgFnKjYaAVAyB2cpKWQiCGciQ4AQY29udHJhY3RfdmVyc2lvboADMi4wZygkZykkZyJD
```

**Clear Program (base64):**
```
BoEBQw==
```

### Step 3: Set State Schema

**IMPORTANT - Use these exact values:**
- **Global Byte Slices**: 10
- **Global Integers**: 2
- **Local Byte Slices**: 0
- **Local Integers**: 0

### Step 4: Deploy

1. Click "Build Transaction"
2. Connect Pera Wallet (scan QR with phone)
3. Approve the transaction
4. Wait ~10 seconds
5. **Copy the Application ID**

### Step 5: Update Environment

Add to `.env.local`:
```bash
NEXT_PUBLIC_BADGE_APP_ID=<your-badge-app-id>
```

## After Deployment

Your MetaCAMPUS app will have:
- ✅ Authentication Contract (App ID: 748159417)
- ✅ Badge Management Contract (App ID: <new-id>)

Both contracts working together for full functionality!

## Cleanup Lora

To delete the duplicate auth contract (748158465):
1. Go to Lora → "App Lab"
2. Find application 748158465
3. Click delete/remove
4. Confirm deletion

---

**Ready to deploy?** Follow the steps above!
