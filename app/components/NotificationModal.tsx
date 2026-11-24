import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { authSelector } from "../services/redux/slices/authSlice";
import {
  notificationSelector,
  setNotification,
  setUnreadCount,
} from "../services/redux/slices/notificationSlice"; //"../../services/redux/slices/notificationSlice";
import fonts from "../res/fonts";
import imagePath from "../constant/imagePath";
import colors from "../res/colors";
import { RootState } from "../services/redux/store";
import { encrypt } from "../utils/crypto";
import notificationsServices from "../services/api/service/notificationService";
import FormattedDate from "./common/FormattedDate";
import AppConstants from "../constant/AppConstants";
import { createModuleLogger } from "../utils/logger";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

type NotificationItem = {
  id: number;
  avatar?: string;
  initials?: string;
  name?: string;
  message?: string;
  created_at: string;
};

interface NotificationModalProps {
  visible: boolean;
  setNotificationVisible: (visible: boolean) => void;
  onClose: () => void;
  data: NotificationItem[];
  onViewAll: () => void;
}

const logger = createModuleLogger("NotificationModal");

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  setNotificationVisible,
  onClose,
  data,
  onViewAll,
}) => {
  const dispatch = useDispatch();
  const { userProfile } = useSelector(authSelector);
  const businessTypeId = useSelector(
    (state: RootState) => state.auth.businessType?.id
  );

  const loanCategoryData = useSelector(
    (state: RootState) => state.auth.loanCategory
  );

  //const { notificationData } = useSelector(notificationSelector);
  const [notificationData, setNotificationData] = useState<any[]>([]);

  // Memoized limited data to prevent unnecessary recalculations
  const limitedData = useMemo(() => data.slice(0, 5), [data]);

  const getNotificationsList = useCallback(async () => {
    try {
      // if (!userProfile?.cifNumber) {
      //   logger.warn("Missing required data for notifications", { userProfile });
      //   return;
      // }
      const bodyObj: any = {};
      let cifNumber = userProfile?.cifNumber;
      bodyObj.cifNumber = cifNumber;
      bodyObj.businessType = encrypt(businessTypeId);
      bodyObj.loanCategory = encrypt(
        loanCategoryData?.TermLoan[0]?.loanCategoryId
      );
      const res = await notificationsServices.secureGetNotifications(bodyObj);
      
      if (res?.status === 200 && res?.data?.data) {
        const notificationsList = res.data.data.filter(
          (n: any) => n.readStatus === false
        );
        const unreadCount = res.data.pagination?.unreadNotificationsCounts;
        dispatch(setNotification(notificationsList));
        setNotificationData(notificationsList);
        dispatch(setUnreadCount(unreadCount));
        logger.info("Notifications fetched successfully", { 
          count: notificationsList.length, 
          unreadCount 
        });
      }
    } catch (error) {
      logger.error("Get notifications API error", error);
    }
  }, [userProfile?.cifNumber, businessTypeId, loanCategoryData, dispatch]);

  const readNotification = useCallback(async (id: number) => {
    try {
      const payload = { id: [id] };
      logger.info("Marking notification as read", { notificationId: id });
      const res = await notificationsServices.secureReadNotification(payload);
      if (res?.status === 200) {
        logger.info("Notification marked as read successfully", { notificationId: id });
        getNotificationsList();
        setNotificationVisible(false);
      }
    } catch (error) {
      logger.error("Read Notification API Error", error);
    }
  }, [getNotificationsList, setNotificationVisible]);

  const handleViewAll = useCallback(() => {
    onViewAll();
    notificationsServices.secureReadNotification({ readStatusAll: true });
  }, [onViewAll]);

  // Optimized useEffect
  useEffect(() => {
    
    if (visible) {
      logger.debug('#(#(#(#(###)#)#))# 2')
      getNotificationsList();
    }
  }, [visible, getNotificationsList]);

  // Render notification item - memoized for performance
  const renderNotificationItem = useCallback((item: NotificationItem, index: number) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={AppConstants.buttonActiveOpacity}
      onPress={() => readNotification(item.id)}
    >
      <View>
        <View style={styles.notificationItem}>
          <View style={styles.avatarContainer}>
            <Image
              source={imagePath.userAvatar}
              style={styles.avatar}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.message} numberOfLines={1}>
              {typeof item.message === "string" && item.message.length > 40
                ? `${item.message.slice(0, 40)}...`
                : item.message ?? ""}
            </Text>
            <FormattedDate createdAt={item?.created_at} />
          </View>
        </View>
        {index < limitedData.length - 1 && (
          <View style={styles.separator} />
        )}
      </View>
    </TouchableOpacity>
  ), [readNotification, limitedData.length]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={styles.container}>
              <Text style={styles.title}>Notification</Text>
              <View style={styles.innerSeparator} />
              {notificationData?.length ? (
                <>
                  {notificationData
                    .slice(0, 5)
                    .map((item: NotificationItem, index: number) =>
                      renderNotificationItem(item, index)
                    )}
                </>
              ) : (
                <View style={styles.noNotificationContainer}>
                  <Text style={[styles.viewAllText, { color: colors.subHeaderTextColor }]}>
                    No Notification
                  </Text>
                  <Text style={[styles.viewAllText, { color: colors.subHeaderTextColor, marginTop: 10 }]}>
                    When you have notification(s), you will see them here.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleViewAll}
                style={styles.viewAllContainer}
              >
                <Text style={styles.viewAllText}>View All Notifications</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.blackOpacity05,
    paddingTop: Platform.OS === "ios" ? 120 : 60,
    alignItems: "flex-end",
  },
  container: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: "75%",
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.avatarItemTextColor,
    marginBottom: 8,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatarContainer: {
    height: 40,
    width: 40,
    backgroundColor: "#BDBDBD",
    borderRadius: 30,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 18,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.avatarItemTextColor,
    marginBottom: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
  noNotificationContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  viewAllContainer: {
    marginTop: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingTop: 10,
  },
  viewAllText: {
    color: colors.appThemeColor,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  innerSeparator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});

export default NotificationModal;
