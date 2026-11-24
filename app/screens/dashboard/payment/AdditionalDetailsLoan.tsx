import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { PaymentTermLoanContext } from "../../../hooks/context";
import postsServices from "../../../services/api/service/postsService";
import strings from "../../../res/strings";
import colors from "../../../res/colors";
import fonts from "../../../res/fonts";
import RadioButtonGroup from "../../../components/RadioButtonGroup";
import CustomTextInput from "../../../components/CustomTextInput";
import PreviousButtonComponent from "../../../components/common/PreviousButtonComponent";
import SmallButtonComponent from "../../../components/common/SmallButtonComponent";
import LoaderView from "../../../components/common/LoaderView";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { useHideTabBar } from "../../../hooks/useHideTabBar";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createModuleLogger } from "../../../utils/logger";

// Create logger for AdditionalDetailsLoan component
const logger = createModuleLogger("AdditionalDetailsLoan");

const AdditionalDetailsLoan = (props: { ref: any }) => {
  
  const { setFormStep, formValue, handleFormValue, isXsOrSm }: any = useContext(
    PaymentTermLoanContext
  );

  const [fundsData, setFundsData] = useState<any>([]);
  const [desiredData, setDesiredData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const scrollRef = useRef(null);
  useHideTabBar();
  // setFundsData(formValue?.sourceFundsUuid);
  // setDesiredData(formValue?.desiredImpactUuid);
  /**
   * Fetches finance-related data from the server.
   *
   * This function makes an asynchronous call to the endpoint `/api/v1/payment/get-source-funds`
   * to retrieve the source of funds data. The data is then stored in the state using `setFundsData`.
   *
   * @async
   * @function fetchFundDataList
   * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
   * @throws Will log an error using logger if the request fails.
   */
  const fetchFundDataList = async (): Promise<void> => {
    try {
      await postsServices
        .secureGetPosts("api/v1/payment/get-source-funds")
        .then((response: any) => {
          logger.info("Successfully fetched source funds data", response?.data);
          setFundsData(response?.data);
        })
        .catch((error: any) => {
          logger.error("Failed to fetch source funds data", error);
        });
    } catch (error: any) {
      logger.error("Error in fetchFundDataList", error);
    }
  };

  /**
   * Fetches the desired list data from the server.
   *
   * This function makes an asynchronous call to the endpoint `/api/v1/payment/get-desired-impacts`
   * to retrieve the desired impacts data. The response data is then set to the state using `setDesiredData`.
   *
   * @async
   * @function fetchDesiredListData
   * @returns {Promise<void>} A promise that resolves when the data fetching is complete.
   * @throws Will log an error using logger if the request fails.
   */
  const fetchDesiredListData = async (): Promise<void> => {
    //reduce emi or tenure
    try {
      await postsServices
        .secureGetPosts("api/v1/payment/get-desired-impacts")
        .then((response: any) => {
          logger.info("Successfully fetched desired impacts data", response?.data);
          setDesiredData(response?.data);
          setIsLoading(false);
        })
        .catch((error: any) => {
          logger.error("Failed to fetch desired impacts data", error);
          setIsLoading(false);
        });
    } catch (error: any) {
      logger.error("Error in fetchDesiredListData", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFundDataList();
    fetchDesiredListData();
  }, []);

  const isCheckValue = useMemo(() => {
    return (
      !!formValue?.sourceFundsUuid &&
      !!formValue?.reasonForPartPayment &&
      !!formValue?.desiredImpactUuid
    );
  }, [formValue]);

  const [selectedFundValue, setSelectedFundValue] = useState("");
  const [selectedImpactValue, setSelectedImpactValue] = useState("");

  const shimmerCard = () => {
    return (
      <View style={{ paddingVertical: 16 }}>
        <ShimmerPlaceholder
          style={styles.title}
          LinearGradient={LinearGradient}
        />
        <View style={{ marginVertical: 10 }}>
          <ShimmerPlaceholder
            style={{
              height: 20,
              width: 300,
              marginBottom: 16,
              borderRadius: 4,
            }}
            LinearGradient={LinearGradient}
          />
        </View>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={`radio-group-${index}`} style={styles.radioText}>
            <ShimmerPlaceholder
              key={`radio-button-${index}`}
              style={styles.radionButton}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              key={`radio-text-${index}`}
              style={styles.radio}
              LinearGradient={LinearGradient}
            />
          </View>
        ))}
        <ShimmerPlaceholder
          style={styles.input}
          LinearGradient={LinearGradient}
        />
        <ShimmerPlaceholder
          style={styles.subheading}
          LinearGradient={LinearGradient}
        />
        <View style={styles.inline}>
          {Array.from({ length: 2 }).map((_, index) => (
            <View key={`inline-group-${index}`} style={styles.radioText}>
              <ShimmerPlaceholder
                key={`inline-button-${index}`}
                style={styles.radionButton}
                LinearGradient={LinearGradient}
              />
              <ShimmerPlaceholder
                key={`inline-text-${index}`}
                style={{
                  height: 20,
                  width: 100,
                  marginVertical: 10,
                  borderRadius: 2,
                }}
                LinearGradient={LinearGradient}
              />
            </View>
          ))}
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonRow}>
          <ShimmerPlaceholder
            key="button-previous"
            style={styles.button}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            key="button-proceed"
            style={styles.button}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>
    );
  };

  return (
    <View>
      {isLoading ? (
        shimmerCard()
      ) : (
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
              options={fundsData}
              selected={selectedFundValue || formValue?.sourceFundsUuid}
              onSelect={(uuid) => {
                setSelectedFundValue(uuid);
                handleFormValue("sourceFundsUuid", uuid);
              }}
              isColumnNeeded={true}
            />
          </View>

          <CustomTextInput
            heading={strings.specify_the_reason}
            placeholder={strings.enter_amount_to_pay}
            keyboardType={"default"}
            color={colors.valueTextColor}
            onChangeText={(text) => {
              handleFormValue("reasonForPartPayment", text);
            }}
            scrollRef={props.ref}
            value={formValue?.reasonForPartPayment}
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
              options={desiredData}
              selected={selectedImpactValue || formValue?.desiredImpactUuid}
              // selected={selectedImpactValue || ""}
              onSelect={(uuid) => {
                setSelectedImpactValue(uuid);
                handleFormValue("desiredImpactUuid", uuid);
              }}
              isColumnNeeded={false}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <PreviousButtonComponent
              onPress={() => {
                setFormStep(0);
              }}
              title={undefined}
              disabled={undefined}
            />
            <SmallButtonComponent
              disabled={isLoading || !isCheckValue}
              title={strings.proceed}
              onPress={() => {
                logger.log("Proceed button pressed", isCheckValue);
                setFormStep(2);
              }}
              imageNotNeeded={undefined}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default AdditionalDetailsLoan;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.appThemeColor,
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    height: 20,
    width: 150,
    marginBottom: 16,
    borderRadius: 4,
  },
  radio: {
    height: 20,
    width: 300,
    marginVertical: 10,
    borderRadius: 4,
    // justifyContent: "center",
    // alignItems: "center",
  },
  input: {
    height: 45,
    width: "100%",
    borderRadius: 8,
    marginVertical: 30,
  },
  subheading: {
    height: 20,
    width: 220,
    marginBottom: 20,
    borderRadius: 4,
  },
  inline: {
    flexDirection: "row",
    gap: 24,
    marginLeft: 10,
    // justifyContent: "space-between",
    marginBottom: 20,
  },
  radioInline: {
    height: 20,
    width: 140,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    height: 45,
    width: 140,
    borderRadius: 10,
  },
  radioText: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  radionButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
});
