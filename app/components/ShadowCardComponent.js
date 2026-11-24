import { StyleSheet, View } from "react-native";
import colors from "../res/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const ShadowCardComponent = ({
  children,
  paddingHorizonatal,
  paddingVertical,
  marginVertical,
  marginHorizontal,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          paddingHorizontal: paddingHorizonatal || scale(20),
          paddingVertical: paddingVertical || verticalScale(64),
          marginVertical: marginVertical || verticalScale(16),
          marginHorizontal: marginHorizontal || scale(24),
        },
      ]}
    >
      {children}
    </View>
  );
};

export default ShadowCardComponent;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.shadowCardBackground,
    borderRadius: moderateScale(6),
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(6),
    elevation: moderateScale(4),
  },
});
