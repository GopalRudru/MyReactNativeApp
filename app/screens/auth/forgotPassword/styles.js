import { Dimensions, StyleSheet } from "react-native";
import { moderateScale, verticalScale } from "react-native-size-matters";
import colors from "../../../res/colors";
import fonts from "../../../res/fonts";
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
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
  // image: {
  //   //flex: 1,
  //   height: height,
  //   width: width,
  // },
  iconText: {
    fontSize: 28,
  },
  // componentView: { flex: 1 },
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
    //textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    // backgroundColor: 'green',
  },
  button: {
    width: "100%",
    backgroundColor: "#45c3cc",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  bulletItem: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    //marginBottom: 5,
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
    //fontWeight: "400",
    fontFamily: fonts.regular,
    color: "#4d4d4d",
    lineHeight: 22,
  },
  headerImageContainer: {
    width: Dimensions.get("window").width,
    height: verticalScale(300),
    //backgroundColor: colors.appThemeColor,
  },
  authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: "stretch",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 6,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 15,
    marginRight: 8,
    fontFamily: fonts.semiBold,
    color: colors.appThemeColor,
  },
  imageView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowView: {
    height: 11,
    width: 12,
  },
});

export default styles;
