import { createSlice } from "@reduxjs/toolkit";

// Interface for the state
interface KeyRegistrarState {
  keys: string;
  mobileNumbers: string;
  lanNumbers: string;
  signupOnboardApi: any; // To store API-related data
  loginType: "email" | "mobile"; // New: Login type as either email or mobile
  newUserData: any; // New: Login type as either email or mobile
}

// Initial state
const initialState: KeyRegistrarState = {
  keys: "", // Initialize as an empty string
  mobileNumbers: "", // Initialize as an empty string
  lanNumbers: "", // Initialize as an empty string
  signupOnboardApi: [], // Initialize as an empty array
  loginType: "email", // Default to email login
  newUserData: {}, // Default to false
};

// Slice definition
const keyRegistrarSlice = createSlice({
  name: "keyRegistrar",
  initialState,
  reducers: {
    addKey: (state, action) => {
      state.keys = action.payload; // Directly assign the string value
    },
    removeKey: (state) => {
      state.keys = ""; // Reset to an empty string
    },
    resetKeys: (state) => {
      state.keys = ""; // Reset to an empty string
    },
    addMobileNumber: (state, action) => {
      state.mobileNumbers = action.payload; // Directly assign the string value
    },
    removeMobileNumber: (state) => {
      state.mobileNumbers = ""; // Reset to an empty string
    },
    addLanNumber: (state, action) => {
      state.lanNumbers = action.payload; // Directly assign the string value
    },
    removeLanNumber: (state) => {
      state.lanNumbers = ""; // Reset to an empty string
    },
    // Updated: Add implementation for `addSignupOnboardApi`
    addSignupOnboardApi: (state, action) => {
      state.signupOnboardApi = action.payload; // Assign the provided data
    },
    // Optionally, you can add a method to clear signupOnboardApi
    resetSignupOnboardApi: (state) => {
      state.signupOnboardApi = []; // Reset to an empty array
    },
    // New: Add or update login type
    setLoginType: (state, action) => {
      state.loginType = action.payload; // Update login type (email or mobile)
    },
    // New: Reset login type to default
    resetLoginType: (state) => {
      state.loginType = "email"; // Reset to email as default
    },
    // New: Add or update login type
    setNewUserData: (state, action) => {
      state.newUserData = action.payload; // Update login type (email or mobile)
    },
    // New: Reset login type to default
    resetNewUserData: (state) => {
      state.newUserData = {}; // Reset to email as default
    },
  },
});

// Exporting actions and reducer
export const {
  addKey,
  removeKey,
  resetKeys,
  addMobileNumber,
  removeMobileNumber,
  addLanNumber,
  removeLanNumber,
  addSignupOnboardApi, // Exporting the new action
  resetSignupOnboardApi, // Export this if necessary
  setLoginType, // Exporting the login type action
  resetLoginType, // Export this if necessary
  setNewUserData,
  resetNewUserData,
} = keyRegistrarSlice.actions;

export default keyRegistrarSlice.reducer;
