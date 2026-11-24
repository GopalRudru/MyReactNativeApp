# Security Module

This folder contains all security-related configuration and threat handling for the React Native application.

## 📁 File Structure

```
app/security/
├── freeRaspConfig.ts           # Main FreeRASP configuration and initialization
├── threatHandlers.ts           # Reusable threat handlers and alert system
├── securityConfig.ts           # Security feature flags and configurations
├── README_ThreatHandlers.md    # Detailed threat handlers documentation
└── README.md                   # This file
```

## 🔧 Module Overview

### `freeRaspConfig.ts`
- **Purpose**: Main FreeRASP configuration and setup
- **Exports**: 
  - `freeRaspConfig` - FreeRASP SDK configuration
  - `threatActions` - Configured threat action handlers
  - `useFreeRaspSecurity()` - React hook for initialization
  - `testPrivilegedAccessCallback()` - Testing function
  - `clearPersistentSecurityThreat()` - Re-exported from threatHandlers

### `threatHandlers.ts`
- **Purpose**: Reusable security threat handlers and alert system
- **Exports**:
  - `handleThreat()` - Centralized threat handler
  - `showSecurityPopup()` - Platform-aware security alerts
  - `clearPersistentSecurityThreat()` - Clear persistent threats
  - `createThreatActions()` - Factory function for threat actions

### `securityConfig.ts`
- **Purpose**: Security feature flags and environment configurations
- **Exports**:
  - `securityFeatures` - Base security configuration
  - `developmentConfig` - Development environment config
  - `productionConfig` - Production environment config
  - `testingConfig` - Testing environment config
  - `securityTestingConfig` - Security testing config

## 🚀 Quick Start

### Basic FreeRASP Setup
```typescript
import { useFreeRaspSecurity } from './security/freeRaspConfig';

// In your main App component
const MyApp = () => {
  useFreeRaspSecurity(); // Initialize FreeRASP with threat handlers
  
  return (
    // Your app content
  );
};
```

### Using Threat Handlers
```typescript
import { handleThreat } from './security/threatHandlers';

// Manual threat handling
await handleThreat('customThreat', 'Security violation detected!');
```

### App State Integration
```typescript
import { threatActions, freeRaspConfig } from './security/freeRaspConfig';
import { setThreatListeners, talsecStart } from 'freerasp-react-native';

// Re-initialize FreeRASP with same threat handlers
setThreatListeners(threatActions);
await talsecStart(freeRaspConfig);
```

## 🛡️ Security Features

### Threat Detection
- **Root/Jailbreak Detection** - Prevents execution on compromised devices
- **Debugger Detection** - Blocks debugging attempts
- **App Integrity Verification** - Ensures app hasn't been modified
- **Simulator Detection** - Prevents execution on emulators
- **Runtime Manipulation Detection** - Detects SSL pinning bypass attempts
- **Device Security Checks** - Verifies device passcode/biometrics
- **Store Verification** - Ensures app from official stores
- **VPN Detection** - Identifies VPN usage
- **Developer Mode Detection** - Blocks developer options

### Alert System
- **Platform-Specific Behavior**: Different handling for iOS/Android
- **Threat Persistence**: Survives app restarts and crashes
- **Popup Prevention**: Prevents multiple security dialogs
- **Graceful Degradation**: App Store compliant for iOS

## 🔧 Configuration

### Environment Selection
```typescript
// In freeRaspConfig.ts
const ENVIRONMENT = 'production'; // 'development' | 'production' | 'testing' | 'securityTesting'
```

### Custom Security Config
```typescript
// In securityConfig.ts
export const customConfig = {
  enableRootJailbreakDetection: true,
  enableDebuggerDetection: true,
  enableSimulatorDetection: false, // Allow for development
  // ... other flags
};
```

## 📋 Migration from `config/` folder

### Old Structure
```
app/config/
├── freeRaspConfig.ts
├── securityConfig.ts
└── threatHandlers.ts (was inline)
```

### New Structure
```
app/security/
├── freeRaspConfig.ts
├── securityConfig.ts
├── threatHandlers.ts
└── README_ThreatHandlers.md
```

### Import Updates
```typescript
// Old imports
import { useFreeRaspSecurity } from './app/config/freeRaspConfig';
import { threatActions } from '../config/freeRaspConfig';

// New imports
import { useFreeRaspSecurity } from './app/security/freeRaspConfig';
import { threatActions } from '../security/freeRaspConfig';
```

## 🧪 Testing

### Manual Testing
```typescript
import { testPrivilegedAccessCallback } from './security/freeRaspConfig';

// Test privileged access detection
testPrivilegedAccessCallback();
```

### Clear Test Data
```typescript
import { clearPersistentSecurityThreat } from './security/threatHandlers';

// Clean up after testing
await clearPersistentSecurityThreat();
```

## 📖 Documentation

- **`README_ThreatHandlers.md`** - Comprehensive threat handlers documentation
- **`docs/FreeRASP_Integration.md`** - Integration guide
- **`docs/FreeRASP_Configuration_Guide.md`** - Configuration guide

## 🔗 Related Files

### Integration Points
- **`App.tsx`** - Main app entry point, initializes FreeRASP
- **`app/utils/appState/AppStateMonitor.ts`** - Re-initializes FreeRASP on foreground
- **`app/screens/auth/preLogin/WelcomeScreen.tsx`** - App entry point security checks

### Dependencies
- **`app/utils/logger.ts`** - Logging utilities
- **`app/utils/storageUtils.ts`** - Persistent storage for threats
- **`app/services/redux/store.ts`** - Redux store for UI state
- **`app/services/redux/slices/statusPopupSlice.ts`** - Security popup state

## ✅ Benefits of New Structure

1. **Clear Organization** - All security code in one folder
2. **Better Separation** - Security concerns isolated from general config
3. **Easier Maintenance** - Related files grouped together
4. **Improved Documentation** - Comprehensive docs in security folder
5. **Scalability** - Room for additional security modules
