import { StyleSheet } from "react-native";
import colors from "./colors";
import fonts from "./fonts";

const mainStyle = StyleSheet.create({
  containerView: {
    flex: 1,
    backgroundColor: colors.colorWhite,
  },
  horizontalView: {
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
  },
  heightOnePx: {
    width: "100%",
    height: 1,
    backgroundColor: colors.black,
  },

  //for mpin
  mpinContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  enterMpinTextStyle: {
    fontSize: 16,
    color: colors.mpinTextColor,
    fontFamily: fonts.regular,
    marginTop: 20,
  },

  errorTextStyle: {
      fontSize: 12,
      fontFamily: fonts.regular,
      color: colors.red,
      marginTop: 0,
    },
});

export default mainStyle;
