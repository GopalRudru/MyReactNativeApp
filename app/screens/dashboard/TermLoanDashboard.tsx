import { Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LoanSummaryCard from "../../components/LoanSummaryCard";
import DisbursementCard from "../../components/DisbursementCard";
import navigationStrings from "../../constant/navigationStrings";
import strings from "../../res/strings";
import AuthTitleTextComponent from "../../components/AuthTitleTextComponent";
import AuthSubTitleTextComponent from "../../components/AuthSubTitleTextComponent";
import fonts from "../../res/fonts";
import colors from "../../res/colors";
import { useSelector } from "react-redux";
import { authSelector } from "../../services/redux/slices/authSlice";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import Space from "../../components/common/Space";
import QuickHelpDashboardData from "../../components/QuickHelpDashboardData";
import ReferralBanners from "./banner/ReferralBanners";
import { useEffect, useState } from "react";
import { scale } from "react-native-size-matters";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";
interface TermLoanDashboardProps {
  updateLoadingFlag: (flag: boolean) => void;
}

const TermLoanDashboard = ({ updateLoadingFlag }: TermLoanDashboardProps) => {
  const { userProfile } = useSelector(authSelector);
  const [bannerVisible, setBannerVisible] = useState(true)
  const [awsBannerVisible, setAwsBannerVisible] = useState(true)
  const [isTermLoanLoading, setIsTermLoanLoading] = useState(false)
  
  const dashboardDataSet = useSelector(
    (state) => state.dashboardData.sanctionedDisbursedData,
  );
  const selectedLoanNumber = useSelector(
    (state) => state.dashboardData.selectedLoanNumber,
  );

  useEffect(() => {
    const matchVal = dashboardDataSet?.find(
      (data: any) => data?.lanNumber === selectedLoanNumber,
    );
    setBannerVisible((matchVal?.status || matchVal?.statusOfLoan) == "A");
    setAwsBannerVisible(
      (matchVal?.status === "A" || matchVal?.statusOfLoan === "A") &&
        (matchVal?.loanTypeName === "ELFORN" ||
          matchVal?.loanTypeName === "ELDOMC"),
    );
  }, [dashboardDataSet]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 8 }}>
        <View style={{ marginTop: 15, marginHorizontal: 8 }}>
          <AuthTitleTextComponent
            text={`Welcome back${
              userProfile?.name ? ` ${userProfile.name} 👋` : ""
            }`}
            textStyle={{
              lineHeight: 25,
              fontSize: 18,
              letterSpacing: 0,
              fontFamily: fonts.bold,
              color: colors.dashboardTitle,
            }}
          />

          <AuthSubTitleTextComponent
            text={strings.Monitor_all_your_loan_accounts_from_here}
            textStyle={{
              fontSize: 12,
              lineHeight: 22,
              color: colors.dashboardSubTitle,
            }}
          />
        </View>
      </View>
      <LoanSummaryCard
        screenName={navigationStrings.DASHBOARD_SCREEN}
        setIsTermLoanLoading={setIsTermLoanLoading}
      />
      {bannerVisible && (
        <ReferralBanners
          isTermLoanLoading={isTermLoanLoading}
          awsBannerVisible={awsBannerVisible}
        />
      )}
      <QuickHelpDashboardData updateStatus={updateLoadingFlag} />
      <DisbursementCard />
      <CopyrightComponent />
      <Space
        style={{ height: Platform.OS === "ios" ? scale(90) : scale(70) }}
      />
      {/* <DialogStatusPopup /> */}
    </ScrollView>
  );
};

export default TermLoanDashboard;
