import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { set } from "react-hook-form";

interface authState {
  otpUserData: any;
  otpVerifyUsersData: any;
  userProfile: any;
  passwordType: String | null;
  password: String | null;
  token: any;
  requestSignature: string | null;
  authStatus: boolean;
  permission: any;
  businessType: Array<object> | null;
  loanCategory: Object | null;
  sessionExpired: boolean,
  mobile: string | null;
  mpin: string | null;
  mpinData: any;
  setPasswordKey: string | null;
  userId: string | null;
  akSessionRef: string | null;
}

const initialState: authState = {
  otpUserData: null,
  otpVerifyUsersData: null,
  userProfile: null,
  passwordType: null,
  password: null,
  token: null,
  requestSignature: null,
  authStatus: false,
  permission: null,
  businessType: null,
  loanCategory: null,
  sessionExpired: false,
  mpin: null,
  mpinData: null,
  mobile: null,
  setPasswordKey: null,
  userId: null,
  akSessionRef: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setOtpUserData(state, action) {
      state.otpUserData = action.payload;
    },
    setOtpVerifyUsersData(state, action) {
      state.otpVerifyUsersData = action.payload;
    },
    setUserProfileData(state, action) {
      state.userProfile = action.payload;
    },
    setPasswordType(state, action) {
      state.passwordType = action.payload;
    },
    setPassword(state, action) {
      state.password = action.payload;
    },
    setUserAuth(state, action) {
      // state.token = action.payload;
      // state.authStatus = !!action.payload;
      state.token = action.payload;
      state.authStatus = !!action.payload;
      // Sync with sessionStorage for consistency
      //if (action.payload) {
      //  sessionStorage.setItem("token", action.payload);
      //} else {
      //  sessionStorage.removeItem("token");
      //}
    },
    setRequestSignature(state, action) {
      state.requestSignature = action.payload;
    },
    setUserPermission(state, action) {
      state.permission = action.payload;
    },
    setUserBusinessType(state, action) {
      state.businessType = action.payload;
    },
    setUserLoanCategory(state, action) {
      state.loanCategory = action.payload;
    },
    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
    },
    setSetPasswordKey(state, action) {
      state.setPasswordKey = action.payload;
    },
    setUserId(state, action) {
      state.userId = action.payload;
    },
    setAkSessionRef(state, action) {
      state.akSessionRef = action.payload;
    },
    setMpin(state, action) {
      state.mpin = action.payload;
    },
    setMpinData(state, action) {
      state.mpinData = action.payload;
    },
    setMobile(state, action) {
      state.mobile = action.payload;
    },
    clearOtpUserData(state) {
      state.otpUserData = null;
      state.otpVerifyUsersData = null;
      state.setPasswordKey = null;
    },
    clearPasswordType(state) {
      state.passwordType = null;
    },
    clearPassword(state) {
      state.password = null;
    },
    clearMpin(state) {
      state.mpin = null;
    },
    clearMpinData(state) {
      state.mpinData = null;
    },
    clearUserId(state) {
      state.userId = null;
    },
    clearAkSessionRef(state) {
      state.akSessionRef = null;
    },
    clearAuth(state) {
      state.otpUserData = null;
      state.otpVerifyUsersData = null;
      state.userProfile = null;
      state.token = null;
      state.requestSignature = null;
      state.authStatus = false;
      state.permission = null;
      state.businessType = null;
      state.password = null;
      state.loanCategory = null;
      state.sessionExpired = false;
      state.mpin = null;
      state.mpinData = null;
      state.setPasswordKey = null;
      state.mobile = null;
      state.userId = null;
      state.akSessionRef = null;
    },
  },
});

export const {
  setOtpUserData,
  setOtpVerifyUsersData,
  setUserProfileData,
  setUserAuth,
  setRequestSignature,
  setPasswordType,
  setPassword,
  setSetPasswordKey,
  setUserId,
  setAkSessionRef,
  clearAkSessionRef,
  setUserPermission,
  setUserBusinessType,
  setUserLoanCategory,
  setSessionExpired,
  setMobile,
  clearAuth,
  clearOtpUserData,
  clearPasswordType,
  clearPassword,
  setMpinData,
  clearMpinData,
  setMpin,
  clearMpin,
} = authSlice.actions;
export const authSelector = (state: RootState) => state?.auth;
export const authStatusSelector = (state: RootState) => state?.auth.authStatus;
export const authTokenSelector = (state: RootState) => state?.auth.token;
export const requestSignatureSelector = (state: RootState) =>
  state?.auth?.requestSignature;
export const userPermissionSelector = (state: RootState) =>
  state?.auth.permission;
export const userSelector = (state: RootState) => state?.auth.userProfile;
export const userBusinessSelector = (state: RootState) =>
  state?.auth.businessType;
export const userLoanCatSelector = (state: RootState) =>
  state?.auth.loanCategory;
export const mobileSelector = (state: RootState) => state?.auth.mobile;
export const akSessionRefSelector = (state: RootState) =>
  state?.auth?.akSessionRef;

export default authSlice.reducer;
