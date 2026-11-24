import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";
import { AstricString } from "../../utils/helpers";
import fonts from "../../res/fonts";
import colors from "../../res/colors";

interface BasicDatePickerProps {
  label: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  value: Date | null;
  onChange: (date: Date | null) => void;
  helperText?: string;
  error?: boolean;
  padding?: string;
}

const BasicDatePicker: React.FC<BasicDatePickerProps> = ({
  label,
  minDate,
  maxDate = new Date(),
  value,
  onChange,
  disabled = false,
  helperText,
  error = false,
  padding = "10px 4px",
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    if (!disabled) {
      setDatePickerVisibility(true);
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    onChange(date);
    hideDatePicker();
  };

  const selectedDate = () => {
    const formattedDate = value
    ? dayjs(value).format("DD/MM/YYYY")
    : "DD/MM/YYYY";
    return formattedDate;
  }

  const formattedDate = value
    ? dayjs(value).format("DD/MM/YYYY")
    : "DD/MM/YYYY";

  return (
    <View style={styles.container}>
      {/* Label */}
      <AstricString label={label} style={styles.label} />

      {/* Touchable Input */}
      <TouchableOpacity
        style={[
          styles.input,
          error && styles.inputError,
          disabled && styles.disabled,
        ]}
        onPress={showDatePicker}
        activeOpacity={0.8}
      >
        <Text style={[styles.dateText, !value && styles.placeholder]}>
          {selectedDate()}
        </Text>
      </TouchableOpacity>

      {/* Helper Text */}
      { helperText && <Text style={[styles.error]}>{helperText}</Text> }

      {/* Date Picker Modal */}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={value ? dayjs(value).toDate() : new Date()}
        minimumDate={minDate ? dayjs(minDate).toDate() : undefined}
        maximumDate={maxDate ? dayjs(maxDate).toDate() : new Date()}
        display={Platform.OS === "ios" ? "spinner" : "calendar"}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    color: colors.subHeaderTextColor, //colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: "center",
  },
  inputError: {
    borderColor: "red",
  },
  disabled: {
    backgroundColor: colors.white,
  },
  dateText: {
    color: colors.guidelinesTextColor, //colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: "center",
  },
  placeholder: {
    color: colors.guidelinesTextColor, //colors.guidelinesTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
    textAlignVertical: "center",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default BasicDatePicker;
