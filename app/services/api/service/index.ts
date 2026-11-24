import postsServices from "./postsService";
import notificationsServices from "./notificationService";
// import userProfileServices from "./userProfileService";
import authServices from "./authService";
import documentsServices from "./documentService";
import customerJourneyService from "./customerJourneyService";

const service = {
  auth: authServices,
  posts: postsServices,
  notifications: notificationsServices,
  // profile: userProfileServices,
  docs: documentsServices,
  customerJourney: customerJourneyService,
};

export default service;
