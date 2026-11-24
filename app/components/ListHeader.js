import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, Image } from "react-native";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";
import { moderateVerticalScale, scale } from "react-native-size-matters";
import fonts from "../res/fonts";
import AppConstants from "../constant/AppConstants";
// import {IMAGE_CONTANT_RES} from '../utils/constant/ImageConstant';

const ListHeader = (props) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{props.rightText}</Text>
      {props.leftText && (
        <TouchableOpacity
          onPress={props.onLeftTextPress}
          activeOpacity={AppConstants.textActiveOpacity}
        >
          <Text style={styles.viewAll}>{props.leftText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 8,
  },
  title: {
    //fontWeight: "600",
    fontSize: 13,
    color: "#168794",
    fontFamily:fonts.bold
  },
  viewAll: {
    fontSize: 13,
    color: "#168794",
    //fontWeight: "600",
    fontFamily:fonts.bold
  },
});

export default ListHeader;
