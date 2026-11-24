import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import { AstricString } from "../../utils/helpers";

interface Option {
  value: string | number;
  label: string | number;
}

interface SelectOptionsProps {
  options: Option[];
  label?: string;
  disabled?: boolean;
  value?: string | number;
  isMandatory: boolean;
  onChange: (value: string | number) => void;
  helperText?: string;
  error?: boolean;
}

const SelectOptions: React.FC<SelectOptionsProps> = ({
  options,
  label,
  disabled = false,
  value,
  isMandatory = false,
  onChange,
  helperText,
  error = false,
}) => {
  
  const renderValue = () => {
    if (value === undefined || value === null || value === "" || String(value) === "0") {
      return "";
    }
    error = false; // Reset error if value is valid
    helperText = ""; // Reset helper text if value is valid
    return value;
  }

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && <AstricString label={label} style={styles.label} />}

      {/* Dropdown */}
      <Dropdown
        data={options}
        labelField="label"
        valueField="value"
        value={renderValue()}
        onChange={(item) => onChange(item.value)}
        disable={disabled}
        placeholder=""
        style={[
          styles.dropdown,
          error ? styles.errorBorder : {},
          disabled && styles.disabled,
        ]}
        placeholderStyle={styles.dropDownTextStyle}
        selectedTextStyle={styles.dropDownTextStyle}
      />

      {/* Helper Text */}
      {helperText ? (
        <Text style={[styles.error]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  dropDownTextStyle: {
    color: colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  errorBorder: {
    borderColor: "red",
  },
  disabled: {
    backgroundColor: colors.white,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default SelectOptions;
