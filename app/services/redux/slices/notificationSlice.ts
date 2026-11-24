import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  notificationData: [],
  unreadCount: 0,
  loading: false,
  notificationType: "",
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    setNotification(state, action) {
      state.notificationData = action.payload;
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    setLoadingNotification(state, action) {
      state.loading = action.payload;
    },
    clearNotification(state) {
      state.unreadCount = null;
      state.notificationData = [];
      state.loading = false;
    },
    setNotificationtype(state, action) {
      state.notificationType = action.payload;
    },
  },
});

export const {
  incrementUnreadCount,
  setNotification,
  setUnreadCount,
  setLoadingNotification,
  clearNotification,
  setNotificationtype
} = notificationSlice.actions;
export const notificationSelector = (state: any) => state.notification;
export default notificationSlice.reducer;
