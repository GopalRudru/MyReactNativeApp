import React, { RefObject, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
} from "react-native";
import fonts from "../../res/fonts";
import colors from "../../res/colors";

interface InputFieldProps {
  label: string;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  onBlur?: () => void;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  scrollRef?: RefObject<any> | null;
  autoComplete?: TextInputProps["autoComplete"];
  autoCorrect?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  optional?: boolean;
  bankDetails?: boolean;
  lienDetails?: boolean;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  placeholder,
  value,
  onChange,
  onBlur,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  scrollRef,
  autoComplete,
  autoCorrect,
  autoCapitalize,
  optional,
  bankDetails,
  lienDetails,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [bankFocused, setBankFocused] = useState(true);
  const [lienFocused, setLienFocused] = useState(true);

  const handleTextEntry = () => {
    if (bankDetails) {
      return bankFocused ? true : false;
    } else if (lienDetails) {
      return lienFocused ? true : false;
    }
  };

  const maskedValue =
    handleTextEntry() && !isFocused ? "*".repeat(value?.length) : value;

  return (
    <View style={styles.container}>
      <Text style={[styles.label /*, error && styles.errorLabel*/]}>
        {label} {optional ? null : <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          !editable && styles.disabledInput,
          error && styles.errorInput,
          isFocused && !error && styles.focusedInput,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#a5a3ae"
        value={maskedValue}
        onChangeText={(text) => {
          if (handleTextEntry()) {
            // Handle masking properly
            if (text.length < value.length) {
              onChange(value.slice(0, -1)); // handle backspace
            } else {
              onChange(value + text.replace(/\*/g, "")); // append new char
            }
          } else {
            onChange(text);
          }
        }}
        maxLength={maxLength ? maxLength : undefined}
        // secureTextEntry={handleTextEntry()}
        onFocus={(e) => {
          setIsFocused(true);
          if (bankDetails) {
            setBankFocused(false);
          }
          if (lienDetails) {
            setLienFocused(false);
          }
          // Scroll to the input when focused
          if (scrollRef?.current && e.target) {
            scrollRef.current.scrollToFocusedInput(e.target, 150);
          }
        }}
        onBlur={(e) => {
          if (bankDetails) {
            setBankFocused(true);
          }
          if (lienDetails) {
            setLienFocused(true);
          }
          setIsFocused(false);
          if (onBlur) {
            onBlur();
          }
        }}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
      />
      {!!helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  label: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
  },
  errorLabel: {
    color: "red",
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    color: colors.subHeaderTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: "center",
  },
  errorInput: {
    borderColor: "red",
  },
  disabledInput: {
    backgroundColor: colors.white,
  },
  focusedInput: {
    borderColor: colors.appThemeColor,
  },
  helperText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputField;
