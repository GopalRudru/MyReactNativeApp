import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Image
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import strings from "../../res/strings";
import AppConstants from "../../constant/AppConstants";
import LoaderView from "./LoaderView";
import { clearAsyncStoreAndReduxStore, IS_LOGGED_IN, setItem } from "../../utils/storageUtils";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import * as NavigationService from "../../navigation/NavigationService";
import navigationStrings from "../../constant/navigationStrings";
import postsServices from "../../services/api/service/postsService";
import { createModuleLogger } from "../../utils/logger";
import { getDeviceUniqueId } from "../../utils/helpers";
import { authSelector } from "../../services/redux/slices/authSlice";
import { useDispatch, useSelector,  } from "react-redux";
import { encrypt } from "../../utils/crypto";
import imagePath from "../../constant/imagePath";
import { checkConnectivity } from "../../services/api/apiClient/apiClient";
import { disableMpinAuth } from "../../screens/auth/mpinBiometric/BiometricUtils";
import GifImage from '@lowkey/react-native-gif';


const logger = createModuleLogger("DeregisterBottomSheet");

interface BottomSheetProps {
  isVisible: boolean;
  setOpenBottomSheet: () => void;
  openBottomSheet: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");


const DeregisterBottomSheet = ({
  isVisible,
  setOpenBottomSheet,
  openBottomSheet,
}: BottomSheetProps) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);
  const { userProfile, businessType } = useSelector(authSelector);
  const dispatch = useDispatch();

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

  const proceedDeregisterAccount = async () => {
    setIsLoading(true);
    const deviceId = await getDeviceUniqueId();
    try {
      let cifNumberValue = "";
      if (userProfile?.cifNumber) {
        cifNumberValue = userProfile?.cifNumber;
      } else if (userProfile?.email && userProfile?.phoneNumber) {
        cifNumberValue = userProfile?.phoneNumber;
      }

      const payload = {
        deviceId: encrypt(deviceId),
        cifNumber: cifNumberValue,
        userId: userProfile?.id?.toString(),
      };
      const response = await postsServices.secureAddPost(
        "api/v2/user/deregister-cif-device",
        payload,
      );
      if (response?.data?.status?.toLowerCase() === "success") {
        setIsAccountDeleted(true);
        setTimeout(async () => {
          setItem(IS_LOGGED_IN, false);
          await disableMpinAuth();
          await clearAsyncStoreAndReduxStore(true);
          setOpenBottomSheet();
          NavigationService.resetTo(navigationStrings.WELCOME_SCREEN);
        }, 3000);
      }
    } catch (error) {
      const isConnected = await checkConnectivity();
              if (isConnected) {
                dispatch(
                  setStatusPopup({
                    status: "Error",
                    message: error,
                  })
                );
              }
    } finally {
      setIsLoading(false);
    }
  };

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
            <View
              style={styles.modalInner}
            >
              <View style={{ width: "100%", alignItems: "center" }}>
                <View style={styles.dragHandle} />
              </View>

              {isAccountDeleted && (
                <>
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
                </>
              )}

              <Text style={styles.title}>
                {isAccountDeleted
                  ? "Account deregistered successfully."
                  : "Deregister Account?"}
              </Text>

              {!isAccountDeleted && (
                <>
                  <Text style={styles.content}>
                    Your MPIN/Biometrics login will be deregistered for this
                    account on this device.
                  </Text>
                  <Text style={styles.warning}>
                    <Text
                      style={[
                        styles.warning,
                        {
                          fontWeight: "bold",
                          fontFamily: fonts.bold,
                          fontSize: 15,
                        },
                      ]}
                    >
                      Note:
                    </Text>
                    {
                      " Your account will not be deleted. You can log in and register a new MPIN/Biometrics for this account at any time."
                    }
                  </Text>
                </>
              )}
              {!isAccountDeleted && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    onPress={setOpenBottomSheet}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    onPress={proceedDeregisterAccount}
                  >
                    <Text style={styles.deleteText}>Deregister</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
        {isLoading && <LoaderView />}
      </View>
    </Modal>
  );

  // return (
  //   <Modal visible={isVisible} transparent animationType="none">
  //     <View style={styles.overlay}>
  //       <TouchableOpacity
  //         style={styles.overlayTouchable}
  //         activeOpacity={1}
  //         onPress={handleOverlayPress}
  //       />
  //       <Animated.View
  //         style={[
  //           styles.modal,
  //           {
  //             transform: [{ translateY: slideAnim }],
  //           },
  //         ]}
  //       >
  //         <View style={styles.modalContent}>
  //           <TouchableOpacity
  //             style={styles.modalInner}
  //             activeOpacity={AppConstants.buttonActiveOpacity}
  //             onPress={handleModalPress}
  //           >
  //             <View style={{width:'100%', alignItems:'center'}}>
  //               <View style={styles.dragHandle} />
  //             </View>
              
  //             <Text style={styles.title}>{isAccountDeleted? "Account has been deleted!" : strings.delete_account}</Text>

  //             {!isAccountDeleted && (
  //               <>
  //                 <Text style={styles.content}>You will lose all access to the app permanently.</Text>
  //                 <Text style={styles.warning}>
  //                   <Text style={[styles.warning, {fontWeight: 'bold', fontFamily: fonts.bold, fontSize: 15}]}>Note:</Text>
  //                   {" For regulatory reasons, your data will be securely retained and will not be deleted.\n\nTo use the app again later, you must contact Customer Service to re-register."}
  //                 </Text>
  //               </>
  //             )}
  //             {!isAccountDeleted && (
  //               <View style={styles.buttonContainer}>
  //                 <TouchableOpacity
  //                   style={styles.cancelButton}
  //                   activeOpacity={AppConstants.buttonActiveOpacity}
  //                   onPress={setOpenBottomSheet}
  //                 >
  //                   <Text style={styles.cancelText}>Cancel</Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={styles.deleteButton}
  //                   activeOpacity={AppConstants.buttonActiveOpacity}
  //                   onPress={proceedDeleteAccount}
  //                 >
  //                   <Text style={styles.deleteText}>Delete</Text>
  //                 </TouchableOpacity>
  //               </View>
  //             )}
  //           </TouchableOpacity>
  //         </View>
  //       </Animated.View>
  //       {isLoading && <LoaderView />}
  //     </View>
  //   </Modal>
  // );
};

export default DeregisterBottomSheet;

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
    fontFamily: fonts.semiBold,
    marginBottom: 8,
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
