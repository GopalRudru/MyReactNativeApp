import { 
  securityFeatures, 
  developmentConfig, 
  productionConfig, 
  securityProductionConfig,
  testingConfig,
  securityTestingConfig,
  preProdConfig,
  storeReleaseConfig,
} from './securityConfig';
import { createModuleLogger } from '../utils/logger';
import { 
  createThreatActions
} from './threatHandlers';

// Choose your environment configuration
// Change this to switch between different security profiles
const ENVIRONMENT = 'production'; // 'development' | 'production' | 'preProd' | 'testing' | 'securityTesting' | 'custom' | 'securityProduction'

// Security Configuration - Choose based on environment
const environmentConfigs = {
  development: developmentConfig,
  production: productionConfig,
  securityProduction: securityProductionConfig,
  preProd: preProdConfig,
  testing: testingConfig,
  securityTesting: securityTestingConfig,
  storeRelease: storeReleaseConfig,
  custom: securityFeatures
};

export const securityConfig = environmentConfigs[ENVIRONMENT] || securityFeatures;

const logger = createModuleLogger("freeRaspConfig");

// FreeRASP Configuration for version 4.2.4
export const freeRaspConfig = {
  androidConfig: {
    packageName: 'com.customermobapp.avanse',
    certificateHashes: [
      // Release certificate hash from avanseRelease.keystore
      // SHA256: 58:B4:FA:B6:E6:DB:0E:4B:9F:07:F2:AE:81:AD:11:54:4F:BF:64:D9:6B:12:20:A6:24:6C:B5:06:82:30:70:9B
      'WLT6tubbDkufB/Kuga0RVE+/ZNlrEiCmJGy1BoIwcJs=',
      // Debug certificate hash from debug.keystore (for development/testing)
      '+sYXRdwJA3hvue3mKpYrOZ9zSPC7b4mbgzJmdZEDO5w=',
      // Google Play Store certificate hash - 
      // SHA-256: 81:9B:C7:33:E3:CF:25:0D:C6:F7:09:27:90:21:3A:5E:50:C0:B8:7A:56:38:B9:AF:8D:76:3D:8E:40:AF:01:E2
      'gZvHM+PPJQ3G9wknkCE6XlDAuHpWOLmvjXY9jkCvAeI=',
    ],
    // Only support official Google Play Store (no alternative stores)
    supportedAlternativeStores: []
  },
  iosConfig: {
    appBundleId: 'com.customermobapp.avanse',
    appTeamId: 'WPSM2M8QKA'
    // iOS automatically only supports App Store (no configuration needed)
  },
  watcherMail: '',
  isProd: true
};

// Create threat actions using the factory function
export const threatActions = createThreatActions(securityConfig);

// Helper function to log security features status
const logSecurityFeatures = () => {
  if (!securityConfig.enableConsoleLogging) return;
  
  logger.log('🔐 Active Security Features:');
  logger.log(`  - Root/Jailbreak Detection: ${securityConfig.enableRootJailbreakDetection ? '✅' : '❌'}`);
  logger.log(`  - Debugger Detection: ${securityConfig.enableDebuggerDetection ? '✅' : '❌'}`);
  logger.log(`  - App Integrity Check: ${securityConfig.enableAppIntegrityCheck ? '✅' : '❌'}`);
  logger.log(`  - Runtime Manipulation Detection: ${securityConfig.enableRuntimeManipulationDetection ? '✅' : '❌'}`);
  logger.log(`  - Device Security Checks: ${securityConfig.enableDeviceSecurityChecks ? '✅' : '❌'}`);
  logger.log(`  - Simulator Detection: ${securityConfig.enableSimulatorDetection ? '✅' : '❌'}`);
  logger.log(`  - Store Verification: ${securityConfig.enableStoreVerification ? '✅' : '❌'}`);
  logger.log(`  - VPN Detection: ${securityConfig.enableVPNDetection ? '✅' : '❌'}`);
  logger.log(`  - Developer Mode Detection: ${securityConfig.enableDeveloperModeDetection ? '✅' : '❌'}`);
  logger.log(`  - Device Binding Checks: ${securityConfig.enableDeviceBindingChecks ? '✅' : '❌'}`);
  logger.log(`  - Secure Hardware Checks: ${securityConfig.enableSecureHardwareChecks ? '✅' : '❌'}`);
  logger.log(`  - Obfuscation Checks: ${securityConfig.enableObfuscationChecks ? '✅' : '❌'}`);
};

// Hook to initialize FreeRASP - now uses centralized FreeRaspManager
export { useFreeRaspSecurity, freeRaspManager } from './FreeRaspManager';

// Test function to manually trigger privileged access callback (for testing only)
export const testPrivilegedAccessCallback = () => {
  logger.log('🧪 TEST: Manually triggering privileged access callback');
  threatActions.privilegedAccess();
};