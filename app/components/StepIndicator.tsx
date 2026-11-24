import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import colors from "../res/colors";
import fonts from "../res/fonts";
import imagePath from "../constant/imagePath";
import strings from "../res/strings";

const StepIndicator = ({
  currentStep,
  requestType,
}: {
  currentStep: number;
  requestType?: any;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      if (currentStep === 3) {
        // Scroll to end when step is 3
        scrollViewRef.current.scrollToEnd({ animated: true });
      } else if (currentStep === 1 || currentStep === 2) {
        // Scroll to start when step is 1 or 2
        scrollViewRef.current.scrollTo({ x: 0, animated: true });
      }
    }
  }, [currentStep]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView}
    >
      <View style={styles.rowDirection}>
        {[1, 2, 3].map((step, index) => {
          const isActive = currentStep === step;
          if (step === 3 && requestType !== "lien") {
            return null; // Skip rendering step 3 if requestType is not "lien"
          }

          return (
            <View key={step} style={styles.rowDirection}>
              <View style={[styles.circle, isActive && styles.activeCircle]}>
                <Text
                  style={[styles.stepNumber, isActive && styles.activeText]}
                >
                  {step}
                </Text>
              </View>
              {isActive && (
                <View style={styles.textContainer(step)}>
                  <Text
                    style={[styles.title, step === 3 && styles.compactTitle]}
                  >
                    {step === 1
                      ? strings.Request_Form
                      : step === 2
                      ? strings.Documents
                      : "A/c Information\n consent"}
                  </Text>
                  <Text style={styles.subtitle}>
                    {step === 1
                      ? strings.Name_Email_Contact
                      : step === 2
                      ? strings.Upload_document
                      : "Authorize Data Fetch"}
                  </Text>
                </View>
              )}
              {(step === 1 || (step === 2 && requestType === "lien")) && (
                <Image source={imagePath.rightArrow} style={styles.arrow} />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  rowDirection: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // flexWrap: "wrap",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#4B465C14",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircle: {
    backgroundColor: colors.appThemeColor,
  },
  stepNumber: {
    color: "#888",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  activeText: {
    color: "#fff",
  },
  textContainer: (step: number) => ({
    // width: step === 3 ? "50%" : "40%",
    marginLeft: 10,
    // backgroundColor: "red",
  }),
  title: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: "#333",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  compactTitle: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#aaa",
  },
  arrow: {
    marginHorizontal: 10,
    height: 20,
    width: 15,
    resizeMode: "contain",
    tintColor: "grey",
  },
});

export default StepIndicator;
