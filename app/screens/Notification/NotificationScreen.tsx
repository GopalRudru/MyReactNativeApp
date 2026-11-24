import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import Header from "../../components/common/Header";
import * as NavigationService from "../../navigation/NavigationService";
import CopyrightComponent from "../../components/common/CopyrightComponent";
import { useDispatch, useSelector } from "react-redux";
import { encrypt } from "../../utils/crypto";
import notificationsServices from "../../services/api/service/notificationService";
import {
  notificationSelector,
  setNotification,
  setUnreadCount,
} from "../../services/redux/slices/notificationSlice";
import { authSelector } from "../../services/redux/slices/authSlice";
import debounce from "lodash.debounce";
import LoaderView from "../../components/common/LoaderView";
import LoadingText from "../../components/common/LoadingText";
import FormattedDate from "../../components/common/FormattedDate";
import { createModuleLogger } from "../../utils/logger";
import { RootState } from "../../services/redux/store";
import DialogStatusPopup from "../../components/common/DialogStatusPopup";

const logger = createModuleLogger("NotificationScreen");

// Add proper TypeScript interfaces
interface NotificationItemData {
  id: string | number;
  message: string;
  created_at: string;
  // Add other notification properties as needed
}

interface NotificationItemProps {
  item: NotificationItemData;
  index: number;
}

// Optimized NotificationItem component
const NotificationItem = React.memo<NotificationItemProps>(({ item, index }) => {
  const { userProfile } = useSelector(authSelector);
  
  // Memoize the cleaned message to prevent unnecessary recalculations
  const cleanedMessage = useMemo(() => 
    item.message?.replace(/\s+/g, " ").trim() || "", 
    [item.message]
  );

  // Memoize the user initial
  const userInitial = useMemo(() => 
    userProfile?.name?.charAt(0).toUpperCase() || 'U', 
    [userProfile?.name]
  );

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{cleanedMessage}</Text>
          </View>
          <View style={styles.dateContainer}>
            <FormattedDate createdAt={item?.created_at} />
          </View>
        </View>
      </View>
    </View>
  );
});

// Add displayName for better debugging
NotificationItem.displayName = 'NotificationItem';

export default function NotificationScreen() {
  const dispatch = useDispatch();
  const { notificationData } = useSelector(notificationSelector);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mockData, setMockData] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectAll, setSelectAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [
    onEndReachedCalledDuringMomentum,
    setOnEndReachedCalledDuringMomentum,
  ] = useState(false);
  const { userProfile } = useSelector(authSelector);
  const businessTypeId = useSelector(
    (state: RootState) => state?.auth?.businessType?.id
  );
  const loanCategoryData: any = useSelector(
    (state: RootState) => state?.auth?.loanCategory
  );
  useEffect(() => {
    dispatch(setNotification([]));
  }, []);

  useEffect(() => {
    logger.info("Initializing notification screen", { page });
    fetchNotifications(page, rowsPerPage, []);
  }, []);

  const fetchNotifications = async (
    pageSkip: number,
    pageSize: number,
    intialData: any[],
    isRefresh = false
  ) => {
    logger.info("Fetching notifications", { pageSkip, pageSize, isRefresh });
    if (isRefresh) setIsRefreshing(true);
    else if (page === 1) setIsLoading(true);
    else if (pageSkip > 1) setIsLoadingMore(true);
    
    setPage(pageSkip);
    try {
      const bodyObj: any = {};
      let cifNumber = userProfile?.cifNumber;
      bodyObj.cifNumber = cifNumber;
      bodyObj.businessType = encrypt(businessTypeId);
      bodyObj.loanCategory = encrypt(
        loanCategoryData?.TermLoan[0]?.loanCategoryId
      );
      bodyObj.pageSkip = pageSkip;
      bodyObj.pageSize = pageSize;
      const response = await notificationsServices.secureGetNotifications(bodyObj);
      logger.info("Notifications API response received", { 
        status: response?.status, 
        dataLength: response?.data?.data?.length 
      });
      if (response?.status === 200) {
        const data = response?.data || {};
        const notificationsList: any[] = data?.data || [];
        const unreadCount = data?.unreadNotificationsCounts || 0;
        setCurrentPage(data?.pagination?.pageCount || 0);
        setTotalRows(data?.pagination?.total_rows || 0);
        const existingIds = new Set(mockData.map((item: any) => item.id));
        const filteredList = notificationsList.filter(
          (item: any) => !existingIds.has(item.id)
        );

        setMockData(
          intialData.length === 0
            ? notificationsList
            : [...intialData, ...filteredList]
        );
        dispatch(setNotification(notificationsList));
        dispatch(setUnreadCount(unreadCount));
        logger.info("Notifications updated successfully", { 
          count: notificationsList.length, 
          unreadCount,
          totalRows: data?.pagination?.total_rows 
        });
      } else {
        logger.error("Unexpected response status", { status: response?.status });
      }
    } catch (error) {
      logger.error("Error fetching notifications", error);
    } finally {
      if (isRefresh) setIsRefreshing(false);
      else setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleBackPress = useCallback(() => {
    logger.info("Navigating back from notifications screen");
    NavigationService.goBack();
  }, []);

  const handleEndReach = useCallback(
    debounce(() => {
      if (page <= currentPage && !onEndReachedCalledDuringMomentum) {
        logger.info("Reached end of list, loading more notifications", { 
          currentPage: page, 
          totalPages: currentPage 
        });
        setIsLoadingMore(true);
        fetchNotifications(page + 1, rowsPerPage, mockData);
        setOnEndReachedCalledDuringMomentum(true);
      }
      logger.debug("End reach check completed");
    }, 2000), // Reduced debounce time from 3000 to 2000
    [page, currentPage, onEndReachedCalledDuringMomentum, mockData, rowsPerPage]
  );

  const handleRefresh = () => {
    setPage(1);
    fetchNotifications(1, rowsPerPage, [], true).then(() => {});
  };

  // Memoized render function for better performance
  const renderNotificationItem = useCallback(
    ({ item, index }: { item: NotificationItemData; index: number }) => (
      <NotificationItem item={item} index={index} />
    ),
    []
  );

  const renderHeader = () => <Text style={styles.header}>Notifications</Text>;

  const renderFooter = () => (
    <View>
      <View style={{ paddingTop: 12 }}>
        {isLoadingMore && <LoadingText />}
      </View>
      <CopyrightComponent />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <View style={styles.mainContainer}>
        <Header
          onMenuPress={() => {}}
          onAvatarPress={() => {}}
          backIconNeeded={true}
          onBackPress={handleBackPress}
          showNotification={false}
          showProfile={false}
          onNotiIconPress={() => {}}
        />
        <View style={styles.container}>
          {/* <Text style={styles.header}>Notifications</Text> */}
          <FlatList
            data={mockData}
            keyExtractor={(item: any, index: number) => {
              // Ensure stable and unique keys
              return item?.id ? `notification-${item.id}` : `notification-fallback-${index}`;
            }}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            // Fix virtualization settings to prevent ViewGroup errors
            removeClippedSubviews={false}
            windowSize={5}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={100}
            onEndReachedThreshold={0.1}
            onEndReached={handleEndReach}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            onMomentumScrollBegin={() => {
              logger.debug("Momentum scroll began, resetting end reach flag");
              setOnEndReachedCalledDuringMomentum(false);
            }}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            // Add these props to fix ViewGroup issues
            legacyImplementation={false}
            disableVirtualization={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
          />
          {/* <CopyrightComponent /> */}
        </View>
        {/* <CopyrightComponent /> */}
        {isLoading && <LoaderView />}
        <DialogStatusPopup />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  mainContainer: { 
    flex: 1,
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 17,
    fontFamily: fonts.regular,
    marginBottom: 12,
    marginTop: 16,
    color: colors.appThemeColor,
  },
  list: { 
    paddingBottom: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    padding: 12,
    marginVertical: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  row: { 
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.appThemeColor,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontFamily: fonts.regular,
    color: colors.white,
  },
  content: { 
    flex: 1, 
    flexDirection: "row",
    alignItems: "flex-start",
  },
  messageContainer: {
    flex: 0.75,
    paddingRight: 8,
  },
  message: {
    fontSize: 12,
    color: colors.subHeaderTextColor,
    fontFamily: fonts.regular,
    marginBottom: 4,
    lineHeight: 16,
  },
  dateContainer: {
    flex: 0.25,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  time: {
    fontSize: 10,
    color: colors.guidelinesTextColor,
    fontFamily: fonts.regular,
  },
  innerSeparator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 0,
  },
});
