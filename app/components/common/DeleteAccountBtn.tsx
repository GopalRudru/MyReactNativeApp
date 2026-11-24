import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import imagePath from "../../constant/imagePath";
import fonts from "../../res/fonts";
import AppConstants from "../../constant/AppConstants";
import strings from "../../res/strings";

const DeleteAccountBtn = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      activeOpacity={AppConstants.buttonActiveOpacity}
      onPress={onPress}
    >
      <View style={styles.btnContainer}>
        {/* <Image source={imagePath.deleteAccount} /> */}
        <Text style={styles.btnLable}>{strings.deregister_account}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default DeleteAccountBtn;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    marginTop: 20,
    marginHorizontal: 22,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FF4C51",
  },
  btnLable: {
    fontSize: 15,
    color: "#FF4C51",
    fontWeight: "700",
    fontFamily: fonts.medium,
  },
});
