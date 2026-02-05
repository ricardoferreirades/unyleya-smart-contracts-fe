import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { parseUnits18, formatUnits18 } from '../utils/format';
import {
  getERC721ContractWithSigner,
  getERC721ContractWithProvider,
  getERC20ContractWithSigner,
} from '../utils/contracts';
import { publicClientToEthersProvider } from '../utils/ethersAdapter';
import { setPrice } from '../store/nftsSlice';

const ERC721_ADDRESS = import.meta.env.VITE_ERC721_ADDRESS;

const NFTPanel = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dispatch = useDispatch();
  const currentPrice = useSelector((state) => state.nfts.price);

  // State for read operations
  const [nftInfo, setNftInfo] = useState({
    name: '',
    symbol: '',
    price: '',
    totalSupply: '',
    nextTokenId: '',
    paymentToken: '',
    owner: '',
  });
  const [queryAddress, setQueryAddress] = useState('');
  const [queryBalance, setQueryBalance] = useState('');
  const [queryTokenId, setQueryTokenId] = useState('');
  const [queryOwner, setQueryOwner] = useState('');
  const [queryTokenURI, setQueryTokenURI] = useState('');
  const [queryApproved, setQueryApproved] = useState('');
  const [queryOperator, setQueryOperator] = useState('');
  const [queryApprovedForAll, setQueryApprovedForAll] = useState('');

  // State for write operations
  const [mintTo, setMintTo] = useState('');
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferTokenId, setTransferTokenId] = useState('');
  const [approveTo, setApproveTo] = useState('');
  const [approveTokenId, setApproveTokenId] = useState('');
  const [approveForAllOperator, setApproveForAllOperator] = useState('');
  const [approveForAllApproved, setApproveForAllApproved] = useState(true);
  const [newPrice, setNewPrice] = useState('');
  const [baseURI, setBaseURI] = useState('');
  const [tokenURITokenId, setTokenURITokenId] = useState('');
  const [tokenURIValue, setTokenURIValue] = useState('');
  const [newOwner, setNewOwner] = useState('');

  const [loading, setLoading] = useState({
    read: false,
    mint: false,
    transfer: false,
    approve: false,
    approveForAll: false,
    setPrice: false,
    setURI: false,
    ownership: false,
  });
  const [isOwner, setIsOwner] = useState(false);

  // Load NFT info and check ownership
  useEffect(() => {
    const loadNFTInfo = async () => {
      if (!publicClient) return;

      try {
        setLoading((prev) => ({ ...prev, read: true }));
        const provider = publicClientToEthersProvider(publicClient);
        const contract = getERC721ContractWithProvider(provider);

        const [name, symbol, price, totalSupply, nextTokenId, paymentToken, owner] =
          await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.price(),
            contract.totalSupply(),
            contract.nextTokenId(),
            contract.paymentToken(),
            contract.owner(),
          ]);

        setNftInfo({
          name,
          symbol,
          price: price.toString(),
          totalSupply: totalSupply.toString(),
          nextTokenId: nextTokenId.toString(),
          paymentToken,
          owner,
        });

        dispatch(setPrice(price.toString()));

        if (address) {
          setIsOwner(owner.toLowerCase() === address.toLowerCase());
        }
      } catch (error) {
        console.error('Error loading NFT info:', error);
      } finally {
        setLoading((prev) => ({ ...prev, read: false }));
      }
    };

    loadNFTInfo();
  }, [publicClient, address, dispatch]);

  // Read Functions
  const handleQueryBalance = async () => {
    if (!queryAddress || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, read: true }));
      const provider = publicClientToEthersProvider(publicClient);
      const contract = getERC721ContractWithProvider(provider);
      const balance = await contract.balanceOf(queryAddress);
      setQueryBalance(balance.toString());
      Swal.fire({
        icon: 'success',
        title: 'Balance',
        text: `${balance.toString()} NFTs`,
      });
    } catch (error) {
      console.error('Error querying balance:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to query balance',
      });
    } finally {
      setLoading((prev) => ({ ...prev, read: false }));
    }
  };

  const handleQueryOwnerOf = async () => {
    if (!queryTokenId || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, read: true }));
      const provider = publicClientToEthersProvider(publicClient);
      const contract = getERC721ContractWithProvider(provider);
      const owner = await contract.ownerOf(queryTokenId);
      setQueryOwner(owner);
      Swal.fire({
        icon: 'success',
        title: 'Owner',
        text: owner,
      });
    } catch (error) {
      console.error('Error querying owner:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to query owner',
      });
    } finally {
      setLoading((prev) => ({ ...prev, read: false }));
    }
  };

  const handleQueryTokenURI = async () => {
    if (!queryTokenId || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, read: true }));
      const provider = publicClientToEthersProvider(publicClient);
      const contract = getERC721ContractWithProvider(provider);
      const uri = await contract.tokenURI(queryTokenId);
      setQueryTokenURI(uri);
      Swal.fire({
        icon: 'success',
        title: 'Token URI',
        text: uri || 'No URI set',
      });
    } catch (error) {
      console.error('Error querying token URI:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to query token URI',
      });
    } finally {
      setLoading((prev) => ({ ...prev, read: false }));
    }
  };

  const handleQueryGetApproved = async () => {
    if (!queryTokenId || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, read: true }));
      const provider = publicClientToEthersProvider(publicClient);
      const contract = getERC721ContractWithProvider(provider);
      const approved = await contract.getApproved(queryTokenId);
      setQueryApproved(approved);
      Swal.fire({
        icon: 'success',
        title: 'Approved Address',
        text: approved === '0x0000000000000000000000000000000000000000' ? 'None' : approved,
      });
    } catch (error) {
      console.error('Error querying approved:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to query approved address',
      });
    } finally {
      setLoading((prev) => ({ ...prev, read: false }));
    }
  };

  const handleQueryIsApprovedForAll = async () => {
    if (!queryAddress || !queryOperator || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, read: true }));
      const provider = publicClientToEthersProvider(publicClient);
      const contract = getERC721ContractWithProvider(provider);
      const approved = await contract.isApprovedForAll(queryAddress, queryOperator);
      setQueryApprovedForAll(approved.toString());
      Swal.fire({
        icon: 'success',
        title: 'Approved For All',
        text: approved ? 'Yes' : 'No',
      });
    } catch (error) {
      console.error('Error querying approved for all:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to query approved for all',
      });
    } finally {
      setLoading((prev) => ({ ...prev, read: false }));
    }
  };

  // Write Functions
  const handleMint = async () => {
    if (!walletClient || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, mint: true }));
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

      Swal.fire({
        icon: 'info',
        title: 'Approval Required',
        text: `Please approve ${formatUnits18(priceWei.toString())} tokens in your wallet`,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const erc20Contract = getERC20ContractWithSigner(signer);

      const approveTx = await erc20Contract.approve(ERC721_ADDRESS, priceWei);
      await approveTx.wait();

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

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'NFT minted successfully!',
      });

      // Reload info
      window.dispatchEvent(new Event('nftListReload'));
    } catch (error) {
      console.error('Error minting NFT:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to mint NFT',
      });
    } finally {
      setLoading((prev) => ({ ...prev, mint: false }));
    }
  };

  const handleMintTo = async () => {
    if (!mintTo || !walletClient || !publicClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please enter recipient address',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, mint: true }));
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

      Swal.fire({
        icon: 'info',
        title: 'Approval Required',
        text: `Please approve ${formatUnits18(priceWei.toString())} tokens in your wallet`,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const erc20Contract = getERC20ContractWithSigner(signer);

      const approveTx = await erc20Contract.approve(ERC721_ADDRESS, priceWei);
      await approveTx.wait();

      Swal.fire({
        icon: 'info',
        title: 'Minting NFT',
        text: 'Please confirm the mint transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const erc721Contract = getERC721ContractWithSigner(signer);
      const mintTx = await erc721Contract.mintTo(mintTo);

      Swal.fire({
        icon: 'info',
        title: 'Transaction Sent',
        text: `Transaction hash: ${mintTx.hash}`,
        showConfirmButton: false,
      });

      await mintTx.wait();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'NFT minted successfully!',
      });

      setMintTo('');
      window.dispatchEvent(new Event('nftListReload'));
    } catch (error) {
      console.error('Error minting NFT:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to mint NFT',
      });
    } finally {
      setLoading((prev) => ({ ...prev, mint: false }));
    }
  };

  const handleTransferFrom = async () => {
    if (!transferFrom || !transferTo || !transferTokenId || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please fill in all fields',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, transfer: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.transferFrom(transferFrom, transferTo, transferTokenId);

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
        text: 'NFT transferred successfully',
      });

      setTransferFrom('');
      setTransferTo('');
      setTransferTokenId('');
      window.dispatchEvent(new Event('nftListReload'));
    } catch (error) {
      console.error('Error transferring NFT:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to transfer NFT',
      });
    } finally {
      setLoading((prev) => ({ ...prev, transfer: false }));
    }
  };

  const handleSafeTransferFrom = async () => {
    if (!transferFrom || !transferTo || !transferTokenId || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please fill in all fields',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, transfer: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.safeTransferFrom(transferFrom, transferTo, transferTokenId);

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
        text: 'NFT transferred successfully',
      });

      setTransferFrom('');
      setTransferTo('');
      setTransferTokenId('');
      window.dispatchEvent(new Event('nftListReload'));
    } catch (error) {
      console.error('Error transferring NFT:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to transfer NFT',
      });
    } finally {
      setLoading((prev) => ({ ...prev, transfer: false }));
    }
  };

  const handleApprove = async () => {
    if (!approveTo || !approveTokenId || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please fill in all fields',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, approve: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.approve(approveTo, approveTokenId);

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
        text: 'Approval successful',
      });

      setApproveTo('');
      setApproveTokenId('');
    } catch (error) {
      console.error('Error approving NFT:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to approve NFT',
      });
    } finally {
      setLoading((prev) => ({ ...prev, approve: false }));
    }
  };

  const handleSetApprovalForAll = async () => {
    if (!approveForAllOperator || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please enter operator address',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, approveForAll: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.setApprovalForAll(approveForAllOperator, approveForAllApproved);

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
        text: `Approval for all ${approveForAllApproved ? 'granted' : 'revoked'}`,
      });

      setApproveForAllOperator('');
      setApproveForAllApproved(true);
    } catch (error) {
      console.error('Error setting approval for all:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to set approval for all',
      });
    } finally {
      setLoading((prev) => ({ ...prev, approveForAll: false }));
    }
  };

  // Owner Functions
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
      const contract = getERC721ContractWithSigner(signer);

      const priceWei = parseUnits18(newPrice);
      const tx = await contract.setPrice(priceWei);

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

  const handleSetBaseURI = async () => {
    if (!baseURI || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please enter base URI',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, setURI: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.setBaseURI(baseURI);

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
        text: 'Base URI updated successfully',
      });

      setBaseURI('');
    } catch (error) {
      console.error('Error setting base URI:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to update base URI',
      });
    } finally {
      setLoading((prev) => ({ ...prev, setURI: false }));
    }
  };

  const handleSetTokenURI = async () => {
    if (!tokenURITokenId || !tokenURIValue || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please fill in all fields',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, setURI: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.setTokenURI(tokenURITokenId, tokenURIValue);

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
        text: 'Token URI updated successfully',
      });

      setTokenURITokenId('');
      setTokenURIValue('');
    } catch (error) {
      console.error('Error setting token URI:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to update token URI',
      });
    } finally {
      setLoading((prev) => ({ ...prev, setURI: false }));
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwner || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please enter new owner address',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, ownership: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.transferOwnership(newOwner);

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
        text: 'Ownership transferred successfully',
      });

      setIsOwner(false);
      setNewOwner('');
    } catch (error) {
      console.error('Error transferring ownership:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to transfer ownership',
      });
    } finally {
      setLoading((prev) => ({ ...prev, ownership: false }));
    }
  };

  const handleRenounceOwnership = async () => {
    if (!walletClient) return;

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'This will permanently renounce ownership. This action cannot be undone!',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, renounce it!',
    });

    if (!result.isConfirmed) return;

    try {
      setLoading((prev) => ({ ...prev, ownership: true }));
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC721ContractWithSigner(signer);

      const tx = await contract.renounceOwnership();

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
        text: 'Ownership renounced successfully',
      });

      setIsOwner(false);
    } catch (error) {
      console.error('Error renouncing ownership:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to renounce ownership',
      });
    } finally {
      setLoading((prev) => ({ ...prev, ownership: false }));
    }
  };

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">NFT Token (ERC-721)</h2>
          <p>Please connect your wallet to interact with the NFT contract.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NFT Information */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">NFT Information</h2>
          {loading.read ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">Name</p>
                <p className="font-bold">{nftInfo.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Symbol</p>
                <p className="font-bold">{nftInfo.symbol || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Price</p>
                <p className="font-bold">
                  {nftInfo.price
                    ? `${formatUnits18(nftInfo.price)} tokens`
                    : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Total Supply</p>
                <p className="font-bold">{nftInfo.totalSupply || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Next Token ID</p>
                <p className="font-bold">{nftInfo.nextTokenId || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Payment Token</p>
                <p className="font-bold text-xs break-all">{nftInfo.paymentToken || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Owner</p>
                <p className="font-bold text-xs break-all">{nftInfo.owner || 'Loading...'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Read Functions */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Read Functions</h2>

          <div className="divider">Query Balance</div>
          <p className="text-xs text-base-content/70 mb-2">
            Enter any wallet address to see how many NFTs it owns from this collection.
          </p>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={queryAddress}
              onChange={(e) => setQueryAddress(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleQueryBalance}
            disabled={loading.read || !queryAddress}
          >
            {loading.read ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Querying...
              </>
            ) : (
              'Query Balance'
            )}
          </button>

          <div className="divider">Query Owner Of</div>
          <p className="text-xs text-base-content/70 mb-2">
            Look up which wallet currently owns a specific NFT (by token ID).
          </p>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Token ID</span>
            </label>
            <input
              type="text"
              placeholder="1"
              className="input input-bordered w-full"
              value={queryTokenId}
              onChange={(e) => setQueryTokenId(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleQueryOwnerOf}
            disabled={loading.read || !queryTokenId}
          >
            {loading.read ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Querying...
              </>
            ) : (
              'Query Owner'
            )}
          </button>

          <div className="divider">Query Token URI</div>
          <p className="text-xs text-base-content/70 mb-2">
            Get the metadata URI (for example an IPFS link) for a specific token ID.
          </p>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Token ID</span>
            </label>
            <input
              type="text"
              placeholder="1"
              className="input input-bordered w-full"
              value={queryTokenId}
              onChange={(e) => setQueryTokenId(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleQueryTokenURI}
            disabled={loading.read || !queryTokenId}
          >
            {loading.read ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Querying...
              </>
            ) : (
              'Query Token URI'
            )}
          </button>

          <div className="divider">Query Get Approved</div>
          <p className="text-xs text-base-content/70 mb-2">
            See which address is allowed to manage this specific NFT (if any).
          </p>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Token ID</span>
            </label>
            <input
              type="text"
              placeholder="1"
              className="input input-bordered w-full"
              value={queryTokenId}
              onChange={(e) => setQueryTokenId(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleQueryGetApproved}
            disabled={loading.read || !queryTokenId}
          >
            {loading.read ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Querying...
              </>
            ) : (
              'Query Approved'
            )}
          </button>

          <div className="divider">Query Is Approved For All</div>
          <p className="text-xs text-base-content/70 mb-2">
            Check if the operator can manage all NFTs owned by the owner address.
          </p>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">Owner Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={queryAddress}
              onChange={(e) => setQueryAddress(e.target.value)}
            />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Operator Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={queryOperator}
              onChange={(e) => setQueryOperator(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleQueryIsApprovedForAll}
            disabled={loading.read || !queryAddress || !queryOperator}
          >
            {loading.read ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Querying...
              </>
            ) : (
              'Query Approved For All'
            )}
          </button>
        </div>
      </div>

      {/* Write Functions */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Write Functions</h2>

          <div className="divider">Mint (to yourself)</div>
          <p className="text-xs text-base-content/70 mt-2">
            This will first approve the payment tokens and then mint a new NFT to your wallet.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleMint}
            disabled={loading.mint}
          >
            {loading.mint ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Minting...
              </>
            ) : (
              'Mint NFT'
            )}
          </button>
          

          <div className="divider">Mint To</div>
          <p className="text-xs text-base-content/70 mb-2">
            Mint a new NFT directly to another wallet instead of your own.
          </p>
          <div className="form-control w-full mb-4">
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
          <button
            className="btn btn-primary"
            onClick={handleMintTo}
            disabled={loading.mint || !mintTo}
          >
            {loading.mint ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Minting...
              </>
            ) : (
              'Mint To Address'
            )}
          </button>

          <div className="divider">Transfer From</div>
          <p className="text-xs text-base-content/70 mb-2">
            Move an existing NFT from one address to another (requires ownership or approval).
          </p>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">From Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={transferFrom}
              onChange={(e) => setTransferFrom(e.target.value)}
            />
          </div>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">To Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
            />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Token ID</span>
            </label>
            <input
              type="text"
              placeholder="1"
              className="input input-bordered w-full"
              value={transferTokenId}
              onChange={(e) => setTransferTokenId(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex-1"
              onClick={handleTransferFrom}
              disabled={
                loading.transfer ||
                !transferFrom ||
                !transferTo ||
                !transferTokenId
              }
            >
              {loading.transfer ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Transferring...
                </>
              ) : (
                'Transfer From'
              )}
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={handleSafeTransferFrom}
              disabled={
                loading.transfer ||
                !transferFrom ||
                !transferTo ||
                !transferTokenId
              }
            >
              {loading.transfer ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Transferring...
                </>
              ) : (
                'Safe Transfer From'
              )}
            </button>
          </div>

          <div className="divider">Approve</div>
          <p className="text-xs text-base-content/70 mb-2">
            Allow another address to transfer this specific NFT on your behalf.
          </p>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">To Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={approveTo}
              onChange={(e) => setApproveTo(e.target.value)}
            />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Token ID</span>
            </label>
            <input
              type="text"
              placeholder="1"
              className="input input-bordered w-full"
              value={approveTokenId}
              onChange={(e) => setApproveTokenId(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={loading.approve || !approveTo || !approveTokenId}
          >
            {loading.approve ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Approving...
              </>
            ) : (
              'Approve'
            )}
          </button>

          <div className="divider">Set Approval For All</div>
          <p className="text-xs text-base-content/70 mb-2">
            Grant or revoke permission for an operator to manage all of your NFTs.
          </p>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">Operator Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={approveForAllOperator}
              onChange={(e) => setApproveForAllOperator(e.target.value)}
            />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label cursor-pointer">
              <span className="label-text">Approved</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={approveForAllApproved}
                onChange={(e) => setApproveForAllApproved(e.target.checked)}
              />
            </label>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSetApprovalForAll}
            disabled={loading.approveForAll || !approveForAllOperator}
          >
            {loading.approveForAll ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              'Set Approval For All'
            )}
          </button>
        </div>
      </div>

      {/* Owner Functions */}
      {isOwner && (
        <div className="card bg-base-200 shadow-xl border-2 border-warning">
          <div className="card-body">
            <h2 className="card-title text-warning">Owner Functions</h2>

            <div className="divider">Set Price</div>
            <p className="text-xs text-base-content/70 mb-2">
              Define how many ERC-20 tokens are needed to mint a single NFT.
            </p>
            <div className="form-control w-full mb-4">
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
              className="btn btn-warning"
              onClick={handleSetPrice}
              disabled={loading.setPrice || !newPrice}
            >
              {loading.setPrice ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Set Price'
              )}
            </button>

            <div className="divider">Set Base URI</div>
            <p className="text-xs text-base-content/70 mb-2">
              Base path used to build token metadata URLs (often an IPFS folder).
            </p>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Base URI</span>
              </label>
              <input
                type="text"
                placeholder="ipfs://QmHash/"
                className="input input-bordered w-full"
                value={baseURI}
                onChange={(e) => setBaseURI(e.target.value)}
              />
            </div>
            <button
              className="btn btn-warning"
              onClick={handleSetBaseURI}
              disabled={loading.setURI || !baseURI}
            >
              {loading.setURI ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Set Base URI'
              )}
            </button>

            <div className="divider">Set Token URI</div>
            <p className="text-xs text-base-content/70 mb-2">
              Override the metadata URI for a single NFT token ID.
            </p>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">Token ID</span>
              </label>
              <input
                type="text"
                placeholder="1"
                className="input input-bordered w-full"
                value={tokenURITokenId}
                onChange={(e) => setTokenURITokenId(e.target.value)}
              />
            </div>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Token URI</span>
              </label>
              <input
                type="text"
                placeholder="ipfs://QmHash/1.json"
                className="input input-bordered w-full"
                value={tokenURIValue}
                onChange={(e) => setTokenURIValue(e.target.value)}
              />
            </div>
            <button
              className="btn btn-warning"
              onClick={handleSetTokenURI}
              disabled={loading.setURI || !tokenURITokenId || !tokenURIValue}
            >
              {loading.setURI ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating...
                </>
              ) : (
                'Set Token URI'
              )}
            </button>

            <div className="divider">Transfer Ownership</div>
            <p className="text-xs text-base-content/70 mb-2">
              Move contract ownership (admin rights) to another wallet.
            </p>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">New Owner Address</span>
              </label>
              <input
                type="text"
                placeholder="0x..."
                className="input input-bordered w-full"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
              />
            </div>
            <button
              className="btn btn-warning mb-2"
              onClick={handleTransferOwnership}
              disabled={loading.ownership || !newOwner}
            >
              {loading.ownership ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Transferring...
                </>
              ) : (
                'Transfer Ownership'
              )}
            </button>

            <div className="divider">Renounce Ownership</div>
            <button
              className="btn btn-error"
              onClick={handleRenounceOwnership}
              disabled={loading.ownership}
            >
              {loading.ownership ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                'Renounce Ownership'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTPanel;

