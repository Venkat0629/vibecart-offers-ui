import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import offerReducer from './offerSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    offer: offerReducer,
  },
});

export default store;
