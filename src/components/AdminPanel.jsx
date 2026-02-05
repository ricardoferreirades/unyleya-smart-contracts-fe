import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { parseUnits18, formatUnits18 } from '../utils/format';
import {
  getERC20ContractWithSigner,
  getERC20ContractWithProvider,
  getERC721ContractWithSigner,
  getERC721ContractWithProvider,
} from '../utils/contracts';
import { publicClientToEthersProvider } from '../utils/ethersAdapter';
import { setERC20Balance } from '../store/balancesSlice';
import { setPrice } from '../store/nftsSlice';
import { setIsOwner } from '../store/walletSlice';

const AdminPanel = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dispatch = useDispatch();
  const isOwner = useSelector((state) => state.wallet.isOwner);
  const currentPrice = useSelector((state) => state.nfts.price);

  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState({
    mint: false,
    setPrice: false,
    checkPrice: false,
  });

  // Check if user is owner
  useEffect(() => {
    const checkOwner = async () => {
      if (!isConnected || !address || !publicClient) return;

      try {
        const provider = publicClientToEthersProvider(publicClient);
        const erc20Contract = getERC20ContractWithProvider(provider);
        const owner = await erc20Contract.owner();
        dispatch(setIsOwner(owner.toLowerCase() === address.toLowerCase()));
      } catch (error) {
        console.error('Error checking owner:', error);
        dispatch(setIsOwner(false));
      }
    };

    checkOwner();
  }, [isConnected, address, publicClient, dispatch]);

  // Load current price
  useEffect(() => {
    const loadPrice = async () => {
      if (!publicClient) return;

      try {
        setLoading((prev) => ({ ...prev, checkPrice: true }));
        const provider = publicClientToEthersProvider(publicClient);
        const erc721Contract = getERC721ContractWithProvider(provider);
        const price = await erc721Contract.price();
        dispatch(setPrice(price.toString()));
      } catch (error) {
        console.error('Error loading price:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load NFT price',
        });
      } finally {
        setLoading((prev) => ({ ...prev, checkPrice: false }));
      }
    };

    loadPrice();
  }, [publicClient, dispatch]);

  const handleMintAndTransfer = async () => {
    if (!mintTo || !mintAmount || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please fill in all fields',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, mint: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const erc20Contract = getERC20ContractWithSigner(signer);

      const amountWei = parseUnits18(mintAmount);
      const tx = await erc20Contract.mintAndTransfer(mintTo, amountWei);

      Swal.fire({
        icon: 'info',
        title: 'Transaction Sent',
        text: `Transaction hash: ${tx.hash}`,
        showConfirmButton: false,
      });

      await tx.wait();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Tokens minted and transferred successfully',
      });

      // Reload balance if recipient is current user
      if (mintTo.toLowerCase() === address?.toLowerCase()) {
        const balance = await erc20Contract.balanceOf(address);
        dispatch(setERC20Balance(balance.toString()));
      }

      setMintTo('');
      setMintAmount('');
    } catch (error) {
      console.error('Error minting tokens:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to mint and transfer tokens',
      });
    } finally {
      setLoading((prev) => ({ ...prev, mint: false }));
    }
  };

  const handleSetPrice = async () => {
    if (!newPrice || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please enter a price',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, setPrice: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const erc721Contract = getERC721ContractWithSigner(signer);

      const priceWei = parseUnits18(newPrice);
      const tx = await erc721Contract.setPrice(priceWei);

      Swal.fire({
        icon: 'info',
        title: 'Transaction Sent',
        text: `Transaction hash: ${tx.hash}`,
        showConfirmButton: false,
      });

      await tx.wait();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Price updated successfully',
      });

      dispatch(setPrice(priceWei.toString()));
      setNewPrice('');
    } catch (error) {
      console.error('Error setting price:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to update price',
      });
    } finally {
      setLoading((prev) => ({ ...prev, setPrice: false }));
    }
  };

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Admin Panel</h2>
          <p>Please connect your wallet to access admin functions.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Admin Panel</h2>
          <p className="text-warning">You are not the contract owner. Admin functions are not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Admin Panel</h2>

        {/* Current Price Display */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-bold">Current NFT Price</span>
          </label>
          <div className="input input-bordered w-full">
            {loading.checkPrice ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              `${formatUnits18(currentPrice || '0')} tokens`
            )}
          </div>
        </div>

        {/* Mint and Transfer */}
        <div className="divider">Mint and Transfer Tokens</div>
        <p className="mb-2 text-xs text-base-content/70">
          Mint new ERC-20 tokens and send them directly to a recipient wallet.
        </p>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Recipient Address</span>
          </label>
          <input
            type="text"
            placeholder="0x..."
            className="input input-bordered w-full"
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Amount (tokens)</span>
          </label>
          <input
            type="text"
            placeholder="100"
            className="input input-bordered w-full"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleMintAndTransfer}
          disabled={loading.mint}
        >
          {loading.mint ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Processing...
            </>
          ) : (
            'Mint and Transfer'
          )}
        </button>

        {/* Set Price */}
        <div className="divider">Update NFT Price</div>
        <p className="mb-2 text-xs text-base-content/70">
          Define how many ERC-20 tokens are required to mint a single NFT.
        </p>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">New Price (tokens)</span>
          </label>
          <input
            type="text"
            placeholder="10"
            className="input input-bordered w-full"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleSetPrice}
          disabled={loading.setPrice}
        >
          {loading.setPrice ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Processing...
            </>
          ) : (
            'Update Price'
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;

