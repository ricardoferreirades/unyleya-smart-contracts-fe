import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { getERC721ContractWithProvider, getERC721ContractWithSigner } from '../utils/contracts';
import { publicClientToEthersProvider } from '../utils/ethersAdapter';
import { setNFTs, removeNFT } from '../store/nftsSlice';

const NftList = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dispatch = useDispatch();
  const nfts = useSelector((state) => state.nfts.nfts);
  const [loading, setLoading] = useState(false);
  const [transferTo, setTransferTo] = useState({});
  const [transferring, setTransferring] = useState(null);

  const loadNFTs = async () => {
    if (!isConnected || !address || !publicClient) return;

    try {
      setLoading(true);
      const provider = publicClientToEthersProvider(publicClient);
      const erc721Contract = getERC721ContractWithProvider(provider);
      
      // Get balance (number of NFTs owned)
      const balance = await erc721Contract.balanceOf(address);
      const balanceNum = Number(balance);

      if (balanceNum === 0) {
        dispatch(setNFTs([]));
        return;
      }

      // Get all token IDs using tokenOfOwnerByIndex (ERC721Enumerable)
      const tokenIds = [];
      for (let i = 0; i < balanceNum; i++) {
        try {
          const tokenId = await erc721Contract.tokenOfOwnerByIndex(address, i);
          tokenIds.push(tokenId.toString());
        } catch (error) {
          console.error(`Error fetching token at index ${i}:`, error);
        }
      }

      // Get token URIs for each NFT
      const nftData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await erc721Contract.tokenURI(tokenId);
            return {
              tokenId,
              tokenURI,
            };
          } catch (error) {
            console.error(`Error fetching URI for token ${tokenId}:`, error);
            return {
              tokenId,
              tokenURI: '',
            };
          }
        })
      );

      dispatch(setNFTs(nftData));
    } catch (error) {
      console.error('Error loading NFTs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load NFTs',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNFTs();
  }, [isConnected, address, publicClient]);

  // Listen for reload events
  useEffect(() => {
    const handleReload = () => {
      loadNFTs();
    };
    window.addEventListener('nftListReload', handleReload);
    return () => window.removeEventListener('nftListReload', handleReload);
  }, [isConnected, address, publicClient]);

  const handleTransfer = async (tokenId) => {
    const toAddress = transferTo[tokenId];
    if (!toAddress || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please enter a valid address',
      });
      return;
    }

    try {
      setTransferring(tokenId);
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

      const tx = await erc721Contract['safeTransferFrom(address,address,uint256)'](
        address,
        toAddress,
        tokenId
      );

      Swal.fire({
        icon: 'info',
        title: 'Transaction Sent',
        text: `Transaction hash: ${tx.hash}`,
        showConfirmButton: false,
      });

      await tx.wait();

      dispatch(removeNFT(tokenId));
      setTransferTo({ ...transferTo, [tokenId]: '' });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'NFT transferred successfully',
      });
    } catch (error) {
      console.error('Error transferring NFT:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to transfer NFT',
      });
    } finally {
      setTransferring(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">My NFTs</h2>
          <p>Please connect your wallet to view your NFTs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">My NFTs</h2>
          <button
            className="btn btn-sm btn-outline"
            onClick={loadNFTs}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {loading && nfts.length === 0 ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : nfts.length === 0 ? (
          <p className="text-center py-8">You don't own any NFTs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <div key={nft.tokenId} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title text-sm">Token ID: {nft.tokenId}</h3>
                  {nft.tokenURI && (
                    <p className="text-xs text-base-content/70 truncate">
                      URI: {nft.tokenURI}
                    </p>
                  )}
                  <div className="form-control mt-4">
                    <input
                      type="text"
                      placeholder="Recipient address (0x...)"
                      className="input input-bordered input-sm"
                      value={transferTo[nft.tokenId] || ''}
                      onChange={(e) =>
                        setTransferTo({
                          ...transferTo,
                          [nft.tokenId]: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    className="btn btn-sm btn-outline mt-2"
                    onClick={() => handleTransfer(nft.tokenId)}
                    disabled={transferring === nft.tokenId || !transferTo[nft.tokenId]}
                  >
                    {transferring === nft.tokenId ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Transferring...
                      </>
                    ) : (
                      'Transfer'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NftList;

