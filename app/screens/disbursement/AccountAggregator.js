import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
// import { Ionicons } from "@expo/vector-icons"; // for edit icon
import imagePath from "../../constant/imagePath";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import { actionRowDataSelector } from "../../services/redux/slices/disbursementButtonSlice";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { getDateRange } from "../../utils/dateFormatUtils";
import { useSelector } from "react-redux";

const AccountAggregator = ({
  onBack,
  onSkipConsent,
  onProvideConsent,
  setMobileNumbers,
  bankName,
  accountNumber,
  ifscCode,
  mobileNumber,
  consentStatus,
  dateRange,
  bankListLien = [],
  aggregatorData = null,
  validConsent = false,
  isLoadingUpdateNew = true,
  isLoadingConsent = false,
  continueButton = false,
  isEditable = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const actionRowData = useSelector(actionRowDataSelector);
  //console.log("validConsent>>>>>>>>>>>>>", validConsent);
  // let val = validConsent;
  // if (val === true) {
  //   setIsEditing(false);
  // }
  useEffect(() => {
    //console.log("validConsent changed in use effcet:", validConsent);
    if (validConsent === true) {
      setIsEditing(false);
    }
  }, [validConsent]); // runs whenever validConsent changes

  const bankNameVal =
    (bankListLien &&
      bankListLien?.find((bank) => bank.id === bankName)?.bankName) ||
    bankName ||
    "HSBC Bank";

  const handleEditIcon = (currentState) => {
    setIsEditing(!currentState);
  };

  // Show shimmer when consent is being processed
  if (isLoadingConsent) {
    return (
      <View style={styles.container}>
        {/* Note Title Shimmer */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: 65, height: 18, borderRadius: 4, marginBottom: 10 }}
        />

        {/* Note Box Shimmer */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{
            width: "100%",
            height: 180,
            borderRadius: 8,
            marginBottom: 16,
          }}
        />

        {/* Section Title Shimmer */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: 200, height: 25, borderRadius: 4, marginBottom: 12 }}
        />

        {/* Input Fields Shimmer */}
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={{ marginBottom: 12 }}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{
                width: 100,
                height: 16,
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{ width: "100%", height: 45, borderRadius: 8 }}
            />
          </View>
        ))}

        {/* Info Text Shimmer */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{
            width: "100%",
            height: 60,
            borderRadius: 4,
            marginBottom: 12,
          }}
        />

        {/* Consent Status Shimmer */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: 100, height: 14, borderRadius: 4, marginBottom: 5 }}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: 120, height: 30, borderRadius: 6, marginBottom: 8 }}
        />

        {/* Date Text Shimmer */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: 250, height: 12, borderRadius: 4 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Note */}
      <Text style={styles.noteTitle}>Note</Text>
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Your consent allows us to securely fetch the balance of your lien
          account automatically, expediting your fund release request. After
          verifying the linked mobile no. below, please click{" "}
          <Text style={styles.linkText}>“Provide consent”</Text> and ensure you
          select the same lien-marked account you mentioned in your fund release
          request and approve consent.
        </Text>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Lien A/c details for consent</Text>

      {/* Bank Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name</Text>
        <TextInput style={styles.input} value={bankNameVal} editable={false} />
      </View>

      {/* Account No */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account No</Text>
        <TextInput
          style={styles.input}
          value={accountNumber || "923182381738"}
          editable={false}
        />
      </View>

      {/* IFSC */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>IFSC Code</Text>
        <TextInput
          style={styles.input}
          value={ifscCode || "HSBC0400003"}
          editable={false}
        />
      </View>

      {/* Mobile Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mobile No. linked to this Bank account</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            // ref={inputRef}
            editable={isEditing}
            style={[
              styles.input,
              {
                flex: 1,
                paddingRight: 32,
                backgroundColor: "white",
                color: isEditing
                  ? "rgba(0, 0, 0, 0.87)"
                  : "rgba(0, 0, 0, 0.38)",
              },
            ]} // paddingRight for icon space
            // onBlur={() => setFocusedInput(null)}
            value={mobileNumber}
            onChangeText={(text) => {
              const value = text.replace(/\D/g, ""); // remove non-digits
              setMobileNumbers?.(value);
            }}
            maxLength={10}
            // editable={isEditing}
          />
          {(validConsent === false || validConsent === "in-progress") &&
          continueButton === false &&
          isEditable === true ? (
            <TouchableOpacity
              style={styles.iconInside}
              onPress={() => handleEditIcon(isEditing)}
            >
              <Image
                source={imagePath.editIcon}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Info text */}
      <Text style={styles.infoText}>
        Please verify the above mobile no. linked to your lien account is
        accurate. An OTP will be sent to this number when you proceed for
        consent.
      </Text>

      {/* Consent Status */}
      <Text
        style={{
          fontSize: 13,
          fontFamily: fonts.medium,
          color: colors.avatarItemTextColor,
          marginBottom: 5,
        }}
      >
        Consent Status
      </Text>
      {isLoadingUpdateNew ? (
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          shimmerStyle={styles.shimmerBox}
        >
          {/* <Text style={styles.text}>No consent received</Text> */}
        </ShimmerPlaceholder>
      ) : (
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: validConsent === true ? "#068906" : "#FFA94D",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {validConsent === true
              ? "Consent received"
              : validConsent === "in-progress"
              ? "In Progress"
              : "No consent received"}
          </Text>
        </View>
      )}

      {/* Date range */}
      <Text style={styles.dateText}>
        {getDateRange(actionRowData?.loanDetails?.loanEndDate)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    PaddingVertical: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    // color: "#168794",
    color: colors.appThemeColor,
    marginBottom: 10,
  },
  noteBox: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBDADE",
    marginBottom: 16,
  },
  noteText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    lineHeight: 22,
    color: "#666666",
  },
  linkText: {
    color: "#00A6A6",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    // fontWeight: "600",
    // color: "#168794",
    color: colors.appThemeColor,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.guidelinesTextColor,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DBDADE",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "rgba(75, 70, 92, 0.5)",
    fontFamily: fonts.regular,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 8,
    padding: 6,
  },
  infoText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#666666",
    marginBottom: 12,
  },
  statusBox: {
    backgroundColor: "#FFA94D",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#fff",
  },
  dateText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: "#999999",
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  iconInside: {
    position: "absolute",
    right: 10,
  },
  shimmerBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FFA726", // orange base
  },
});

export default AccountAggregator;
