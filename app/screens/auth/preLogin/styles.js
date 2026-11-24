import { StyleSheet,Dimensions, useWindowDimensions } from "react-native";
import colors from "../../../res/colors";
import fonts from "../../../res/fonts";

const { width, height } = Dimensions.get("window");
// const { width: screenWidth, height: screenHeight } = useWindowDimensions();
// const isSmallWidth = screenWidth < 400;
const isSmallHeight = height < 840;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#C9ECEE",
  },
  container: {
    flexGrow: 1,
    //justifyContent: 'space-between',
  },
  topSection: {
    alignItems: "center",
    // gap: 16,
    marginTop: 20,
  },
  heading: {
    fontSize: isSmallHeight ? 24 : 28,
    fontFamily: fonts.bold,
    fontStyle: "bold",
    marginTop: isSmallHeight ? 16 : 20,
    color: "#1F2233",
  },
  subHeading: {
    fontSize: isSmallHeight ? 12 : 16,
    fontFamily: fonts.regular,
    fontWeight: 400,
    marginTop: isSmallHeight ? 2 : 8,
    marginBottom: isSmallHeight ? 16 : 30,
    color: "rgb(46,99,109)",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: isSmallHeight ? 12 : 16,
    columnGap: 12,
  },
  featureItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 8,
  },
  featureText: {
    fontSize: isSmallHeight ? 12 : 14,
    fontFamily: fonts.medium,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: 0.3,
    color: "#1F2233",
    flex: 1,
    marginLeft: 5,
  },
  iconStyle: {
    width: 36,
    height: 36,
  },
  imageStyle: {
    height: 210,
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: 25,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: isSmallHeight ? 210 :220,
    resizeMode: "cover",
  },
});

export default styles;
