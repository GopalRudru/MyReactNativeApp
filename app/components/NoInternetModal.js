import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import imagePath from "../constant/imagePath";
import { useDispatch, useSelector } from "react-redux";
import { setStatusPopup } from "../services/redux/slices/statusPopupSlice";
import { hideNoInternetModal } from "../services/redux/slices/networkSlice";
import colors from "../res/colors";
import fonts from "../res/fonts";
import AppConstants from "../constant/AppConstants";
import { Platform, Linking } from 'react-native';
import logger from "../utils/logger";
import { initialWindowMetrics } from "react-native-safe-area-context";

// This sheet is bottom-anchored inside a <Modal>, which renders in its own
// native window - useSafeAreaInsets() does not apply there. initialWindowMetrics
// reads the inset from native constants and needs no SafeAreaProvider.
const bottomInset = initialWindowMetrics?.insets?.bottom ?? 0;

const NoInternetModal = ({ visible }) => {
  const dispatch = useDispatch();
  const showUpdate = useSelector((state) => state.networkSlice.showUpdate);
  const appStoreUrl = useSelector((state) => state.networkSlice.appStoreUrl);
  const [cachedShowUpdate, setCachedShowUpdate] = React.useState(showUpdate);

  React.useEffect(() => {
    if (visible) {
      setCachedShowUpdate(showUpdate);
    }
  }, [visible]);

  const handleClose = () => {
    if (showUpdate) {
      dispatch(hideNoInternetModal());
      setTimeout(() => {
        redirectToStore();
      }, 500);
    } else {
      dispatch(hideNoInternetModal());
    }
  };

  const redirectToStore = () => {
    // Use dynamic appStoreUrl from Redux if available
    if (appStoreUrl) {
      Linking.openURL(appStoreUrl);
      return;
    }
    // Fallback to hardcoded URLs if not available
    // if (Platform.OS === 'ios') {
    //   Linking.openURL('https://apps.apple.com/app/idYOUR_APP_ID');
    // } else if (Platform.OS === 'android') {
    //   Linking.openURL('https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME');
    // }
  };

  logger.log("NoInternetModal rendered, visible:", visible);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image
            source={imagePath.rectangle}
            style={{ resizeMode: "contain", marginBottom: 32 }}
          />
          <View
            style={{
              height: 60,
              width: 60,
              backgroundColor: "#FDF3D3",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 30,
            }}
          >
            <Image
              source={cachedShowUpdate ? imagePath.vector : imagePath.offline}
              style={styles.image}
            />
          </View>
          <Text style={styles.title}>
            {!cachedShowUpdate
              ? "No Internet Connection"
              : "A new version of the app is available"}
          </Text>
          <Text style={styles.subtitle}>
            {!cachedShowUpdate
              ? "Please check your connection and try again."
              : "To continue using this app, please update to the latest version."}
          </Text>
          <TouchableOpacity style={styles.button} activeOpacity={AppConstants.buttonActiveOpacity} onPress={() => handleClose()}>
            <Text style={styles.buttonText}>
              {cachedShowUpdate ? "Update" : "OK"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NoInternetModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    // justifyContent: "center",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    // borderRadius: 12,
    // borderTopEndRadius: 16,
    paddingTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingBottom: 24 + bottomInset,
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: 37,
    height: 37,

    resizeMode: "contain",
    // marginBottom: 16,
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    // fontWeight: "bold",
    fontFamily: fonts.bold,
    textAlign: "center",
    color: "#090A0A",
    //marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: "#4B465C",
    fontFamily: fonts.regular,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    //flex: 1,
    height: 42,
    width: "100%",
    backgroundColor: colors.appThemeColor,
    // backgroundColor: "#00B3B5",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: fonts.semiBold,
    //fontWeight: "bold",
  },
});
