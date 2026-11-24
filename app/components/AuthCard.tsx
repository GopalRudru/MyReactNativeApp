import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import colors from "../res/colors";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface AuthCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

export default AuthCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.shadowCardBackground,
    borderRadius: 20,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginVertical: 0,
    marginHorizontal: 24,
    marginTop: 10,
  },
});
