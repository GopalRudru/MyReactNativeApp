import { useDispatch, useSelector } from "react-redux";
import { authSelector } from "../services/redux/slices/authSlice";
import { RootState } from "../services/redux/store";
import { useCallback } from "react";
import { encrypt } from "../utils/crypto";
import { setNotification, setUnreadCount } from "../services/redux/slices/notificationSlice";
import logger from "../utils/logger";
import notificationsServices from "../services/api/service/notificationService";

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { userProfile } = useSelector(authSelector);
    const businessTypeId = useSelector(
      (state: RootState) => state.auth.businessType?.id
    );
    const loanCategoryData = useSelector(
      (state: RootState) => state.auth.loanCategory
    );

  const getNotificationsList = useCallback(async () => {
    // if (!userProfile?.cifNumber) return;

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

  return { getNotificationsList };
};

