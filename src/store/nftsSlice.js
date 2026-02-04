import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nfts: [],
  isLoading: false,
  price: '0',
};

const nftsSlice = createSlice({
  name: 'nfts',
  initialState,
  reducers: {
    setNFTs: (state, action) => {
      state.nfts = action.payload;
    },
    addNFT: (state, action) => {
      state.nfts.push(action.payload);
    },
    removeNFT: (state, action) => {
      state.nfts = state.nfts.filter(nft => nft.tokenId !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setPrice: (state, action) => {
      state.price = action.payload;
    },
  },
});

export const { setNFTs, addNFT, removeNFT, setLoading, setPrice } = nftsSlice.actions;
export default nftsSlice.reducer;

