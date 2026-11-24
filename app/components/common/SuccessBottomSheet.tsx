import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import strings from "../../res/strings";
import AppConstants from "../../constant/AppConstants";
import LoaderView from "./LoaderView";
import { clearAsyncStoreAndReduxStore, IS_LOGGED_IN, setItem } from "../../utils/storageUtils";
import * as NavigationService from "../../navigation/NavigationService";
import navigationStrings from "../../constant/navigationStrings";
import postsServices from "../../services/api/service/postsService";
import { createModuleLogger } from "../../utils/logger";
import { getDeviceUniqueId, SCREEN_NAME } from "../../utils/helpers";
import { authSelector } from "../../services/redux/slices/authSlice";
import { useSelector,  } from "react-redux";
import { encrypt } from "../../utils/crypto";
import imagePath from "../../constant/imagePath";
import GifImage from '@lowkey/react-native-gif';


const logger = createModuleLogger("SuccessBottomSheet");

interface BottomSheetProps {
  isVisible: boolean;
  setOpenBottomSheet: () => void;
  successMessage?: string;
  screenName?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");


const SuccessBottomSheet = ({
  isVisible,
  setOpenBottomSheet,
  successMessage = "",
  screenName = "",
}: BottomSheetProps) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);
  const { userProfile, businessType } = useSelector(authSelector);

  useEffect(() => {
    if (isVisible) {
      // Animate in - Bottom to Top (Slide In)
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 100,
      }).start();
    } else {
      // Animate out - Top to Bottom (Slide Out)
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        duration: 250,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleOverlayPress = () => {
    //setOpenBottomSheet();
  };

  const handleModalPress = (event: any) => {
    // Prevent modal from closing when content is pressed
    event.stopPropagation();
  };

  useEffect(() => {
    if (isVisible && screenName === SCREEN_NAME.RESET_MPIN) {
      setTimeout(async () => {
        setItem(IS_LOGGED_IN, false);
        setOpenBottomSheet();
        NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
      }, 3000);
    } else if (isVisible && screenName === SCREEN_NAME.CREATE_MPIN) {
      setTimeout(() => {
        setOpenBottomSheet();
      }, 3000);
    } else if (isVisible && screenName === SCREEN_NAME.MPIN_LOGIN) {
      setTimeout(() => {
        setOpenBottomSheet();
      }, 3000);
    }
  }, [isVisible]);

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        />
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalInner}
              activeOpacity={AppConstants.buttonActiveOpacity}
              onPress={handleModalPress}
            >
              <View style={{ width: "100%", alignItems: "center" }}>
                <View style={styles.dragHandle} />
              </View>
              {/* <Image
                source={imagePath.success}
                style={{
                  alignSelf: "center",
                  marginVertical: 20,
                  width: 50,
                  height: 50,
                }}
              /> */}
              <GifImage
                source={imagePath.done}
                style={{
                  width: 180,
                  height: 180,
                  alignSelf: "center",
                }}
                //resizeMode={"cover"}
                onLoadEnd={() => {}}
              />
              <Text style={styles.title}>{successMessage}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        {isLoading && <LoaderView />}
      </View>
    </Modal>
  );
};

export default SuccessBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalInner: {
    paddingTop: 8,
    paddingHorizontal: 0,
    paddingBottom: 24,
    alignItems: "flex-start",
    width: "100%",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 20,
  },
  title: {
    width: "100%",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: fonts.bold,
    color: "#090A0A",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    fontSize: 16,
    color: colors.black,
    fontFamily: fonts.bold,
    marginBottom: 8,
    marginTop: 8,
    textAlign: "left",
    lineHeight: 22,
    paddingHorizontal: 18,
  },
  warning: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 24,
    fontFamily: fonts.regular,
    textAlign: "left",
    paddingHorizontal: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 20,
    paddingHorizontal: 18,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    alignItems: "center",
  },
  cancelText: {
    color: colors.appThemeColor,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  deleteButton: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.appThemeColor,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
