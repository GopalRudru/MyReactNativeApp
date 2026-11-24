import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import colors from "../res/colors";
import imagePath from "../constant/imagePath";
import fonts from "../res/fonts";

const steps = [
  { key: 1, label: "Request Form" },
  { key: 2, label: "Additional Details" },
  { key: 3, label: "Proceed to pay" },
];

const PaymentHeader = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        return (
          <React.Fragment key={step.key}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={[
                  styles.stepCircle(currentStep, step.key),
                  isActive && styles.activeCircle,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber(currentStep, step.key),
                    isActive && styles.activeNumber,
                  ]}
                >
                  {step.key}
                </Text>
              </TouchableOpacity>

              {isActive && <Text style={styles.stepLabel}>{step.label}</Text>}
            </View>
            {index < steps.length - 1 && (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Image
                  source={imagePath.rightArrow}
                  style={{
                    height: 20,
                    width: 15,
                    resizeMode: "contain",
                    tintColor: "grey",
                  }}
                />
              </View>
            )}
            {/* </View> */}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  stepCircle: (currentStep, key) => ({
    backgroundColor: currentStep > key ? "#EEF8F9" : "#F1F0F2",
    width: 30,
    height: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  }),
  activeCircle: {
    backgroundColor: colors.appThemeColor,
  },
  stepNumber: (currentStep, key) => ({
    color: currentStep > key ? colors.appThemeColor : colors.subHeaderTextColor,
  }),
  activeNumber: {
    color: colors.white,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    marginLeft: 12,
    fontWeight: "600",
    color: colors.subHeaderTextColor,
  },
  arrow: {
    marginHorizontal: 5,
    color: "#9ca3af",
    fontWeight: "bold",
  },
});

export default PaymentHeader;
