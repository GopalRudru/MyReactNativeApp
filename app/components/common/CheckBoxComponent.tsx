import React, { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import fonts from "../../res/fonts";
import colors from "../../res/colors";

interface CheckBoxComponentProps {
  label: string;
  onValueChange?: (value: boolean) => void;
  errorText?: string;
  error?: boolean;
}

const CheckBoxComponent: React.FC<CheckBoxComponentProps> = ({
  label,
  onValueChange,
  errorText,
  error,
}) => {
  const [checked, setChecked] = useState(false);

  const onPress = () => {
    Keyboard.dismiss();
    const value = !checked;
    setChecked(value);
    onValueChange?.(value);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.container} onPress={onPress}>
        <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
          {checked && <Text style={styles.checkMark}>✓</Text>}
        </View>

        <Text style={styles.label}>{label}</Text>
      </Pressable>

      {!!errorText && (
        <Text style={[styles.helperText, !error && styles.helperTextMuted]}>
          {errorText}
        </Text>
      )}
    </View>
  );
};

export default CheckBoxComponent;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "column",
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.appThemeColor,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginTop: 5,
  },
  checkedCheckbox: {
    backgroundColor: colors.appThemeColor,
  },
  checkMark: {
    color: "#FFF",
    fontWeight: "bold",
  },
  label: {
    flex: 1,
    flexWrap: "wrap",
    marginLeft: 10,
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  helperText: {
    color: "red",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 32,
  },
  helperTextMuted: {
    color: "#8a8a8a",
  },
});
