import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, Text } from "react-native";
import strings from "../../res/strings";
import Header from "../../components/common/Header";
import * as NavigationService from "../../navigation/NavigationService";
import fonts from "../../res/fonts";
import { useDispatch, useSelector } from "react-redux";
import {
  authSelector,
  userLoanCatSelector,
} from "../../services/redux/slices/authSlice";
import {
  setStatusPopup,
  statusPopupSelector,
} from "../../services/redux/slices/statusPopupSlice";
import { setloanAccountNumberOptions } from "../../services/redux/slices/optionSlice";
import { RootState } from "../../services/redux/store";
import { encrypt } from "../../utils/crypto";
import postsServices from "../../services/api/service/postsService";
import { messages } from "../../constant/AppConstants";
import { termLoanPermissionCheck } from "../../utils/helpers";
import {
  setDashboardData,
  setExistDisbursementStatus,
  setSelectedLoanNumber,
} from "../../services/redux/slices/dashboardDataSlice";
import {
  setProdcuctName,
  setSelectedIndex,
} from "../../services/redux/slices/tabsSlice";
import TermLoanDashboardData from "./TermLoanDashboardData";
import { ScrollView } from "react-native-gesture-handler";
import colors from "../../res/colors";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import ShadowCardComponent from "../../components/ShadowCardComponent";
import NoRecordFound from "../../components/common/NoRecordFound";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import mainStyle from "../../res/mainStyles";
import Space from "../../components/common/Space";
import navigationStrings from "../../constant/navigationStrings";
import { cleardisbursementButtonSlice } from "../../services/redux/slices/disbursementButtonSlice";
import { createModuleLogger } from "../../utils/logger";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";

const LoanListScreen = () => {
  const [termLoanData, setTermLoanData] = useState<any[]>([]);
  const { userProfile, businessType } = useSelector(authSelector);
  const [isLoading, setIsLoading] = useState(true);
  const selectedIndex = useSelector(
    (state: RootState) => state?.tabs?.selectedIndex
  );
  const logger = createModuleLogger("WelcomeScreen");
  const { refreshValue } = useSelector(statusPopupSelector);
  const userLoanCategory = useSelector(userLoanCatSelector);
  const [selected, setSelected] = useState("termLoan");
  const dispatch = useDispatch();
  const [isHideMainCard, setIsHideMainCard] = useState(false);
  interface Payload {
    cif: any;
    business: any;
    loanCategory: any;
  }

  useEffect(() => {
    logger.info("LoanListScreen mounted");
    const fetchData = async () => {
      setIsLoading(true);
      const payload: Payload = {
        cif: userProfile?.cifNumber,
        business: encrypt(businessType?.id),
        loanCategory: encrypt(userLoanCategory?.TermLoan[0]?.loanCategoryId),
      };
      try {
        const response = await postsServices.secureAddPost(
          "api/v1/dashboard/term-loan-dashboard",
          payload
        );
        //Sort list based on acive status
        const statusPriority: Record<string, number> = { A: 0, C: 1 };
        response?.data?.data.sort(
          (a: { statusOfLoan: string | number; }, b: { statusOfLoan: string | number; }) =>
            (statusPriority[a.statusOfLoan] ?? 99) -
            (statusPriority[b.statusOfLoan] ?? 99)
        );
        setTermLoanData(response?.data?.data);
        setIsHideMainCard(
          !Array.isArray(response?.data?.data) ||
            response?.data?.data.length === 0
        );
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          messages.withdrErrorMessages.commonError;
        //console.error("Error fetching data:", errorMessage);
        setIsHideMainCard(LoanListScreen.length === 0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshValue, userProfile?.cifNumber]);

  const handleViewDetailsClick = (
    loanAccountNumber: any,
    isExistDisbursementAllowdLoan: any
  ) => {
    if (termLoanPermissionCheck()) {
      let filterLoanAccountNumber = termLoanData?.map((acc) => acc.lanNumber);
      dispatch(setloanAccountNumberOptions(filterLoanAccountNumber));
      //dispatch(setSelectedloanAccountNumber(loanAccountNumber));
      dispatch(setDashboardData(termLoanData));
      dispatch(setExistDisbursementStatus(isExistDisbursementAllowdLoan));
      //dispatch(setSelectedLoanNumber(loanAccountNumber));

      //ToDo
      //NavigationService.navigate()
      dispatch(setSelectedIndex(0));
      dispatch(setProdcuctName("TermLoan"));
    } else {
      dispatch(
        setStatusPopup({
          status: "No access",
          message: `${messages.noPermission.module} "Account Summary"`,
        })
      );
    }
  };

  const handleBackPress = () => {
    NavigationService.goBack();
  };
  const ShimmerCard = () => {
    return (
      <View>
        <View style={styles.row}>
          <ShimmerPlaceHolder style={{ width: 170, height: 40 }} />
          <ShimmerPlaceHolder style={{ width: 80, height: 40 }} />
        </View>
        <View style={styles.row}>
          <ShimmerPlaceHolder
            style={{ width: "45%", height: 60 }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={{ width: "45%", height: 60 }}
            LinearGradient={LinearGradient}
          />
        </View>
        <View>
          <ShimmerPlaceHolder
            style={{
              width: "100%",
              height: 8,
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
        </View>
        <View style={styles.row}>
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
        </View>
        <View style={styles.row}>
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceHolder
            style={styles.boxSmall}
            LinearGradient={LinearGradient}
          />
        </View>
        <ShimmerPlaceHolder
          style={styles.footer}
          LinearGradient={LinearGradient}
        />
      </View>
    );
  };

  const onButtonPress = (item) => {
    if (termLoanPermissionCheck()) {
      let filterLoanAccountNumber = termLoanData?.map(
        (acc: any) => acc.lanNumber
      );
      dispatch(cleardisbursementButtonSlice());
      dispatch(setloanAccountNumberOptions(filterLoanAccountNumber));
      // dispatch(setSelectedloanAccountNumber(loanAccountNumber));
      dispatch(setDashboardData(termLoanData));
      dispatch(setSelectedLoanNumber(item?.lanNumber));
      NavigationService.navigate(navigationStrings.ACCOUNT_SUMMARY_TERM);
      dispatch(setSelectedIndex(0));
      dispatch(setProdcuctName("TermLoan"));
    } else {
      dispatch(
        setStatusPopup({
          status: "No access",
          message: `${messages.noPermission.module} "Account Summary"`,
        })
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      <Header backIconNeeded={true} onBackPress={handleBackPress} />
      {/* <View style={{ flex: 1 }}> */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {
          <>
            <View style={mainStyle.safeArea}>
              <Text style={styles.viewAll}>{strings.all_loans}</Text>
              {isLoading ? (
                <View>
                  <ShadowCardComponent
                    paddingHorizonatal={16}
                    paddingVertical={20}
                    marginVertical={1}
                    marginHorizontal={16}
                  >
                    <ShimmerCard />
                  </ShadowCardComponent>

                  <Space style={{ height: 15 }} />

                  <ShadowCardComponent
                    paddingHorizonatal={16}
                    paddingVertical={20}
                    marginVertical={1}
                    marginHorizontal={16}
                  >
                    <ShimmerCard />
                  </ShadowCardComponent>
                </View>
              ) : termLoanData.length === 0 ? (
                <NoRecordFound textmainStyle={{ marginTop: 5 }} />
              ) : (
                termLoanData.map((item, index) => (
                  <TermLoanDashboardData
                    key={index}
                    item={item}
                    screenName={navigationStrings.LOAN_LIST_SCREEN}
                    onRequestDisbursement={() => onButtonPress(item)}
                  />
                ))
              )}
            </View>
            {/* <View style={{ backgroundColor: "green" }}> */}
            <CopyrightComponent />
            {/* </View> */}
          </>
        }
      </ScrollView>
      <DialogStatusPopup />
      {/* </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  viewAll: {
    fontSize: 13,
    color: "#168794",
    lineHeight: 24,
    fontFamily: fonts.bold,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxSmall: {
    //width: screenWidth * 0.28,
    width: "32%",
    height: 40,
    borderRadius: 8,
  },
  footer: {
    alignSelf: "flex-end",
    width: 160,
    height: 40,
    marginTop: 16,
  },
});

export default LoanListScreen;
