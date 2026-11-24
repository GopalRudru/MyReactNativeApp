import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../res/colors";
import ListHeader from "./ListHeader";
import * as NavigationService from "../navigation/NavigationService";
import postsServices from "../services/api/service/postsService";
import { useSelector } from "react-redux";
import { RootState } from "../services/redux/store";
import fonts from "../res/fonts";
import NoRecordFound from "./common/NoRecordFound";
import LoadingText from "./common/LoadingText";
import { formatDate } from "../utils/dateFormatUtils";
import { formatIndianRupees } from "../utils/formatting";
import Space from "./common/Space";
import { scale } from "react-native-size-matters";
import analytics from "@react-native-firebase/analytics";
import { createModuleLogger } from "../utils/logger";
import { authSelector } from "../services/redux/slices/authSlice";
import { decrypt } from "../utils/crypto";

interface Item {
  accountNumber: string;
  name: string;
  status: string;
  initiatedBy: string;
  requested: string;
  disbursed: string;
  amount: string;
  date: string;
  party: string;
  utrNumber: string;
}

interface DisbursementProps {
  item: Item;
  rowIndex: number;
}

const logger = createModuleLogger("Dashboard DisbursementHistory");
let user_id = "";
const handleLeftTextPress = async () => {
  analytics().logEvent("ViewAll_Disbursment", {
    screen_name: "Dashboard",
    user_id: user_id,
  });
  NavigationService.navigate("DisbursementHistory");
};

const DisbursementCard = (props) => {
  const [cardListRows, setCardListRows] = useState<Item[]>([]);
  const [responseReceived, setResponseReceived] = useState(false);
  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber
  );
  const { userProfile } = useSelector(authSelector);

  if (selectedLoanNumber && decrypt(userProfile?.cifNumber)) {
    user_id = `${decrypt(userProfile?.cifNumber)}TZ${selectedLoanNumber}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      setResponseReceived(false);
      setCardListRows([]); // Clear previous data
      const payload = { lan: selectedLoanNumber };
      try {
        const response = await postsServices.secureAddPost(
          "api/v1/dashboard/disbursement-history",
          payload
        );
        // const data = response?.data?.data.slice(0, 5) || [];
        const data = response?.data?.data || [];
        setCardListRows(data);
        // await analytics().logEvent("Dashboard_History", { user_id: user_id });
      } catch (error) {
        logger.error("Failed to fetch disbursement history", error);
      } finally {
        setResponseReceived(true);
      }
    };

    if (selectedLoanNumber) {
      fetchData();
    }
  }, [selectedLoanNumber]);

  const renderList = useCallback((data: Item[]) => {
    return (
      <View>
        {data.map((rowItem, rowIndex) => (
          <Disbursement
            key={`disbursement-${rowItem.accountNumber}-${rowIndex}`}
            item={rowItem}
            rowIndex={rowIndex}
          />
        ))}
        <View style={{ height: props.showDisbursementHistory ? 5 : 2 }} />
      </View>
    );
  }, []);

  const Disbursement = React.memo<DisbursementProps>(({ item, rowIndex }) => (
    <View
      style={[
        styles.card,
        {
          marginTop: rowIndex === 0 ? 0 : 10,
          marginBottom: rowIndex === cardListRows?.length - 1 ? 20 : 0,
        },
      ]}
    >
      <View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{item.accountNumber}</Text>
          </View>
          <View style={styles.column}>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(item.date)}</Text>
            </View>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Beneficiary Party</Text>
            <Text style={styles.value}>{item.party}</Text>
          </View>
        </View>
        {/* Divider */}
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Beneficiary Name</Text>
            <Text style={styles.value}>{item.name}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Amount</Text>
            <Text style={[styles.value, styles.amount]}>
              {formatIndianRupees(Number(item?.amount))}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>UTR</Text>
            <Text style={styles.value}>{item.utrNumber}</Text>
          </View>
        </View>
      </View>
    </View>
  ));

  // Add displayName for better debugging
  Disbursement.displayName = "DisbursementItem";
  return (
    <View style={styles.container}>
      <View style={{ marginTop: props.showDisbursementHistory ? 0 : 20 }}>
        {!props.showDisbursementHistory && (
          <ListHeader
            rightText={
              props.showDisbursementHistory
                ? "Disbursement History"
                : "Disbursement History  (Last 5)"
            }
            leftText={props.showDisbursementHistory ? "" : "View all"}
            onLeftTextPress={
              props.showDisbursementHistory ? "" : handleLeftTextPress
            }
          />
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            {responseReceived ? (
              cardListRows.length === 0 ? (
                <NoRecordFound textmainStyle={{ marginTop: 5 }} />
              ) : (
                renderList(
                  props.showDisbursementHistory
                    ? cardListRows
                    : cardListRows.slice(0, 5)
                )
              )
            ) : (
              <LoadingText />
            )}
          </View>
        </ScrollView>

        <Space
          style={{
            height: props.showDisbursementHistory ? scale(100) : scale(10),
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flex: 1,
    paddingHorizontal: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.medium,
    marginRight: 4,
    color: colors.guidelinesTextColor,
  },
  value: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.valueTextColor,
    marginRight: 10,
  },
  amount: {
    color: "#28C76F", // green
  },
});

export default DisbursementCard;
