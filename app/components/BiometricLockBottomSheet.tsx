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
import colors from "../res/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = SCREEN_HEIGHT / 2;

interface BiometricLockBottomSheet {
  visible: boolean;
  onClose: () => void;
  enableBiometric?: () => void;
  fingerprintEnabled?: boolean;
  title?: string;
  subTitle?: string;
  image?: any;
  btnText?: string;
}

const BiometricLockBottomSheet = ({
  visible,
  onClose,
  enableBiometric,
  fingerprintEnabled = true,
  title = "",
  subTitle = "",
  image,
  btnText = "",
}: BiometricLockBottomSheet) => {

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
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subTitleText}>{subTitle}</Text>

          <Image
            source={imagePath.icLock/*image || (Platform.OS === "android" ? imagePath.fingerprint : imagePath.faceId)*/}
            style={styles.image}
          />

          <CustomButton
            title={btnText}
            onPress={enableBiometric}
            isDisabled={false}
            marginTop={8}
            marginHorizontal={20}
          />
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default BiometricLockBottomSheet;

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
    tintColor: colors.appThemeColor,
    width: 120,
    height: 120,
  }
});
