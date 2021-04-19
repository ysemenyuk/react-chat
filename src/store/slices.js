/* eslint-disable no-param-reassign */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import routes from '../routes.js';

import chatAdapter from './adapter.js';

const getAuthHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo && userInfo.token) {
    return { Authorization: `Bearer ${userInfo.token}` };
  }

  return {};
};

export const fetchUserData = createAsyncThunk('fetchUserData', async () => {
  const url = routes.usersPath();
  return axios
    .get(url, {
      headers: getAuthHeader(),
    })
    .then((resp) => resp.data)
    .catch((err) => console.log(err));
});

const channelsSlice = createSlice({
  name: 'channels',
  initialState: chatAdapter.getInitialState({
    currentChannelId: null,
    fetchStatus: 'idle',
  }),
  reducers: {
    setAll: chatAdapter.setAll,
    selectChannel: (state, action) => {
      state.currentChannelId = action.payload;
    },
    addChannel: (state, action) => {
      chatAdapter.addOne(state, action);
      state.currentChannelId = action.payload.id;
    },
    removeChannel: (state, action) => {
      const { id } = action.payload;
      if (id === state.currentChannelId) {
        state.currentChannelId = 1;
      }
      chatAdapter.removeOne(state, id);
    },
    renameChannel: (state, action) => {
      const { id, name } = action.payload;
      chatAdapter.updateOne(state, { id, changes: { name } });
    },
  },
  extraReducers: {
    [fetchUserData.pending]: (state) => {
      state.fetchStatus = 'loading';
    },
    [fetchUserData.fulfilled]: (state, action) => {
      // console.log('fulfilled action.payload', action.payload);
      const { channels, currentChannelId } = action.payload;
      chatAdapter.setAll(state, channels);
      state.currentChannelId = currentChannelId;
      state.fetchStatus = 'idle';
    },
    [fetchUserData.rejected]: (state) => {
      state.fetchStatus = 'idle';
    },
  },
});

const messagesSlice = createSlice({
  name: 'messages',
  initialState: chatAdapter.getInitialState(),
  reducers: {
    setAll: chatAdapter.setAll,
    addMessage: chatAdapter.addOne,
  },
  extraReducers: {
    [fetchUserData.fulfilled]: (state, action) => {
      // console.log('action.payload', action.payload);
      const { messages } = action.payload;
      chatAdapter.setAll(state, messages);
    },
    [channelsSlice.actions.removeChannel]: (state, action) => {
      const channelMessagesIds = state.ids
        .filter((id) => state.entities[id].channelId === action.payload);
      chatAdapter.removeMany(state, channelMessagesIds);
    },
  },
});

const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    modalShow: false,
    modalType: null,
    modalData: null,
  },
  reducers: {
    openModal: (state, action) => {
      state.modalShow = true;
      state.modalType = action.payload.modalType;
      state.modalData = action.payload.modalData;
    },
    closeModal: (state) => {
      state.modalShow = false;
      state.modalType = null;
      state.modalData = null;
    },
  },
});

const connectSlice = createSlice({
  name: 'networkStatus',
  initialState: { status: 'connected' },
  reducers: {
    setDisconnect: (state) => {
      state.status = 'disconnected';
    },
    setConnect: (state) => {
      state.status = 'çonnected';
    },
  },
});

export const channelsActions = channelsSlice.actions;
export const messagesActions = messagesSlice.actions;
export const modalActions = modalSlice.actions;
export const connectStatusActions = connectSlice.actions;

export default {
  channels: channelsSlice.reducer,
  messages: messagesSlice.reducer,
  modal: modalSlice.reducer,
  connect: connectSlice.reducer,
};
