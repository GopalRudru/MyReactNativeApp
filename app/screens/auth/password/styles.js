import { Dimensions, StyleSheet } from "react-native";
import {
  moderateScale,
  moderateVerticalScale,
  verticalScale,
} from "react-native-size-matters";
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
  iconText: {
    fontSize: 28,
  },
  headerImageContainer: {
    width: Dimensions.get("window").width,
    height: verticalScale(300),
    //backgroundColor: colors.appThemeColor,
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
  footer: {
    fontSize: 14,
    color: "#555",
  },
  text: {
    marginTop: 15,
    color: "#555",
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    //color: "#45c3cc",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  bold: {
    fontWeight: "bold",
  },
  changeCIF: {
    fontSize: 14,
    color: colors.appThemeColor,
    //fontWeight: 'bold',
    fontFamily:fonts.medium,
    textAlign: "center",
     alignSelf: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
    authImageStyle: {
    width: width,
    alignSelf: "center",
    resizeMode: 'stretch',
  },
});

export default styles;
