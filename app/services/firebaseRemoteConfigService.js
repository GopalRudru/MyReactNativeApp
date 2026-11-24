import remoteConfig from '@react-native-firebase/remote-config';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('FirebaseRemoteConfigService');

class FirebaseRemoteConfigService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize Firebase Remote Config with default values and settings
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Set default values
      const defaultValues = {
        remote_cif: '',
      };

      await remoteConfig().setDefaults(defaultValues);

      // Set config settings
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 1000 * 60 * 3, // 3 minutes
        fetchTimeoutMillis: 60000, // 1 minute
      });

      this.isInitialized = true;
      logger.info('Firebase Remote Config initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase Remote Config:', error);
      throw error;
    }
  }

  /**
   * Fetch and activate remote config values
   * @returns {Promise<boolean>} - Returns true if fetch was successful
   */
  async fetchAndActivate() {
    try {
      await this.initialize();
      
      const fetchSuccess = await remoteConfig().fetchAndActivate();
      
      if (fetchSuccess) {
        logger.info('Remote config fetched and activated successfully');
        return true;
      } else {
        logger.info('Remote config fetch returned existing values');
        return false;
      }
    } catch (error) {
      logger.error('Failed to fetch remote config:', error);
      // Don't throw error, return false to allow app to continue with cached/default values
      return false;
    }
  }

  /**
   * Get a string value from remote config
   * @param {string} key - Config key
   * @returns {string} - Config value
   */
  getString(key) {
    try {
      return remoteConfig().getValue(key).asString();
    } catch (error) {
      logger.error(`Failed to get string value for key ${key}:`, error);
      return '';
    }
  }

  /**
   * Get a boolean value from remote config
   * @param {string} key - Config key
   * @returns {boolean} - Config value
   */
  getBoolean(key) {
    try {
      return remoteConfig().getValue(key).asBoolean();
    } catch (error) {
      logger.error(`Failed to get boolean value for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a number value from remote config
   * @param {string} key - Config key
   * @returns {number} - Config value
   */
  getNumber(key) {
    try {
      return remoteConfig().getValue(key).asNumber();
    } catch (error) {
      logger.error(`Failed to get number value for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get all remote config values as an object
   * @returns {Object} - All config values
   */
  getAllValues() {
    try {
      const allValues = remoteConfig().getAll();
      const configObject = {};
      
      Object.keys(allValues).forEach(key => {
        configObject[key] = {
          value: allValues[key].asString(),
          source: allValues[key].getSource(),
        };
      });
      
      return configObject;
    } catch (error) {
      logger.error('Failed to get all remote config values:', error);
      return {};
    }
  }

  /**
   * Get last fetch time
   * @returns {Date} - Last fetch time
   */
  getLastFetchTime() {
    try {
      return remoteConfig().lastFetchTime;
    } catch (error) {
      logger.error('Failed to get last fetch time:', error);
      return new Date(0);
    }
  }

  /**
   * Get fetch status
   * @returns {string} - Fetch status
   */
  getFetchStatus() {
    try {
      return remoteConfig().lastFetchStatus;
    } catch (error) {
      logger.error('Failed to get fetch status:', error);
      return 'no_fetch_yet';
    }
  }
}

// Export singleton instance
export default new FirebaseRemoteConfigService();
