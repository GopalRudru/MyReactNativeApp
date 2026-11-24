import { StyleSheet } from "react-native";
import colors from "../../res/colors";
import fonts from "../../res/fonts";

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  accordionContainer: {
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  accordionHeader: {
    flexDirection: "row",
    //justifyContent: 'space-between',
    paddingLeft: 16,
    paddingVertical: 24,
    backgroundColor: colors.white,
  },
  accordionTitle: {
    fontSize: 16,
    color: colors.appThemeColor,
    fontFamily: fonts.bold,
  },
  accordionContent: {
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginTop: 30,
    marginBottom: 10,
    color: colors.appThemeColor,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
  },
  label: {
    fontSize: 10,
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  value: {
    fontSize: 10,
    color: colors.textValueColor,
    marginTop: 10,
    lineHeight: 14,
    fontFamily: fonts.medium,
    paddingBottom: 16,
  },
  expandIcon: {
    width: 16,
    height: 16,
    alignSelf: "center",
    tintColor: colors.appThemeColor,
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxSmall: {
    //width: screenWidth * 0.28,
    width: "32%",
    height: 40,
    borderRadius: 8,
  },
  footer: {
    alignSelf: "flex-end",
    width: 160,
    height: 40,
    marginTop: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: "85%",
  },
  headerIndicator: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#333333",
    // textAlign: "center",
    marginBottom: 16,
  },
  bulletList: {
    gap: 2,
  },
  bullet: {
    fontSize: 9,
    color: colors.subHeaderTextColor,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: "#00B3AD",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    // marginBottom: 4,
  },
  bulletDot: {
    fontSize: 22, // bigger than normal
    lineHeight: 24,
    color: "black",
    // color: "#00B3B5", // teal (can change as needed)
    marginRight: 8,
    //marginTop: -2, // aligns nicely with text
  },
  bulletText: {
    // flex: 1,
    fontSize: 10,
    color: colors.subHeaderTextColor,
    lineHeight: 22,
    marginRight: 16,
  },
  header: {
    fontSize: 14,
    color: "#168794",
    fontFamily: fonts.bold,
    // marginTop: 16,
    // marginLeft: 16,
  },
});

export default styles;
