// components/AvatarMenu.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from "react-native";
import strings from "../../res/strings";
import fonts from "../../res/fonts";
import colors from "../../res/colors";
import imagePath from "../../constant/imagePath";
//import Icon from 'react-native-vector-icons/Feather';

interface AvatarMenuProps {
  onProfilePress: () => void;
  onLogoutPress: () => void;
  onRequestClose: () => void;
  visible: boolean;
}

const AvatarMenu: React.FC<AvatarMenuProps> = ({
  onProfilePress,
  onLogoutPress,
  onRequestClose,
  visible,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={onProfilePress}>
            {/* <Icon name="user" size={20} style={styles.icon} /> */}
            <Image
              source={imagePath.userIcon}
              style={{
                marginRight: 8,
                height: 20,
                width: 20,
                resizeMode: "contain",
                tintColor: colors.avatarItemTextColor,
              }}
            />
            <Text style={styles.label}>{strings.profile}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onLogoutPress}>
            {/* <Icon name="power" size={20} style={styles.icon} /> */}
            <Image
              source={imagePath.logout}
              style={{
                marginRight: 8,
                height: 18,
                width: 18,
                tintColor: colors.avatarItemTextColor,
                resizeMode: "contain",
              }}
            />
            <Text style={styles.label}>{strings.logOut}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default AvatarMenu;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 106 : 50,
    right: 16,
    zIndex: 999,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.regular,
    fontWeight: "400",
    color: colors.avatarItemTextColor,
  },
});
