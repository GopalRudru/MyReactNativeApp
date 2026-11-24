import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface LoanData {
  loanAccountNumber: string;
  productType: string;
  statusOfLoan: string;
  totalLimit: number;
  outstanding: number;
  availableLimit: number;
  overdueAmount: number;
}
export interface OptionState {
  selectedloanAccountNumber: string | null;
  loanAccountNumberOptions: string[] | null;
  loanData: LoanData[] | null;
}
const initialState: OptionState = {
  selectedloanAccountNumber: null, // Initialize with null
  loanAccountNumberOptions: null,
  loanData: null,
};
export const optionSlice = createSlice({
  name: "option",
  initialState,
  reducers: {
    setSelectedloanAccountNumber: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedloanAccountNumber = action.payload;
    },
    setloanAccountNumberOptions: (
      state,
      action: PayloadAction<string[] | null>
    ) => {
      state.loanAccountNumberOptions = action.payload;
    },
    setSelectedloanData: (state, action: PayloadAction<LoanData[] | null>) => {
      state.loanData = action.payload;
    },
  },
});
export const {
  setSelectedloanAccountNumber,
  setSelectedloanData,
  setloanAccountNumberOptions,
} = optionSlice.actions;
export default optionSlice.reducer;
