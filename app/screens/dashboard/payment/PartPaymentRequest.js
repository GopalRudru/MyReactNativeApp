import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Header from "../../../components/common/Header";
import mainStyle from "../../../res/mainStyles";
import * as NavigationService from "../../../navigation/NavigationService";
import PaymentHeader from "../../../components/PaymentHeader";
import LoanDetails from "../../../components/LoanDetails";
import colors from "../../../res/colors";
import CopyrightComponent from "../../../components/common/CopyrightComponent";
import CustomTextInput from "../../../components/CustomTextInput";
import strings from "../../../res/strings";
import fonts from "../../../res/fonts";
import imagePath from "../../../constant/imagePath";
import RadioButtonGroup from "../../../components/RadioButtonGroup";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

const PartPaymentRequest = () => {
  const [value, setValue] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFundValue, setSelectedFundValue] = useState("");
  const [selectedImpactValue, setSelectedImpactValue] = useState("");
  const [reasonText, setReasonText] = useState("");

  const options1 = [
    { label: "Own Funds/Savings", value: "savings" },
    { label: "Sale of immovable property", value: "sale prop" },
    { label: "Borrowed from financial Institutions", value: "borrowed inst" },
    {
      label: "Borrowed from Friend/Relatives/Family Members",
      value: "borrowed fam",
    },
    {
      label: "Sale of other investment (Like jewellery,shares etc.)",
      value: "sale investment",
    },
  ];
  const options2 = [
    { label: "Reduce Emi", value: "emi" },
    { label: "Reduce Tenure", value: "tenure" },
  ];

  const handleBackPress = () => {
    NavigationService.goBack();
  };

  const handleChange = (text, value) => {
    setValue(value);
  };

  const handleProceedPress = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousPress = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReasonbInput = (text, value) => [setReasonText(value)];

  const mainContent = (title) => {
    return (
      <>
        <Text style={styles.sectionTitle}>
          {currentStep === 1
            ? strings.payment_details.toUpperCase()
            : strings.review_details.toUpperCase()}
        </Text>

        {currentStep === 1 && (
          <CustomTextInput
            heading={strings.Total_Amount}
            placeholder={"Enter desired Pre-Payment amount"}
            keyboardType={"default"}
            onChangeText={(text) => handleChange("phoneNumber", text)}
            value={value}
          />
        )}
        <View pointerEvents="none">
          {currentStep === 3 && (
            <CustomTextInput
              heading={strings.Total_Amount}
              placeholder={strings.enter_your_phone}
              keyboardType={"default"}
              value={value}
            />
          )}

          <CustomTextInput
            heading={strings.applicable_charges}
            placeholder={strings.enter_your_phone}
            keyboardType={"default"}
            value={"1000"}
          />
          <CustomTextInput
            heading={strings.net_principal_adjustment}
            placeholder={"0"}
            keyboardType={"default"}
            value={value || 0}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: currentStep > 1 ? "space-between" : "flex-end",
          }}
        >
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => handlePreviousPress()}
            >
              <Image
                source={imagePath.backArrow}
                style={{
                  height: 10,
                  width: 20,
                  marginRight: 10,
                  tintColor: colors.appThemeColor,
                }}
              />
              <Text
                style={{
                  color: colors.appThemeColor,
                  fontFamily: fonts.regular,
                }}
              >
                {strings.previous}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.buttonDisabled,
              {
                backgroundColor:
                  value.length === 0
                    ? colors.disabledBackGroundColor
                    : colors.appThemeColor,
                width: currentStep === 1 ? "35%" : "50%",
              },
            ]}
            onPress={() => handleProceedPress()}
            disabled={value.length === 0}
          >
            <Text style={styles.buttonText(value.length)}>
              {currentStep === 1 ? strings.proceed : strings.proceed_to_pay}
            </Text>

            <Image
              source={imagePath.forwardArrow}
              style={{
                height: 10,
                width: 20,
                marginLeft: 10,
                tintColor: value.length ? "white" : "#BBBBBB",
              }}
            />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const secondPageContent = () => {
    return (
      <>
        <Text style={styles.sectionTitle}>
          {strings.additional_details.toUpperCase()}
        </Text>

        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 13,
              color: colors.paymentTextColor,
              fontFamily: fonts.regular,
            }}
          >
            {strings.source_of_funds}
          </Text>
        </View>
        <View style={{ marginTop: 20, marginBottom: 7, marginLeft: 12 }}>
          <RadioButtonGroup
            options={options1}
            selected={selectedFundValue || ""}
            onSelect={setSelectedFundValue}
            isColumnNeeded={true}
          />
        </View>
        <CustomTextInput
          heading={strings.specify_the_reason}
          placeholder={"Enter here"}
          keyboardType={"default"}
          onChangeText={(text) => handleReasonbInput("phoneNumber", text)}
          value={reasonText}
        />
        <View style={{ marginVertical: 12 }}>
          <Text
            style={{
              marginTop: 10,
              fontSize: 13,
              color: colors.paymentTextColor,
              fontFamily: fonts.regular,
            }}
          >
            {strings.please_select_the_desired_impact}
          </Text>
        </View>
        <View style={{ marginLeft: 16, marginVertical: 5 }}>
          <RadioButtonGroup
            options={options2}
            selected={selectedImpactValue || ""}
            onSelect={setSelectedImpactValue}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => handlePreviousPress()}
          >
            <Image
              source={imagePath.backArrow}
              style={{
                height: 10,
                width: 20,
                marginRight: 10,
                tintColor: colors.appThemeColor,
              }}
            />
            <Text
              style={{
                color: colors.appThemeColor,
                fontFamily: fonts.regular,
              }}
            >
              {strings.previous}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonDisabled,
              {
                backgroundColor:
                  reasonText.length > 0 &&
                  selectedFundValue.length > 0 &&
                  selectedImpactValue.length > 0
                    ? colors.appThemeColor
                    : colors.disabledBackGroundColor,
                width: "35%",
              },
            ]}
            onPress={() => handleProceedPress()}
            disabled={
              !(
                reasonText.length > 0 &&
                selectedFundValue.length > 0 &&
                selectedImpactValue.length > 0
              )
            }
          >
            <Text
              style={styles.buttonText(
                reasonText.length > 0 &&
                  selectedFundValue.length > 0 &&
                  selectedImpactValue.length > 0
              )}
            >
              {strings.proceed}
            </Text>
            <Image
              source={imagePath.forwardArrow}
              style={{
                height: 10,
                width: 20,
                marginLeft: 10,
                tintColor:
                  reasonText.length > 0 &&
                  selectedFundValue.length > 0 &&
                  selectedImpactValue.length > 0
                    ? "white"
                    : "#BBBBBB",
              }}
            />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={mainStyle.safeArea}>
      <Header
        backIconNeeded={true}
        onBackPress={handleBackPress}
        showProfile={true}
        showNotification={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, padding: 16 }}>
            <LoanDetails />
            <View style={styles.card}>
              <PaymentHeader currentStep={currentStep} />
              <View style={styles.horizontalDivider} />
              {(currentStep === 1 || currentStep === 3) &&
                mainContent(strings.payment_details)}
              {currentStep === 2 && secondPageContent()}
            </View>
          </View>
          <CopyrightComponent />
        </ScrollView>
      </KeyboardAvoidingView>
      <DialogStatusPopup />
    </SafeAreaView>
  );
};

export default PartPaymentRequest;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.appThemeColor,
  },
  buttonDisabled: {
    flexDirection: "row",
    marginTop: 20,
    width: "50%",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    marginTop: 20,
    width: "35%",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },

  buttonText: (length) => ({
    color: length ? "white" : "#BBBBBB",
    fontFamily: fonts.regular,
  }),
});
