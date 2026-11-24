import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../res/colors';
import fonts from '../res/fonts';
import AppConstants from '../constant/AppConstants';

interface ButtonBorderProps {
    title: string;
    onPress: () => void;
    marginTop?: number;
    marginHorizontal?: number;
}

const ButtonBorder = ({ title, onPress, marginTop = 20, marginHorizontal = 0 }: ButtonBorderProps) => {
  return (
    <TouchableOpacity
      activeOpacity={AppConstants.buttonActiveOpacity}
      style={[
        styles.buttonContainer,
        { marginTop: marginTop, marginHorizontal: marginHorizontal },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

export default ButtonBorder

const styles = StyleSheet.create({
    buttonContainer: {
        borderWidth: 1,
        borderColor: colors.appThemeColor,
        backgroundColor: 'transparent',
        paddingVertical: 12,
        borderRadius: 6,
    },
    textStyle: {
        color: colors.appThemeColor,
        fontSize: 15,
        fontFamily: fonts.bold,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
})