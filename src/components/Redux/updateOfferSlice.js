import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch offers
export const fetchOffers = createAsyncThunk('updateOffers/fetchOffers', async (token) => {
  const response = await axios.get('http://localhost:5501/vibe-cart/offers', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
});

// Thunk to update an offer
export const updateOffer = createAsyncThunk('updateOffers/updateOffer', async ({ id, data, token }) => {
  const response = await axios.put(`http://localhost:5501/vibe-cart/offers/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
});

// Thunk to update multiple offers
export const updateMultipleOffers = createAsyncThunk('updateOffers/updateMultipleOffers', async ({ ids, data, token }) => {
  await Promise.all(
    ids.map(id => 
      axios.put(`http://localhost:5501/vibe-cart/offers/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    )
  );
  return ids; // Return updated IDs to filter them out from state
});

const updateOfferSlice = createSlice({
  name: 'updateOffers',
  initialState: {
    offers: [],
    status: 'idle',
    error: null,
    jwtToken: '',
  },
  reducers: {
    setToken(state, action) {
      state.jwtToken = action.payload;
    },
    selectAllOffers(state, action) {
      state.offers = state.offers.map(offer => ({
        ...offer,
        selected: action.payload,
      }));
    },
    toggleOfferSelection(state, action) {
      state.offers = state.offers.map(offer =>
        offer.offerId === action.payload
          ? { ...offer, selected: !offer.selected }
          : offer
      );
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.offers = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateOffer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.offers = state.offers.map(offer =>
          offer.offerId === action.payload.offerId ? action.payload : offer
        );
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateMultipleOffers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateMultipleOffers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.offers = state.offers.filter(offer => !action.payload.includes(offer.offerId));
      })
      .addCase(updateMultipleOffers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setToken, selectAllOffers, toggleOfferSelection, clearError } = updateOfferSlice.actions;

export default updateOfferSlice.reducer;
