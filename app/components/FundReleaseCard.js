import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import imagePath from "../constant/imagePath";
import fonts from "../res/fonts";
import colors from "../res/colors";
import { toPascalCase } from "../utils/formatting";
import FundReleaseModal from "./FundReleaseModal";
import AppConstants from "../constant/AppConstants";
// import { Ionicons } from "@expo/vector-icons"; // or lucide-react if you use it

const FundReleaseCard = ({ data }) => {
  const [openModal, setOpenModal] = useState(false);
  const handleCloseModal = (type: boolean) => {
    setOpenModal(type);
  };
  const handleViewStatusModal = () => {
    setOpenModal(true);
  };
  
  return (
    <View>
      {/* Header */}
      {/* <Text style={styles.title}>Fund Release</Text> */}
      <View style={styles.card}>
        {/* Request ID & Amount Row */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Request ID</Text>
            <Text style={styles.valueBold}>{data?.referenceNumber}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Text style={styles.label}>Disbursement Amount</Text>
            <Text style={styles.valueBold}>{data?.disbursedAmount}</Text>
          </View>
        </View>

        {/* Disbursement Type */}
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Disbursement Type</Text>
          <Text style={styles.valueBold}>
            {data &&
              data?.lienValues &&
              data?.lienValues
                .map((item: any) => `${toPascalCase(item.type)}`)
                .join(" + ")}
          </Text>
        </View>

        {/* View details link */}
        <TouchableOpacity
          style={styles.detailsRow}
          onPress={() => handleViewStatusModal()}
          activeOpacity={AppConstants.buttonActiveOpacity}
        >
          <Text style={styles.linkText}>View details</Text>
          <Image
            source={imagePath.rightArrow}
            style={{ width: 10, height: 10 }}
          />
          {/* <Ionicons name="chevron-forward" size={18} color="#00A6A6" /> */}
        </TouchableOpacity>
      </View>
      <FundReleaseModal
        rows={data}
        visible={openModal}
        onClose={() => handleCloseModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#00000012",
    //marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    // fontWeight: "600",
    color: "#168794", // teal like in screenshot
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    // color: "#4B465C",
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
  },
  valueBold: {
    fontSize: 14,
    color: "#414042",
    fontFamily: fonts.semiBold,
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  linkText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    // fontWeight: "600",
    color: "#168794",
    marginRight: 4,
  },
});

export default FundReleaseCard;
