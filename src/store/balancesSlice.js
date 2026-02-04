import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  erc20Balance: '0',
  isLoading: false,
};

const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    setERC20Balance: (state, action) => {
      state.erc20Balance = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setERC20Balance, setLoading } = balancesSlice.actions;
export default balancesSlice.reducer;

