import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for deleting a single offer
export const deleteOffer = createAsyncThunk(
  'deleteOffers/deleteOffer',
  async (offerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5501/api/v1/vibe-cart/offers/${offerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return offerId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for deleting multiple offers
export const deleteOffers = createAsyncThunk(
  'deleteOffers/deleteOffers',
  async (offerIds, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        offerIds.map((id) =>
          axios.delete(`http://localhost:5501/api/v1/vibe-cart/offers/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        )
      );
      return offerIds;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const deleteOfferSlice = createSlice({
  name: 'deleteOffers',
  initialState: {
    offers: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setOffers(state, action) {
        state.offers = action.payload;
      },
      selectAllOffers(state, action) {
        state.offers = state.offers.map((offer) => ({
          ...offer,
          selected: action.payload,
        }));
      },
      toggleOfferSelection(state, action) {
        state.offers = state.offers.map((offer) =>
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
      .addCase(deleteOffer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.offers = state.offers.filter((offer) => offer.offerId !== action.payload);
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteOffers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteOffers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.offers = state.offers.filter((offer) => !action.payload.includes(offer.offerId));
      })
      .addCase(deleteOffers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setOffers, clearError,selectAllOffers,toggleOfferSelection } = deleteOfferSlice.actions;

export default deleteOfferSlice.reducer;
