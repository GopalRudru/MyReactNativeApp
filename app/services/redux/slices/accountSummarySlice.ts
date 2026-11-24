import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface accountSummaryData {
  sanctionedDisbursedData: any[]; 
}

const initialState: accountSummaryData = {
  sanctionedDisbursedData: [], 
};

const accountSummaryDataSlice = createSlice({
  name: 'accountSummaryData',
  initialState,
  reducers: {
    setaccountSummaryData: (state, action: PayloadAction<any[]>) => { // dispatch
      state.sanctionedDisbursedData = action.payload;  // get data
    },
  },
});

export const { setaccountSummaryData } = accountSummaryDataSlice.actions;
export default accountSummaryDataSlice.reducer;