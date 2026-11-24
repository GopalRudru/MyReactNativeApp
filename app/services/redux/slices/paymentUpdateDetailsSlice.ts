import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaymentUpdateDetailsState {
  nextTermSubID: Number;
  nextPaymentAmount: Number
}

const initialState: PaymentUpdateDetailsState = {
  nextTermSubID: 0,
  nextPaymentAmount: 0,
};

const paymentUpdateDetailsSlice = createSlice({
  name: "paymentUpdateDetails",
  initialState,
  reducers: {
    setPaymentUpdateDetails: (state, action: PayloadAction<{
      nextPaymentAmount: any;
      nextTermSubID: any
    }>) => {
      state.nextTermSubID = action.payload.nextTermSubID;
      state.nextPaymentAmount = action.payload.nextPaymentAmount;
    },
  },
});

export const { setPaymentUpdateDetails } = paymentUpdateDetailsSlice.actions;
export default paymentUpdateDetailsSlice.reducer;