/**
 * Development Logger Utility
 *
 * This utility provides logging functions that only work in development environment.
 * In production builds, all log statements are stripped out to improve performance
 * and avoid exposing sensitive information.
 *
 * Usage:
 * import { logger } from '../utils/logger';
 *
 * logger.log('Simple message');
 * logger.info('Info message', data);
 * logger.warn('Warning message', error);
 * logger.error('Error occurred', errorObject);
 * logger.debug('Debug info', debugData);
 */

interface LoggerInterface {
  log: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
  table: (data: any) => void;
  group: (label: string) => void;
  groupEnd: () => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

/**
 * Creates a formatted timestamp for logs
 */
const getTimestamp = (): string => {
  const now = new Date();
  return (
    now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) +
    "." +
    now.getMilliseconds().toString().padStart(3, "0")
  );
};

/**
 * Formats log message with timestamp and level
 */
const formatMessage = (level: string, message: string): string => {
  return `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
};

/**
 * Development-only logger
 * All methods are no-ops in production builds
 */
const createLogger = (): LoggerInterface => {
  if (false) {
  // if (__DEV__) {
    return {
      /**
       * General purpose logging
       */
      log: (message: string, ...args: any[]) => {
        console.log(formatMessage("LOG", message), ...args);
      },

      /**
       * Information logging
       */
      info: (message: string, ...args: any[]) => {
        console.info(formatMessage("INFO", message), ...args);
      },

      /**
       * Warning logging
       */
      warn: (message: string, ...args: any[]) => {
        console.warn(formatMessage("WARN", message), ...args);
      },

      /**
       * Error logging
       */
      error: (message: string, ...args: any[]) => {
        console.error(formatMessage("ERROR", message), ...args);
      },

      /**
       * Debug logging (most verbose)
       */
      debug: (message: string, ...args: any[]) => {
        console.debug(formatMessage("DEBUG", message), ...args);
      },

      /**
       * Table logging for objects/arrays
       */
      table: (data: any) => {
        console.log(formatMessage("TABLE", "Data:"));
        console.table(data);
      },

      /**
       * Group logging start
       */
      group: (label: string) => {
        console.group(formatMessage("GROUP", label));
      },

      /**
       * Group logging end
       */
      groupEnd: () => {
        console.groupEnd();
      },

      /**
       * Start timing
       */
      time: (label: string) => {
        console.time(label);
      },

      /**
       * End timing
       */
      timeEnd: (label: string) => {
        console.timeEnd(label);
      },
    };
  } else {
    // Production build - all methods are no-ops
    return {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      table: () => {},
      group: () => {},
      groupEnd: () => {},
      time: () => {},
      timeEnd: () => {},
    };
  }
};

/**
 * Logger instance
 */
export const logger = createLogger();

/**
 * Specific loggers for different modules/screens
 */
export const createModuleLogger = (moduleName: string) => {
  const moduleLogger = createLogger();

  if (__DEV__) {
    return {
      log: (message: string, ...args: any[]) =>
        moduleLogger.log(`[${moduleName}] ${message}`, ...args),
      info: (message: string, ...args: any[]) =>
        moduleLogger.info(`[${moduleName}] ${message}`, ...args),
      warn: (message: string, ...args: any[]) =>
        moduleLogger.warn(`[${moduleName}] ${message}`, ...args),
      error: (message: string, ...args: any[]) =>
        moduleLogger.error(`[${moduleName}] ${message}`, ...args),
      debug: (message: string, ...args: any[]) =>
        moduleLogger.debug(`[${moduleName}] ${message}`, ...args),
      table: moduleLogger.table,
      group: (label: string) => moduleLogger.group(`[${moduleName}] ${label}`),
      groupEnd: moduleLogger.groupEnd,
      time: moduleLogger.time,
      timeEnd: moduleLogger.timeEnd,
    };
  } else {
    return moduleLogger;
  }
};

/**
 * Pre-configured loggers for common modules
 */
export const authLogger = createModuleLogger("AUTH");
export const apiLogger = createModuleLogger("API");
export const navigationLogger = createModuleLogger("NAVIGATION");
export const reduxLogger = createModuleLogger("REDUX");

/**
 * Network request logger
 */
export const logNetworkRequest = (
  method: string,
  url: string,
  payload?: any,
  response?: any,
  error?: any
) => {
  if (__DEV__) {
    apiLogger.group(`${method.toUpperCase()} ${url}`);

    if (payload) {
      apiLogger.info("Request Payload:", payload);
    }

    if (response) {
      apiLogger.info("Response:", response);
    }

    if (error) {
      apiLogger.error("Error:", error);
    }

    apiLogger.groupEnd();
  }
};

/**
 * Performance timing logger
 */
export const performanceLogger = {
  start: (operation: string) => {
    if (__DEV__) {
      logger.time(`Performance: ${operation}`);
    }
  },
  end: (operation: string) => {
    if (__DEV__) {
      logger.timeEnd(`Performance: ${operation}`);
    }
  },
};

export default logger;
