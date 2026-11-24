import axiosInstance, { secureFetch } from "../apiClient/apiClient"; // Assuming axiosInstance is correctly configured
import dictionary from "../dictionary";

const { profile } = dictionary;

const userProfileServices = {
  changeUserPassword: (userId: number, body: any) =>
    axiosInstance.put(profile.changeUserPassword(userId), body),
  getProfileDetails: (payload: any) =>
    axiosInstance.post(profile.getProfileDetails(), payload),

  // 🔐 Secure methods using SSL pinning
  secureChangeUserPassword: (userId: number, body: any) =>
    secureFetch({
      url: profile.changeUserPassword(userId),
      method: "PUT",
      body,
    }),

  secureGetProfileDetails: (payload: any) =>
    secureFetch({
      url: profile.getProfileDetails(),
      method: "POST",
      body: payload,
    }),

  secureChangeUserMpin: (body: any) =>
    secureFetch({
      url: profile.changeUserMpin(),
      method: "POST",
      body,
    }),
};

export default userProfileServices;
