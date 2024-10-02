import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { VIBECART_URI } from '../Services/service';

// Async thunk for creating an offer
export const createOffer = createAsyncThunk(
  'offers/createOffer',
  async (offerDetails, { rejectWithValue }) => {
    try {

      const response = await axios.post(`${VIBECART_URI}/api/v1/vibe-cart/offers`, offerDetails, {
      
      });
      return response.data;
    } catch (error) {
      console.log("c")

      return rejectWithValue(error.response.data);

    }
  }
);

const createOfferSlice = createSlice({
  name: 'offers',
  initialState: {
    offerDetails: {
      offerName: '',
      offerDescription: '',
      offerQuantity: 0,
      offerDiscountType: '',
      offerDiscountValue: 0,
      offerItems:[],
      offerStartDate: '',
      offerEndDate: '',
    },
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetForm: (state) => {
      state.offerDetails = {
        offerName: '',
        offerDescription: '',
        offerQuantity: 0,
        offerDiscountType: '',
        offerDiscountValue: 0,
        offerItems: [],
        offerStartDate: '',
        offerEndDate: '',
      };
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setOfferDetails: (state, action) => {
      state.offerDetails = { ...state.offerDetails, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetForm, setOfferDetails } = createOfferSlice.actions;

export default createOfferSlice.reducer;
