import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { stat } from "fs";

interface statusPopupState {
  open: boolean;
  status: string | null;
  message: string | null;
  locationPath?: string | null;
  isFunction?: boolean;
  locationFunction?: any;
  buttonStatus: boolean;
  btnStatus?: string;
  refreshValue: any;
  anotherDeviceAuth: boolean;
  title?: string;
  submessage?: string | null;

  // Add new button configuration properties
  positiveButtonText?: string;
  negativeButtonText?: string;
  onPositivePress?: () => void;
  onNegativePress?: () => void;
  showNegativeButton?: boolean;
  showLeftCross?: boolean;
}

const initialState: statusPopupState = {
  open: false,
  status: null,
  message: null,
  locationPath: null,
  buttonStatus: false,
  refreshValue: 0,
  anotherDeviceAuth: false,
  locationFunction: null,
  isFunction: false,
  title: "",
  submessage: null,

  positiveButtonText: "",
  negativeButtonText: "",
  showNegativeButton: false,
  showLeftCross: true,
};

const statusPopupSlice = createSlice({
  name: "statusPopup",
  initialState,
  reducers: {
    setStatusPopup(state, action) {
      state.title = action.payload.title;
      state.open = true;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.buttonStatus = action.payload.buttonStatus;
      state.locationFunction = action.payload.locationFunction;
      state.isFunction = action.payload.isFunction;
      if (action.payload.anotherDeviceAuth) {
        state.anotherDeviceAuth = action.payload.anotherDeviceAuth;
      }
      if (action.payload.locationPath)
        state.locationPath = action.payload.locationPath;

       // Add new properties
      state.positiveButtonText = action.payload.positiveButtonText;
      state.negativeButtonText = action.payload.negativeButtonText;
      state.onPositivePress = action.payload.onPositivePress;
      state.onNegativePress = action.payload.onNegativePress;
      state.showNegativeButton = action.payload.showNegativeButton || false;
      state.showLeftCross = action.payload.showLeftCross !== false;
      state.submessage = action.payload.submessage || null;
    },

    clearStatusPopup(state) {
      state.open = false;
      state.locationPath = null;
      state.anotherDeviceAuth = false;
      state.locationFunction = null;
      state.isFunction = false;
      state.title = "";
      state.submessage = null;

      //Add new properties
      state.positiveButtonText = "";
      state.negativeButtonText = "";
      state.onPositivePress = () => {};
      state.onNegativePress = () => {};
      state.showNegativeButton = false;
      state.showLeftCross = true;
    },
    refreshStatusPopup(state, action) {
      state.refreshValue = action.payload;
    },
  },
});

export const { setStatusPopup, clearStatusPopup, refreshStatusPopup } =
  statusPopupSlice.actions;
export const statusPopupSelector = (state: RootState) => state?.statusPopup;
export default statusPopupSlice.reducer;
