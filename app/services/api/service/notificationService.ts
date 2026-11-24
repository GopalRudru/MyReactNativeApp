import axiosInstance, { secureFetch } from "../apiClient/apiClient";
import dictionary from "../dictionary";

const { notifications } = dictionary;

const notificationsServices = {
  // Regular methods
  getNotifications: (body?: any) => axiosInstance.post(notifications.getNotifications(), body),
  readNotification: (body: any) => axiosInstance.put(notifications.updateReadNotification(), body),

  // 🔐 Secure methods using SSL pinning
  secureGetNotifications: (body?: any) =>
    secureFetch({
      url: notifications.getNotifications(),
      method: "POST",
      body,
    }),

  secureReadNotification: (body: any) =>
    secureFetch({
      url: notifications.updateReadNotification(),
      method: "PUT",
      body,
    }),
};

export default notificationsServices;
