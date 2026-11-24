import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  Image,
  Keyboard,
} from "react-native";
import fonts from "../res/fonts";
import colors from "../res/colors";
import imagePath from "../constant/imagePath";
import AppConstants from "../constant/AppConstants";

interface DropdownOption {
  value: string | number;
  label?: string;
}

interface CustomSearchDropdownProps {
  options: DropdownOption[];
  label?: string;
  title?: string;
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  isMandatory?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  placeholder?: string;
  // Change University functionality
  isChangeUniversity?: boolean;
  handleChangeUniversity?: (val: boolean) => void;
  changeUniversityValue?: boolean;
  // Single line text control
  singleLine?: boolean;
  isLienTranchNonEditable?: boolean;
  marginTop?: number;
}

const CustomSearchDropdown: React.FC<CustomSearchDropdownProps> = ({
  options,
  label,
  title,
  value,
  onChange,
  isMandatory = false,
  disabled = false,
  helperText,
  error = false,
  placeholder = "Select an option",
  // Change University functionality
  isChangeUniversity = false,
  handleChangeUniversity,
  changeUniversityValue = false,
  // Single line text control
  singleLine = false,
  isLienTranchNonEditable = false,
  marginTop = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const filteredOptions = options.filter((option) =>
    option.label?.toLowerCase().includes(searchText.toLowerCase())
  );

  const selectedLabel =
    options.find((option) => option.value === value)?.label || placeholder;

  const handleSelect = (selectedValue: string | number) => {
    // Clear focus from TextInput
    searchInputRef.current?.blur();
    
    // Dismiss keyboard
    Keyboard.dismiss();
    
    // Handle selection after a small delay to ensure focus/keyboard operations complete
    setTimeout(() => {
      onChange(selectedValue);
      setIsVisible(false);
      setSearchText("");
    }, 150);
  };

  return (
    <View style={[styles.container, {marginTop: marginTop > 0 ? marginTop : 24}]}>
      {/* Label and Change University */}
      <View style={styles.labelContainer}>
        {label && (
          <Text style={[styles.label /*error && { color: "red" }*/]}>
            {label} {isMandatory && <Text style={{ color: "red" }}>*</Text>}
          </Text>
        )}

        {isChangeUniversity && (
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={AppConstants.buttonActiveOpacity}
            onPress={() => {
              if (!isLienTranchNonEditable) {
                handleChangeUniversity &&
                  handleChangeUniversity(!changeUniversityValue);
              }
            }}
          >
            <Text style={[styles.label, { color: colors.orangeColor }]}>
              {" Change University"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.dropdown,
          error && { borderColor: "red" },
          disabled && { backgroundColor: "#fff" },
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
          singleLine && {
            height: 48, // Fixed height to prevent expansion
            minHeight: 48,
          },
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
        activeOpacity={AppConstants.textActiveOpacity}
      >
        <Text
          style={[
            styles.dropdownText,
            value ? {} : { color: "#999" },
            singleLine && {
              flexShrink: 1,
              overflow: "hidden",
            },
          ]}
          numberOfLines={singleLine ? 1 : undefined}
          ellipsizeMode={singleLine ? "tail" : undefined}
        >
          {selectedLabel}
        </Text>
        <View style={{ marginLeft: 8, flexShrink: 0 }}>
          <Image
            source={imagePath.downArrow}
            style={{ width: 18, height: 18, tintColor: "#999" }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      {helperText && (
        <Text style={[styles.helperText, error && { color: "red" }]}>
          {helperText}
        </Text>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            searchInputRef.current?.blur();
            Keyboard.dismiss();
            setTimeout(() => setIsVisible(false), 100);
          }}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>
                {title || "Please Select Option"}
              </Text>

              <TextInput
                ref={searchInputRef}
                style={[
                  styles.searchInput,
                  {
                    borderColor: isSearchFocused
                      ? colors.appThemeColor
                      : "#9DA3AE",
                  },
                ]}
                placeholder="Search"
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                autoFocus
              />

              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value.toString()}
                style={styles.optionsList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      item.value === value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      handleSelect(item.value);
                    }}
                    activeOpacity={AppConstants.textActiveOpacity}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
                activeOpacity={AppConstants.buttonActiveOpacity}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

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
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.guidelinesTextColor,
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 1,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.blackOpacity05,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6.84,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'rgb(14, 14, 14)',
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#9DA3AE",
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    fontFamily: fonts.regular,
    marginBottom: 16,
    backgroundColor: "#fff",
    height: 44,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: 'rgb(235, 235, 235)',
  },
  optionText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: 'rgb(14, 14, 14)',
  },
  selectedOptionText: {
    color: colors.paymentTextColor,
    fontFamily: fonts.medium,
  },
  closeButton: {
    backgroundColor: colors.appThemeColor,
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: fonts.medium,
  },
});

export default CustomSearchDropdown;
