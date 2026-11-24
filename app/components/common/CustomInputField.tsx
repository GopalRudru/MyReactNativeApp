import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import fonts from "../../res/fonts";
import colors from "../../res/colors";

interface InputFieldProps {
  label?: string;
  error?: boolean;
  errorText?: string;
  placeholder?: string;
  value: string;
  onChange: (text: string) => void;
  onBlur?: () => void;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  scrollRef?: React.RefObject<any> | null;
  autoComplete?: TextInputProps["autoComplete"];
  autoCorrect?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  optional?: boolean;
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
  secureTextEntry?: boolean;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: () => void;
  testID?: string;
}

const CustomInputField: React.FC<InputFieldProps> = ({
  label = "",
  error,
  errorText,
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
  maxLength,
  containerStyle,
  secureTextEntry,
  returnKeyType,
  onSubmitEditing,
  testID,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={[styles.label, error && styles.errorLabel]}>
          {label} {optional ? null : <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <TextInput
        ref={inputRef}
        testID={testID}
        accessibilityLabel={label}
        style={[
          styles.input,
          !editable && styles.disabledInput,
          error && styles.errorInput,
          isFocused && !error && styles.focusedInput,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#a5a3ae"
        value={value}
        onChangeText={onChange}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => {
          setIsFocused(true);
          // Use our own ref instead of the synthetic event's target —
          // more reliable across platforms for scroll-into-view libs.
          if (scrollRef?.current && inputRef.current) {
            scrollRef.current.scrollToFocusedInput(inputRef.current, 150);
          }
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
      />
      {!!errorText && (
        <Text style={[styles.helperText, !error && styles.helperTextMuted]}>
          {errorText}
        </Text>
      )}
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
    color: colors.subHeaderTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: "center",
    backgroundColor: colors.white,
  },
  errorInput: {
    borderColor: "red",
  },
  disabledInput: {
    backgroundColor: "#fcfcfc",
    borderColor: "#ccc",
    opacity: 0.7,
  },
  focusedInput: {
    borderColor: colors.appThemeColor,
  },
  helperText: {
    color: "red",
    fontSize: 12,
    marginTop: 1,
  },
  helperTextMuted: {
    color: "#8a8a8a",
  },
});

export default React.memo(CustomInputField);
