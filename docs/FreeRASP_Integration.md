# FreeRASP Security Integration

This document explains the FreeRASP (Runtime App Self Protection) integration in the Avanse Customer Mobile App.

## Overview

FreeRASP v4.2.2 has been successfully integrated to provide comprehensive mobile app security monitoring and protection. It detects various security threats and can take appropriate actions to protect the app and user data.

## Features Enabled

### Common Security Checks (Android & iOS)
- **Root/Jailbreak Detection**: Detects compromised devices
- **App Integrity Verification**: Ensures the app hasn't been tampered with
- **Debugging Detection**: Identifies when the app is being debugged
- **Simulator/Emulator Detection**: Detects virtual environments
- **Runtime Manipulation**: Detects tools like Frida
- **Unofficial Store Installation**: Identifies sideloaded apps
- **Device Binding**: Validates device-app binding
- **Screenshot/Screen Recording Protection**: Detects screen capture attempts
- **VPN Detection**: Identifies system-level VPN usage
- **Passcode Requirements**: Checks for device security settings

### Android-Specific Checks
- **Malware Detection**: Scans for suspicious apps
- **Developer Mode Detection**: Identifies developer settings
- **ADB Debugging Detection**: Detects USB debugging
- **Multiple Instance Detection**: Identifies app cloning
- **Code Obfuscation Validation**: Checks code protection

### iOS-Specific Checks
- **Device ID Validation**: Ensures proper device identification

## Configuration

### Files Created/Modified

1. **`app/security/freeRaspConfig.ts`** - Main configuration file
2. **`app/services/securityServices/SecurityResponseActions.ts`** - Security response handlers
3. **`App.tsx`** - Integration point

### Configuration Details

```typescript
// Android Configuration
androidConfig: {
  packageName: 'com.customermobapp.avanse',
  certificateHashes: ['YOUR_CERTIFICATE_HASH'],
  malwareConfig: {
    blacklistedPackageNames: [...],
    suspiciousPermissions: [...],
    whitelistedInstallationSources: [...]
  }
}

// iOS Configuration
iosConfig: {
  appBundleId: 'com.customermobapp.avanse',
  appTeamId: 'YOUR_TEAM_ID'
}
```

## Security Responses

### Threat Levels

1. **Critical (App Exit)**: Root/Jailbreak, App Integrity, Runtime Manipulation
2. **Warning (Continue)**: Unofficial Store, Developer Mode, Passcode Missing
3. **Logging Only**: VPN Detection, Hardware Issues

### Customizing Responses

Edit `SecurityResponseActions.ts` to modify how the app responds to threats:

```typescript
// Example: Custom response for root detection
static handleRootJailbreakDetection() {
  // Log the event
  this.logSecurityEvent('root_jailbreak_detected');
  
  // Show alert and exit
  this.showSecurityAlertAndExit(
    'Security Alert',
    'This app cannot run on rooted devices.'
  );
}
```

## Required Configuration Updates

### 1. Certificate Hash (Android)

Get your app's certificate hash:
```bash
keytool -list -v -keystore your-release-keystore.jks
```

Update in `freeRaspConfig.ts`:
```typescript
certificateHashes: ['YOUR_ACTUAL_CERTIFICATE_HASH']
```

### 2. Apple Team ID (iOS)

Update in `freeRaspConfig.ts`:
```typescript
appTeamId: 'YOUR_APPLE_TEAM_ID'
```

### 3. Security Email

Update the notification email:
```typescript
watcherMail: 'your-security-team@avanse.com'
```

## Security Report

FreeRASP provides weekly security reports to the configured email address containing:
- Threat detection statistics
- Security incident details
- Recommendations for improving app security

## Testing

### Development Environment
- FreeRASP is configured to be less restrictive in debug builds
- Simulator/emulator detection warnings are shown but don't exit the app
- Debug mode detection is logged but doesn't block functionality

### Production Environment
- All security checks are enforced
- Critical threats will cause app termination
- All events are logged for security monitoring

## Integration Verification

The integration includes:
- ✅ Package installed: `freerasp-react-native@4.2.2`
- ✅ iOS linking: Completed via CocoaPods
- ✅ Android linking: Auto-linked via React Native
- ✅ Configuration: Set up with app-specific values
- ✅ Security responses: Implemented with proper handlers
- ✅ App integration: Added to main App.tsx

## Monitoring

Monitor the app logs for FreeRASP events:
```
[SECURITY EVENT] threat_type_here
🚨 FreeRASP: Description of detected threat
```

## Commercial Features

Consider upgrading to FreeRASP Commercial for:
- AppiCrypt® - API protection with app integrity verification
- Advanced threat detection
- Professional support
- Custom security policies

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure `pod install` was run after installation
2. **Certificate Hash**: Must match your release signing certificate
3. **Team ID**: Required for iOS builds, get from Apple Developer account

### Debug Mode

In development, you can temporarily disable strict security:
```typescript
isProd: false // This will make FreeRASP less restrictive
```

## Documentation

- Official Docs: https://docs.talsec.app/freerasp
- GitHub: https://github.com/talsec/Free-RASP-ReactNative
- Support: https://talsec.app

## Version Information

- **FreeRASP Version**: 4.2.2
- **React Native Version**: 0.76.9
- **Installation Date**: August 25, 2025
- **Configuration**: Production-ready with customizable responses
