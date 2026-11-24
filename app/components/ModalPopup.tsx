import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Dimensions,
  Image,
} from "react-native";
import Modal from "react-native-modal";
import imagePath from "../constant/imagePath";
import fonts from "../res/fonts";
import colors from "../res/colors";
import AppConstants from "../constant/AppConstants";

interface ModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  childrenAction?: React.ReactNode;
  style?: ViewStyle;
  onNavigate?: () => void;
}

const ModalPopup: React.FC<ModalPopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
  childrenAction,
  style,
}) => {
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
      backdropOpacity={0.5}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View style={[styles.modalContainer, style]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity activeOpacity={AppConstants.buttonActiveOpacity} onPress={onClose} style={styles.closeButton}>
            <Image
              source={imagePath.cross}
              style={{ width: 20, height: 20, tintColor: "#000" }}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>{children}</View>

        {/* Actions (optional) */}
        {childrenAction && <View style={styles.actions}>{childrenAction}</View>}
      </View>
    </Modal>
  );
};

export default ModalPopup;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    left: 12,
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.appThemeColor,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
