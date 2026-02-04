import { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';

const TransactionsPanel = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const getExplorerUrl = (address, type = 'address') => {
    if (!publicClient || !address) return '#';
    const chainId = publicClient.chain?.id;
    const baseUrl =
      chainId === 11155111
        ? 'https://sepolia.etherscan.io'
        : chainId === 1
          ? 'https://etherscan.io'
          : '#';
    return `${baseUrl}/${type}/${address}`;
  };

  const ERC20_ADDRESS = import.meta.env.VITE_ERC20_ADDRESS;
  const ERC721_ADDRESS = import.meta.env.VITE_ERC721_ADDRESS;

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Transactions</h2>
          <p>Please connect your wallet to view transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title mb-4">Transaction History</h2>

        <div className="space-y-4">
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              View all transactions on the block explorer. Transaction history is
              available for all contract interactions.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ERC20_ADDRESS && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title text-sm">ERC-20 Contract</h3>
                  <p className="text-xs font-mono break-all mb-2">{ERC20_ADDRESS}</p>
                  <a
                    href={getExplorerUrl(ERC20_ADDRESS, 'address')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            )}

            {ERC721_ADDRESS && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title text-sm">ERC-721 Contract</h3>
                  <p className="text-xs font-mono break-all mb-2">{ERC721_ADDRESS}</p>
                  <a
                    href={getExplorerUrl(ERC721_ADDRESS, 'address')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            )}

            {address && (
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title text-sm">Your Address</h3>
                  <p className="text-xs font-mono break-all mb-2">{address}</p>
                  <a
                    href={getExplorerUrl(address, 'address')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="divider">Transaction Types</div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
              <div>
                <p className="font-semibold">ERC-20 Transfers</p>
                <p className="text-xs text-base-content/70">
                  View all token transfers on the block explorer
                </p>
              </div>
              {ERC20_ADDRESS && (
                <a
                  href={getExplorerUrl(ERC20_ADDRESS, 'address')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  View
                </a>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
              <div>
                <p className="font-semibold">ERC-721 Transfers</p>
                <p className="text-xs text-base-content/70">
                  View all NFT transfers and mints on the block explorer
                </p>
              </div>
              {ERC721_ADDRESS && (
                <a
                  href={getExplorerUrl(ERC721_ADDRESS, 'address')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  View
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPanel;

