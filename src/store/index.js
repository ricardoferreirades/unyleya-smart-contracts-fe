import { configureStore } from '@reduxjs/toolkit';
import walletSlice from './walletSlice';
import balancesSlice from './balancesSlice';
import nftsSlice from './nftsSlice';

export const store = configureStore({
  reducer: {
    wallet: walletSlice,
    balances: balancesSlice,
    nfts: nftsSlice,
  },
});

