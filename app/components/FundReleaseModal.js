import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from "react-native";
import fonts from "../res/fonts";
import colors from "../res/colors";
import { toPascalCase } from "../utils/formatting";
import { formatDate } from "../utils/dateFormatUtils";
import imagePath from "../constant/imagePath";
import AppConstants from "../constant/AppConstants";

const FundReleaseModal = ({ rows, visible, onClose }) => {
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 361;
  let status = "cancelled";
  const finalAmount =
    rows?.lienValues
      ?.filter((item) => item.status === "approved")
      .reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.container}>
          <View style={{ alignItems: "center" }}>
            <Image
              source={imagePath.rectangle}
              style={{ resizeMode: "contain", marginBottom: 16 }}
            />
          </View>
          <Text style={styles.title}>View details</Text>

          <ScrollView showsVerticalScrollIndicator={true}>
            {/* Request Info */}
            <View
              style={[
                styles.itemContainer,
                { borderColor: "#DBDADE", borderWidth: 1 },
              ]}
            >
              <View style={styles.detailContainer}>
                {/* <View style={styles.card}> */}
                <View style={styles.row}>
                  <Text
                    style={[styles.label, isSmallScreen && { fontSize: 12.5 }]}
                  >
                    Request ID
                  </Text>
                  <Text
                    style={[styles.value, isSmallScreen && { fontSize: 10.5 }]}
                  >
                    {rows?.referenceNumber}
                  </Text>
                </View>
                <View style={[styles.row, { width: "40%" }]}>
                  <Text
                    style={[styles.label, isSmallScreen && { fontSize: 12.5 }]}
                  >
                    Disbursement Amount
                  </Text>
                  <Text
                    style={[styles.value, isSmallScreen && { fontSize: 10.5 }]}
                  >
                    INR {rows?.disbursedAmount}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text
                    style={[styles.label, isSmallScreen && { fontSize: 12.5 }]}
                  >
                    Disbursement Type
                  </Text>
                  <Text
                    style={[styles.value, isSmallScreen && { fontSize: 10.5 }]}
                  >
                    {" "}
                    {rows &&
                      rows?.lienValues &&
                      rows?.lienValues
                        .map((item: any) => `${toPascalCase(item.type)}`)
                        .join(" + ")}
                  </Text>
                </View>
                {/* </View> */}
              </View>
            </View>

            {/* Lien Removal */}
            <View style={[styles.itemContainer, { flexDirection: "column" }]}>
              {rows?.lienValues &&
                rows.lienValues.map((item: any, index: number) => (
                  // <View key={index} style={styles.itemContainer}>
                  <View key={index} style={[styles.detailContainer]}>
                    {/* Card Content */}
                    <View style={styles.row}>
                      <Text
                        style={[
                          styles.label,
                          isSmallScreen && { fontSize: 12.5 },
                        ]}
                      >
                        Disbursement Type
                      </Text>
                      <Text
                        // numberOfLines={2}
                        // ellipsizeMode="tail"
                        style={[
                          styles.value,
                          isSmallScreen && { fontSize: 10.5 },
                        ]}
                      >
                        {item.type == "lien"
                          ? "Fund Release from Lien A/c"
                          : item?.type == "tranche"
                          ? "New Tranche"
                          : ""}
                      </Text>
                    </View>

                    <View style={[styles.row, { width: "40%" }]}>
                      <Text
                        style={[
                          styles.label,
                          isSmallScreen && { fontSize: 12.5 },
                        ]}
                      >
                        Amount
                      </Text>
                      <Text
                        style={[
                          styles.value,
                          isSmallScreen && { fontSize: 10.5 },
                        ]}
                      >
                        INR {item.amount}
                      </Text>
                    </View>

                    <View style={[styles.row, { }]}>
                      <Text
                        style={[
                          styles.label,
                          isSmallScreen && { fontSize: 12.5 },
                        ]}
                      >
                        Status
                      </Text>
                      {/* <View style={styles.statusBox}> */}
                      <View
                        style={{
                          // flexDirection: "row",
                          // alignItems: "center",
                          // fontSize: 14,
                          alignSelf: "flex-start",
                          paddingHorizontal: isSmallScreen ? 8 : 10,
                          paddingVertical: isSmallScreen ? 3 : 5,
                          borderRadius: 4,
                          backgroundColor:
                            item?.status?.toLowerCase() === "approved"
                              ? "#b4ffd5"
                              : item?.status?.toLowerCase() === "pending" ||
                                item?.status?.toLowerCase() === "rejected"
                              ? "rgba(234, 84, 85, 0.2)"
                              : item?.status?.toLowerCase() === "query"
                              ? "#eaeaea"
                              : "rgba(8, 7, 7, 0.2)",
                        }}
                      >
                        <Text
                          style={{
                            color:
                              item?.status?.toLowerCase() === "approved"
                                ? "#28C76F"
                                : item?.status?.toLowerCase() === "pending"
                                ? "#EA5455"
                                : item?.status?.toLowerCase() === "query"
                                ? "rgb(28, 177, 177)"
                                : "#EA5455",
                            textTransform: "capitalize",
                            // marginLeft: 8,
                            fontSize: isSmallScreen ? 12 : 14,
                            fontWeight: "500",
                          }}
                        >
                          {item?.status}
                        </Text>
                      </View>
                    </View>
                    {/* </View> */}

                    <View style={[styles.row, { width: "40%" }]}>
                      <Text
                        style={[
                          styles.label,
                          isSmallScreen && { fontSize: 12.5 },
                        ]}
                      >
                        Disbursement Date
                      </Text>
                      <Text
                        style={[
                          styles.value,
                          isSmallScreen && { fontSize: 10.5 },
                        ]}
                      >
                        {item.type === "tranche" && rows?.disbursemntDate
                          ? formatDate(rows?.disbursemntDate)
                          : item?.disbDate
                          ? formatDate(item?.disbDate)
                          : ""}
                      </Text>
                    </View>

                    <View style={[styles.row, {marginBottom: 0, marginTop: 0}]}>
                      {item?.status?.toLowerCase() == "pending" && (
                        <Text
                          style={[
                            styles.errorText,
                            isSmallScreen && { fontSize: 12.5 },
                          ]}
                        >
                          {item?.BankUploadStatus
                            ? item?.BankUploadStatus
                            : "Pending From Avanse"}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.row, {marginBottom: 0, marginTop: 0}]}>
                      {item.type === "lien" &&
                        item?.status?.toLowerCase() == "rejected" &&
                        typeof item?.remark === "string" &&
                        item?.remark.trim() !== "" && (
                          <Text
                            style={[
                              styles.errorText,
                              isSmallScreen && { fontSize: 12.5, },
                            ]}
                          >
                            {item?.remark}
                          </Text>
                        )}
                    </View>
                    <View style={[styles.row, {marginBottom: 0, marginTop: 0}]}>
                      {item.type === "tranche" &&
                        item?.status?.toLowerCase() === "rejected" && (
                          <Text
                            style={[
                              styles.errorText,
                              isSmallScreen && { fontSize: 12.5 },
                            ]}
                          >
                            {rows?.remark}
                          </Text>
                        )}
                    </View>
                    {index === 0 && rows.lienValues.length > 1 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: "#ccc",
                          width: "100%",
                          marginTop: 4,
                          marginBottom: 4,
                        }}
                      />
                    )}
                  </View>
                ))}
            </View>
          </ScrollView>

          {/* Final Disbursed */}
          <Text style={[styles.finalText, isSmallScreen && { fontSize: 15 }]}>
            Final Disbursed Amount: INR {finalAmount}
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={AppConstants.buttonActiveOpacity}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: "#090A0A",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    width: "60%",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
  },
  value: {
    fontSize: 14,
    color: "#414042",
    fontFamily: fonts.semiBold,
  },
  pending: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: "red",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontFamily: fonts.regular,
    marginBottom: 0,
  },
  finalText: {
    fontSize: 18,
    color: "#090A0A",
    fontFamily: fonts.bold,
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: "#00b5ad",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeText: {
    textAlign: "center",
    fontFamily: fonts.semiBold,
    color: "#fff",
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  statusBox: {
    fontSize: 14,
    fontWeight: "600",
    color: "red",
    backgroundColor: "#ffe5e5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  detailContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default FundReleaseModal;
