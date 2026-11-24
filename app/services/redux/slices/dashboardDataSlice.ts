import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardData {
  sanctionedDisbursedData: any[]; // Define the type of sanctionedDisbursedData
  selectedLoanNumber?: string | null; // Define selectedLoanNumber as optional
  existDisbursementStatus?: string | null; // Define existDisbursementStatus as optional
  existMoratStatus?: string | null;
}

const initialState: DashboardData = {
  sanctionedDisbursedData: [], // Initialize with an empty array
  existMoratStatus: "",
};

const dashboardDataSlice = createSlice({
  name: "dashboardData",
  initialState,
  reducers: {
    setDashboardData: (state, action: PayloadAction<any[]>) => {
      state.sanctionedDisbursedData = action.payload;
    },
    setSelectedLoanNumber: (state, action: PayloadAction<string | null>) => {
      state.selectedLoanNumber = action.payload;
    },
    setExistDisbursementStatus: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.existDisbursementStatus = action.payload;
    },
    setMoratStatus: (state, action: PayloadAction<string | null>) => {
      state.existMoratStatus = action.payload;
    },
    //morat
  },
});

export const {
  setDashboardData,
  setSelectedLoanNumber,
  setExistDisbursementStatus,
  setMoratStatus,
} = dashboardDataSlice.actions;

export default dashboardDataSlice.reducer;
