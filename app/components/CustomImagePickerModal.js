import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import imagePath from "../constant/imagePath";
import strings from "../res/strings";
import colors from "../res/colors";
import AppConstants from "../constant/AppConstants";
import logger from "../utils/logger";

const CustomImagePickerModal = ({ visible, onClose, onSelectImages }) => {

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 1, // Allows multiple images
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          logger.log("User cancelled gallery");
        } else if (response.errorCode) {
          logger.error("Gallery error:", response.errorMessage);
        } else if (response.assets?.length) {
          onSelectImages(response.assets);
        }
        onClose();
      }
    );
  };

  const openCameraLibrary = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) {
          logger.log("User cancelled camera");
        } else if (response.errorCode) {
          logger.error("Camera error:", response.errorMessage);
        } else if (response.assets?.length) {
          onSelectImages(response.assets);
        }
        onClose();
      }
    );
  }

  const openCamera = () => {
    if (Platform.OS === "android") {
      requestCameraPermission();
    }
    else{
      openCameraLibrary();
    }

  };

  const requestCameraPermission = async () => {
    const permission = PERMISSIONS.ANDROID.CAMERA
        
    try {
      const result = await request(permission);
      logger.log("result", result);

      switch (result) {
        case RESULTS.GRANTED:
          openCameraLibrary();
          break;
        case RESULTS.DENIED:
          Alert.alert("Permission Denied", "Camera access is required.");
          break;
        case RESULTS.BLOCKED:
          Alert.alert(
            "Permission Blocked",
            "Camera permission is blocked. Please enable it in settings."
          );
          break;
        default:
          Alert.alert("Permission Error", "Unexpected permission result.");
      }
    } catch (error) {
      logger.error("Camera permission error:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.cancelIconView}>
            <TouchableOpacity 
            activeOpacity={AppConstants.buttonActiveOpacity} 
            onPress={onClose}>
              <Image 
              source={imagePath.cancel} 
              style={styles.icon} />
            </TouchableOpacity>
          </View>
          <View style={styles.titleView}>
            <Text style={styles.modalTitle}>{strings.choose_an_option}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={AppConstants.buttonActiveOpacity}
            style={styles.optionButton}
            onPress={() => openCamera()}
          >
            <Text style={styles.optionText}>{strings.open_camera}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
          activeOpacity={AppConstants.buttonActiveOpacity} 
          style={styles.optionButton} 
          onPress={openGallery}>
            <Text style={styles.optionText}>{strings.select_from_gallery}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  titleView: { alignItems: "center" },
  modalTitle: {
    fontSize: 18,
    color: colors.colorTitleText,
    marginBottom: 20,
  },
  optionButton: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: colors.appThemeColor,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelIconView: {
    alignItems: "flex-end",
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.colorTitleText,
  },
});

export default CustomImagePickerModal;
