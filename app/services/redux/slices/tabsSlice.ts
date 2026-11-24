// tabsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TabState {
  applicationStatus: string;
  summaryPageActiveTab: string; // state is for tab from viewsummary page
  selectedIndex: number;
  productName: string;
  selectDisbDetailIndex: number;
  quickHelpInfoRoute: string;
  tabType: string; // Add tabType to state
  isBottomNavVisible: boolean; // controls bottom tab bar visibility
  selectedSubTabName: string;
  existingApplicationRefreshCount: number;
}

const initialState: TabState = {
  applicationStatus: "",
  summaryPageActiveTab: "summary",
  selectedIndex: 0,
  productName: "",
  selectDisbDetailIndex: 0,
  quickHelpInfoRoute: "",
  tabType: "Term Loan", // Default value
  isBottomNavVisible: true,
  selectedSubTabName: "",
  existingApplicationRefreshCount: 0,
};

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    setApplicationStatus: (state, action: PayloadAction<string>) => {
      state.applicationStatus = action.payload;
    },
    setSummaryPageActiveTab: (state, action: PayloadAction<string>) => {
      state.summaryPageActiveTab = action.payload;
    },
    setSelectedIndex: (state, action: PayloadAction<number>) => {
      state.selectedIndex = action.payload;
    },
    setSelectDisbDetailIndex: (state, action: PayloadAction<number>) => {
      state.selectDisbDetailIndex = action.payload;
    },
    setProdcuctName: (state, action: PayloadAction<string>) => {
      state.productName = action.payload;
    },
    setQuickHelpInfoRoute: (state, action: PayloadAction<string>) => {
      state.quickHelpInfoRoute = action.payload;
    },
    setTabType: (state, action: PayloadAction<string>) => {
      state.tabType = action.payload;
    },
    hydrateTabType: (state, action: PayloadAction<string>) => {
      state.tabType = action.payload;
    },
    setBottomNavVisible: (state, action: PayloadAction<boolean>) => {
      state.isBottomNavVisible = action.payload;
    },
    setSelectedSubTabName: (state, action: PayloadAction<string>) => {
      state.selectedSubTabName = action.payload;
    },
    triggerExistingApplicationRefresh: (state) => {
      state.existingApplicationRefreshCount += 1;
    },
  },
});

export const {
  setApplicationStatus,
  setSummaryPageActiveTab,
  setSelectedIndex,
  setProdcuctName,
  setSelectDisbDetailIndex,
  setQuickHelpInfoRoute,
  setTabType,
  hydrateTabType,
  setBottomNavVisible,
  setSelectedSubTabName,
  triggerExistingApplicationRefresh,
} = tabsSlice.actions;
export default tabsSlice.reducer;
