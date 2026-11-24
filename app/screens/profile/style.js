import { Dimensions, StyleSheet } from "react-native";
import colors from "../../res/colors";
import fonts from "../../res/fonts";

const styles = StyleSheet.create({
  changePasswordTxtStyle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.subHeaderTextColor,
  },
  uploadNewPhotoTextStyle: {
    marginBottom: 10,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.appThemeColor,
  },
  uploadGuidlinesTxtStyle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.guidelinesTextColor,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 32,
    marginBottom: 8,
    width: "100%",
  },
  bulletItem: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 20,
    fontWeight: "400",
    fontFamily: fonts.Black,
    lineHeight: 24,
    marginRight: 8,
    color: "#333",
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    fontFamily: fonts.regular,
    color: "#333",
    lineHeight: 22,
  },
  iconStyle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.appThemeColor,
  },
  shimmerInput: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    marginBottom: 20,
  },
  shimmerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 30,
  },
  shimmerTitle: {
    width: "60%",
    marginLeft: 10,
    height: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  shimmersubTitle: {
    width: "100%",
    height: 25,
    marginLeft: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  shimmerHeading: {
    width: 150,
    height: 30,
    borderRadius: 6,
    marginBottom: 30,
  },
  shimmerRule: {
    width: 150,
    height: 30,
    borderRadius: 6,
    marginBottom: 30,
  },
  shimmerPasswordRule: {
    width: "95%",
    height: 70,
    borderRadius: 4,
  },
  fallbackImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.appThemeColor,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 20,
  },
});

export default styles;
