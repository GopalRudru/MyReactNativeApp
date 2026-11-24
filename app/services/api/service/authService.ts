import axiosInstance, { secureFetch } from "../apiClient/apiClient";
import dictionary from "../dictionary";
const { auth } = dictionary;

const authServices = {
  sendUserOtp: (body: any) => axiosInstance.post(auth?.sendOtp(), body),
  reSendRegisterOtp: (body: any) =>
    axiosInstance.post(auth?.reSendRegisterOtp(), body),
  sendRegisterOtp: (body: any) =>
    axiosInstance.post(auth?.sendRegisterOtp(), body),

  verifyUserOtp: (body: any) => axiosInstance.post(auth?.verifyOtp(), body),
  verifyRegisterOtp: (body: any) =>
    axiosInstance.post(auth?.verifyRegisterOtp(), body),
  // registerNewUser: (body: any) =>
  //   axiosInstance.post(auth?.registerNewUser(), body),
  signupOnboard: (body: any) => axiosInstance.post(auth?.signupOnboard(), body),
  setUserPassword: (body: any) => axiosInstance.post(auth?.setPassword(), body),
  userLogin: (body: any) => axiosInstance.post(auth?.customerLogin(), body),
  getLogin: (body: any) => axiosInstance.post(auth?.getLogin(), body),
  setLogin: (body: any) => axiosInstance.post(auth?.setLogin(), body),
  uploadImage: (body: any) => axiosInstance.put(auth?.uploadImage(), body),

  // 🔐 New method using SSL pinning
  secureSendUserOtp: (body: any) =>
    secureFetch({
      url: auth?.sendOtp(),
      method: "POST",
      body,
    }),

  registerNewUser: (body: any) =>
    secureFetch({
      url: auth?.registerNewUser(),
      method: "POST",
      body,
    }),

  secureReSendRegisterOtp: (body: any) =>
    secureFetch({
      url: auth?.reSendRegisterOtp(),
      method: "POST",
      body,
    }),

  secureSendRegisterOtp: (body: any) =>
    secureFetch({
      url: auth?.sendRegisterOtp(),
      method: "POST",
      body,
    }),

  secureVerifyUserOtp: (body: any) =>
    secureFetch({
      url: auth?.verifyOtp(),
      method: "POST",
      body,
    }),

  secureRegisterNewUser: (body: any) =>
    secureFetch({
      url: auth?.registerNewUser(),
      method: "POST",
      body,
    }),

  secureVerifyRegisterOtp: (body: any) =>
    secureFetch({
      url: auth?.verifyRegisterOtp(),
      method: "POST",
      body,
    }),

  secureSignupOnboard: (body: any) =>
    secureFetch({
      url: auth?.signupOnboard(),
      method: "POST",
      body,
    }),

  secureSetUserPassword: (body: any) =>
    secureFetch({
      url: auth?.setPassword(),
      method: "POST",
      body,
    }),

  secureUserLogin: (body: any) =>
    secureFetch({
      url: auth?.customerLogin(),
      method: "POST",
      body,
    }),

  secureUserLoginV2: (body: any) =>
    secureFetch({
      url: auth?.customerLoginV2(),
      method: "POST",
      body,
    }),

  secureGetLogin: (body: any) =>
    secureFetch({
      url: auth?.getLogin(),
      method: "POST",
      body,
    }),

  secureSetLogin: (body: any) =>
    secureFetch({
      url: auth?.setLogin(),
      method: "POST",
      body,
    }),

  secureSetLoginV2: (body: any) =>
    secureFetch({
      url: auth?.setLoginV2(),
      method: "POST",
      body,
    }),
    

  secureUploadImage: (body: any) =>
    secureFetch({
      url: auth?.uploadImage(),
      method: "PUT",
      body,
    }),

  secureCreateMpin: (body: any) =>
    secureFetch({
      url: auth?.createMpin(),
      method: "POST",
      body,
    }),

  secureGetMpinDetail: (body: any) =>
    secureFetch({
      url: auth?.getMpinDetail(),
      method: "POST",
      body,
    }),
};

export default authServices;
