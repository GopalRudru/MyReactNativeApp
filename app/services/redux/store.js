// app/store/store.js
//import { configureStore } from '@reduxjs/toolkit';
//import apiReducer from './slices/apislice';

// const store = configureStore({
//   reducer: {
//     api: apiReducer,
//   },
// });

// export default store;
//

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import optionReducer from "./slices/optionSlice";
import tabsReducer from "./slices/tabsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dashboardDataReducer from "./slices/dashboardDataSlice";
// import unauthReducer from "./slices/authSlice";
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
// import ccifDataReducer from "./slices/ccifDataSlice";
// import selectCcifSlice from "./slices/selectCcifSlice";
import notificationSlice from "./slices/notificationSlice";
// import tokenSlice from "./slices/tokenSlice";
// import snackbarSlice from "./slices/snackbarSlice";
// import mobileEmailSlice from "./slices/mobileEmailSlice";
import accountSummaryDataSlice from "./slices/accountSummarySlice";
import authSlice from "./slices/authSlice";
import { createTransform } from "redux-persist";
import CryptoJS from "crypto-js";

//import { encryptTransform } from "redux-persist-transform-encrypt";
import statusPopupSlice from "./slices/statusPopupSlice";
import networkSlice from "./slices/networkSlice";
import disbursementButtonSlice from "./slices/disbursementButtonSlice";
import documentFormSlice from "./slices/documentFormSlice";
// import notificationToast from "./slices/toastNotificationSlice";
import paymentUpdateDetailsSlice from "./slices/paymentUpdateDetailsSlice";
import keyRegistrarReducer from "./slices/keyRegistrarSlice";

// Custom encryption transform
const encryptor = createTransform(
  (inboundState, key) => {
    const stringifiedState = JSON.stringify(inboundState);
    const encryptedState = CryptoJS.AES.encrypt(
      stringifiedState,
      "Sq@r3G@m3-$3cr3t-k3y"
    ).toString();
    return encryptedState;
  },
  (outboundState, key) => {
    const bytes = CryptoJS.AES.decrypt(outboundState, "Sq@r3G@m3-$3cr3t-k3y");
    const decryptedState = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedState);
  }
);

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  transforms: [encryptor],
};

const rootReducer: any = combineReducers({
  auth: authSlice,
  option: optionReducer,
  tabs: tabsReducer,
  dashboardData: dashboardDataReducer,

  // snackbarSlice: snackbarSlice,
  notification: notificationSlice,
  accountSummaryData: accountSummaryDataSlice,
  statusPopup: statusPopupSlice,
  disbursementButtonSlice: disbursementButtonSlice,
  documentFormSlice: documentFormSlice,
  // toastNotification: notificationToast,
  paymentUpdateDetailsSlice: paymentUpdateDetailsSlice,
  networkSlice: networkSlice,
  keyRegistrar: keyRegistrarReducer,
});

const appReducer = (state, action) => {
  if (action.type === "RESET_APP") {
    state = undefined; // setting undefined resets whole redux tree
  }
  return rootReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, appReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
