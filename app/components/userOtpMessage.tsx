import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../res/colors";
import fonts from "../res/fonts";
import { logger } from "../utils/logger";

// Optimized masking functions - moved outside component to prevent recreation
const maskMobile = (mobile: string): string => {
  return mobile.replace(/.(?=.{4})/g, "x");
};

const maskEmailOrMobile = (data: any): string => {
  const mobilePattern = /^\d{10}$/; // Pattern for 10-digit mobile number
  const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/; // Pattern for email

  if (mobilePattern.test(data)) {
    // Check if the input is a mobile number
    return "*".repeat(6) + data.slice(-4); // Mask first 6 digits
  } else if (emailPattern.test(data)) {
    // Check if the input is an email address
    const [name, domain] = data.split("@");
    // Mask email name except for the first three characters
    const maskedName = name.slice(0, 3) + "*".repeat(name.length - 3);
    return `${maskedName}@${domain}`; // Return masked email address
  } else {
    return "Invalid input"; // Handle invalid input
  }
};

const userOtpMessage = memo(({ userData, loginType, registerKey }: {
  userData: any;
  loginType: string;
  registerKey: string;
}) => {
  const baseMessage = "Please enter OTP code which we sent to below";
  
  // Debug logging for development
  logger.debug('UserOtpMessage render', { 
    userData: typeof userData === 'object' && userData !== null ? Object.keys(userData) : userData, 
    loginType, 
    registerKey 
  });

  // Memoize the message content to prevent unnecessary recalculations
  const messageContent = useMemo(() => {
    if (registerKey === "register") {
      // Register flow
      const text = userData ? (
        <>
          {" " + loginType + " "}
          <Text style={styles.highlight}>{maskEmailOrMobile(userData)}</Text>
        </>
      ) : null;
      return text;
    } else {
      // Login flow
      const emailText = userData?.email ? (
        <>
          {" email "}
          <Text style={styles.highlight}>{maskEmailOrMobile(String(userData.email))}</Text>
        </>
      ) : null;

      const mobileText = userData?.mobile ? (
        <>
          {" mobile "}
          <Text style={styles.highlight}>
            {maskMobile(String(userData.mobile))}
          </Text>
        </>
      ) : null;

      const andText = userData?.email && userData?.mobile ? " and " : null;

      return (
        <>
          {emailText}
          {andText}
          {mobileText}
        </>
      );
    }
  }, [userData, loginType, registerKey]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {baseMessage}
        {messageContent}
      </Text>
    </View>
  );
});

// Add display name for better debugging
userOtpMessage.displayName = 'UserOtpMessage';

// Custom comparison function for memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.loginType === nextProps.loginType &&
    prevProps.registerKey === nextProps.registerKey &&
    JSON.stringify(prevProps.userData) === JSON.stringify(nextProps.userData)
  );
};

// Re-export with custom comparison
const MemoizedUserOtpMessage = memo(userOtpMessage, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    paddingHorizontal: 0,
  },
  text: {
    color: colors.timerTextColor,
    fontSize: 15,
    fontFamily: fonts.medium,
    lineHeight: 19,
  },
  highlight: {
    color: "#1CB1B1",
    textDecorationLine: "none",
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});

export default MemoizedUserOtpMessage;
