import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Interface for the disbursement button slice state
interface disbursementButtonSliceState {
  disbursementButtonSlice: string | null;
  lastDisbursementStatus: any; // Adjust the type as needed
  actionRowData: any;
}

// Initial state for the slice
const initialState: disbursementButtonSliceState = {
  disbursementButtonSlice: null,
  lastDisbursementStatus: null, // Initial state for lastDisbursementStatus
  actionRowData: null,
};

// Create the slice
const disbursementButtonSlice = createSlice({
  name: "disbursementButtonSlice",
  initialState,
  reducers: {
    setdisbursementButtonValue(state, action: PayloadAction<string>) {
      state.disbursementButtonSlice = action.payload;
    },
    cleardisbursementButtonSlice(state) {
      state.disbursementButtonSlice = null;
    },
    resetDisbursementButtonValue(state) {
      state.disbursementButtonSlice = null; // Reset to initial state (null)
    },
    setLastDisbursementStatus(state, action: PayloadAction<any>) {
      state.lastDisbursementStatus = action.payload; // Update the last disbursement status
    },
    setActionRowData(state, action: PayloadAction<any>) {
      state.actionRowData = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  setdisbursementButtonValue,
  cleardisbursementButtonSlice,
  resetDisbursementButtonValue,
  setLastDisbursementStatus,
  setActionRowData,
} = disbursementButtonSlice.actions;
export const actionRowDataSelector = (state: RootState) => state.disbursementButtonSlice.lastDisbursementStatus;
export default disbursementButtonSlice.reducer;
