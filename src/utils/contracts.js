import { ethers } from 'ethers';
import PaymentTokenABI from '../abi/PaymentToken.json';
import NFTABI from '../abi/NFT.json';

const ERC20_ADDRESS = import.meta.env.VITE_ERC20_ADDRESS;
const ERC721_ADDRESS = import.meta.env.VITE_ERC721_ADDRESS;

/**
 * Get ERC-20 contract instance with provider (for read operations)
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {ethers.Contract} Contract instance
 */
export const getERC20ContractWithProvider = (provider) => {
  if (!ERC20_ADDRESS) {
    throw new Error('ERC20_ADDRESS not set in environment variables');
  }
  return new ethers.Contract(ERC20_ADDRESS, PaymentTokenABI, provider);
};

/**
 * Get ERC-20 contract instance with signer (for write operations)
 * @param {ethers.Signer} signer - Ethers signer
 * @returns {ethers.Contract} Contract instance
 */
export const getERC20ContractWithSigner = (signer) => {
  if (!ERC20_ADDRESS) {
    throw new Error('ERC20_ADDRESS not set in environment variables');
  }
  return new ethers.Contract(ERC20_ADDRESS, PaymentTokenABI, signer);
};

/**
 * Get ERC-721 contract instance with provider (for read operations)
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {ethers.Contract} Contract instance
 */
export const getERC721ContractWithProvider = (provider) => {
  if (!ERC721_ADDRESS) {
    throw new Error('ERC721_ADDRESS not set in environment variables');
  }
  return new ethers.Contract(ERC721_ADDRESS, NFTABI, provider);
};

/**
 * Get ERC-721 contract instance with signer (for write operations)
 * @param {ethers.Signer} signer - Ethers signer
 * @returns {ethers.Contract} Contract instance
 */
export const getERC721ContractWithSigner = (signer) => {
  if (!ERC721_ADDRESS) {
    throw new Error('ERC721_ADDRESS not set in environment variables');
  }
  return new ethers.Contract(ERC721_ADDRESS, NFTABI, signer);
};

