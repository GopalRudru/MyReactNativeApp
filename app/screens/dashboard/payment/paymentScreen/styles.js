import { StyleSheet } from "react-native";
import colors from "../../../../res/colors";
import fonts from "../../../../res/fonts";

const styles = StyleSheet.create({
  header: {
    fontSize: 14,
    color: "#168794",
    fontFamily: fonts.bold,
    // marginTop: 16,
    // marginLeft: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 16,
  },
  detailItem: {
    width: "50%",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 11,
    color: "#a5a3ae",
    fontFamily: fonts.regular,
    lineHeight: 14,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: fonts.bold,
    lineHeight: 14,
    paddingTop: 5,
    color: "#222",
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  dropdownContainer: {
    width: 200,
    borderRadius: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingBottom: 6,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 8,
    marginBottom: 8,
  },
  lanText: {
    color: colors.appThemeColor,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginRight: 6,
  },
  lanContent: {
    width: 170,
  },
  directionJustify: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: colors.appThemeColor,
  },
  rowshimmerstyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxSmall: {
    width: "32%",
    height: 40,
    borderRadius: 8,
  },
  dropdownShimmer: {
    height: 48,
    width: "100%",
    borderRadius: 8,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItemLabel: {
    width: "47%",
    height: 30,
    borderRadius: 8,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 24,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 40,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  radioLabel: {
    width: 100,
    height: 20,
    borderRadius: 6,
  },
  buttonShimmer: {
    width: "100%",
    height: 44,
    borderRadius: 8,
  },
  container: {
    flexDirection: "row",
    gap: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.appThemeColor,
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircle: {
    borderColor: colors.appThemeColor,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.appThemeColor,
  },
  label: {
    marginLeft: 8,
    color: colors.textValueColor,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  containerDropdown: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
  },

  container: {
    padding: 16,
  },
  stepsWrapper: {
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 0,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  stepActive: {
    backgroundColor: "rgba(0, 179, 181, 1)",
  },
  stepCompleted: {
    backgroundColor: "rgba(0, 179, 181, 0.08)",
  },
  stepInactive: {
    backgroundColor: "rgba(75, 70, 92, 0.08)",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textActive: {
    color: "rgba(0, 179, 181, 1)",
  },
  textInactive: {
    color: "rgba(75, 70, 92, 1)",
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 21,
    color: "rgba(75, 70, 92, 1)",
    marginRight: 5,
  },
  arrowIcon: {
    marginHorizontal: 5,
    width: 16,
    height: 16,
    tintColor: "grey",
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
    //marginBottom: 4,
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
    marginRight: 16,
    lineHeight: 22,
    fontFamily: fonts.regular,
    
  },
});

export default styles;
