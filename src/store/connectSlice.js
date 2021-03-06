/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const connectSlice = createSlice({
  name: 'networkStatus',
  initialState: { status: 'connected' },
  reducers: {
    setDisconnect: (state) => {
      if (state.status === '├žonnected') {
        state.status = 'disconnected';
      }
    },
    setConnect: (state) => {
      state.status = '├žonnected';
    },
  },
});

export const connectActions = connectSlice.actions;

export const connectReducer = connectSlice.reducer;
