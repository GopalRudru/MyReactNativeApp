import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  statusPopupSelector,
  clearStatusPopup,
  refreshStatusPopup,
} from "../../services/redux/slices/statusPopupSlice";
import { useNavigation } from "@react-navigation/native";
import imagePath from "../../constant/imagePath";
import colors from "../../res/colors";
import * as NavigationService from "../../navigation/NavigationService";
import navigationStrings from "../../constant/navigationStrings";
import {
  authSelector,
  setSessionExpired,
} from "../../services/redux/slices/authSlice";
import { RootState } from "../../services/redux/store";
import { encrypt } from "../../utils/crypto";
import notificationsServices from "../../services/api/service/notificationService";
import { clearDocumentDiscardModal } from "../../services/redux/slices/documentFormSlice";
import { clearAsyncStoreAndReduxStore } from "../../utils/storageUtils";
import AppConstants from "../../constant/AppConstants";
import { capitalizeStatusFirstLetter } from "../../utils/helpers";
import { moderateScale } from "react-native-size-matters";
import { createModuleLogger } from "../../utils/logger";
import { enableBiometricAuth, isBiometricEnabled } from "../../screens/auth/mpinBiometric/BiometricUtils";

const logger = createModuleLogger("DialogStatusPopup");

// Status constants - centralized for reuse throughout the file
export const STATUS_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  NO_ACCESS: "no access",
  INFO: "info",
  SECURITY_WARNING: "security warning",
  SECURITY_ALERT: "security alert",
  INCORRECT_ACCOUNT_SELECTED: "incorrect account selected",
} as const;

// Helper function to check status type
const isStatusType = (currentStatus: string, targetStatus: string): boolean => {
  return currentStatus.toLowerCase() === targetStatus;
};

const DialogStatusPopup = () => {
  const {
    open,
    status,
    title,
    message,
    locationPath,
    buttonStatus,
    anotherDeviceAuth,
    locationFunction,
    isFunction,
    submessage,

    positiveButtonText,
    negativeButtonText,
    onPositivePress,
    onNegativePress,
    showNegativeButton,
    showLeftCross,
  } = useSelector(statusPopupSelector);

  const dispatch = useDispatch();
  const { userProfile } = useSelector(authSelector);
  const businessTypeId = useSelector(
    (state: RootState) => state?.auth?.businessType?.id
  );
  const loanCategoryData: any = useSelector(
    (state: RootState) => state?.auth?.loanCategory
  );

  const getIcon = () => {
    switch (status?.toLowerCase()) {
      case STATUS_TYPES.SUCCESS:
        return imagePath.success;
      case STATUS_TYPES.ERROR:
        return imagePath.redCross;
      case STATUS_TYPES.WARNING:
        return imagePath.warningImage;
      case STATUS_TYPES.NO_ACCESS:
        return imagePath.lockImage;
      case STATUS_TYPES.INFO:
      case STATUS_TYPES.INCORRECT_ACCOUNT_SELECTED:
        return imagePath.infoImage;
      case STATUS_TYPES.SECURITY_WARNING:
      case STATUS_TYPES.SECURITY_ALERT:
        return imagePath.redWarningImage;
      default:
        return imagePath.redCross;
    }
  };

  const handleClose = async () => {
    if (anotherDeviceAuth) {
      //dispatch(clearAuth());
      await clearAsyncStoreAndReduxStore();
      //NavigationService.resetTo(navigationStrings.LOGIN);
      NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
      dispatch(clearStatusPopup());
      //getNotificationsList();
    } else {
      dispatch(clearDocumentDiscardModal());
      if (locationPath) {
        dispatch(clearStatusPopup());
        //NavigationService.resetTo(navigationStrings.LOGIN);
        NavigationService.resetTo(navigationStrings.BIOMETRIC_MPIN_LOGIN);
      } else {
        dispatch(clearStatusPopup());
      }
    }
  };

  // const getNotificationsList = async () => {
  //   const bodyObj: any = {};
  //   let cifEntity = userProfile?.cifEntity;
  //   bodyObj.cifEntity = cifEntity;
  //   bodyObj.businessType = encrypt(businessTypeId);
  //   bodyObj.loanCategory = encrypt(
  //     loanCategoryData?.TermLoan[0]?.loanCategoryId
  //   );
  //   try {
  //     const res = await notificationsServices.getNotifications(bodyObj);
  //   } catch (error) {
  //     logger.error("get notifications API error:", error);
  //   }
  // };

  const handleOkEvent = () => {
    if (isFunction && typeof locationFunction === "function") {
      locationFunction();
    }
    dispatch(clearStatusPopup());
  };

  const handlePositivePress = () => {
    logger.debug("handlePositivePress called");
    if (onPositivePress && typeof onPositivePress === "function") {
      onPositivePress();
    } else if (isFunction && typeof locationFunction === "function") {
      locationFunction();
    } else {
      handleClose();
    }
    dispatch(clearStatusPopup());
  };

  const handleNegativePress = () => {
    if (onNegativePress && typeof onNegativePress === "function") {
      onNegativePress();
    } else {
      handleClose();
    }
    dispatch(clearStatusPopup());
  };

  const onRefresh = () => {
    dispatch(refreshStatusPopup(Date.now()));
    handleClose();
  };

  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {showLeftCross && (
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Image source={imagePath.cross} style={{ width: 20, height: 20, tintColor: "#888" }} />
            </TouchableOpacity>
          )}

          <View style={styles.header}>
            <Image source={getIcon()} style={styles.icon} />
            <Text style={styles.title}>
              {capitalizeStatusFirstLetter(title) ||
                capitalizeStatusFirstLetter(status)}
            </Text>
          </View>

          <Text style={styles.message}>{message}</Text>
          {submessage && submessage !== "" && <Text style={styles.message}>{submessage}</Text>}
         

          <View style={styles.buttons}>
            {buttonStatus && (
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                style={styles.primaryBtn}
                onPress={onRefresh}
              >
                <Text style={styles.btnText}>Reload</Text>
              </TouchableOpacity>
            )}

            {/* Show negative button if configured */}
            {showNegativeButton && (
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                style={styles.negativeBtn}
                onPress={handleNegativePress}
              >
                <Text style={styles.negativeBtnText}>
                  {negativeButtonText || "Cancel"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Positive button (always shown unless buttonStatus is true) */}
            {!buttonStatus && (
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                style={styles.primaryBtn}
                onPress={handlePositivePress}
              >
                <Text style={styles.btnText}>
                  {positiveButtonText ||
                    (isFunction
                      ? isStatusType(status, STATUS_TYPES.ERROR)
                        ? "Close"
                        : "Confirm"
                      : "Close")}
                </Text>
              </TouchableOpacity>
            )}

            {/* {isFunction ? (
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                style={styles.primaryBtn}
                onPress={handleOkEvent}
              >
                <Text style={styles.btnText}>
                  {status == "error" ? "Close" : "Confirm"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                style={styles.primaryBtn}
                onPress={handleClose}
              >
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            )} */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DialogStatusPopup;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.blackOpacity01,
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  popup: {
    padding: 20,
    width: "85%",

    backgroundColor: colors.shadowCardBackground,
    borderRadius: moderateScale(10),

    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(6),
    elevation: moderateScale(4),
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
  },
  message: {
    fontSize: 15,
    color: "#444",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: colors.appThemeColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  negativeBtn: {
    backgroundColor: colors.lightGreyBackgroundColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.appThemeColor,
  },
  negativeBtnText: {
    color: colors.appThemeColor,
    fontWeight: "600",
  },
});
