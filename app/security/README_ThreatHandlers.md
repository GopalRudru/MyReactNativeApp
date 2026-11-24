# Threat Handlers Module

This module provides reusable security threat handlers and alert dialog functionality for FreeRASP integration.

## 🎯 Overview

The threat handlers module centralizes all security threat handling logic, making it reusable across different parts of the application. This module contains:

- **Threat Action Factory**: Creates threat actions based on security configuration
- **Alert Dialog System**: Handles security popups with platform-specific behavior
- **Persistence Management**: Manages persistent security threats across app restarts

## 📁 Files

### `threatHandlers.ts`
Contains all reusable threat handling functionality:

- `createThreatActions(securityConfig)` - Factory function to create threat actions
- `handleThreat()` - Centralized threat handler with persistence
- `showSecurityPopup()` - Platform-aware security alert system
- `clearPersistentSecurityThreat()` - Clear persistent threats

## 🔧 Usage

### Creating Threat Actions
```typescript
import { createThreatActions } from './security/threatHandlers';
import { securityConfig } from './security/securityConfig';

// Create threat actions for FreeRASP
const threatActions = createThreatActions(securityConfig);

// Use with FreeRASP
useFreeRasp(freeRaspConfig, threatActions);
```

### Using in App State Monitor
```typescript
import { threatActions } from '../security/freeRaspConfig';

// Threat actions are automatically created and exported
// from freeRaspConfig for reuse
setThreatListeners(threatActions);
```

### Manual Threat Handling
```typescript
import { handleThreat } from './security/threatHandlers';

// Manually trigger a security threat
await handleThreat('customThreat', 'Custom security message');
```

### Clearing Persistent Threats
```typescript
import { clearPersistentSecurityThreat } from './security/threatHandlers';

// Clear persistent threats (for testing or admin override)
await clearPersistentSecurityThreat();
```

## 🛡️ Security Features

### Threat Persistence
- Threats are persisted to device storage
- Survives app restarts and crashes
- Ensures security alerts are shown even after force-close

### Platform-Specific Behavior

#### Android
- Shows "Exit" button
- Calls `BackHandler.exitApp()` to close app
- Immediate security enforcement

#### iOS
- Shows "Ok" button (App Store compliant)
- Cannot force-close app (Apple guidelines)
- Shows persistent security message
- User must manually close app

### Popup Prevention
- Prevents multiple security popups from stacking
- Tracks popup state to avoid spam
- Ensures single security dialog at a time

## 🔍 Available Threat Types

All threat handlers check their respective security config flags:

- **`privilegedAccess`** - Root/Jailbreak detection
- **`debug`** - Debugger detection  
- **`simulator`** - Simulator/Emulator detection
- **`appIntegrity`** - App integrity verification
- **`unofficialStore`** - Store verification
- **`hooks`** - Runtime manipulation detection
- **`passcode`** - Device passcode verification
- **`devMode`** - Developer mode detection
- **`systemVPN`** - VPN detection
- **`deviceBinding`** - Device binding verification
- **`deviceID`** - Device ID verification
- **`secureHardwareNotAvailable`** - Secure hardware checks
- **`obfuscationIssues`** - Obfuscation verification

## 📝 Configuration

Threat actions are controlled by `securityConfig` flags:

```typescript
const securityConfig = {
  enableRootJailbreakDetection: true,
  enableDebuggerDetection: true,
  enableSimulatorDetection: true,
  enableAppIntegrityCheck: true,
  enableStoreVerification: true,
  enableRuntimeManipulationDetection: true,
  enableDeviceSecurityChecks: true,
  enableDeveloperModeDetection: true,
  enableVPNDetection: true,
  enableDeviceBindingChecks: true,
  enableSecureHardwareChecks: true,
  enableObfuscationChecks: true,
  enableThreatLogging: true,
  enableAlertDialogs: true
};
```

## 🔗 Integration Points

### FreeRASP Integration
```typescript
// In freeRaspConfig.ts
export const threatActions = createThreatActions(securityConfig);

// Use with FreeRASP
useFreeRasp(freeRaspConfig, threatActions);
```

### App State Monitor Integration
```typescript
// In AppStateMonitor.ts
import { threatActions } from '../../security/freeRaspConfig';

// Re-initialize on foreground
setThreatListeners(threatActions);
await talsecStart(freeRaspConfig);
```

## 🧪 Testing

### Test Individual Threats
```typescript
import { handleThreat } from './security/threatHandlers';

// Test specific threat
await handleThreat('debug', 'Test debug detection message');
```

### Test Threat Persistence
```typescript
// Trigger threat, close app, reopen - should show again
await handleThreat('privilegedAccess', 'Test persistence');
```

### Clear Test Threats
```typescript
import { clearPersistentSecurityThreat } from './security/threatHandlers';

// Clean up after testing
await clearPersistentSecurityThreat();
```

## 📋 Migration Guide

### Before (Old Structure)
```typescript
// All threat logic was in freeRaspConfig.ts
const threatActions = {
  privilegedAccess: () => {
    // Inline threat handling logic
  }
};
```

### After (New Structure)
```typescript
// Reusable threat handlers in threatHandlers.ts
import { createThreatActions } from './threatHandlers';

// Factory creates threat actions based on config
export const threatActions = createThreatActions(securityConfig);
```

## ✅ Benefits

1. **Reusability**: Threat handlers can be used across multiple modules
2. **Maintainability**: Centralized threat logic is easier to update
3. **Testability**: Individual threat handlers can be tested in isolation
4. **Flexibility**: Factory pattern allows different configurations
5. **Consistency**: Same alert behavior across all security features
6. **Platform Compliance**: iOS and Android specific behaviors handled correctly
