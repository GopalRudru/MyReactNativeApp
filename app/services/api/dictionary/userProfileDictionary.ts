import { getQueryString } from "../../../utils/helpers";

const userProfileDictionary = {
  changeUserPassword: (userId: any) => {
    return `api/v1/user/update-user-profile`;
  },
  getProfileDetails: () => {
    return `api/v1/user/profile-details`;
  },
  changeUserMpin: () => {
    return `api/v2/user/mpin/change`;
  },
};

export default userProfileDictionary;
