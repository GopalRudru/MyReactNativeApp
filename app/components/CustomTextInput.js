import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";
import fonts from "../res/fonts";

const CustomTextInput = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={{ marginTop: props.topMargin ?? 16 }}>
      <Text style={styles.headingView}>{props.heading}</Text>

      <View
        style={[
          styles.textInputView,
          {
            borderColor: props.errorText
              ? "red"
              : isFocused
              ? colors.appThemeColor
              : "#9DA3AE",
          }, // Dynamic border
        ]}
      >
        <TextInput
          textContentType="none"
          style={[
            styles.input,
            {
              color: props.color ? props.color : colors.blackopacity87,
            },
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            // Scroll to the input when focused
            if (props.scrollRef?.current && e.target) {
              props.scrollRef.current.scrollToFocusedInput(e.target, 50);
            }
          }}
          value={props?.value}
          editable={props.editable}
          placeholder={props.placeholder}
          maxLength={props.maxLength ?? undefined}
          keyboardType={props.keyboardType}
          onChangeText={props.onChangeText}
          secureTextEntry={props.secureTextEntry || false}
          // onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.placeHolderColor}
        />

        {props.isPassword && (
          <TouchableOpacity
            style={styles.eyeView}
            onPress={() => props.handleEyePress(props.secureTextEntry)}
          >
            <Image
              source={
                props.secureTextEntry ? imagePath.eyeInvisible : imagePath.eye
              }
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      {props.errorText ? (
        <Text style={styles.errorText}>{props.errorText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingLeft: 15,
    fontSize: 14,
    alignItems: "center",
    fontFamily: fonts.regular,
  },
  headingView: {
    color: colors.blackopacity87,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  textInputView: {
    flexDirection: "row",
    marginTop: 7,
    borderRadius: 6,
    height: 44,
    fontSize: 14,
    borderWidth: 1,
    backgroundColor: "white",
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#555",
  },
  eyeView: {
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomTextInput;
