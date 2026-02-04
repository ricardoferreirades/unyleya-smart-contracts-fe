import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import TabbedInterface from './components/TabbedInterface';
import NftList from './components/NftList';
import { setERC20Balance } from './store/balancesSlice';
import { getERC20ContractWithProvider } from './utils/contracts';
import { publicClientToEthersProvider } from './utils/ethersAdapter';

const queryClient = new QueryClient();

// Configure wagmi with RainbowKit
// Get WalletConnect project ID from env or use placeholder
// Get a free project ID at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

const config = getDefaultConfig({
  appName: 'Unyleya NFT Marketplace',
  projectId: projectId,
  chains: [mainnet, sepolia, localhost],
  ssr: false,
});

// Component to load balance when wallet connects
const BalanceLoader = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const dispatch = useDispatch();

  useEffect(() => {
    const loadBalance = async () => {
      if (!isConnected || !address || !publicClient) {
        dispatch(setERC20Balance('0'));
        return;
      }

      try {
        // Convert viem public client to ethers provider
        const provider = publicClientToEthersProvider(publicClient);
        const erc20Contract = getERC20ContractWithProvider(provider);
        const balance = await erc20Contract.balanceOf(address);
        dispatch(setERC20Balance(balance.toString()));
      } catch (error) {
        console.error('Error loading balance:', error);
        dispatch(setERC20Balance('0'));
      }
    };

    loadBalance();
    
    // Reload balance periodically
    const interval = setInterval(loadBalance, 10000);
    return () => clearInterval(interval);
  }, [isConnected, address, publicClient, dispatch]);

  return null;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-base-300">
      <Header />
      <BalanceLoader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <TabbedInterface />
        </div>
        <div className="mt-6">
          <NftList />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

