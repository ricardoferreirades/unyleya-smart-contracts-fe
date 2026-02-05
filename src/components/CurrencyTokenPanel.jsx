import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { ethers } from 'ethers';
import { parseUnits18, formatUnits18 } from '../utils/format';
import {
  getERC20ContractWithSigner,
  getERC20ContractWithProvider,
} from '../utils/contracts';
import { publicClientToEthersProvider } from '../utils/ethersAdapter';
import { setERC20Balance } from '../store/balancesSlice';

const CurrencyTokenPanel = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const dispatch = useDispatch();
  const erc20Balance = useSelector((state) => state.balances.erc20Balance);

  // State for read operations
  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    symbol: '',
    decimals: '',
    totalSupply: '',
    owner: '',
  });
  const [queryAddress, setQueryAddress] = useState('');
  const [queryBalance, setQueryBalance] = useState('');
  const [querySpender, setQuerySpender] = useState('');
  const [queryAllowance, setQueryAllowance] = useState('');

  // State for write operations
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [approveSpender, setApproveSpender] = useState('');
  const [approveAmount, setApproveAmount] = useState('');
  const [transferFromFrom, setTransferFromFrom] = useState('');
  const [transferFromTo, setTransferFromTo] = useState('');
  const [transferFromAmount, setTransferFromAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [newOwner, setNewOwner] = useState('');

  const [loading, setLoading] = useState({
    read: false,
    transfer: false,
    approve: false,
    transferFrom: false,
    mint: false,
    ownership: false,
  });
  const [isOwner, setIsOwner] = useState(false);

  // Load token info and check ownership
  useEffect(() => {
    const loadTokenInfo = async () => {
      if (!publicClient) return;

      try {
        setLoading((prev) => ({ ...prev, read: true }));
        const provider = publicClientToEthersProvider(publicClient);
        const contract = getERC20ContractWithProvider(provider);

        const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply(),
          contract.owner(),
        ]);

        setTokenInfo({
          name,
          symbol,
          decimals: decimals.toString(),
          totalSupply: totalSupply.toString(),
          owner,
        });

        if (address) {
          setIsOwner(owner.toLowerCase() === address.toLowerCase());
        }
      } catch (error) {
        console.error('Error loading token info:', error);
      } finally {
        setLoading((prev) => ({ ...prev, read: false }));
      }
    };

    loadTokenInfo();
  }, [publicClient, address]);

  // Read Functions
  const handleQueryBalance = async () => {
    if (!queryAddress || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, read: true }));
      const provider = publicClientToEthersProvider(publicClient);
      const contract = getERC20ContractWithProvider(provider);
      const balance = await contract.balanceOf(queryAddress);
      setQueryBalance(balance.toString());
      Swal.fire({
        icon: 'success',
        title: 'Balance',
        text: `${formatUnits18(balance.toString())} ${tokenInfo.symbol}`,
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

  const handleQueryAllowance = async () => {
    if (!queryAddress || !querySpender || !publicClient) return;

    try {
      setLoading((prev) => ({ ...prev, read: true }));
      const provider = publicClientToEthersProvider(publicClient);
      const contract = getERC20ContractWithProvider(provider);
      const allowance = await contract.allowance(queryAddress, querySpender);
      setQueryAllowance(allowance.toString());
      Swal.fire({
        icon: 'success',
        title: 'Allowance',
        text: `${formatUnits18(allowance.toString())} ${tokenInfo.symbol}`,
      });
    } catch (error) {
      console.error('Error querying allowance:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to query allowance',
      });
    } finally {
      setLoading((prev) => ({ ...prev, read: false }));
    }
  };

  // Write Functions
  const handleTransfer = async () => {
    if (!transferTo || !transferAmount || !walletClient) {
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
      const contract = getERC20ContractWithSigner(signer);

      const amountWei = parseUnits18(transferAmount);
      const tx = await contract.transfer(transferTo, amountWei);

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
        text: 'Tokens transferred successfully',
      });

      // Reload balance
      if (transferTo.toLowerCase() === address?.toLowerCase() || address) {
        const balance = await contract.balanceOf(address);
        dispatch(setERC20Balance(balance.toString()));
      }

      setTransferTo('');
      setTransferAmount('');
    } catch (error) {
      console.error('Error transferring tokens:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to transfer tokens',
      });
    } finally {
      setLoading((prev) => ({ ...prev, transfer: false }));
    }
  };

  const handleApprove = async () => {
    if (!approveSpender || !approveAmount || !walletClient) {
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
      const contract = getERC20ContractWithSigner(signer);

      const amountWei = parseUnits18(approveAmount);
      const tx = await contract.approve(approveSpender, amountWei);

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

      setApproveSpender('');
      setApproveAmount('');
    } catch (error) {
      console.error('Error approving tokens:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.reason || error.message || 'Failed to approve tokens',
      });
    } finally {
      setLoading((prev) => ({ ...prev, approve: false }));
    }
  };

  const handleTransferFrom = async () => {
    if (!transferFromFrom || !transferFromTo || !transferFromAmount || !walletClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation',
        text: 'Please fill in all fields',
      });
      return;
    }

    // Validate addresses
    if (!ethers.isAddress(transferFromFrom)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Address',
        text: 'The "From" address is not a valid Ethereum address',
      });
      return;
    }

    if (!ethers.isAddress(transferFromTo)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Address',
        text: 'The "To" address is not a valid Ethereum address',
      });
      return;
    }

    if (transferFromFrom.toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Address',
        text: 'The "From" address cannot be the zero address',
      });
      return;
    }

    if (transferFromTo.toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Address',
        text: 'The "To" address cannot be the zero address',
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, transferFrom: true }));

      // Pre-flight validation: Check balance and allowance
      const provider = publicClientToEthersProvider(publicClient);
      const readContract = getERC20ContractWithProvider(provider);
      const amountWei = parseUnits18(transferFromAmount);

      // Check balance
      const balance = await readContract.balanceOf(transferFromFrom);
      if (balance < amountWei) {
        Swal.fire({
          icon: 'error',
          title: 'Insufficient Balance',
          text: `The "From" address has insufficient balance. Balance: ${formatUnits18(balance.toString())} ${tokenInfo.symbol}, Required: ${transferFromAmount} ${tokenInfo.symbol}`,
        });
        setLoading((prev) => ({ ...prev, transferFrom: false }));
        return;
      }

      // Check allowance (the caller must have been approved by the from address)
      if (!address) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Wallet address not available',
        });
        setLoading((prev) => ({ ...prev, transferFrom: false }));
        return;
      }

      const allowance = await readContract.allowance(transferFromFrom, address);
      if (allowance < amountWei) {
        Swal.fire({
          icon: 'error',
          title: 'Insufficient Allowance',
          text: `Insufficient allowance. The "From" address must approve your wallet (${address}) to spend tokens. Current allowance: ${formatUnits18(allowance.toString())} ${tokenInfo.symbol}, Required: ${transferFromAmount} ${tokenInfo.symbol}`,
        });
        setLoading((prev) => ({ ...prev, transferFrom: false }));
        return;
      }

      // All validations passed, proceed with transaction
      Swal.fire({
        icon: 'info',
        title: 'Transaction',
        text: 'Please sign the transaction in your wallet',
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const { walletClientToEthersSigner } = await import('../utils/ethersAdapter');
      const signer = await walletClientToEthersSigner(walletClient);
      const contract = getERC20ContractWithSigner(signer);

      const tx = await contract.transferFrom(transferFromFrom, transferFromTo, amountWei);

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
        text: 'Transfer from successful',
      });

      setTransferFromFrom('');
      setTransferFromTo('');
      setTransferFromAmount('');
    } catch (error) {
      console.error('Error transferring from:', error);
      
      // Try to extract more meaningful error messages
      let errorMessage = 'Failed to transfer from';
      
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        // Check for common error patterns
        if (error.message.includes('insufficient allowance')) {
          errorMessage = 'Insufficient allowance. The "From" address must approve your wallet to spend tokens.';
        } else if (error.message.includes('insufficient balance')) {
          errorMessage = 'Insufficient balance in the "From" address.';
        } else if (error.message.includes('missing revert data')) {
          errorMessage = 'Transaction would fail. Please check that the "From" address has sufficient balance and has approved your wallet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setLoading((prev) => ({ ...prev, transferFrom: false }));
    }
  };

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
      const contract = getERC20ContractWithSigner(signer);

      const amountWei = parseUnits18(mintAmount);
      const tx = await contract.mintAndTransfer(mintTo, amountWei);

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
        const balance = await contract.balanceOf(address);
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
      const contract = getERC20ContractWithSigner(signer);

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
      const contract = getERC20ContractWithSigner(signer);

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
          <h2 className="card-title">Currency Token (ERC-20)</h2>
          <p>Please connect your wallet to interact with the token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Information */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Token Information</h2>
          {loading.read ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">Name</p>
                <p className="font-bold">{tokenInfo.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Symbol</p>
                <p className="font-bold">{tokenInfo.symbol || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Decimals</p>
                <p className="font-bold">{tokenInfo.decimals || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Total Supply</p>
                <p className="font-bold">
                  {tokenInfo.totalSupply
                    ? `${formatUnits18(tokenInfo.totalSupply)} ${tokenInfo.symbol}`
                    : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Owner</p>
                <p className="font-bold text-xs break-all">{tokenInfo.owner || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/70">Your Balance</p>
                <p className="font-bold">
                  {erc20Balance ? `${formatUnits18(erc20Balance)} ${tokenInfo.symbol}` : '0'}
                </p>
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
            Enter any wallet address to see how many ERC-20 tokens it holds.
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

          <div className="divider">Query Allowance</div>
          <p className="text-xs text-base-content/70 mb-2">
            See how many tokens a spender is allowed to move on behalf of the owner.
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
              <span className="label-text">Spender Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={querySpender}
              onChange={(e) => setQuerySpender(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleQueryAllowance}
            disabled={loading.read || !queryAddress || !querySpender}
          >
            {loading.read ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Querying...
              </>
            ) : (
              'Query Allowance'
            )}
          </button>
        </div>
      </div>

      {/* Write Functions */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Write Functions</h2>

          <div className="divider">Transfer</div>
          <p className="text-xs text-base-content/70 mb-2">
            Sends tokens from your connected wallet to the destination address.
          </p>
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
              <span className="label-text">Amount (tokens)</span>
            </label>
            <input
              type="text"
              placeholder="100"
              className="input input-bordered w-full"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleTransfer}
            disabled={loading.transfer || !transferTo || !transferAmount}
          >
            {loading.transfer ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Transferring...
              </>
            ) : (
              'Transfer'
            )}
          </button>

          <div className="divider">Approve</div>
          <p className="text-xs text-base-content/70 mb-2">
            Allow another address to spend up to a maximum amount of your tokens.
          </p>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">Spender Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={approveSpender}
              onChange={(e) => setApproveSpender(e.target.value)}
            />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Amount (tokens)</span>
            </label>
            <input
              type="text"
              placeholder="100"
              className="input input-bordered w-full"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleApprove}
            disabled={loading.approve || !approveSpender || !approveAmount}
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

          <div className="divider">Transfer From</div>
          <p className="text-xs text-base-content/70 mb-2">
            Uses an existing allowance to move tokens from one address to another.
          </p>
          <div className="form-control w-full mb-2">
            <label className="label">
              <span className="label-text">From Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={transferFromFrom}
              onChange={(e) => setTransferFromFrom(e.target.value)}
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
              value={transferFromTo}
              onChange={(e) => setTransferFromTo(e.target.value)}
            />
          </div>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Amount (tokens)</span>
            </label>
            <input
              type="text"
              placeholder="100"
              className="input input-bordered w-full"
              value={transferFromAmount}
              onChange={(e) => setTransferFromAmount(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleTransferFrom}
            disabled={
              loading.transferFrom ||
              !transferFromFrom ||
              !transferFromTo ||
              !transferFromAmount
            }
          >
            {loading.transferFrom ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Transferring...
              </>
            ) : (
              'Transfer From'
            )}
          </button>
        </div>
      </div>

      {/* Owner Functions */}
      {isOwner && (
        <div className="card bg-base-200 shadow-xl border-2 border-warning">
          <div className="card-body">
            <h2 className="card-title text-warning">Owner Functions</h2>

            <div className="divider">Mint and Transfer</div>
            <p className="text-xs text-base-content/70 mb-2">
              Mints new tokens and sends them directly to the chosen address.
            </p>
            <div className="form-control w-full mb-2">
              <label className="label">
                <span className="label-text">To Address</span>
              </label>
              <input
                type="text"
                placeholder="0x..."
                className="input input-bordered w-full"
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
              />
            </div>
            <div className="form-control w-full mb-4">
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
              className="btn btn-warning"
              onClick={handleMintAndTransfer}
              disabled={loading.mint || !mintTo || !mintAmount}
            >
              {loading.mint ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Minting...
                </>
              ) : (
                'Mint and Transfer'
              )}
            </button>

            <div className="divider">Transfer Ownership</div>
            <p className="text-xs text-base-content/70 mb-2">
              Transfers admin control of the ERC-20 contract to a new wallet.
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

export default CurrencyTokenPanel;

