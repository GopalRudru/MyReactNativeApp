import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import colors from "../res/colors";
import mainStyle from "../res/mainStyles";
import { moderateScale, scale } from "react-native-size-matters";

const TextLeftDrawableComponent = ({ image, text, press = () => {} }) => {
  return (
    <View>
      <TouchableOpacity activeOpacity={0.6} onPress={press}>
        <View style={[mainStyle.horizontalView, {alignContent:'center', alignItems:'center'}]}>
          <Image
            source={image}
            style={[styles.backArrowStyle, { tintColor: colors.colorTextBlue }]}
          />

          <Text style={styles.backTextStyle}>{text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TextLeftDrawableComponent;

const styles = StyleSheet.create({
  backArrowStyle: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  backTextStyle: {
    fontSize: moderateScale(17),
    color: colors.colorTextBlue,
    fontWeight:'700',
    fontStyle:"normal",
    marginStart:scale(10),
  },
});
