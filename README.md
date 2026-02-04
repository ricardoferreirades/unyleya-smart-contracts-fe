# Unyleya NFT Marketplace - Frontend

A React frontend application for interacting with ERC-20 and ERC-721 smart contracts, built with Vite, wagmi, RainbowKit, and ethers.js.

## Features

- 🔗 **Wallet Connection**: Connect wallet via RainbowKit
- 💰 **ERC-20 Balance**: Display user's token balance in header
- 👑 **Admin Functions**: 
  - Mint and transfer tokens (owner only)
  - Update NFT price (owner only)
  - View current NFT price
- 🛒 **Buy NFTs**: Complete flow with approve + mint
- 📦 **NFT Management**: List user's NFTs and transfer them

## Tech Stack

- **React.js** - UI framework
- **Vite** - Build tool (fastest React setup)
- **ethers.js** - Ethereum library
- **wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Redux Toolkit** - State management
- **SweetAlert2** - Beautiful alerts
- **Tailwind CSS** - Styling
- **DaisyUI** - Component library

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_ERC20_ADDRESS=0x...
   VITE_ERC721_ADDRESS=0x...
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
   
   You can copy from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   **Note:** Get a free WalletConnect project ID at [cloud.walletconnect.com](https://cloud.walletconnect.com)

4. **Add Contract ABIs:**
   - Export ABIs from your Hardhat project
   - Copy to `src/abi/PaymentToken.json` and `src/abi/PaidMintNFT.json`
   - The current ABIs are placeholders - replace with your actual contract ABIs

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── abi/                    # Contract ABIs
│   ├── PaymentToken.json
│   └── PaidMintNFT.json
├── components/             # React components
│   ├── Header.jsx         # Wallet connection & balance
│   ├── AdminPanel.jsx     # Admin functions
│   ├── UserPanel.jsx      # Buy NFT flow
│   └── NftList.jsx        # List & transfer NFTs
├── store/                  # Redux store
│   ├── index.js
│   ├── walletSlice.js
│   ├── balancesSlice.js
│   └── nftsSlice.js
├── utils/                  # Utility functions
│   ├── contracts.js       # Contract helpers
│   ├── format.js          # Format/parse units
│   └── ethersAdapter.js   # Viem to ethers adapter
├── App.jsx                 # Main app component
└── main.jsx               # Entry point
```

## Usage

### For Admins (Contract Owner)

1. Connect your wallet (must be the contract owner)
2. Use **Admin Panel** to:
   - Mint and transfer tokens to any address
   - Update the NFT price
   - View current NFT price

### For Users

1. Connect your wallet
2. View your ERC-20 token balance in the header
3. Use **Buy NFT** to purchase an NFT (approves tokens and mints)
4. View your NFTs in **My NFTs** section
5. Transfer NFTs to other addresses

## Requirements

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible wallet
- Deployed ERC-20 and ERC-721 contracts

## Notes

- The app assumes ERC721Enumerable for NFT listing (uses `tokenOfOwnerByIndex`)
- All token amounts use 18 decimals
- Network switching is handled by RainbowKit
- Transaction confirmations use SweetAlert2 for better UX

## License

MIT
