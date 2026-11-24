import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBottomNavVisible } from "../../services/redux/slices/tabsSlice";
import Header from "../../components/common/Header";
import colors from "../../res/colors";
import LoaderView from "../../components/common/LoaderView";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
import TermLoanDashboard from "./TermLoanDashboard";
import { authSelector } from "../../services/redux/slices/authSlice";
import { RootState } from "../../services/redux/store";
import SanctionedDisbursed from "./SanctionedDisbursed";
import NoLoansFound from "./NoLoansFound";
import * as NavigationService from "../../navigation/NavigationService";
import navigationStrings from "../../constant/navigationStrings";
import { disableBiometricLock } from "../auth/mpinBiometric/BiometricUtils";
import logger from "../../utils/logger";
import ExistingApplication from "./ExistingApplication";
import DrawerWebViewScreen from "../webview/DrawerWebViewScreen";

type DashboardView =
  | "TERM_LOAN"
  | "FLEXI_LOAN"
  | "EXISTING_APPLICATION"
  | "NO_LOANS";

const resolveDashboardView = (
  tabType: string | null,
  termLoanCount: number,
  flexiCount: number
): DashboardView => {
  if ((tabType === "Term Loan" || tabType == null) && termLoanCount > 0) {
    return "TERM_LOAN";
  }
  if (tabType === "Flexi Term Loan" && flexiCount > 0) {
    return "FLEXI_LOAN";
  }
  if (termLoanCount === 0 && flexiCount === 0) {
    return "EXISTING_APPLICATION";
  }
  return "NO_LOANS";
};

const DashboardScreen = ({ route }: any) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const applyNowRegisterFlow = route?.params?.applyNowRegisterFlow ?? false;

  const { loanCategory } = useSelector(authSelector);
  const { Flexi = [], TermLoan = [] } = loanCategory || {};

  const tabType = useSelector((state: RootState) => state.tabs.tabType);

  const updateLoadingFlag = (flag: boolean) => {
    setIsLoading(flag);
  };

  useEffect(() => {
    const disableLock = async () => {
      await disableBiometricLock();
    };
    disableLock();
  }, []);

  const dashboardView = useMemo(
    () => resolveDashboardView(tabType, TermLoan.length, Flexi.length),
    [tabType, TermLoan.length, Flexi.length]
  );

  // The embedded Existing Application view is part of the Application flow,
  // which never shows the bottom navigation.
  useEffect(() => {
    dispatch(setBottomNavVisible(dashboardView == "TERM_LOAN"));
  }, [dashboardView, dispatch]);

  const componentToRender = useMemo(() => {
    switch (dashboardView) {
      case "TERM_LOAN":
        return <TermLoanDashboard updateLoadingFlag={updateLoadingFlag} />;
      case "FLEXI_LOAN":
        //return <DrawerWebViewScreen embedded={true} />;
        return <SanctionedDisbursed updateLoadingFlag={updateLoadingFlag} />;
      case "EXISTING_APPLICATION":
        return (
          <ExistingApplication
            updateLoadingFlag={updateLoadingFlag}
            embedded={true}
          />
        );
      default:
        return <NoLoansFound embedded={true} />;
    }
  }, [dashboardView]);

  useEffect(() => {
    if (applyNowRegisterFlow) {
      updateLoadingFlag(false);
      NavigationService.navigate(navigationStrings.WEB_VIEW_SCREEN, {
        URL: "https://customerportal-uat.avanse.com/apply-now", headerVisible: true,
      });
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Header
        onMenuPress={() => {}}
        onAvatarPress={() => {}}
        backIconNeeded={false}
        onBackPress={() => {}}
        onNotiIconPress={() => {}}
        setIsLoggedOut={setIsLoggedOut}
      />

      {componentToRender}
      {isLoading && <LoaderView />}
      {/* <DialogStatusPopup /> */}
    </SafeAreaView>
  );
};
export default DashboardScreen;
