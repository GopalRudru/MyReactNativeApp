import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";


interface NetworkState {
  showNoInternetModal: boolean;
  showUpdate?: boolean;
  appStoreUrl: string | null; // App store URL, default null
}

const initialState: NetworkState = {
  showNoInternetModal: false,
  showUpdate: false,
  appStoreUrl: null,
};

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    showNoInternetModal(
      state,
      action: PayloadAction<{ showUpdate?: boolean; appStoreUrl?: string } | undefined>
    ) {
      state.showNoInternetModal = true;
      state.showUpdate = action.payload?.showUpdate ?? false;
      state.appStoreUrl = action.payload?.appStoreUrl ?? null;
    },
    setAppStoreUrl(state, action: PayloadAction<string | null>) {
      state.appStoreUrl = action.payload;
    },
    hideNoInternetModal(state) {
      state.showNoInternetModal = false;
      state.showUpdate = false;
    },
  },
});

export const { showNoInternetModal, hideNoInternetModal, setAppStoreUrl } =
  networkSlice.actions;


// Selectors
export const selectShowNoInternetModal = (state: RootState) =>
  state.network.showNoInternetModal;
export const selectAppStoreUrl = (state: RootState) => state.network.appStoreUrl;

export default networkSlice.reducer;
