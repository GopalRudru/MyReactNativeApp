const eligibilityCheckDictionary = {
  getForm: () => `api/v1/product/get-data`,
  getCourses: () => "api/v1/user-course/get-courses",
  //getCountries: () => "api/v1/user-course/get-countries",
  getCountries: () => "api/v1/master/countries",
  getUniversities: () => "api/v1/user-course/get-universities",
  getInstitutes: () => "api/v1/user-course/get-institutes",
  getMasters: () => "api/v1/user-course/get-master-data",
  getApplicantDetails: (payload: any) =>
    `api/v1/account-aggregator/consent-numbers?trackingId=${payload?.trackingId}`,
  getProducts: () => "api/v1/user-course/get-products",
  dedupeCheck: () => "api/v1/user-course/dedupe-check",
  captureFormData: () => "api/v1/user-course/capture",
  sendOtp: () => "api/v1/user-lead/send-otp",
  verifyOtp: (type: "mobile" | "email") =>
    `api/v1/user-lead/verify-otp/${type}`,
  checkOffer: () => "api/v1/user-lead/check-eligibility",
  createPartnerLead: () => "api/v1/user-lead/create-lead",
  leadAllocation: () => "api/v1/user-lead/assign-sm",
  partnerGetLeadDetails: () => "api/v1/partner/get-lead-details",
  getMandatoryDocuments: () =>
    `api/v1/journey-master-document/mandatory-documents`,
  getDocuments: () => `api/v1/partner/get-documents`,
  getDocumentCategories: () => `api/v1/journey-master-document/get-categories`,
  getDocumentList: () => `api/v1/journey-master-document/list`,

  createOtherDocument: () => `api/v1/journey-master-document/create`,

  getViewMandatoryDocuments: (payload: any) =>
    `api/v1/journey-master-document/mandatory-documents?trackingId=${payload?.trackingId}`,
  uploadDocument: () => `api/v1/documents/upload`,
  previewDocument: () => `api/v1/applicant/preview-doc`,
  downloadDocument: () => `api/v1/partner/download-document`,
  previewAggregateDocument: () => `api/v1/account-aggregator/preview-doc`,

  addMoreDocument: () => `api/v1/journey-master-document/add-user-document`,
  getViewBulkDocuments: (trackingId: any) =>
    `api/v1/documents/bulk-uploaded-documents?trackingId=${trackingId}`,
  uploadBulkDocuments: () => `api/v1/documents/bulk-upload`,
  deleteUserDocument: () => `api/v1/documents/delete-docs`,
  triggerLinkToCollectDocuments: () => `api/v1/kyc/send-link`,

  accountAggregatorRequest: () => `api/v1/account-aggregator/consent-request`,
  accountAggregatorRequestConsent: () =>
    `api/v1/account-aggregator/application-details`,

  fetchBre: () => "api/v1/user-lead/fetch-bre",
  checkOfferProvisional: () => "api/v1/user-lead/check-offer",
  getPinCode: (zipCode: string) => `api/v1/master/pincodes?pinCode=${zipCode}`,
  getZipCode: (zipCode: string) =>
    `api/v1/location/zipcodes?zipCode=${zipCode}`,
  //getZipCode: (zipCode: string) => `api/v1/master/pincodes?pinCode=${zipCode}`,
  getState: (stateCode: string) =>
    `api/v1/location/states?stateCode=${stateCode}`,
  getCity: (cityCode: string) => `api/v1/master/cities?cityCode=${cityCode}`,
  getSalutations: () => `api/v1/master/salutations`,
  getSystemValues: () => `api/v1/master/system-values`,
  // getZipCode: (zipCode: string) =>
  //   `api/v1/location/zipcodes?zipCode=${zipCode}`,
  // getState: (stateCode: string) =>
  //   `api/v1/location/states?stateCode=${stateCode}`,
  // getCity: (cityCode: string) => `api/v1/location/cities?stateCode=${cityCode}`,

  getEntranceExamMaster: () => `api/v1/master/entrance-exam-master`,
  pushDocument: () => `api/v1/processio/push-document`,
  bulkDocumentCount: () => `api/v1/documents/bulk-document-count`,
};

export default eligibilityCheckDictionary;
