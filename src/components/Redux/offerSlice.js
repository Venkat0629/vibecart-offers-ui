import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for creating an offer
export const createOffer = createAsyncThunk(
  'offers/createOffer',
  async (offerDetails, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post("http://localhost:5501/vibe-cart/offers", offerDetails, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
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
      offerQuantity: '',
      offerDiscountType: '',
      offerDiscountValue: '',
      offerType: {
        offerType: '',
        offerOn:'',
        entityIds: [],
        couponCode: ''
      },
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
        offerQuantity: '',
        offerDiscountType: '',
        offerDiscountValue: '',
        offerType: {
          offerType: '',
          offerOn:'',
          entityIds: [],
          couponCode: ''
        },
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
