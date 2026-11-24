import axiosInstance, { secureFetch } from "../apiClient/apiClient";
import eligibilityCheckDictionary from "../dictionary/eligibilityCheckDictionary";

// Body interfaces for requests
export interface GetUniversitiesBody {
  universityName?: string;
  countryId: string;
}

export interface GetInstitutesBody {
  instituteName?: string;
  universityId: string;
  countryId: string;
}

export interface GetCoursesBody {
  courseName?: string;
  instituteId: string;
}

const eligibilityCheckServices = {
  getForm: (body: any) =>
    axiosInstance.post(eligibilityCheckDictionary.getForm(), body),
  getCourses: (body: GetCoursesBody) =>
    axiosInstance.post(eligibilityCheckDictionary.getCourses(), body),
  getCountries: () =>
    axiosInstance.get(eligibilityCheckDictionary.getCountries()),
  getUniversities: (body: GetUniversitiesBody) =>
    axiosInstance.post(eligibilityCheckDictionary.getUniversities(), body),
  getInstitutes: (body: GetInstitutesBody) =>
    axiosInstance.post(eligibilityCheckDictionary.getInstitutes(), body),
  getSalutations: () =>
    axiosInstance.get(eligibilityCheckDictionary.getSalutations()),
  getSystemValues: () =>
    axiosInstance.get(eligibilityCheckDictionary.getSystemValues()),
  getProducts: () =>
    axiosInstance.post(eligibilityCheckDictionary.getProducts()),
  getMasters: () => axiosInstance.post(eligibilityCheckDictionary.getMasters()),
  getApplicantDetails: (payload: any) =>
    axiosInstance.get(eligibilityCheckDictionary.getApplicantDetails(payload)),
  dedupeCheck: (payload: { mobileNumber: string; courseName: string }) =>
    axiosInstance.post(eligibilityCheckDictionary.dedupeCheck(), payload),
  captureFormData: (payload: { formData: any; submissionTrackingId: string }) =>
    axiosInstance.post(eligibilityCheckDictionary.captureFormData(), payload),
  // sendOtp: (payload: {
  //   name: string;
  //   mobileNumber?: string;
  //   email?: string;
  // }) => {
  //   console.log("payload in service>>>", payload);
  //   return axiosInstance.post(eligibilityCheckDictionary.sendOtp(), payload);
  // },
  sendOtp: (payload) =>
    secureFetch({
      url: eligibilityCheckDictionary.sendOtp(),
      method: "POST",
      body: payload,
    }),
  // verifyOtp: (payload: {
  //   mobileNumber?: string;
  //   email?: string;
  //   key: string;
  //   mobileOtp?: string;
  //   mobileOtpCrtdAt?: string;
  //   emailOtp?: string;
  //   emailOtpCrtdAt?: string;
  //   type: "mobile" | "email";
  // }) => {
  //   const { type, ...rest } = payload;
  //   return axiosInstance.post(eligibilityCheckDictionary.verifyOtp(type), rest);
  // },
  verifyOtp: (payload: {
    mobileNumber?: string;
    email?: string;
    key: string;
    mobileOtp?: string;
    mobileOtpCrtdAt?: string;
    emailOtp?: string;
    emailOtpCrtdAt?: string;
    type: "mobile" | "email";
  }) => {
    const { type, ...rest } = payload;
    return secureFetch({
      url: eligibilityCheckDictionary.verifyOtp(type),
      method: "POST",
      body: rest,
    });
  },
  checkOffer: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.checkOffer(), payload),
  createPartnerLead: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.createPartnerLead(), payload),
  leadAllocation: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.leadAllocation(), payload),
  getDocumentCategoriesApi: () =>
    axiosInstance.get(eligibilityCheckDictionary.getDocumentCategories()),
  partnerGetLeadDetailsApi: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.partnerGetLeadDetails(),
      payload
    ),
  getMandatoryDocuments: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.getMandatoryDocuments(),
      payload
    ),
  getDocuments: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.getDocuments(), payload),
  getViewMandatoryDocuments: (payload: any) =>
    axiosInstance.get(
      eligibilityCheckDictionary.getViewMandatoryDocuments(payload)
    ),
  uploadDocument: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.uploadDocument(), payload),
  getDocumentList: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.getDocumentList(), payload),

  createOtherDocumentApi: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.createOtherDocument(),
      payload
    ),

  previewDocument: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.previewDocument(), payload),
  downloadDocument: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.downloadDocument(), payload),
  previewAggregateDocument: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.previewAggregateDocument(),
      payload
    ),

  addMoreDocument: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.addMoreDocument(), payload),
  getViewBulkDocuments: (trackingId: any) =>
    axiosInstance.get(
      eligibilityCheckDictionary.getViewBulkDocuments(trackingId)
    ),
  uploadBulkDocuments: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.uploadBulkDocuments(),
      payload
    ),
  deleteUserDocument: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.deleteUserDocument(),
      payload
    ),
  triggerLinkToCollectDocuments: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.triggerLinkToCollectDocuments(),
      payload
    ),
  accountAggregatorRequest: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.accountAggregatorRequest(),
      payload
    ),
  accountAggregatorRequestConsent: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.accountAggregatorRequestConsent(),
      payload
    ),

  fetchBreApi: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.fetchBre(), payload),

  checkOfferProvisional: (payload: any) =>
    axiosInstance.post(
      eligibilityCheckDictionary.checkOfferProvisional(),
      payload
    ),

  getPinCode: (zipCode: string) =>
    axiosInstance.get(eligibilityCheckDictionary.getPinCode(zipCode)),
  getZipCode: (zipCode: string) =>
    axiosInstance.get(eligibilityCheckDictionary.getZipCode(zipCode)),
  getState: (stateCode: string) =>
    axiosInstance.get(eligibilityCheckDictionary.getState(stateCode)),
  getCity: (cityCode: string) =>
    axiosInstance.get(eligibilityCheckDictionary.getCity(cityCode)),

  getEntranceExamMaster: () =>
    axiosInstance.get(eligibilityCheckDictionary.getEntranceExamMaster()),
  pushDocument: (payload: any) =>
    axiosInstance.post(eligibilityCheckDictionary.pushDocument(), payload),
  bulkDocumentCount: (payload: { trackingId: string }) =>
    axiosInstance.post(eligibilityCheckDictionary.bulkDocumentCount(), payload),
};

export default eligibilityCheckServices;
