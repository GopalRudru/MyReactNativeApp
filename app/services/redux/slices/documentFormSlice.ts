import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface documentFormType {
  formType: string;
  isDiscard: boolean;
  isNewData: boolean;
  partPaymentType: string;
}

const initialState: documentFormType = {
  formType: "",
  isDiscard: false,
  isNewData: false,
  partPaymentType: "",
};

const documentFormSlice = createSlice({
  name: "formType",
  initialState,
  reducers: {
    setDocumentNewData: (state, action: PayloadAction<boolean>) => {
      state.isNewData = action.payload;
    },
    setDocumentFormType: (state, action: PayloadAction<string>) => {
      state.formType = action.payload;
    },
    setDocumentDiscardModal: (state) => {
      state.isDiscard = true;
    },
    clearDocumentDiscardModal: (state) => {
      state.isDiscard = false;
    },

    setPartPaymentType: (state, action: PayloadAction<string>) => {
      state.partPaymentType = action.payload;
    },

    clearPartPaymentType: (state) => {
      state.partPaymentType = "";
    },

    clearDocumentFormType: (state) => {
      state.formType = "";
      state.isDiscard = false;
      state.isNewData = false;
    },
    clearDocumentNewData: (state) => {
      state.isNewData = false;
    },
  },
});

export const {
  setDocumentFormType,
  setDocumentDiscardModal,
  clearDocumentFormType,
  clearDocumentDiscardModal,
  clearDocumentNewData,
  setDocumentNewData,
  clearPartPaymentType,
  setPartPaymentType
} = documentFormSlice.actions;
export default documentFormSlice.reducer;
