import { Dimensions, StyleSheet } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";
import colors from "../../../res/colors";
import fonts from "../../../res/fonts";
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  scrollContentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    //paddingTop: 50,
  },
  textStyle: {
    color: colors.black,
    fontSize: 25,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  iconText: {
    fontSize: 28,
  },
  headerImageContainer: {
    width: Dimensions.get("window").width,
    height: verticalScale(300),
    backgroundColor: colors.white,
  },
  titleView: { width: "100%", alignItems: "flex-start" },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  footer: {
    fontSize: 14,
    color: "#555",
    fontFamily: fonts.regular,
  },
  text: {
    marginTop: 36,
    color: "#555",
    fontSize: 14,
    lineHeight: 16,
    fontFamily: fonts.regular,
  },
  link: {
    color: colors.appThemeColor,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 16,
    //textDecorationLine: "underline",
    //fontFamily: fonts.regular,//creating issue in ios
  },
  bold: {
    fontWeight: "bold",
  },
  registerTextStyle: {
    fontSize: 20,
    fontFamily: fonts.medium,
    lineHeight: 30,
    marginTop: 16,
  },
  notRegistercontainer: {
    borderColor: colors.appThemeColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 20,
  },
  notRegisterText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
    color: "#636363",
  },
  highlight: {
    color: colors.appThemeColor,
    fontSize: 15,
    letterSpacing: 0.43,
    fontFamily: fonts.bold,
  },
  authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: "stretch",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E9F0F2", // light background
    borderRadius: 10,
    padding: 4,
    marginTop: 15,
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    //fontWeight: "600",
  },
  activeText: {
    color: colors.appThemeColor, // teal or blue shade for active
  },
  inactiveText: {
    color: "#0000008A",
  },
  question: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CFCFCF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "48%",
  },
  activeOption: {
    borderColor: "#2F80ED",
    backgroundColor: "#EEF4FF",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2F80ED",
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    // fontWeight: "600",
    color: "#000",
  },
  wrapper: {
    marginTop: 16,
    //  marginBottom: 20,
  },
  label: {
    color: colors.blackopacity87,
    fontSize: 13,
    fontFamily: fonts.regular,
    // marginBottom: 6,
  },
  inputContainer: {
    // flexDirection: "row",
    // alignItems: "center",
    // borderWidth: 1,
    // borderColor: "#D0D0D0",
    // borderRadius: 10,
    // paddingHorizontal: 12,
    // height: 48,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    borderRadius: 6,
    height: 44,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#9DA3AE",
    backgroundColor: "white",
  },
  input: {
    // flex: 1,
    // fontSize: 14,
    // fontFamily: fonts.regular,
    // color: "#000",
    width: "85%",
    paddingLeft: 15,
    fontSize: 14,
    // alignItems: "center",
    fontFamily: fonts.regular,
  },
  verifyText: {
    fontSize: 13,
    color: "#3BB2B8", // teal color
    fontFamily: fonts.regular,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    maxHeight: "85%",
  },
});

export default styles;
