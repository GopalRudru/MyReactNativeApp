# FreeRASP Security Configuration Guide

## Overview
This implementation provides a comprehensive, configurable security system using FreeRASP with granular control over individual security features.

## Configuration Files

### 1. `securityConfig.ts`
Main configuration file with boolean flags for each security feature.

### 2. `freeRaspConfig.ts`
FreeRASP implementation that uses the security configuration.

## Security Features

### Core Security Features
- ✅ **Root/Jailbreak Detection** - Detects rooted/jailbroken devices
- ✅ **Debugger Detection** - Detects debugging tools attached to the app
- ✅ **App Integrity Verification** - Verifies app hasn't been tampered with
- ✅ **Runtime Manipulation Detection** - Detects hooks and code injection

### Device Security Checks
- ✅ **Device Security Checks** - Verifies device security settings (passcode, etc.)
- ✅ **Simulator Detection** - Detects emulator/simulator environments
- ✅ **Developer Mode Detection** - Detects if developer options are enabled

### Advanced Security Features
- ✅ **Store Verification** - Verifies app was installed from official store
- ✅ **VPN Detection** - Detects active VPN connections
- ✅ **Device Binding Checks** - Ensures app runs on intended device
- ✅ **Secure Hardware Checks** - Verifies secure hardware availability
- ✅ **Obfuscation Verification** - Checks if obfuscation is intact

### Logging & Response Settings
- ✅ **Threat Logging** - Master switch for all threat logging
- ✅ **Alert Dialogs** - Shows popup alerts for threats
- ✅ **Console Logging** - Logs threat information to console

## Environment Configurations

### Development Environment
```typescript
const ENVIRONMENT = 'development';
```
- Disables simulator detection (allows emulators)
- Disables debugger detection (allows debugging)
- Disables developer mode detection
- Disables alert dialogs (reduces interruptions)
- Enables console logging

### Production Environment
```typescript
const ENVIRONMENT = 'production';
```
- Enables all security features
- Shows alerts for all threats
- Minimal console logging

### Testing Environment
```typescript
const ENVIRONMENT = 'testing';
```
- Allows emulators and debugging for QA
- Disables alerts to reduce interruptions
- Enables detailed logging for analysis

## How to Use

### 1. Choose Environment
In `freeRaspConfig.ts`, change the ENVIRONMENT constant:
```typescript
const ENVIRONMENT = 'development'; // or 'production' or 'testing'
```

### 2. Custom Configuration
To create a custom configuration, modify `securityConfig.ts`:
```typescript
export const customConfig = {
  enableRootJailbreakDetection: true,
  enableDebuggerDetection: false,
  enableAppIntegrityCheck: true,
  // ... other settings
};
```

Then update the environment configs in `freeRaspConfig.ts`:
```typescript
const environmentConfigs = {
  development: developmentConfig,
  production: productionConfig,
  testing: testingConfig,
  custom: customConfig  // Use your custom config
};
```

### 3. Individual Feature Control
To disable a specific feature, set its flag to `false` in `securityConfig.ts`:
```typescript
enableSimulatorDetection: false,  // Disable simulator detection
```

## Testing Security Features

### To Test Root Detection
- Use a rooted Android device
- Should trigger `privilegedAccess` threat

### To Test Debug Detection
- Connect a physical device with USB debugging enabled
- Should trigger `debug` threat

### To Test Simulator Detection
- Run on a physical device (not emulator)
- Change `enableSimulatorDetection: true` in development config
- Should trigger `simulator` threat when running on emulator

### To Test App Integrity
- Modify the certificate hash in `freeRaspConfig.ts` to an incorrect value
- Should trigger `appIntegrity` threat

## Certificate Hashes
Your app currently has the correct certificate hashes:
- **Release**: `WLT6tubbDkufB/Kuga0RVE+/ZNlrEiCmJGy1BoIwcJs=`
- **Debug**: `+sYXRdwJA3hvue3mKpYrOZ9zSPC7b4mbgzJmdZEDO5w=`

## Logging Output
When console logging is enabled, you'll see:
```
🔒 Initializing FreeRASP security monitoring...
✅ FreeRASP security monitoring started
🔐 Active Security Features:
  - Root/Jailbreak Detection: ✅
  - Debugger Detection: ❌
  - App Integrity Check: ✅
  ...
```

## Threat Response
When a threat is detected:
1. **Console Warning** (if enabled): `🚨 FreeRASP: [Threat Type] detected`
2. **Alert Dialog** (if enabled): Popup with threat information
3. **Custom Response**: Modify `handleThreat()` function for custom actions

## Best Practices

### Development
- Use `development` environment
- Enable console logging for debugging
- Disable disruptive alerts

### Production
- Use `production` environment
- Enable all security features
- Show alerts to users
- Minimize console logging

### Testing/QA
- Use `testing` environment
- Allow necessary debugging tools
- Enable detailed logging for analysis

## Troubleshooting

### FreeRASP Not Working
1. Check console for initialization logs
2. Verify certificate hashes are correct
3. Ensure FreeRASP version 3.9.3 is installed
4. Check threat detection flags are enabled

### No Threats Detected
- Modern emulators are secure and may not trigger threats
- Test on physical devices with debugging enabled
- Verify security features are enabled in configuration

### Too Many Alerts
- Switch to `development` environment
- Set `enableAlertDialogs: false`
- Keep `enableConsoleLogging: true` for monitoring
