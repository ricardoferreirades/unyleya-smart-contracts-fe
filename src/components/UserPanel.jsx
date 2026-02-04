import { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { formatUnits18 } from '../utils/format';
import {
  getERC20ContractWithSigner,
  getERC20ContractWithProvider,
  getERC721ContractWithSigner,
  getERC721ContractWithProvider,
} from '../utils/contracts';
import { publicClientToEthersProvider } from '../utils/ethersAdapter';
import { setERC20Balance } from '../store/balancesSlice';
import { setPrice } from '../store/nftsSlice';

const ERC721_ADDRESS = import.meta.env.VITE_ERC721_ADDRESS;

const UserPanel = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dispatch = useDispatch();
  const currentPrice = useSelector((state) => state.nfts.price);
  const [loading, setLoading] = useState(false);

  const handleBuyNFT = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Wallet',
        text: 'Please connect your wallet',
      });
      return;
    }

    try {
      setLoading(true);

      // Step 1: Get current price
      Swal.fire({
        icon: 'info',
        title: 'Loading Price',
        text: 'Fetching current NFT price...',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const provider = publicClientToEthersProvider(publicClient);
      const erc721ContractProvider = getERC721ContractWithProvider(provider);
      const priceWei = await erc721ContractProvider.price();
      dispatch(setPrice(priceWei.toString()));

      const priceFormatted = formatUnits18(priceWei.toString());

      // Step 2: Approve ERC-20
      Swal.fire({
        icon: 'info',
        title: 'Approval Required',
        text: `Please approve ${priceFormatted} tokens in your wallet`,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const erc20Contract = getERC20ContractWithSigner(signer);

      const approveTx = await erc20Contract.approve(ERC721_ADDRESS, priceWei);
      Swal.fire({
        icon: 'info',
        title: 'Approval Sent',
        text: `Waiting for confirmation...`,
        showConfirmButton: false,
      });

      await approveTx.wait();

      // Step 3: Mint NFT
      Swal.fire({
        icon: 'info',
        title: 'Minting NFT',
        text: 'Please confirm the mint transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const erc721Contract = getERC721ContractWithSigner(signer);
      const mintTx = await erc721Contract.mint();

      Swal.fire({
        icon: 'info',
        title: 'Transaction Sent',
        text: `Transaction hash: ${mintTx.hash}`,
        showConfirmButton: false,
      });

      await mintTx.wait();

      // Reload balance using public client (reuse provider from earlier)
      const erc20ContractRead = getERC20ContractWithProvider(provider);
      const balance = await erc20ContractRead.balanceOf(address);
      dispatch(setERC20Balance(balance.toString()));

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'NFT purchased successfully!',
      });

      // Trigger NFT list reload (parent component should handle this)
      window.dispatchEvent(new Event('nftListReload'));
    } catch (error) {
      console.error('Error buying NFT:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to purchase NFT',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Buy NFT</h2>
          <p>Please connect your wallet to purchase NFTs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Buy NFT</h2>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Current Price</span>
          </label>
          <div className="input input-bordered w-full">
            {currentPrice ? `${formatUnits18(currentPrice)} tokens` : 'Loading...'}
          </div>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleBuyNFT}
          disabled={loading || !currentPrice}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Processing...
            </>
          ) : (
            'Buy NFT'
          )}
        </button>
        <div className="text-sm text-base-content/70 mt-2">
          This will: 1) Approve tokens, 2) Mint NFT
        </div>
      </div>
    </div>
  );
};

export default UserPanel;

