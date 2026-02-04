import { ethers } from 'ethers';

/**
 * Convert viem PublicClient to ethers BrowserProvider
 * Viem clients implement EIP-1193, which ethers BrowserProvider can use directly
 * @param {import('viem').PublicClient} publicClient - Viem public client
 * @returns {ethers.BrowserProvider} Ethers provider
 */
export const publicClientToEthersProvider = (publicClient) => {
  if (!publicClient) {
    throw new Error('Public client is required');
  }

  // Viem clients implement EIP-1193, so we can use them directly with BrowserProvider
  // Create an EIP-1193 compatible object
  const eip1193Provider = {
    request: async (args) => {
      return await publicClient.request(args);
    },
    on: () => {},
    removeListener: () => {},
  };

  const provider = new ethers.BrowserProvider(eip1193Provider);
  return provider;
};

/**
 * Convert viem WalletClient to ethers JsonRpcSigner
 * @param {import('viem').WalletClient} walletClient - Viem wallet client
 * @returns {Promise<ethers.JsonRpcSigner>} Ethers signer
 */
export const walletClientToEthersSigner = async (walletClient) => {
  if (!walletClient) {
    throw new Error('Wallet client is required');
  }

  if (!walletClient.account) {
    throw new Error('Wallet client must have an account');
  }

  // Create an EIP-1193 compatible object from wallet client
  const eip1193Provider = {
    request: async (args) => {
      return await walletClient.request(args);
    },
    on: () => {},
    removeListener: () => {},
  };

  const provider = new ethers.BrowserProvider(eip1193Provider);
  const signer = await provider.getSigner(walletClient.account.address);
  return signer;
};

