# 🎓 MetaCAMPUS

**Blockchain-Powered Academic Credential Management System**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![Algorand](https://img.shields.io/badge/Algorand-TestNet-blue)](https://algorand.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

> A decentralized platform for managing academic transcripts and course completion badges on the Algorand blockchain.

---

## 🌟 Features

### For Students
- 📜 **View Academic Transcripts** - Access your complete academic record on the blockchain
- 🏆 **Request Course Badges** - Submit requests for course completion badges
- 🔍 **Find Student Hash** - Locate your unique blockchain identifier
- 💾 **Download Transcripts** - Export your academic data as JSON

### For Universities
- 👨‍🎓 **Onboard Students** - Register new students on the blockchain
- 📚 **Manage Transcripts** - Add courses and update student records
- ✅ **Approve Badges** - Review and approve badge requests
- 🔐 **Verify Records** - Validate student credentials

### For Super Admins
- 🏛️ **University Management** - Approve university registrations
- 📊 **System Statistics** - Monitor platform-wide metrics
- 🔗 **Blockchain Monitoring** - Track all transactions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Pera Wallet (for blockchain interactions)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/metacampus.git
cd metacampus

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Algorand Node Configuration
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.4160.nodely.dev
NEXT_PUBLIC_ALGOD_PORT=443
NEXT_PUBLIC_ALGOD_TOKEN=

# Algorand Indexer Configuration
NEXT_PUBLIC_INDEXER_SERVER=https://testnet-idx.4160.nodely.dev
NEXT_PUBLIC_INDEXER_PORT=443
NEXT_PUBLIC_INDEXER_TOKEN=

# Smart Contract App IDs (TestNet)
NEXT_PUBLIC_AUTH_APP_ID=733353488
NEXT_PUBLIC_BADGE_APP_ID=733353489

# Network Configuration
NEXT_PUBLIC_NETWORK=TestNet
```

---

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Context API

### Blockchain
- **Network:** Algorand (TestNet/MainNet)
- **SDK:** AlgoSDK v3
- **Wallet:** Pera Wallet integration
- **Smart Contracts:** PyTeal (deployed)

### Storage
- **Development:** Browser localStorage
- **Production:** Blockchain + IPFS (planned)

---

## 🏗️ Project Structure

```
metacampus/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── student/             # Student portal
│   ├── university-admin/    # University admin portal
│   └── super-admin/         # Super admin dashboard
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── header.tsx           # App header
│   ├── route-guard.tsx      # Route protection
│   └── wallet-button.tsx    # Wallet connection
├── contexts/                # React contexts
│   └── wallet-context.tsx   # Wallet state management
├── lib/                     # Core business logic
│   ├── algorand-client.ts   # Algorand blockchain client
│   ├── transcript-service.ts # Transcript management
│   ├── badge-service.ts     # Badge management
│   └── file-storage-service.ts # Local storage
├── docs/                    # Documentation
├── public/                  # Static assets
└── .env.local              # Environment variables (not in git)
```

---

## 🔐 Smart Contracts

### Deployed on Algorand TestNet

#### Authentication Contract
- **App ID:** `733353488`
- **Purpose:** User role management (student, university, super admin)
- **Explorer:** [View on Lora](https://lora.algokit.io/testnet/application/733353488)

#### Badge Management Contract
- **App ID:** `733353489`
- **Purpose:** Course completion badge issuance and verification
- **Explorer:** [View on Lora](https://lora.algokit.io/testnet/application/733353489)

---

## 🎯 User Roles

### Student (Role: 0)
- View personal transcripts
- Request course completion badges
- Download academic records
- Find student hash

### University Admin (Role: 1)
- Onboard new students
- Add courses to transcripts
- Approve badge requests
- Verify student records

### Super Admin (Role: 2)
- Approve university registrations
- View system-wide statistics
- Monitor blockchain transactions
- Manage platform settings

---

## 🔄 Workflow

### Student Onboarding
1. University admin onboards student with personal info
2. System generates unique student hash (blockchain identifier)
3. Student record stored on blockchain
4. Student can access portal with wallet

### Transcript Management
1. University admin adds courses to student transcript
2. Courses include: name, grade, credits, semester, etc.
3. GPA calculated automatically
4. Updates stored on blockchain

### Badge Issuance
1. Student requests course completion badge
2. University admin reviews request
3. Admin approves badge
4. Badge minted on blockchain
5. Badge appears in student profile

---

## 📱 Wallet Integration

### Pera Wallet
MetaCAMPUS uses Pera Wallet for secure blockchain interactions:

1. **Install Pera Wallet:**
   - Mobile: [iOS](https://apps.apple.com/app/id1459898525) | [Android](https://play.google.com/store/apps/details?id=com.algorand.android)
   - Web: [Pera Web Wallet](https://web.perawallet.app)

2. **Connect Wallet:**
   - Click "Connect Wallet" in the app
   - Scan QR code or use WalletConnect
   - Approve connection in Pera Wallet

3. **Sign Transactions:**
   - All blockchain operations require wallet signature
   - Review transaction details before signing
   - Transactions are free on TestNet

---

## 🧪 Testing

### Local Testing
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Blockchain Testing
- Use TestNet for all development
- Get free ALGO from [TestNet Faucet](https://bank.testnet.algorand.network/)
- Monitor transactions on [Lora Explorer](https://lora.algokit.io/testnet)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/metacampus.git
   git push -u origin master
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables
   - Click "Deploy"

3. **Configure Environment Variables:**
   - Add all variables from `.env.local`
   - Ensure `NEXT_PUBLIC_*` prefix for client-side variables

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📚 Documentation

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started quickly
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current project state
- **[Documentation Index](./docs/DOCUMENTATION_INDEX.md)** - All documentation
- **[Cleanup Summary](./CLEANUP_COMPLETE.md)** - Recent codebase cleanup

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Live Demo:** [Coming Soon]
- **Documentation:** [docs/](./docs/)
- **Algorand Explorer:** [Lora TestNet](https://lora.algokit.io/testnet)
- **Pera Wallet:** [perawallet.app](https://perawallet.app)

---

## 🙏 Acknowledgments

- **Algorand Foundation** - Blockchain infrastructure
- **Pera Wallet** - Wallet integration
- **Vercel** - Hosting and deployment
- **Next.js Team** - Framework
- **shadcn/ui** - UI components

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/metacampus/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/metacampus/discussions)
- **Email:** [your-email@example.com]

---

## 🗺️ Roadmap

### Current (v1.0.0)
- ✅ Student transcript management
- ✅ Badge request and approval system
- ✅ University admin portal
- ✅ Super admin dashboard
- ✅ Pera Wallet integration

### Planned (v1.1.0)
- ⏭️ IPFS integration for document storage
- ⏭️ Multi-university support
- ⏭️ Advanced analytics dashboard
- ⏭️ Mobile app (React Native)

### Future (v2.0.0)
- ⏭️ MainNet deployment
- ⏭️ NFT badges
- ⏭️ Credential verification API
- ⏭️ Integration with existing SIS systems

---

## 📊 Status

- **Version:** 1.0.0
- **Status:** Production Ready ✅
- **Network:** Algorand TestNet
- **Last Updated:** October 22, 2025

---

**Built with ❤️ using Algorand blockchain technology**
# metacampus-demo
# metacampus-demo
# metacampus-demo
# metacampus-demo
