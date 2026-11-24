import { Platform, BackHandler } from 'react-native';
import { createModuleLogger } from '../utils/logger';
import { store } from '../services/redux/store';
import { setStatusPopup } from '../services/redux/slices/statusPopupSlice';
import { setItem, SECURITY_THREAT_KEY } from '../utils/storageUtils';
import { STATUS_TYPES } from '../components/common/DialogStatusPopup';
import { getPlatformTiming } from './iOSOptimizations';

const logger = createModuleLogger('threatHandlers');

// Track if a security popup is already shown to prevent multiple popups
let isSecurityPopupShown = false;

// Reference to the FreeRaspManager (will be set when needed)
let freeRaspManagerRef: any = null;

// Function to set the FreeRaspManager reference
export const setFreeRaspManagerRef = (manager: any) => {
  freeRaspManagerRef = manager;
};

// Function to reset the security popup flag (for re-initialization)
export const resetSecurityPopupFlag = () => {
  isSecurityPopupShown = false;
  logger.log('🔄 Security popup flag reset - new alerts can now be shown');
};

// Function to check if security popup is currently shown
export const isSecurityPopupCurrentlyShown = () => {
  return isSecurityPopupShown;
};

// Centralized threat handler with configuration-based controls
export const handleThreat = async (threatType: string, message: string, alertTitle: string = 'Security Alert') => {
  // Track this threat for re-triggering on foreground
  freeRaspManagerRef?.trackThreat?.(threatType);
  
  // Prevent multiple security popups from opening
  if (isSecurityPopupShown) {
    logger.log(`🔒 Security popup already shown, skipping: ${threatType}`);
    return;
  }
  isSecurityPopupShown = true;
  
  // Persist security threat for app restart scenarios
  try {
    await setItem(SECURITY_THREAT_KEY, JSON.stringify({
      type: threatType,
      message: message,
      timestamp: Date.now()
    }));
    logger.log(`💾 Persisted security threat: ${threatType}`);
  } catch (error) {
    logger.error('Failed to persist security threat:', error);
  }
  
  showSecurityPopup(message);
};

// Method to show security popup with exit functionality
export const showSecurityPopup = (message: string) => {
  isSecurityPopupShown = true;
  store.dispatch(
    setStatusPopup({
      status: STATUS_TYPES.SECURITY_WARNING,
      message: message,
      showLeftCross: false,
      positiveButtonText: Platform.OS === "android" ? "Exit" : "Ok",
      onPositivePress: async () => {
        // Only reset the popup flag but keep the persistent threat
        // This ensures the security popup will show again on app restart
        isSecurityPopupShown = false;
        logger.log(`🔒 Security popup dismissed, threat persists for next app launch`);
        
        // Platform-specific delay - iOS needs more time for proper cleanup
        const cleanupDelay = getPlatformTiming('securityPopupCleanupDelay');
        setTimeout(() => {
          if (Platform.OS === "android") {
            BackHandler.exitApp();
          } else {
            // For iOS, we cannot forcefully exit the app as Apple Store guidelines prohibit it
            // Instead, we disable app functionality and show a persistent security message
            logger.log('🍎 iOS Security Alert: App functionality disabled due to security threat');
            // Keep the security popup persistent - user must manually close the app
            // This is App Store compliant as we're not forcefully terminating
            showSecurityPopup('For security reasons, please manually close this app and download the official version from the App Store. This app cannot continue due to security violations.');
          }
        }, cleanupDelay);
      },
    })
  );
};

// Factory function to create threat actions with security config
export const createThreatActions = (securityConfig: any) => {
  return {
    // Root/Jailbreak detection
    privilegedAccess: () => {
      if (!securityConfig.enableRootJailbreakDetection) return;
      logger.log('🚨 CRITICAL: Privileged access detected!', { threatType: 'privilegedAccess', severity: 'critical' });
      handleThreat('privilegedAccess', 'Your device has been rooted or jailbroken! For the security of your financial data, this app cannot run on modified devices. Please use an unmodified device to access your account safely.');
    },
    
    // Debugger detection
    debug: () => {
      if (!securityConfig.enableDebuggerDetection) return;
      logger.log('🐛 DEBUG DETECTED: Debug mode detected!', { threatType: 'debug', severity: 'high' });
      handleThreat('debug', 'Debug mode detected! For security reasons, this app cannot run while debugging tools are active. Please disconnect any debugging tools and restart the app.');
    },
    
    // Simulator/Emulator detection
    simulator: () => {
      if (!securityConfig.enableSimulatorDetection) return;
      logger.log('📱 SIMULATOR: App is running on simulator/emulator environment', { threatType: 'simulator', severity: 'medium' });
      handleThreat('simulator', 'This app cannot run on simulators or emulators! For the security of your financial data, please use a real physical device to access your account. Simulators and emulators lack the security features required for safe banking.', 'Security Warning');
    },
    
    // App integrity verification
    appIntegrity: () => {
      if (!securityConfig.enableAppIntegrityCheck) return;
      logger.log('🔒 INTEGRITY VIOLATION: App integrity check failed!', { threatType: 'appIntegrity', severity: 'critical' });
      handleThreat('appIntegrity', 'App integrity verification failed! The app has been modified or tampered with. For your security, please download the official app from the official app store.');
    },
    
    
    // Store verification
    unofficialStore: () => {
      if (!securityConfig.enableStoreVerification) return;
      logger.log('🏪 UNOFFICIAL STORE: App installed from unofficial store!', { threatType: 'unofficialStore', severity: 'high' });
      handleThreat('unofficialStore', 'This app was installed from an unofficial source! For your security and to ensure you have the authentic app, please download it from the official Google Play Store or Apple App Store.');
    },
    
    // Runtime manipulation detection
    hooks: () => {
      if (!securityConfig.enableRuntimeManipulationDetection) return;
      logger.log('🎣 CRITICAL: Runtime manipulation detected! Possible SSL bypass attempt!', { 
        threatType: 'hooks', 
        severity: 'critical',
        possibleBypass: 'SSL_PINNING_BYPASS'
      });
      // Fire and forget - don't await to avoid delays
      handleThreat('hooks', 'Security violation detected! The app has detected runtime manipulation which could indicate an SSL pinning bypass attempt. The app will close for security reasons.');
    },
    
    // Device security checks - Passcode
    passcode: () => {
      if (!securityConfig.enableDeviceSecurityChecks) return;
      logger.log('🔐 DEVICE SECURITY: Device passcode not set!', { threatType: 'passcode', severity: 'medium' });
      handleThreat('passcode', 'Your device does not have a screen lock or passcode set! For enhanced security of your financial data, please set up a secure screen lock (PIN, password, pattern, or biometric) in your device settings and restart the app.');
    },
    
    // Developer mode detection
    devMode: () => {
      if (!securityConfig.enableDeveloperModeDetection) return;
      logger.log('👨‍💻 DEVELOPER MODE: Developer mode enabled!', { threatType: 'devMode', severity: 'medium' });
      handleThreat('devMode', 'Developer options are enabled on your device! For security reasons, this app cannot run with developer options active. Please disable developer options in your device settings and restart the app.');
    },
    
    // VPN detection
    systemVPN: () => {
      if (!securityConfig.enableVPNDetection) return;
      logger.log('🌐 VPN DETECTED: System VPN detected!', { threatType: 'systemVPN', severity: 'low' });
      handleThreat('systemVPN', 'A VPN connection is active on your device! For optimal security and app performance, please disconnect your VPN and try again. Some banking features may not work properly with VPN connections.');
    },
    
    // Device binding checks
    deviceBinding: () => {
      if (!securityConfig.enableDeviceBindingChecks) return;
      logger.log('📱 DEVICE BINDING: Device binding issue detected!', { threatType: 'deviceBinding', severity: 'high' });
      handleThreat('deviceBinding', 'Device security verification failed! This app is designed to work with specific authorized devices. Please contact customer support if you believe this is an error, or reinstall the app from the official app store.');
    },
    
    // Device ID checks
    deviceID: () => {
      if (!securityConfig.enableDeviceBindingChecks) return;
      logger.log('🆔 DEVICE ID: Device ID issue detected!', { threatType: 'deviceID', severity: 'high' });
      handleThreat('deviceID', 'Device identification verification failed! Your device could not be properly identified for security purposes. Please restart your device and try again, or contact customer support for assistance.');
    },
    
    // Secure hardware checks
    secureHardwareNotAvailable: () => {
      if (!securityConfig.enableSecureHardwareChecks) return;
      logger.log('🔧 HARDWARE SECURITY: Secure hardware not available!', { threatType: 'secureHardwareNotAvailable', severity: 'medium' });
      handleThreat('secureHardwareNotAvailable', 'Your device does not support advanced hardware security features required by this app! This may affect the security of your financial transactions. Please ensure your device meets the minimum security requirements or contact customer support.');
    },
    
    // Obfuscation verification
    obfuscationIssues: () => {
      if (!securityConfig.enableObfuscationChecks) return;
      logger.log('🔀 OBFUSCATION: Obfuscation issues detected!', { threatType: 'obfuscationIssues', severity: 'medium' });
      handleThreat('obfuscationIssues', 'App security verification failed! The app\'s security protections may have been compromised or modified. For your safety, please download the official app from the authorized app store and avoid using modified versions.');
    },

    // ============================================================
    // freeRASP 4.x threat types (new in 4.2.4).
    // freeRASP requires a listener for every threat it reports, so these must
    // exist. They are log-only by default - see securityConfig.ts. Enabling any
    // of them makes it block the user, so decide the policy per threat first.
    // ============================================================

    // ADB / USB debugging enabled
    adbEnabled: () => {
      logger.log('🔌 ADB: USB debugging is enabled on this device', { threatType: 'adbEnabled', severity: 'medium' });
      if (!securityConfig.enableAdbDetection) return;
      handleThreat('adbEnabled', 'USB debugging is enabled on your device! For the security of your financial data, please disable USB debugging in your device settings and restart the app.');
    },

    // Malware detected among installed apps
    malware: () => {
      logger.log('🦠 MALWARE: Malicious app detected on device', { threatType: 'malware', severity: 'critical' });
      if (!securityConfig.enableMalwareDetection) return;
      handleThreat('malware', 'A potentially malicious app was detected on your device! For the security of your financial data, please review and remove untrusted apps, then restart the app.');
    },

    // App running as a cloned / multi-instance copy
    multiInstance: () => {
      logger.log('👥 MULTI-INSTANCE: App is running as a cloned instance', { threatType: 'multiInstance', severity: 'high' });
      if (!securityConfig.enableMultiInstanceDetection) return;
      handleThreat('multiInstance', 'This app is running as a cloned copy! For your security, please use the original app installed from the official app store.');
    },

    // Screen recording in progress
    screenRecording: () => {
      logger.log('🎥 SCREEN RECORDING: Screen recording detected', { threatType: 'screenRecording', severity: 'medium' });
      if (!securityConfig.enableScreenRecordingDetection) return;
      handleThreat('screenRecording', 'Screen recording is active! For the protection of your financial information, please stop screen recording to continue.');
    },

    // Screenshot taken
    screenshot: () => {
      logger.log('📸 SCREENSHOT: Screenshot captured', { threatType: 'screenshot', severity: 'low' });
      if (!securityConfig.enableScreenshotDetection) return;
      handleThreat('screenshot', 'A screenshot was captured! Please be careful when sharing images that contain your financial information.');
    }
  };
};
