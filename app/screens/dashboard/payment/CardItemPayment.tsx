// PreviousPaymentCard.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import imagePath from "../../../constant/imagePath";
import fonts from "../../../res/fonts";
import colors from "../../../res/colors";
import strings from "../../../res/strings";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import NoRecordFound from "../../../components/common/NoRecordFound";
import { formatDate } from "../../../utils/dateFormatUtils";
import { formatNormalIndianRupees } from "../../../utils/formatting";
import LoadingText from "../../../components/common/LoadingText";
import AppConstants from "../../../constant/AppConstants";

interface Item {
  accountNumber: string;
  totalAmount: number;
  status: string;
  initiatedBy: string;
  requested: string;
  disbursed: string;
  amount: string;
  requestAt: string;
  purpose: string;
  trackingId: string;
  requestId: string;
  amountPaid: string;
}

const CardItemPayment = ({ rows, isLoading, handleActionClick }: any) => {
  const [responseReceived, setResponseReceived] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setResponseReceived(true);
    }
  }, [isLoading]);

  return (
    <View>
      <Text style={styles.header}>
        {strings.Previous_Payment_Details}{" "}
        <Text style={styles.subHeader}>({strings.Initiated_Via_Customer_Portal})</Text>
      </Text>

      {
        responseReceived ? (
          rows?.length === 0 ? (
            <NoRecordFound />
          ) : (
            rows?.map((item: any) => (
              <ItemCard
                key={item?.accountNumber || item?.requestId || `item-${index}`}
                item={item}
                isLoading={isLoading}
                handleActionClick={handleActionClick} />
            ))
          )
        ) : (
          <LoadingText />
        )}
    </View>
  );
};

const ItemCard = ({
  item,
  isLoading,
  handleActionClick,
}: {
  item: Item;
  isLoading: boolean;
  handleActionClick: any;
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={styles.dateContainer}
        >
          <Text style={[styles.label, { color: '#00B2B2' }]}>{strings.Date}</Text>
          <Text style={styles.value}>{formatDate(item?.requestAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.statusButton}
          activeOpacity={AppConstants.textActiveOpacity}
          onPress={() => { handleActionClick(item) }}>
          <Text style={styles.statusText}>{strings.View_Status}</Text>
          <View
            style={styles.arrowIconContainer}>
            <Image
              source={imagePath.rightArrow}
              style={styles.arrowIconStyle}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>{strings.Request_ID}</Text>
          <Text style={styles.value}>{item?.requestId}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>{strings.Tracking_ID}</Text>
          <Text style={styles.value}>{item?.trackingId}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>{strings.Initiated_By}</Text>
          <Text style={styles.value}>{item?.initiatedBy}</Text>
        </View>
      </View>
      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>{strings.Purpose}</Text>
          <Text style={styles.value}>{item?.purpose}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>{strings.Amount_Paid}</Text>
          <Text style={[styles.value, { color: "#00B853" }]}>
            {formatNormalIndianRupees(Number(item?.amountPaid))}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>{strings.Total_Amount}</Text>
          <Text style={styles.value}>{formatNormalIndianRupees(Number(item?.totalAmount))}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    fontSize: 14,
    color: "#168794",
    fontFamily: fonts.bold,
    marginBottom: 16,
    //textTransform: "uppercase",
  },
  subHeader: {
    fontSize: 11,
    color: "#168794",
    fontFamily: fonts.medium,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    color: "#00B2B2",
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailItem: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.medium,
    //fontWeight: "500",
    marginRight: 4,
    color: colors.guidelinesTextColor,
  },
  value: {
    fontSize: 10,
    //fontWeight: "600",
    fontFamily: fonts.bold,
    color: colors.valueTextColor,
    marginRight: 10,
  },
  dateContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  arrowIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  arrowIconStyle: { height: 10, width: 10, resizeMode: "contain" }
});

export default CardItemPayment;
