import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  address: null,
  isConnected: false,
  isOwner: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setAddress: (state, action) => {
      state.address = action.payload;
      state.isConnected = !!action.payload;
    },
    setIsOwner: (state, action) => {
      state.isOwner = action.payload;
    },
    disconnect: (state) => {
      state.address = null;
      state.isConnected = false;
      state.isOwner = false;
    },
  },
});

export const { setAddress, setIsOwner, disconnect } = walletSlice.actions;
export default walletSlice.reducer;

