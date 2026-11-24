// Security Configuration for FreeRASP
// Set each flag to true/false to enable/disable specific security features

import { Platform } from 'react-native';

export const securityFeatures = {
  // ============================
  // CORE SECURITY FEATURES
  // ============================
  
  // Root/Jailbreak Detection
  // Detects if the device is rooted (Android) or jailbroken (iOS)
  enableRootJailbreakDetection: true,
  
  // Debugger Detection
  // Detects if debugging tools are attached to the app
  enableDebuggerDetection: true,
  
  // App Integrity Verification
  // Verifies that the app hasn't been tampered with or modified
  enableAppIntegrityCheck: true,
  
  // Runtime Manipulation Detection
  // Detects runtime hooks, code injection, and other manipulation attempts
  enableRuntimeManipulationDetection: true,


  
  // ============================
  // DEVICE SECURITY CHECKS
  // ============================
  
  // Device Security Checks
  // Checks device security settings like passcode, lock screen, etc.
  enableDeviceSecurityChecks: false,
  
  // Simulator/Emulator Detection
  // Detects if the app is running on an emulator or simulator
  enableSimulatorDetection: false,
  
  // Developer Mode Detection
  // Detects if developer options are enabled on the device
  enableDeveloperModeDetection: true,


  
  // ============================
  // ADVANCED SECURITY FEATURES
  // ============================
  
  // Store Verification
  // Verifies that the app was installed from an official app store
  enableStoreVerification: true,
  
  // VPN Detection
  // Detects if a VPN is active on the device
  enableVPNDetection: true,
  
  // Device Binding Checks
  // Ensures the app is running on the intended device
  enableDeviceBindingChecks: false,
  
  // Secure Hardware Checks
  // Verifies that secure hardware features are available and functioning
  enableSecureHardwareChecks: false,
  
  // Obfuscation Verification
  // Checks if app obfuscation is intact and hasn't been bypassed
  enableObfuscationChecks: false,

  // ============================
  // freeRASP 4.x THREAT TYPES
  // ============================
  // Added in freeRASP 4.2.4. All default to false = detected and logged, but NOT
  // blocking, so upgrading introduces no new user-facing lockouts. Turn on only
  // after deciding the policy for each - see notes on each flag.

  // ADB / USB debugging enabled on the device.
  // NOTE: many ordinary users leave USB debugging on. Blocking on this will lock
  // out legitimate customers. Recommend leaving false.
  enableAdbDetection: false,

  // Malware detected among installed apps.
  // Requires malwareConfig (blacklistedPackageNames / suspiciousPermissions) in
  // freeRaspConfig.androidConfig, otherwise this never fires.
  enableMalwareDetection: false,

  // App is running as a cloned/multi-instance copy.
  enableMultiInstanceDetection: false,

  // Screen is being recorded.
  // NOTE: fires during normal use. Blocking here is user-hostile; log instead.
  enableScreenRecordingDetection: false,

  // A screenshot was taken.
  // NOTE: fires whenever a customer screenshots a statement. Blocking here is
  // user-hostile; log instead.
  enableScreenshotDetection: false,


  
  // ============================
  // LOGGING & RESPONSE SETTINGS
  // ============================
  
  // Threat Logging and Response Handling
  // Master switch for all threat logging and response actions
  enableThreatLogging: true,
  
  // Alert Dialogs
  // Shows popup alerts when threats are detected
  enableAlertDialogs: true,
  
  // Console Logging
  // Logs threat information to console for debugging
  enableConsoleLogging: true,
};

// ============================
// ENVIRONMENT-BASED PRESETS
// ============================

// Development Environment (for testing - more permissive)
export const developmentConfig = {
  ...securityFeatures,
  enableSimulatorDetection: false,     // Allow emulators in dev
  enableDebuggerDetection: false,      // Allow debugging in dev
  enableDeveloperModeDetection: false, // Allow dev mode in dev
  enableAlertDialogs: true,            // Reduce interruptions in dev
  enableConsoleLogging: true,          // Keep logging for debugging
  enableStoreVerification: false,      // Allow unofficial stores in dev
  enableVPNDetection: false,            // Enable VPN detection in development
};

// Production Environment (strict security)
export const preProdConfig = {
  ...securityFeatures,
  enableSimulatorDetection: true,      // Block emulators in production
  enableDebuggerDetection: true,       // Block debugging in production
  enableDeveloperModeDetection: false, // Block dev mode in production
  enableAlertDialogs: true,            // Show alerts in production
  enableConsoleLogging: false,         // Reduce logging in production
  enableStoreVerification: false,      // Allow unofficial stores in production
  enableVPNDetection: false,            // Enable VPN detection in production
  enableObfuscationChecks: false,       // Enable obfuscation checks in production
  enableAppIntegrityCheck: true,        // Enable app integrity check in production
};

// Production Environment (strict security)
export const productionConfig = {
  ...securityFeatures,
  enableSimulatorDetection: false,      // Block emulators in production
  enableDebuggerDetection: false,       // Block debugging in production
  enableDeveloperModeDetection: false, // Block dev mode in production
  enableAlertDialogs: true,            // Show alerts in production
  enableConsoleLogging: false,         // Reduce logging in production
  enableStoreVerification: false,       // Allow unofficial stores in production
  enableVPNDetection: Platform.OS === 'ios',            // Enable VPN detection in production
  enableObfuscationChecks: false,      // Disable obfuscation checks in production
  enableAppIntegrityCheck: false,      // Disable app integrity check in production
};

// Production Security Testing Environment (strict security)
export const securityProductionConfig = {
  ...securityFeatures,
  enableSimulatorDetection: true,      // Block emulators in production
  enableDebuggerDetection: true,       // Block debugging in production
  enableDeveloperModeDetection: false, // Block dev mode in production
  enableAlertDialogs: true,            // Show alerts in production
  enableConsoleLogging: false,         // Reduce logging in production
  enableStoreVerification: false,      // Allow unofficial stores in production
  enableVPNDetection: false,            // Enable VPN detection in production
  enableObfuscationChecks: false,       // Enable obfuscation checks in production
};


// Testing Environment (for QA testing)
export const testingConfig = {
  ...securityFeatures,
  enableSimulatorDetection: false,     // Allow emulators for testing
  enableDebuggerDetection: false,      // Allow debugging for testing
  enableAlertDialogs: true,           // Reduce interruptions during testing
  enableConsoleLogging: true,          // Keep logging for test analysis
};

// Security Testing Environment (strict security for security testing)
export const securityTestingConfig = {
  ...securityFeatures,
  enableSimulatorDetection: false,      // Block emulators in security testing
  enableDebuggerDetection: false,       // Block debugging in security testing
  enableDeveloperModeDetection: true, // Block dev mode in security testing
  enableAlertDialogs: true,            // Show alerts in security testing
  enableConsoleLogging: true,         // Reduce logging in security testing
  enableStoreVerification: false,      // Allow unofficial stores in security testing
  enableVPNDetection: true,            // Enable VPN detection in security testing
  enableObfuscationChecks: true,      // Enable obfuscation checks in security testing
};

// Google Play Store Release Configuration
// Optimized for Google Play Store distribution with compatibility adjustments
export const storeReleaseConfig = {
  ...securityFeatures,
  enableSimulatorDetection: true,      // Block emulators in store release
  enableDebuggerDetection: true,       // Block debugging in store release
  enableDeveloperModeDetection: false, // Block dev mode in store release
  enableAlertDialogs: true,            // Show alerts in store release
  enableConsoleLogging: false,         // Reduce logging in store release
  enableStoreVerification: true,       // Enable store verification
  enableVPNDetection: true,            // Enable VPN detection in store release
  enableObfuscationChecks: false,      // Disabled for Google Play Store compatibility
  enableAppIntegrityCheck: false,      // Disabled to prevent Play Store processing issues
};

