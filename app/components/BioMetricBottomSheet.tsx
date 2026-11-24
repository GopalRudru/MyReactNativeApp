import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import fonts from "../res/fonts";
import strings from "../res/strings";
import imagePath from "../constant/imagePath";
import CustomButton from "./CustomButton";
import ButtonBorder from "./ButtonBorder";
import { BiometricUnavailableReason, checkBiometricAvailability } from "../screens/auth/mpinBiometric/BiometricUtils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = SCREEN_HEIGHT / 2;

interface BioMetricBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  enableBiometric?: () => void;
  fingerprintEnabled?: boolean;
  btnText?: string;
}

const BioMetricBottomSheet = ({
  visible,
  onClose,
  enableBiometric,
  fingerprintEnabled = true,
  btnText = "",
}: BioMetricBottomSheetProps) => {

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(
    null,
  );

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : SCREEN_HEIGHT, {
      damping: 50,
      stiffness: 300,
    });
  }, [visible]);

  useEffect(() => {
    const checkBiometric = async () => {
      const { available, biometryType, unavailableReason } =
        await checkBiometricAvailability();
      if (!available || !biometryType) {
        setUnavailableReason(unavailableReason);
      }
    };
    checkBiometric();
  }, [visible]);

  const reanimatedBottomStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible) return null;

  return (
    <>
      <Pressable style={styles.backdrop} />
      <Animated.View
        style={[styles.bottomsheet_container, reanimatedBottomStyle]}
      >
        <View style={styles.line} />
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.titleText}>
            {unavailableReason === BiometricUnavailableReason.PERMISSION_DENIED
              ?  `Permission Denied`
              : unavailableReason === BiometricUnavailableReason.NOT_ENROLLED
              ? "Biometrics Not Set Up"
              : fingerprintEnabled
              ? "Enable Fingerprint"
              : "Enable Face ID"}
          </Text>
          <Text style={styles.subTitleText}>
            {unavailableReason === BiometricUnavailableReason.PERMISSION_DENIED
            ? `Biometric permission is disabled for this app. Please enable in your device settings first to use this feature.`
            : unavailableReason === BiometricUnavailableReason.NOT_ENROLLED
              ? strings.Please_enable_fingerprint_authentication_from_settings_to_use_this_feature
              : fingerprintEnabled
              ? strings.would_you_like_to_enable_fingerprint_along_with_using_mpin
              : strings.would_you_like_to_enable_face_id_along_with_using_mpin}
          </Text>

          <Image
            source={
              unavailableReason === BiometricUnavailableReason.PERMISSION_DENIED
              ? (Platform.OS === "android"
                ? imagePath.fingerprint
                : imagePath.faceId)
              : unavailableReason === BiometricUnavailableReason.NOT_ENROLLED
                ? imagePath.fingerprint
                : fingerprintEnabled
                ? imagePath.fingerprint
                : imagePath.faceId
            }
            style={styles.image}
          />

          <CustomButton
            title={
              unavailableReason === BiometricUnavailableReason.PERMISSION_DENIED
                ? btnText
                 :
              unavailableReason === BiometricUnavailableReason.NOT_ENROLLED
                ? btnText
                  ? btnText
                  : strings.continue_in_app
                : fingerprintEnabled
                ? strings.yes_enable_fingerprint
                : strings.yes_enable_face_id
            }
            onPress={enableBiometric}
            isDisabled={false}
            marginTop={8}
            marginHorizontal={20}
          />

          {(unavailableReason != BiometricUnavailableReason.PERMISSION_DENIED &&
            unavailableReason !== BiometricUnavailableReason.NOT_ENROLLED) && (
            <ButtonBorder
              title={strings.not_now}
              onPress={onClose}
              marginTop={15}
              marginHorizontal={20}
            />
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default BioMetricBottomSheet;

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 11999,
  },
  bottomsheet_container: {
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.75,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    zIndex: 12000,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  line: {
    width: 48,
    height: 5,
    backgroundColor: "#CDCFD0",
    borderRadius: 100,
    alignSelf: "center",
    marginVertical: 10,
  },
  titleText: {
    fontSize: 20,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
    fontFamily: fonts.bold,
  },
  subTitleText: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
    fontFamily: fonts.regular,
  },
  image: {
    alignSelf: "center",
    marginTop: 0,
  }
});
