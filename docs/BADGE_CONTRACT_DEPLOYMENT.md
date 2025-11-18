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

## Appendix: EC2 Algorand Node (quick summary)

If you plan to run your own Algorand node on AWS EC2 rather than using public nodes, the full step-by-step instructions are in `docs/EC2_ALGORAND_NODE_SETUP.md`. Below is a short summary and quick checklist so the Lora deployment steps above are still reproducible when using your EC2 node.

- Launch an Ubuntu 22.04 instance (t2.medium or t2.large recommended). Open SSH (22) and Algorand ports (4001 for algod, 8980 for indexer) to your IP only.
- SSH into the instance and install Algorand packages, start the algorand service and clone the TestNet data directory (see full guide).
- (Optional) Install and configure Algorand Indexer with PostgreSQL. Create a PostgreSQL DB for the indexer and provide its connection string when starting the indexer.
- Retrieve your node token from `/var/lib/algorand/data/algod.token` and use the EC2 public IP for the node URL: `http://<EC2_PUBLIC_IP>:4001`.
- Update your local `.env.local` with the EC2 node values:

```bash
NEXT_PUBLIC_ALGOD_URL=http://<EC2_PUBLIC_IP>:4001
NEXT_PUBLIC_INDEXER_URL=http://<EC2_PUBLIC_IP>:8980
NEXT_PUBLIC_ALGOD_TOKEN=<your_algod_token>
NEXT_PUBLIC_INDEXER_TOKEN=
NEXT_PUBLIC_ALGORAND_NETWORK=testnet
```

Notes:
- For development, we recommend using public TestNet nodes (AlgoNode, Nodely, PureStake) to avoid EC2 costs and long sync times; instructions for public nodes are in the EC2 guide's Quick Start section.
- Full EC2 instructions (including commands, security group settings, and troubleshooting) are in `docs/EC2_ALGORAND_NODE_SETUP.md`.
