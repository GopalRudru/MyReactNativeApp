import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AppConstants from "../../constant/AppConstants";
import fonts from "../../res/fonts";
import colors from "../../res/colors";

interface UniversityOption {
  value: string | number;
  label?: string;
}

interface SearchSelectOptionsProps {
  options: UniversityOption[];
  label?: string;
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  isMandatory?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  setIsFormSaved?: (val: boolean) => void;
  isChangeUniversity?: boolean;
  handleChangeUniversity?: (val: boolean) => void;
  changeUniversityValue?: boolean;
  width: any;
  searchEnabled?: boolean;
  isChangeUniversityClickable?: boolean;
  isLienTranchNonEditable?: boolean;
}

const SearchSelectOptions: React.FC<SearchSelectOptionsProps> = ({
  options,
  label,
  value,
  onChange,
  isMandatory = false,
  disabled = false,
  helperText,
  error = false,
  setIsFormSaved,
  isChangeUniversity = false,
  handleChangeUniversity,
  changeUniversityValue = false,
  width,
  searchEnabled = true,
  isChangeUniversityClickable = true,
  isLienTranchNonEditable= false,
  style = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Label and Change University */}
      <View style={styles.labelContainer}>
        {label && (
          <Text
            style={[
              styles.label,
              //error && { color: "red" }
            ]}
          >
            {label} {isMandatory && <Text style={{ color: "red" }}>*</Text>}
          </Text>
        )}

        {isChangeUniversity && (
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={AppConstants.buttonActiveOpacity}
            onPress={() => {
              if (isLienTranchNonEditable) return;
              if (!isChangeUniversityClickable) return;
              handleChangeUniversity && handleChangeUniversity(!changeUniversityValue);
            }}
          >
            <Text style={[styles.label, { color: colors.orangeColor }]}>
              {" Change University"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Picker */}
      <Dropdown
        data={options}
        value={
          value === null || value === undefined || value === "" ? null : value
        }
        onChange={(item) => {
          setTimeout(() => {
            setIsFormSaved?.(true);
            onChange(item.value);
          }, 50);
        }}
        search={searchEnabled}
        searchPlaceholder="Search"
        labelField="label"
        valueField="value"
        placeholder={getUniversityNameById(value, options)}
        style={[
          styles.dropdown,
          error && { borderColor: "red" },
          disabled && { backgroundColor: colors.white },
          { width: width > 0 ? width : "100%" },
        ]}
        placeholderStyle={styles.dropDownTextStyle}
        selectedTextStyle={styles.dropDownTextStyle}
        disable={disabled}
      />

      {/* Helper Text */}
      {!!helperText && (
        <Text style={[styles.helperText, error && { color: "red" }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const getUniversityNameById = (
  id: string | number | null | undefined,
  options: { value: string | number; label?: string }[]
): string => {
  if (id === null || id === undefined || id === "") return "";
  const match = options.find((data) => data.value === id);
  return match?.label ?? "";
};

export default SearchSelectOptions;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  label: {
    marginTop: 0,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
  },
  changeUniversity: {
    fontSize: 11,
    color: "#FF9F43",
    fontWeight: "500",
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
  helperText: {
    fontSize: 12,
    marginTop: 4,
    color: "#999",
  },
});
