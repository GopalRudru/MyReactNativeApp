import React from "react";
import { View, Text, StyleSheet } from "react-native";
import fonts from "../../res/fonts";
import strings from "../../res/strings";

const CopyrightComponent = ({
  text = strings.copyRightsText,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    justifyContent: "flex-end",
  },
  text: {
    textAlign: "center",
    color: "#666666",
    marginTop: 30,
    marginBottom: 5,
    marginHorizontal: 16,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
});

export default CopyrightComponent;
