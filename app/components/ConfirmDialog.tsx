import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";
import AppConstants from "../constant/AppConstants";

// Define allowed dialog types for better type safety
type DialogType = "success" | "Error" | "warning" | "No access" | "info";

interface ConfirmDialogProps {
  type: DialogType;
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
  onDisagree: () => void;
  inputField: (value: string) => void;
  fieldValue: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  type,
  title,
  content,
  open,
  onClose,
  onAgree,
  onDisagree,
  inputField,
  fieldValue,
}) => {
  const [localValue, setLocalValue] = useState("");

  // Sync localValue with fieldValue when dialog opens
  useEffect(() => {
    if (open) {
      setLocalValue(fieldValue || "");
    }
  }, [open, fieldValue]);

  // Memoize the change handler to prevent unnecessary re-renders
  const handleChange = useCallback((value: string) => {
    setLocalValue(value);
    inputField(value);
  }, [inputField]);

  // Memoize icon selection to prevent repeated switch execution
  const selectedIcon = useMemo(() => {
    switch (type) {
      case "success":
        return imagePath.successImage;
      case "Error":
        return imagePath.errorImage;
      case "warning":
        return imagePath.warningImage;
      case "No access":
        return imagePath.lockImage;
      default:
        return imagePath.infoImage;
    }
  }, [type]);

  // Memoize disabled state to prevent repeated calculations
  const isDisabled = useMemo(() => {
    return !fieldValue || fieldValue.length < 1;
  }, [fieldValue]);

  // Memoize button style to prevent array recreation on each render
  const agreeButtonStyle = useMemo(() => [
    styles.primaryButton,
    isDisabled && styles.disabledButton,
  ], [isDisabled]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={open}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={Platform.OS === "ios"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.dialogContainer}>
                <View style={styles.header}>
                  <Image source={selectedIcon} style={styles.icon} />
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>×</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.content}>{content}</Text>

                <TextInput
                  style={styles.textarea}
                  multiline
                  numberOfLines={3}
                  placeholder="Please enter remarks"
                  onChangeText={handleChange}
                  value={localValue}
                  keyboardType="default"
                  maxLength={500} // Add character limit for better UX
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    style={agreeButtonStyle}
                    onPress={onAgree}
                    disabled={isDisabled}
                  >
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    style={styles.primaryButton}
                    onPress={onDisagree}
                  >
                    <Text style={styles.buttonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    paddingHorizontal: 10,
  },
  closeText: {
    fontSize: 22,
    color: "#999",
  },
  content: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  textarea: {
    height: 80,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.appThemeColor,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default React.memo(ConfirmDialog);
