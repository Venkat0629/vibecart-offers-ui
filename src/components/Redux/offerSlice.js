// offerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  offerDetails: {
    offerId: '',
    offerName: '',
    offerType: '',
    discountType: '',
    discountValue: '',
    quantity: '',
    startDate: '',
    expiryDate: '',
    skuId: '', 
  },
  errors: {},
  skuValidationError: '',
};

const offerSlice = createSlice({
  name: 'offer',
  initialState,
  reducers: {
    setOfferDetails(state, action) {
      state.offerDetails = action.payload;
    },
    setErrors(state, action) {
      state.errors = action.payload;
    },
    setSkuValidationError(state, action) {
      state.skuValidationError = action.payload;
    },
  },
});

export const { setOfferDetails, setErrors, setSkuValidationError } = offerSlice.actions;
export default offerSlice.reducer;
