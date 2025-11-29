# eth-sign-verify

A minimal, offline-first Ethereum signature generator and verifier. Built for developers to quickly test EIP-191 signatures and verify ownership without interacting with the blockchain.

![App Screenshot](./screenshot.png)

## Features

### ✍️ Produce Signature
- **Dual Signing Modes**:
  - **Private Key**: Sign messages using a raw private key
  - **Extension**: Sign using connected browser wallets (MetaMask, Rabby, etc.)
- **Auto-Formatted Payloads**: Comes with a default JSON payload structure, but supports any string input
- **Output Results**: Instantly generates the `Signature` and the derived `Signer Address`

### 🔍 Verify Signature
- **Stateless Verification**: Uses cryptographic logic to recover the address from the signature and message. No backend required
- **Visual Feedback**: Clear, color-coded status indicators for **Matched** (Green), **Mismatch** (Red), and **Format Error** (Yellow)
- **Workflow Efficiency**: Includes a **"Fill to Verifier →"** button to instantly transfer generated data to the verification panel for immediate testing

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Crypto Library**: [viem](https://viem.sh/)
- **Styling**: Pure CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kadxy/eth-sign-verify.git
   cd eth-sign-verify
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Build for production**
   ```bash
   pnpm build
   ```

Open your browser and navigate to http://localhost:5173.

## Security Note

⚠️ **Private Key Safety**: This application runs entirely client-side. Private keys are processed strictly within your browser's memory and are never transmitted to any server.

**Best Practice**: Never enter a private key containing real Mainnet assets. Use testnet accounts or ephemeral development keys only.

## License

MIT License