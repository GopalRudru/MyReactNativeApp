import React from "react";
import { TouchableOpacity, Image, StyleSheet, Platform, ViewStyle } from "react-native";
import imagePath from "../../constant/imagePath";

const CustomBackButton = ({ onPress, style }: { onPress: () => void; style?: ViewStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <Image source={imagePath.blackBack} style={styles.backImage} />
    </TouchableOpacity>
  );
};

export default CustomBackButton;

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "ios" ? 0 : 16, // Adjust margin for iOS and Android
    // marginBottom: 36,
    height: 36,
    width: 36,
    justifyContent: "center",
  },
  backImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});
