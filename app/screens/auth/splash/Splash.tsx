import React, { useEffect } from "react";
import { View, Image, StatusBar } from "react-native";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import AppConstants from "../../../constant/AppConstants";
import styles from "./styles";
import imagePath from "../../../constant/imagePath";
import { clearAsyncStoreAndReduxStore, getItem, IS_LOGGED_IN } from "../../../utils/storageUtils";
import colors from "../../../res/colors";
import analytics from "@react-native-firebase/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import postsServices from "../../../services/api/service/postsService";
import { useDispatch } from "react-redux";
import { setStatusPopup } from "../../../services/redux/slices/statusPopupSlice";
import logger from "../../../utils/logger";
import DialogStatusPopup from "../../../components/common/DialogStatusPopup";

const Splash = () => {

  

  return (
    <View style={styles.containerViewStyle}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Image
        source={imagePath.splashLogo}
        style={styles.logoStyle}
        resizeMode="contain"
      />
      <DialogStatusPopup />
    </View>
  );
};

export default Splash;
