import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setAddress } from '../store/walletSlice';
import { formatUnits18 } from '../utils/format';

const Header = () => {
  const { address, isConnected } = useAccount();
  const erc20Balance = useSelector((state) => state.balances.erc20Balance);
  const dispatch = useDispatch();

  useEffect(() => {
    if (address) {
      dispatch(setAddress(address));
    }
  }, [address, dispatch]);

  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Unyleya NFT Marketplace</a>
      </div>
      <div className="flex-none gap-2">
        {isConnected && (
          <div className="flex items-center gap-4">
            <div className="badge badge-primary badge-lg">
              Balance: {formatUnits18(erc20Balance || '0')} tokens
            </div>
          </div>
        )}
        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;

