import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";

const BackgroundImages = (props) => {
  return (
    <View style={styles.imagesContainer}>
      <View style={[styles.logoView, { width: "100%" }]}>
        <Image source={imagePath.logo} style={styles.logo} />
      </View>
      <View style={{ width: "100%" }}>
        <Image source={imagePath.avansePreLogin} style={styles.loginImage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imagesContainer: {
    alignItems: "center",
    backgroundColor: colors.white,
  },
  logo: { height: 50, resizeMode: "center" },
  loginImage: {
    resizeMode: "contain",
    width: "100%",
  },
  logoView: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  backImage: {
    height: 20,
    width: 20,
    resizeMode: "contain",
    tintColor: colors.colorTextBlue,
  },
});

export default BackgroundImages;
