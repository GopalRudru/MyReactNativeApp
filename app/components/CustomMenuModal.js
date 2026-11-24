import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import colors from "../res/colors";
import fonts from "../res/fonts";

const CustomMenuModal = ({ visible, onClose, onSelect, menuItems }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuCard}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  onSelect(item.route);
                }}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.blackOpacity05,
    paddingTop: Platform.OS === "ios" ? 120 : 60,
  },
  menuCard: {
    backgroundColor: "white",
    width: 250,
    borderRadius: 6,
    elevation: 10,
    paddingVertical: 12,
    //marginHorizontal: 16,
    shadowColor: Platform.OS === "ios" ? "#000" : colors.white,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: colors.menuTextColor,
    fontWeight: "400",
    // fontFamily: fonts.Black,
    fontFamily: fonts.regular,
  },
});

export default CustomMenuModal;
