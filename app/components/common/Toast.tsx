import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../res/colors";
import fonts from "../../res/fonts";

interface ToastProps {
  open: boolean;
  message: string;
  severity: "error" | "warning" | "info" | "success";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) {
      // Show toast
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      // Auto hide after 6 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [open]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const getBackgroundColor = () => {
    switch (severity) {
      case "success":
        return "rgba(239, 247, 238, 1)";
      case "error":
        return colors.redText;
      case "warning":
        return "#ed6c02";
      case "info":
        return "#0288d1";
      default:
        return "rgba(239, 247, 238, 1)";
    }
  };

  return (
    <Animated.View
      pointerEvents={open ? "auto" : "none"}
      style={[
        styles.container,
        {
          top: insets.top || 0,
          backgroundColor: open ? getBackgroundColor() : "transparent",
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.message, {color: severity === "success" ? colors.cifTextColor : severity === "error" ?  colors.white : colors.cifTextColor}]}>{message}</Text>

        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  message: {
    flex: 1,
    color: colors.cifTextColor,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginRight: 10,
  },

  close: {
    color: colors.black,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Toast;