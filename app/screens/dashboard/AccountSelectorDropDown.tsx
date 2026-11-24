import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../services/redux/store";
import { setSelectedLoanNumber } from "../../services/redux/slices/dashboardDataSlice";
import { setSelectedIndex } from "../../services/redux/slices/tabsSlice";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import { clearPartPaymentType } from "../../services/redux/slices/documentFormSlice";
import imagePath from "../../constant/imagePath";
import colors from "../../res/colors";
import { Dropdown } from "react-native-element-dropdown";
import strings from "../../res/strings";
import fonts from "../../res/fonts";
import analytics from "@react-native-firebase/analytics";
import { authSelector } from "../../services/redux/slices/authSlice";
import { decrypt } from "../../utils/crypto";

const AccountSelectorDropDown = ({
  buttonText,
  isActive,
  labelText,
  borderWidth,
  backgroundColor,
  marginTop,
}: any) => {
  const dispatch = useDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 361;

  const selectedLoanNumber = useSelector(
    (state: RootState) => state?.dashboardData?.selectedLoanNumber
  );

  const dashboardDataSet = useSelector(
    (state: RootState) => state?.dashboardData?.sanctionedDisbursedData
  );

  const selectedIndex = useSelector(
    (state: RootState) => state.tabs.selectedIndex
  );

  const loanAccountNumberOptions = useSelector(
    (state: RootState) => state?.option?.loanAccountNumberOptions
  );

  const buttonValue = useSelector(
    (state: RootState) => state.disbursementButtonSlice.disbursementButtonSlice
  );

  const paymentType = useSelector(
    (state: RootState) => state.documentFormSlice.partPaymentType
  );

  const [selectedLanNumber, setSelectedLanNumber] = useState(
    selectedLoanNumber ?? ""
  );
  const { userProfile } = useSelector(authSelector);

  const { otpUserData } = useSelector(authSelector);

  let user_id = "";
  if (selectedLoanNumber && userProfile?.cifNumber) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  const handleOptionSelect = async (value: string) => {
    setSelectedLanNumber(value);
    dispatch(setSelectedLoanNumber(value));
    dispatch(clearPartPaymentType());
    await analytics().setUserId(user_id);
    await analytics().logEvent("account_selected", {
      selected_loan_number: value,
      user_id: user_id,
    });
  };

  useEffect(() => {
    const matchVal: any = dashboardDataSet?.find(
      (data: any) => data?.lanNumber === selectedLoanNumber
    );

    if (matchVal?.isExistDisbursementAllowdLoan === false) {
      if (![0, 2, 3, 4].includes(selectedIndex)) {
        dispatch(setSelectedIndex(0));
        dispatch(
          setStatusPopup({
            status: "No access",
            message:
              strings.disbursement_requests_are_currently_unavailable_for_this_loan,
          })
        );
      }
    }

    if (
      selectedIndex === 2 &&
      ["M", "C", "W", "E", "S"].includes(
        matchVal?.status || matchVal?.statusOfLoan
      )
    ) {
      const allAccess = otpUserData?.altAccessFlag === true; // Check if user has all access privileges
      if (!allAccess) {
        dispatch(setSelectedIndex(0));
        dispatch(
          setStatusPopup({
            status: "No access",
            message:
              strings.payment_requests_are_currently_unavailable_for_this_loan,
          })
        );
      }
    }
  }, [selectedLoanNumber, dashboardDataSet, selectedIndex]);

  return (
    //Here assume LoanNumber every digit width 14 points
    <Dropdown
      style={[
        styles.lanContent,
        { width: selectedLoanNumber ? (isSmallScreen ? selectedLoanNumber.length * 16 : selectedLoanNumber.length * 15) : 164 },
      ]}
      data={
        loanAccountNumberOptions?.map((item: string, index: number) => ({
          label: item,
          value: item,
        })) || []
      }
      maxHeight={300}
      value={selectedLoanNumber}
      valueField="value"
      labelField="label"
      containerStyle={styles.dropdownContainer}
      placeholder={
        selectedLoanNumber ? `${selectedLoanNumber}` : "Select Account"
      }
      renderRightIcon={() => (
        <Image
          source={imagePath.downArrow}
          style={{ width: 16, height: 16, tintColor: colors.appThemeColor }}
          resizeMode="contain"
        />
      )}
      renderLeftIcon={() => <Text style={styles.lanText}>{strings.LAN}</Text>}
      onChange={(item) => {
        handleOptionSelect(item.value);
      }}
      placeholderStyle={{
        color: colors.appThemeColor,
        fontSize: 14,
        fontFamily: fonts.bold,
      }}
      selectedTextStyle={{
        color: colors.appThemeColor,
        fontSize: 14,
        fontFamily: fonts.bold,
      }}
    />
  );
};

export default AccountSelectorDropDown;

const styles = StyleSheet.create({
  lanContent: {
    zIndex: 1000,
    elevation: 10,
    minWidth: 150,
  },
  lanText: {
    color: colors.appThemeColor,
    fontSize: 14,
    marginRight: 6,
    fontFamily: fonts.bold,
  },
  dropdownContainer: {
    zIndex: 1000,
    width: 200,
    borderRadius: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingBottom: 6,
  },
  pressableStyle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)", // Optional: modal dim
  },
  wrapper: {
    position: "relative",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#00b3b5",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 200,
    width: "90%",
    zIndex: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  container: {
    alignItems: "flex-end",
    marginBottom: 5,
  },
  button: {
    borderColor: "#00b3b5",
    padding: 10,
    borderRadius: 6,
    minWidth: 180,
  },
  buttonText: {
    color: "#00b3b5",
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContainer: {
    backgroundColor: "#fefefe",
    marginHorizontal: 40,
    padding: 10,
    borderRadius: 8,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 12,
  },
});
