import { getQueryString } from "../../../utils/helpers";

const notificationDictionary = {
  // getNotifications: (queryParams?: any) => {
  //   const queryParamsString: string = getQueryString(queryParams);
  //   return `api/v1/notifications/get-notifications${queryParamsString}`;
  // },
  getNotifications: () => `api/v1/notifications/get-notifications`,
  updateReadNotification: () => "api/v1/notifications/update-read-status",
};

export default notificationDictionary;
