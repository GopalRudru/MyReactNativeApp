const authDictionary = {
  sendOtp: () => `api/v1/user/send-otp`,
  sendRegisterOtp: () => `api/v1/onboarding/signup-otp`,
  reSendRegisterOtp: () => `api/v1/onboarding/resend-signup-otp`,
  verifyOtp: () => `api/v1/user/otp-verify`,
  verifyRegisterOtp: () => `api/v1/onboarding/signup-otp/verify`,
  signupOnboard: () => `api/v1/onboarding/signup-onboard`,
  setPassword: () => `api/v1/user/set-password`,
  customerLogin: () => `api/v1/user/customer-login`,
  customerLoginV2: () => `api/v2/user/customer-login`,
  registerNewUser: () => `api/v1/auth/register`,
  getLogin: () => `api/v1/user/get-auth`,
  setLogin: () => `api/v1/user/loan-type-permission`,
  setLoginV2: () => `api/v2/user/loan-type-permission`,
  uploadImage: () => `api/v1/user/upload-image`,
  createMpin: () => `api/v2/user/mpin/setup`,
  getMpinDetail: () => `api/v2/user/mpin/records`,
};

export default authDictionary;
