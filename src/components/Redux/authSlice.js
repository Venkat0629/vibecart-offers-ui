import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: !!localStorage.getItem('isLoggedIn'), // Check if 'isLoggedIn' is stored in localStorage
  },
  reducers: {
    login(state) {
      state.isLoggedIn = true;
      localStorage.setItem('isLoggedIn', 'true'); // Store the login state in localStorage
    },
    logout(state) {
      state.isLoggedIn = false;
      localStorage.removeItem('isLoggedIn'); // Remove the login state from localStorage on logout
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
