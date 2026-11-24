import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../res/colors";
import fonts from "../res/fonts";
import AppConstants from "../constant/AppConstants";

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  selected: string;
  isColumnNeeded: Boolean;
  onSelect: (value: string) => void;
}

const RadioButtonGroup = ({
  options,
  isColumnNeeded,
  selected,
  onSelect,
}: Props) => {
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: isColumnNeeded ? "column" : "row",
          gap: isColumnNeeded ? 18 : 24,
        },
      ]}
    >
      {options.map((option) => {
        return (
          <TouchableOpacity
            key={option.uuid}
            style={styles.option}
            activeOpacity={AppConstants.textActiveOpacity}
            onPress={() => onSelect(option.uuid)}
          >
            <View
              style={[
                styles.circle,
                selected === option.uuid && styles.activeCircle,
              ]}
            >
              {selected === option.uuid && <View style={styles.innerCircle} />}
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: isColumnNeeded
                    ? colors.paymentTextColor
                    : colors.textValueColor,
                  fontFamily: isColumnNeeded ? fonts.regular : fonts.bold,
                },
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
    //color: "green",
    color: colors.textValueColor,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});

export default RadioButtonGroup;
