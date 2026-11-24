import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ShadowCardComponent from "./ShadowCardComponent";
import colors from "../res/colors";
import fonts from "../res/fonts";
import strings from "../res/strings";
import { useEffect, useState } from "react";
import postsServices from "../services/api/service/postsService";
import { decrypt } from "../utils/crypto";
import { formatDate } from "../utils/dateFormatUtils";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { createModuleLogger } from "../utils/logger";
import imagePath from "../constant/imagePath";
import AppConstants from "../constant/AppConstants";

interface DisbursementFormTermDetailsProps {
  disbursementFormId: number;
  validConsent: boolean;
  formStatus: string;
  onClickFunc: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <View style={styles.row}>
      {/* <Text style={styles.label}>{"acohbdjebfje jwbdffenjf"}</Text> */}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const DisbursementFormTermDetails: React.FC<
  DisbursementFormTermDetailsProps
> = ({ disbursementFormId, validConsent, formStatus, onClickFunc }) => {
  const [disbursementFormDetails, setDisbursementFormDetails] = useState<any>(
    []
  );
  // const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const logger = createModuleLogger("DisbursementFormTermDetails");

  const handleInvokDetailApi = async () => {
    try {
      const payload = {
        disbursementFormId: disbursementFormId,
      };
      logger.debug("Payload for review details:", payload);
      const response: any = await postsServices.secureAddPost(
        "api/v1/disbursement-form/review-details",
        payload
      );
      if (response?.status == 200) {
        setIsLoading(false);
        setDisbursementFormDetails(JSON.parse(decrypt(response?.data?.data)));
      }
    } catch (error: any) {
      setIsLoading(false);
      logger.log(error);
    }
  };

  logger.debug(disbursementFormDetails);
  let data = disbursementFormDetails[0] || {};

  const formatKeyToLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
      .replace(/_/g, " ") // Replace underscores with space
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of words
      .trim();
  };

  useEffect(() => {
    handleInvokDetailApi();
  }, [disbursementFormId]);

  const formatLabel = (label: string) =>
    label.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const ShimmerReviewRow = () => (
    <View style={styles.row}>
      <View style={styles.column}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerLabelStyle}
        />
      </View>
      <View style={styles.column}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={styles.shimmerValueStyle}
        />
      </View>
    </View>
  );

  const handleButton = () => {
    if (
      formStatus != "query" &&
      formStatus != "pendingFromOperationMaker" &&
      formStatus != "pendingFromOperationChecker" &&
      formStatus != "pendingFromLienOperationChecker" &&
      formStatus != "pendingFromCredit" &&
      formStatus != "pendingFromCollection" &&
      formStatus != "pendingFromSalesCoordinator" &&
      formStatus != "approve" &&
      formStatus != "reject" &&
      formStatus != "cancelled"
    ) {
      return (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            padding: 6,
            borderWidth: 1,
            borderColor: "#168794",
            borderRadius: 6,
          }}
          onPress={onClickFunc}
          activeOpacity={AppConstants.buttonActiveOpacity}
        >
          <Image
            source={imagePath.editIcon}
            style={{
              width: 16,
              height: 16,
              marginRight: 6,
              tintColor: "#168794",
            }}
          />
          <Text style={{ color: "#168794", fontFamily: fonts.medium }}>
            Edit
          </Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ fontFamily: fonts.bold, fontSize: 16, color: "#168794" }}
        >
          Review Details
        </Text>
        <View style={{ flexDirection: "row" }}>{handleButton()}</View>
      </View>
      <View style={styles.horizontalLine} />
      {isLoading ? (
        <>
          {/* Section Title */}
          <ShimmerPlaceholder
            style={{
              width: 180,
              height: 25,
              marginBottom: 20,
              borderRadius: 6,
            }}
          />

          {/* Fund Request Details */}
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.shimmerRow}>
              <ShimmerPlaceholder
                style={{ width: 160, height: 18, borderRadius: 6 }}
              />
              <ShimmerPlaceholder
                style={{ width: 160, height: 18, borderRadius: 6 }}
              />
            </View>
          ))}

          {/* Section Title */}
          <ShimmerPlaceholder
            style={{
              width: 180,
              height: 25,
              marginBottom: 20,
              borderRadius: 6,
            }}
          />

          {/* Lien A/c Details */}
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.shimmerRow}>
              <ShimmerPlaceholder
                style={{ width: 160, height: 18, borderRadius: 6 }}
              />
              <ShimmerPlaceholder
                style={{ width: 160, height: 18, borderRadius: 6 }}
              />
            </View>
          ))}

          {/* Section Title */}
          <ShimmerPlaceholder
            style={{
              width: 180,
              height: 25,
              marginBottom: 20,
              borderRadius: 6,
            }}
          />

          {/* Beneficiary Bank Details */}
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.shimmerRow}>
              <ShimmerPlaceholder
                style={{ width: 160, height: 18, borderRadius: 6 }}
              />
              <ShimmerPlaceholder
                style={{ width: 160, height: 18, borderRadius: 6 }}
              />
            </View>
          ))}

          {/* Buttons */}
          <ShimmerPlaceholder style={styles.button} />
          <ShimmerPlaceholder
            style={[styles.button, { marginTop: 12, backgroundColor: "#eee" }]}
          />
        </>
      ) : (
        <>
          <View style={styles.wrapper}>
            {/* Fund Request Details */}
            <Text style={styles.sectionTitle}>Fund Request Details</Text>

            <DetailRow
              label="Request Type"
              value={
                data?.requestType === "lien"
                  ? "Fund Release from Lien A/c"
                  : data?.requestType === "tranche"
                  ? "New Tranche"
                  : "-"
              }
            />
            <DetailRow label="Payment Type" value={data?.paymentTypeName} />
            <DetailRow
              label="Disbursement Purpose"
              value={data?.disbursementPurposeName}
            />
            <DetailRow label="Account Type" value={data?.accountType} />
            <DetailRow label="University Name" value={data?.universityName} />
            <DetailRow
              label="Updated University Name"
              value={data?.newUniversityName ?? "-"}
            />
            <DetailRow
              label="Payment Date"
              value={data?.paymentDate ? formatDate(data?.paymentDate) : ""}
            />
            <DetailRow label="Payment Made To" value={data?.paymentMadeTo} />
            <DetailRow label="Requested Amount" value={data?.requestedAmount} />
            <DetailRow label="Overseas Number" value={data?.overseasNumber} />
            <DetailRow label="Overseas Address" value={data?.overseasaddress} />

            {/* Lien A/c Details */}
            {(data?.lienAccountHolderName ||
              data?.lienAccountNumber ||
              data?.lienIfscCode) && (
              <>
                <Text style={styles.sectionTitle}>Lien A/c Details</Text>
                <DetailRow
                  label="Bank Name"
                  value={data?.LienBankData?.bankName}
                />
                <DetailRow
                  label="Account Number"
                  value={data?.lienAccountNumber}
                />
                <DetailRow label="IFSC Code" value={data?.lienIfscCode} />
                <DetailRow
                  label="Account Holder Name"
                  value={data?.lienAccountHolderName}
                />

                <View style={styles.row}>
                  <Text style={styles.label}>Account Information consent</Text>
                  <View
                    style={[
                      styles.consentBox,
                      // { backgroundColor: validConsent ? "#068906" : "#FFA94D" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.consentText,
                        {
                          backgroundColor: validConsent ? "#068906" : "#FFA94D",
                        },
                      ]}
                    >
                      {validConsent === true
                        ? "Consent received"
                        : "No consent received"}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Beneficiary Bank Details */}
            {(data?.accHolderName || data?.accountNumber || data?.ifsccode) && (
              <>
                <Text style={styles.sectionTitle}>
                  Beneficiary Bank Details
                </Text>
                <DetailRow label="Bank Name" value={data?.BankData?.bankName} />
                <DetailRow label="Account Number" value={data?.accountNumber} />
                <DetailRow label="IFSC Code" value={data?.ifsccode} />
                <DetailRow
                  label="Account Holder Name"
                  value={data?.accHolderName}
                />
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default DisbursementFormTermDetails;

const styles = StyleSheet.create({
  shimmerLabelStyle: {
    width: 120,
    height: 18,
    borderRadius: 4,
    marginBottom: 6,
  },
  shimmerValueStyle: {
    width: 140,
    height: 18,
    borderRadius: 4,
    marginBottom: 6,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: colors.guidelinesTextColor,
    marginTop: 8,
    marginBottom: 16,
    width: "100%",
  },
  label: {
    flex: 1,
    // flex: 1,
    color: colors.guidelinesTextColor,
    fontSize: 10,
    // fontSize: 14,
    fontFamily: fonts.regular,
  },
  value: {
    flex: 1.2,
    // flex: 1.2,
    fontFamily: fonts.medium,
    fontSize: 10,
    // fontSize: 14,
    color: colors.valueTextColor,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: colors.darkGreyTextColor,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: colors.appThemeColor,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  confirmButton: {
    backgroundColor: colors.appThemeColor,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  confirmText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  wrapper: {
    padding: 0,
    //paddingHorizontal: 16,
  },
  sectionContainer: {
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    // flexDirection: "row",
    marginBottom: 10,
  },
  column: {
    width: "50%",
    paddingHorizontal: 6,
  },
  labelText: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.guidelinesTextColor,
  },
  valueText: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.textValueColor,
  },
  consentBox: {
    flex: 1.2,
    // backgroundColor: "#d9fce3",
    // paddingVertical: 4,
    // paddingHorizontal: 10,
    // borderRadius: 6,
    alignSelf: "flex-start",
    // marginTop: 2,
  },
  consentText: {
    backgroundColor: "#d9fce3",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 2,
    fontSize: 10,
    fontFamily: fonts.semiBold,
    // flex: 1.2,
    color: "white",
    // backgroundColor: "green",
    // color: "red",
    // fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    // fontWeight: "600",
    // color: "#00796B",
    color: "#168794",
    marginVertical: 10,
  },
  shimmerContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  // row: {
  //   marginBottom: 12,
  // },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  shimmer: {
    borderRadius: 6,
  },
  shimmerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    marginTop: 24,
  },
});
