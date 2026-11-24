import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
} from "react-native";
import fonts from "../res/fonts";
import colors from "../res/colors";
import imagePath from "../constant/imagePath";
import strings from "../res/strings";
import { RowData } from "../screens/disbursement/RequestForDisbursement";
import NoRecordFound from "./common/NoRecordFound";
import LoadingText from "./common/LoadingText";
import { formatDate } from "../utils/dateFormatUtils";
import AppConstants from "../constant/AppConstants";
import { transformer } from "../../metro.config";
import { capitalizeStatusFirstLetter } from "../utils/helpers";
import { Popable, usePopable } from "react-native-popable";
import FundReleaseModal from "./FundReleaseModal";
import { toPascalCase } from "../utils/formatting";

interface DisbursementItem {
  id: string;
  status: "Cancelled" | "Approved" | "Rejected";
  initiatedBy: string;
  requestedDate: string;
  disbursementDate: string;
  trancheAmount: string;
  name?: string;
  amount?: number;
}

interface Item {
  accountNumber: string;
  status: string;
  initiatedBy: string;
  requested: string;
  disbursed: string;
  amount: string;
  referenceNumber: string;
  initatedBy: string;
  trancheAmount: number;
  requestedDate: string;
  disbursemntDate: string;
}

interface CardItemListProps {
  data: RowData[];
  onActionClick: (rowData: RowData) => void;
}

const statusStyles = {
  Cancelled: { backgroundColor: colors.redBackground, color: colors.redText },
  Approved: {
    backgroundColor: colors.approveBackgroundColor,
    color: colors.approveTextColor,
  },
  Rejected: { backgroundColor: colors.redBackground, color: colors.redText },
};

const ItemCard = ({
  item,
  onActionClick,
}: {
  item: RowData;
  onActionClick: (rowData: RowData) => void;
}) => {
  //const statusStyle = statusStyles[item.status];
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [approveTooltipVisible, setApproveTooltipVisible] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dateModal, setDateModal] = useState<boolean>(false);
  const [rowsData, setRowsData] = useState<any>(null);
  // const [visible, setVisible] = useState(true);

  const StatusChip = ({ item }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [anchor, setAnchor] = useState(null); // Not required in RN, handled differently

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      //setAnchorEl(event.currentTarget);
      onActionClick(item);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const getStatusColorStyle = () => {
      if (item?.lienValues?.length > 0) {
        return {
          backgroundColor: "#E1DBFD",
          color: "#674AF5",
        };
      }
      switch (item.status) {
        case "reject":
        case "cancelled":
        case "Failed":
          return {
            backgroundColor: "rgba(234, 84, 85, 0.2)",
            color: "rgb(234, 84, 85)",
          };
        case "indraft":
        case "query":
          return {
            backgroundColor: "rgba(225, 219, 253, 0.2)",
            color: "#1CB1B1",
          };
        case "approve":
        case "Success":
          return {
            backgroundColor: "rgba(40, 199, 111, 0.2)",
            color: "#28C76F",
          };
        case "pendingFromAvanse":
          return {
            backgroundColor: "rgba(243, 111, 33, 0.2)",
            color: "#EF7327",
          };
        default:
          return { backgroundColor: "#fde2d3", color: "#ff9f43" };
      }
    };

    const label = () => {
      if (item.status === "approve") return "Approved";
      if (item.status === "reject") return `Rejected`; //return `Rejected ${handleToolTip(item)}`;
      if (item.status === "cancelled") return `Cancelled`;
      if (item.status === "pendingFromAvanse")
        return capitalizeStatusFirstLetter(item.status);
      return capitalizeStatusFirstLetter(item.status);
    };

    const stylesStatusChip = getStatusColorStyle();

    const handleTip = () => {
      setTimeout(() => setTooltipVisible(false), 2000);
    };

    const handleViewStatusModal = (row: any) => {
      setOpenModal(true);
      setRowsData(row);
    };

    const handleCloseModalNew = (val: boolean) => {
      if (val) {
        setRowsData(item);
      }
      setVisible(val);
    };

    const [statusRef, { show: showStatusPopable, hide: hideStatusPopable }] =
      usePopable();
    return (
      <View
        style={[
          styles.statusContainer,
          {
            flex: 1,
          },
        ]}
      >
        <View
          style={[
            styles.chip,
            {
              backgroundColor: stylesStatusChip.backgroundColor,
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 1, // allows it to shrink to fit content
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: item.status === "pendingFromAvanse" ? 1 : 8,
              paddingVertical: item.status === "pendingFromAvanse" ? 6 : 4,
              alignSelf: "center",
            }}
          >
            {/* <Text
              style={{
                color: stylesStatusChip.color,
                fontSize: item.status === "pendingFromAvanse" ? 12 : 13,
                fontFamily: fonts.regular,
                textAlign: "left",
                backgroundColor: "transparent",
              }}
            >
              {label()}
            </Text> */}
            {item?.lienValues && item?.lienValues?.length > 0 ? (
              <TouchableOpacity
                onPress={() => handleViewStatusModal(item)}
                style={{
                  // backgroundColor: "green",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
                activeOpacity={AppConstants.textActiveOpacity}
              >
                <Text
                  style={{
                    color: stylesStatusChip.color,
                    fontSize: 13,
                    fontFamily: fonts.regular,
                    textAlign: "left",
                    textDecorationLine: "underline",
                  }}
                >
                  View Status
                </Text>
              </TouchableOpacity>
            ) : (
              <Text
                style={{
                  color: stylesStatusChip.color,
                  fontSize: item.status === "pendingFromAvanse" ? 12 : 13,
                  fontFamily: fonts.regular,
                  textAlign: "left",
                  backgroundColor: "transparent",
                }}
              >
                {label()}
              </Text>
            )}
          </View>
          {/* </Chip> */}
          {(item.status === "reject" ||
            item.status === "cancelled" ||
            item.status === "approved" ||
            item.status === "pending") && (
            <Popable
              style={{
                opacity: 0.85,
                maxWidth: 250,
              }}
              position="left"
              ref={statusRef}
              wrapperStyle={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onAction={(visible) => {
                if (visible) {
                  setTimeout(() => hideStatusPopable(), 3000);
                }
              }}
              content={
                <View
                  style={{
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(80,80,80,0.85)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: fonts.regular,
                      color: "#fff",
                    }}
                  >
                    {item?.remark || "No reason provided"}
                  </Text>
                </View>
              }
            >
              {!(item?.lienValues && item?.lienValues.length > 0) && (
                <TouchableOpacity
                  onPress={() => {
                    handleCloseModalNew(true);
                  }}
                >
                  <Image
                    source={imagePath.info}
                    style={styles.infoIconStyle}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </Popable>

            // <Tooltip
            //   isVisible={tooltipVisible}
            //   content={
            //     <Text
            //       style={{
            //         fontSize: 13,
            //         fontFamily: fonts.regular,
            //         color: colors.white,
            //       }}
            //     >
            //       {item?.remark || "No reason provided"}
            //     </Text>
            //   }
            //   placement="top"
            //   onClose={() => {
            //     setTooltipVisible(false);
            //   }}
            //   backgroundColor="transparent"
            //   contentStyle={{
            //     backgroundColor: "rgb(109, 109, 109)", // <-- tooltip box background
            //     borderRadius: 8,
            //     padding: 10,
            //   }}
            // >
            //   <TouchableOpacity
            //     onPress={() => {
            //       setTooltipVisible(true);
            //       handleTip();
            //     }}
            //   >
            //     <Image
            //       source={imagePath.info}
            //       style={styles.infoIconStyle}
            //       resizeMode="contain"
            //     />
            //   </TouchableOpacity>
            // </Tooltip>
          )}
        </View>
        {/*  */}
        <FundReleaseModal
          rows={rowsData}
          onClose={() => handleCloseModal(false)}
          visible={openModal}
        />
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={() => setVisible(false)}
        >
          {/* Overlay touch handler */}
          <TouchableWithoutFeedback onPress={() => setVisible(false)}>
            <View style={styles.overlay}>
              {/* Stop touches from propagating to overlay */}
              <TouchableWithoutFeedback>
                <View style={styles.container1}>
                  {/* Top notch */}
                  <View style={{ alignItems: "center", width: "100%" }}>
                    <View style={styles.notch} />
                  </View>

                  {/* Title */}
                  <Text style={styles.title}>
                    {toPascalCase(rowsData?.status)}
                  </Text>

                  {/* Subtitle */}
                  <Text style={styles.subtitle}>
                    {rowsData?.status.toLowerCase() === "pending"
                      ? "Pending From Avanse"
                      : rowsData?.remark}
                  </Text>

                  {/* Close button */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    onPress={() => setVisible(false)}
                  >
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Modal visible={dateModal} transparent animationType="fade">
          {/* Pressable Background */}
          <Pressable style={styles.overlay} onPress={() => setDateModal(false)}>
            {/* Prevent closing when pressing inside box */}
            <Pressable
              style={styles.modalBox}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Lien Date */}
              <View style={[styles.row, { marginBottom: 12 }]}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 15 }}>
                  Lien Disbursement Date:
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    fontSize: 15,
                    marginLeft: 6,
                  }}
                >
                  {Array.isArray(rowsData?.lienValues)
                    ? rowsData.lienValues.find(
                        (v: any) => v.type?.toLowerCase() === "lien"
                      )?.disbDate
                      ? formatDate(
                          rowsData.lienValues.find(
                            (v: any) => v.type?.toLowerCase() === "lien"
                          )?.disbDate
                        )
                      : "-"
                    : "-"}
                </Text>
              </View>

              {/* Tranche Date */}
              <View style={styles.row}>
                <Text style={{ fontFamily: fonts.bold, fontSize: 15 }}>
                  Tranche Disbursement Date:
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.regular,
                    fontSize: 15,
                    marginLeft: 6,
                  }}
                >
                  {Array.isArray(rowsData?.lienValues)
                    ? rowsData?.disbursemntDate
                      ? formatDate(String(rowsData?.disbursemntDate))
                      : "-"
                    : "-"}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.closeButton, { marginTop: 20 }]}
                activeOpacity={AppConstants.buttonActiveOpacity}
                onPress={() => setDateModal(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  };
  const handleCloseModal = (type: boolean) => {
    setOpenModal(type);
  };

  const handleClick = () => {
    //setAnchorEl(event.currentTarget);
    onActionClick(item);
  };

  const handleTip = () => {
    setTimeout(() => setApproveTooltipVisible(false), 2000);
  };
  const [visible, setVisible] = useState(false);
  const [amountRef, { show: showAmountPopable, hide: hideAmountPopable }] =
    usePopable();
  return (
    <View style={[styles.card, { marginBottom: 12 }]}>
      <View style={styles.rowBetween}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "transparent",
            flex: 1,
          }}
        >
          {/* Refrence number */}
          <Text
            style={[
              styles.idText,
              {
                flex: 0.55,
                paddingEnd: 0,
                color: colors.appThemeColor,
                textDecorationLine: "underline", // underline it
              },
            ]}
            onPress={() => handleClick()}
          >
            {String(item?.referenceNumber)}
          </Text>
          {/* Status */}
          <View
            style={{
              flex: 0.45,
              alignItems: "flex-end",
              backgroundColor: "transparent",
            }}
          >
            <StatusChip item={item} />
          </View>
        </View>

        {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={[
              styles.statusBadge,
              {
                // backgroundColor: statusStyle.backgroundColor
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  // color: statusStyle.color,
                },
              ]}
            >
              {item.status}
            </Text>
            {item.status === "Cancelled" || item.status === "Rejected" ? (
              <Image
                source={imagePath.info}
                style={{ width: 15, height: 15, marginLeft: 4 }}
              />
            ) : null}
          </View>
          <TouchableOpacity>
            <Text style={styles.dotMenu}>⋮</Text>
          </TouchableOpacity>
        </View> */}
      </View>

      <View style={styles.divider} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <View style={{ flex: 0.3, backgroundColor: "transparent" }}>
          <Text style={styles.label}>{strings.Initiated_By}</Text>
          <Text style={[styles.value, { paddingEnd: 5 }]}>
            {item?.initatedBy}
          </Text>
        </View>
        <View
          style={{ flex: 0.4, backgroundColor: "transparent", paddingRight: 2 }}
        >
          <View style={styles.row}>
            <Text style={styles.label}>{strings.Requested}</Text>
            <Text style={styles.value}>
              {formatDate(String(item?.requestedDate || ""))}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{strings.Disbursement}</Text>
            {/* <Text style={[styles.value, {}]}>
              {formatDate(String(item?.disbursemntDate || ""))}
            </Text> */}
            {Array.isArray(item?.lienValues) &&
            item?.lienValues?.length > 1 &&
            item?.lienValues?.filter(
              (v) => v?.disbDate !== null && v?.disbDate !== ""
            ).length > 0 ? (
              // More than one dataset - show info icon
              <TouchableOpacity
                onPress={() => {
                  setDateModal(true);
                  setRowsData(item);
                }}
              >
                <Image
                  source={imagePath.info}
                  style={{
                    height: 12,
                    width: 12,
                    // marginLeft: 5,
                    position: "relative",
                    top: 2,
                    resizeMode: "contain",
                  }}
                />
              </TouchableOpacity>
            ) : Array.isArray(item?.lienValues) &&
              item?.lienValues?.length === 1 ? (
              (() => {
                const lienData = item?.lienValues?.filter(
                  (v) => v?.type?.toLowerCase() === "lien"
                );
                return (
                  <Text style={styles.value}>
                    {lienData.length > 0
                      ? formatDate(String(lienData[0]?.disbDate) || "")
                      : formatDate(String(item?.disbursemntDate) || "")}
                  </Text>
                );
              })()
            ) : (
              <Text style={styles.value}>
                {formatDate(String(item?.disbursemntDate) || "")}
              </Text>
            )}
          </View>
        </View>
        <View
          style={{
            flex: 0.3,
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{strings.Tranche_Amount}</Text>
            <View style={styles.row}>
              <Text style={styles.value}>
                {item?.trancheAmount ? (
                  <>
                    {item?.currencyCode} {item?.trancheAmount}
                  </>
                ) : (
                  "-"
                )}
              </Text>
              {item.status == "approve" && (
                <>
                  {/* <Popable
                    style={{
                      opacity: 0.85,
                      width:
                        `Disbursement Amount = INR ${item?.disbursedAmount}`
                          .length * 8,
                      maxWidth: 250,
                    }}
                    position="left"
                    ref={amountRef}
                    wrapperStyle={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 5,
                    }}
                    onAction={(visible) => {
                      if (visible) {
                        setTimeout(() => hideAmountPopable(), 3000);
                      }
                    }}
                    content={
                      <View
                        style={{
                          padding: 10,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(80,80,80,0.85)",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: fonts.regular,
                            color: "#fff",
                          }}
                        >
                          {`Disbursement Amount = INR ${item?.disbursedAmount}`}
                        </Text>
                      </View>
                    }
                  > */}
                  {/* <TouchableOpacity
                    onPress={() => {
                      console.log("inside press");
                      setVisible(true);
                    }}
                  >
                    <Image
                      source={imagePath.info}
                      style={styles.infoIconStyle}
                      resizeMode="contain"
                    />
                  </TouchableOpacity> */}
                  {/* </Popable> */}
                  {/* <Tooltip
                  isVisible={approveTooltipVisible}
                  content={
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: fonts.regular,
                        color: "#fff",
                      }}
                    >
                      {`Disbursement Amount = INR ${item?.disbursedAmount}`}
                    </Text>
                  }
                  placement="top"
                  onClose={() => setApproveTooltipVisible(false)}
                  backgroundColor="rgba(0,0,0,0)"
                  contentStyle={{
                    backgroundColor: "rgba(80,80,80,0.85)", // <-- tooltip box background
                    borderRadius: 8,
                    padding: 10,
                    shadowColor: "transparent", // <-- removes shadow
                    elevation: 0,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setApproveTooltipVisible(true);
                      handleTip();
                    }}
                  >
                    <Image
                      source={imagePath.info}
                      style={[styles.infoIconStyle, { marginLeft: 4 }]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </Tooltip> */}
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const CardItemList = ({ data, onActionClick }: CardItemListProps) => {
  const [responseReceived, setResponseReceived] = useState(false);
  // const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Simulating an API call with a timeout
    const fetchData = () => {
      // Replace this timeout with actual API call
      setTimeout(() => {
        setResponseReceived(true);
      }, 1000);
    };

    fetchData();
  }, []);
  return (
    <View style={styles.container}>
      {responseReceived ? (
        data.length === 0 ? (
          <NoRecordFound textmainStyle={{ marginTop: 5 }} />
        ) : (
          data?.map((item: any, index: number) => (
            <ItemCard
              key={item.accountNumber}
              item={item}
              onActionClick={onActionClick}
            />
          ))
        )
      ) : (
        <LoadingText />
      )}
    </View>
  );
};

export default CardItemList;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  idText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.blackopacity87,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    marginRight: 4,
    fontFamily: fonts.regular,
  },
  infoIcon: {
    fontSize: 12,
    fontWeight: "bold",
  },
  dotMenu: {
    width: 24,
    height: 24,
    tintColor: "rgba(0, 0, 0, 0.54)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.regular,
    marginRight: 4,
    color: colors.guidelinesTextColor,
  },
  value: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.textValueColor,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#666666",
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  infoIconStyle: {
    width: 15,
    height: 15,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container1: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    // alignItems: "center",
  },
  notch: {
    width: 50,
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#090A0A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.darkGreyTextColor,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#00B9AE", // teal-ish color like screenshot
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalBox: {
    //width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
});
