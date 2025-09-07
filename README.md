# Decentralized Student Transcript Management System

A blockchain-based system for managing and verifying student academic transcripts using Algorand technology. This system enables secure, transparent, and immutable record-keeping for educational institutions while providing instant verification capabilities.

## 🎯 Project Overview

This system creates a decentralized alternative to traditional transcript management, eliminating fraud, reducing verification time from weeks to seconds, and giving students full control over their academic records.

### Key Features

- **Immutable Records**: Academic data stored permanently on Algorand blockchain
- **Instant Verification**: Real-time transcript verification using cryptographic hashes
- **Student Privacy**: Hash-based identification protects student personal information
- **Institution Control**: Colleges manage their own student onboarding and transcript updates
- **Global Access**: Worldwide institutions can verify transcripts instantly
- **Cost Effective**: Minimal blockchain transaction fees compared to traditional verification

## 🏗️ Technology Stack

- **Blockchain**: Algorand Testnet
- **Frontend**: Next.js 15 with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Wallet Integration**: Pera Algo Wallet SDK
- **Smart Contracts**: PyTeal (Python for Algorand)
- **Blockchain SDK**: AlgoSDK for JavaScript

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Pera Algo Wallet (mobile app or browser extension)
- Algorand Testnet account with ALGO tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/metacampus-org/easy-a-hackathon
   cd easy-a-hackathon/easy-a-hackathon-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Connect your Pera Algo Wallet
   - Choose your role: Student, College Admin, or External Institution

## 📋 User Roles & Workflows

### 1. College Administrator (`/admin/transcript`)

**Purpose**: Onboard students and manage academic transcripts

**Workflow**:
1. Connect Pera Wallet to authenticate
2. **Onboard Student**: 
   - Enter student personal information
   - Generate unique blockchain hash identifier
   - Student receives their permanent hash ID
3. **Manage Transcripts**:
   - Search by student hash
   - Add course completion records
   - Update grades and credits
   - Submit to blockchain with digital signature

### 2. Student (`/student`)

**Purpose**: View and share their own academic records

**Workflow**:
1. Obtain student hash from their institution
2. Enter hash to view complete transcript
3. Download transcript data for offline access
4. Share verification hash with other institutions
5. Monitor academic progress and GPA

### 3. External Institution (`/verify`)

**Purpose**: Verify academic records for admissions/employment

**Workflow**:
1. Receive student hash from applicant
2. Enter hash into verification portal
3. Instantly receive verified transcript data
4. Download official verification report
5. Confirm authenticity via blockchain

## 🔐 Security & Privacy

### Data Protection
- **On-Chain**: Only hashed identifiers and encrypted academic data
- **Off-Chain**: Personal information stored securely by institutions
- **Access Control**: Students control who can access their records
- **Immutability**: Records cannot be altered once written to blockchain

### Verification Process
1. Student provides their unique hash to institution
2. Institution queries Algorand blockchain using hash
3. Smart contract returns encrypted academic data
4. System verifies cryptographic signatures
5. Institution receives verified transcript with authenticity proof

## 🧠 Smart Contract Architecture

### Contract Functions

```python
# Student onboarding
onboard_student(student_data) -> student_hash

# Transcript management  
update_transcript(student_hash, academic_data) -> transcript_hash

# Verification
verify_transcript(student_hash) -> verification_result
```

## 🔄 Transaction Flow

### 1. Student Onboarding
```
Admin -> Smart Contract -> Blockchain -> Student Hash Generated
```

### 2. Transcript Update
```
Admin -> Collect Course Data -> Smart Contract -> Blockchain Storage
```

### 3. Verification
```
External Institution -> Student Hash -> Smart Contract Query -> Verified Data
```

## 🛠️ Development

### Project Structure

```
easy-a-hackathon-frontend/
├── app/                          # Next.js app directory
│   ├── admin/transcript/         # College admin interface
│   ├── student/                  # Student portal
│   ├── verify/                   # Verification interface
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   └── wallet-connect.tsx        # Wallet integration
├── lib/                          # Core business logic
│   ├── transcript-service.ts     # Main service layer
│   ├── algorand.ts               # Blockchain connection
│   ├── wallet.ts                 # Wallet management
│   └── utils.ts                  # Utility functions
├── contracts/                    # Smart contract code
│   └── transcript_manager.py     # PyTeal contract
└── public/                       # Static assets
```

### Key Services

#### TranscriptService
- `onboardStudent()`: Create new student blockchain record
- `updateTranscript()`: Add/modify academic data
- `verifyTranscript()`: Retrieve and verify student records
- `generateStudentHash()`: Create unique identifiers
- `calculateGradePoints()`: GPA calculations

#### WalletService  
- `connectWallet()`: Pera Wallet integration
- `signTransaction()`: Cryptographic signing
- `getWalletState()`: Connection status management

#### AlgorandService
- `createApplicationCall()`: Smart contract interactions
- `submitTransaction()`: Blockchain submissions
- `queryBlockchain()`: Data retrieval

## 🎯 Benefits

### For Students
- **Ownership**: Complete control over academic records
- **Portability**: Records travel with student globally
- **Privacy**: Share only necessary information
- **Permanence**: Records never lost or destroyed

### For Institutions
- **Efficiency**: Automated verification processes
- **Security**: Elimination of transcript fraud
- **Cost Savings**: Reduced administrative overhead
- **Trust**: Cryptographic proof of authenticity

### For Employers
- **Confidence**: Verified academic credentials
- **Speed**: Instant background checks
- **Compliance**: Audit trail for verification
- **Accuracy**: No human verification errors

## 🔮 Future Enhancements

### Phase 2 Features
- **Multi-Institution Support**: Students from multiple colleges
- **Advanced Analytics**: Institutional reporting dashboards
- **API Integration**: Connect with existing SIS systems
- **Mobile Application**: Native iOS/Android apps

### Phase 3 Features
- **Micro-Credentials**: Skill-based certifications
- **AI Verification**: Automated course equivalency
- **DeFi Integration**: Scholarship and loan platforms
- **Global Standards**: International credential framework

## 🆘 Support

### Documentation
- [Algorand Developer Docs](https://developer.algorand.org/)
- [Pera Wallet Integration](https://perawallet.app/developers/)
- [Next.js Documentation](https://nextjs.org/docs)

### FAQ

**Q: How secure is student data on the blockchain?**
A: Personal information is hashed and encrypted. Only authorized parties with the student's hash can access records.

**Q: What happens if a student loses their hash?**
A: Institutions can regenerate access using the student's verified identity and original enrollment records.

**Q: Can transcripts be modified after blockchain storage?**
A: No, blockchain records are immutable. New entries can be added, but existing records cannot be changed.

**Q: Is this FERPA compliant?**
A: Yes, students control access to their records through private hash identifiers, maintaining privacy requirements.

---

Built with ❤️ for the future of education technology on Algorand blockchain.
