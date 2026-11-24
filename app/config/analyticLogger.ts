// firebaseAnalytics.ts
import analytics from "@react-native-firebase/analytics";

export const initFirebaseAnalytics = async (userId?: string) => {
  if (userId) {
    await analytics().setUserId(userId); // ✅ Set User ID globally
    await analytics().setUserProperty("custom_user_id", userId);
  }
};

export const trackEvent = async (
  eventName: string,
  userId?: string,
  params?: Record<string, any>
) => {
  // Optional: attach userId to every event parameter
  const eventParams = {
    ...(params || {}),
    ...(userId ? { user_id: userId } : {}),
  };

  await analytics().logEvent(eventName, eventParams);
};
