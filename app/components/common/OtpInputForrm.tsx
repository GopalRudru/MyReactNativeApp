import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
} from "react-native";
import stringConstant from "../../res/strings";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import { OtpInput } from "react-native-otp-entry";
import AuthTitleTextComponent from "../AuthTitleTextComponent";
import strings from "../../res/strings";
import CustomButton from "../CustomButton";
import LoaderView from "./LoaderView";
import styles from "../../screens/auth/otp/styles";
import { moderateVerticalScale } from "react-native-size-matters";
import imagePath from "../../constant/imagePath";

interface OtpInputFormProps {
  emailMasked?: string;
  mobileMasked?: string;
  otpLength?: number;
  onOtpSubmit: (otp: string) => void;
  onResendOtp: () => void;
  closeModal: () => void;
  initialTimerSeconds?: number;
}
const OTP_LENGTH = 6;
const COUNTDOWN_TIME = 180;
const SPACING_BETWEEN_INPUTS = 16;
const { width: screenWidth } = Dimensions.get("window");
const PADDING = 20;
const totalSpacing = (OTP_LENGTH - 1) * SPACING_BETWEEN_INPUTS;
const availableWidth = screenWidth - PADDING * 2 - totalSpacing;
const otpInputWidth = availableWidth / OTP_LENGTH;

const OtpInputForm: React.FC<OtpInputFormProps> = ({
  emailMasked,
  mobileMasked,
  otpLength = 6,
  onOtpSubmit,
  onResendOtp,
  closeModal,
  initialTimerSeconds = 180,
}) => {
  // const [otp, setOtp] = useState<string[]>(new Array(otpLength).fill(""));
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(initialTimerSeconds);
  const [canResend, setCanResend] = useState(false);
  const otpRef = useRef<any>(null);
  const [otpKey, setOtpKey] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);
  const [timerStartTime, setTimerStartTime] = useState<number>(Date.now());
  const [isResendDisabled, setResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isOtpComplete = otp.length === OTP_LENGTH;
  /* ---------------- Timer Logic ---------------- */
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleChangeText = (text: string) => {
    setOtp(text);
  };

  return (
    <View
      style={{
        backgroundColor: "white",
        width: "90%",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <AuthTitleTextComponent text={stringConstant.Enter_OTP} />
          <TouchableOpacity onPress={closeModal}>
            <Image source={imagePath.cross} style={{ width: 40, height: 40 }} />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: moderateVerticalScale(10) }}>
          <Text style={styles.descriptionText}>
            Please enter the OTP sent to{" "}
            {emailMasked ? (
              <>
                <Text>your email </Text>
                <Text style={styles.highlightText}>{emailMasked}</Text>
              </>
            ) : null}
            {emailMasked && mobileMasked ? <Text> and </Text> : null}
            {mobileMasked ? (
              <>
                <Text>your mobile </Text>
                <Text style={styles.highlightText}>{mobileMasked}</Text>
              </>
            ) : null}
            <Text>.</Text>
          </Text>
        </View>
        <Text style={styles.label}>
          {stringConstant.Type_your_6_digit_security_code}
        </Text>

        <View style={styles.otpContainer}>
          <OtpInput
            ref={otpRef}
            key={otpKey}
            numberOfDigits={OTP_LENGTH}
            focusColor={colors.appThemeColor}
            autoFocus={false}
            hideStick={false}
            disabled={false}
            type="numeric"
            secureTextEntry={false}
            focusStickBlinkingDuration={500}
            onTextChange={(text) => handleChangeText(text)}
            onFilled={(text) => {
              // logger.debug("OTP input completed", { otp: text });
            }}
            textInputProps={{
              accessibilityLabel: "One-Time Password",
              textContentType: "oneTimeCode",
              keyboardType: "number-pad",
            }}
            theme={{
              containerStyle: {
                flexDirection: "row",
                alignItems: "center",
              },
              pinCodeContainerStyle: {
                width: otpInputWidth,
                height: otpInputWidth,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#C4C4C4",
                backgroundColor: "transparent",
              },
              pinCodeTextStyle: {
                fontSize: 16,
                fontFamily: fonts.regular,
              },
              focusedPinCodeContainerStyle: {
                borderColor: colors.appThemeColor,
              },
            }}
          />
        </View>

        <View style={styles.timerRow}>
          <Text style={styles.timerText}>
            {`${Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`}
          </Text>
          <TouchableOpacity disabled={isResendDisabled} onPress={onResendOtp}>
            <Text
              style={[
                styles.resendText,
                isResendDisabled && styles.disabledText,
              ]}
            >
              {stringConstant.Resend_OTP}
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title={strings.Continue}
          isDisabled={!isOtpComplete || isLoading}
          onPress={() => onOtpSubmit(otp)}
          backgroundColor={!isOtpComplete && colors.disabledBackGroundColor}
          imageNeeded={false}
          logoutImage={false}
        />
      </View>
      {isLoading && <LoaderView />}
    </View>
  );
};

export default OtpInputForm;
