import { getCrashlytics, log, crash, recordError, setUserId, setAttribute } from '@react-native-firebase/crashlytics';
import app from '@react-native-firebase/app';

const crashlytics = getCrashlytics(app());

export const logMessage = (message: string) => {
  log(crashlytics, message);
  crash(crashlytics);
};

export const logError = (error: Error, context?: string) => {
  if (context) log(crashlytics, `Context: ${context}`);
  recordError(crashlytics, error);
};

export const setCrashUserId = (userId: string) => {
  setUserId(crashlytics, userId);
};

export const setCrashAttribute = (key: string, value: string) => {
  setAttribute(crashlytics, key, value);
};
