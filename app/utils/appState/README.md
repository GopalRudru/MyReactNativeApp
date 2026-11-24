# App State Monitoring with FreeRASP Re-initialization

This module provides comprehensive app state monitoring with automatic FreeRASP security re-initialization when the app comes to the foreground.

## 🎯 Overview

When your React Native app transitions from background to active state, this system automatically re-initializes FreeRASP to ensure all security checks are fresh and up-to-date. This prevents potential security bypass attempts that might occur during the background state.

## Features

### 🔄 Automatic FreeRASP Re-initialization
When the app transitions from background to active state, the system automatically:
- Removes existing threat listeners (`removeThreatListeners()`)
- Sets up fresh threat listeners (`setThreatListeners()`)
- Re-executes all FreeRASP security checks (`talsecStart()`) including:
  - ✅ Root/Jailbreak detection (`enableRootJailbreakDetection`)
  - ✅ Debugger detection (`enableDebuggerDetection`)
  - ✅ Simulator detection (`enableSimulatorDetection`)
  - ✅ App integrity verification (`enableAppIntegrityDetection`)
  - ✅ Unofficial store detection (`enableUnofficialStoreDetection`)
  - ✅ Runtime manipulation detection (`enableHooksDetection`)
  - ✅ Device passcode verification (`enablePasscodeDetection`)
  - ✅ Developer mode detection (`enableDeveloperModeDetection`)
  - ✅ System VPN detection (`enableSystemVPNDetection`)
  - ✅ Device binding verification (`enableDeviceBindingDetection`)
  - ✅ Secure hardware availability check (`enableSecureHardwareDetection`)

### 📱 App State Monitoring
- Tracks app state changes (active, background, inactive)
- Provides callback system for custom handlers
- Comprehensive logging for debugging
- React hook for easy integration

## Files Structure

```
app/utils/appState/
├── AppStateMonitor.ts      # Core monitoring service with FreeRASP integration
├── useAppState.ts          # React hook for app state
├── AppStateTest.tsx        # Basic test component for validation
├── FreeRaspReInitTest.tsx  # Comprehensive test for FreeRASP functionality
└── README.md               # This documentation
```

## Usage

### Automatic Integration
The app state monitor is automatically initialized and will handle FreeRASP re-initialization without any additional setup required:

```typescript
// In your main App.tsx, the monitor is already initialized
import { appStateMonitor } from './utils/appState/AppStateMonitor';

// Monitor automatically handles FreeRASP re-initialization
// when app comes to foreground
```

### Using the React Hook
```typescript
import { useAppState } from './utils/appState/useAppState';

const MyComponent = () => {
  const { currentState, isActive, isBackground, isInactive } = useAppState();
  
  return (
    <Text>App is currently: {currentState}</Text>
  );
};
```

### Adding Custom Callbacks
```typescript
import { appStateMonitor } from './utils/appState/AppStateMonitor';

const handleStateChange = (newState: AppStateStatus) => {
  console.log('App state changed to:', newState);
};

// Add callback
appStateMonitor.addCallback(handleStateChange);

// Remove callback when done
appStateMonitor.removeCallback(handleStateChange);
```

## Security Benefits

This implementation ensures that all security checks are fresh when users return to the app, providing:

- **🛡️ Up-to-date threat detection** - All security checks are re-executed with current device state
- **🚫 Prevention of security bypass attempts** - Stops potential bypass attempts during background state
- **🔍 Continuous security posture validation** - Ensures security remains active throughout app lifecycle
- **⚡ Enhanced protection against runtime manipulation** - Fresh listeners detect new threats

## Testing

Use the provided test components to validate functionality:

### Basic App State Test
```typescript
import { AppStateTest } from './utils/appState/AppStateTest';

// Use in your app to see basic state monitoring
<AppStateTest />
```

### FreeRASP Re-initialization Test
```typescript
import { FreeRaspReInitTest } from './utils/appState/FreeRaspReInitTest';

// Comprehensive test with instructions for manual testing
<FreeRaspReInitTest />
```

## Logging

All operations are logged with emojis for easy identification:

- 🔄 **Re-initialization starting** - FreeRASP re-init process begins
- ✅ **Successful operations** - All operations completed successfully
- ❌ **Error conditions** - Something went wrong
- 📱 **State transitions** - App state changed
- 🚨 **Security threats detected** - FreeRASP found security issues

### Example Log Output
```
📱 App state changed: background → active
🔄 Re-initializing FreeRASP on foreground...
✅ FreeRASP re-initialized successfully - all security checks re-executed
```

## Configuration

The re-initialization uses the same configuration and threat handlers as the main FreeRASP setup from:
- `security/freeRaspConfig.ts` - Main FreeRASP configuration
- `security/threatHandlers.ts` - Reusable threat handlers and alert system

No additional configuration is required.

## Technical Implementation

The core logic in `AppStateMonitor.handleAppStateChange()`:

```typescript
// Re-initialize FreeRASP when app comes to foreground
if (previousState === 'background' && nextAppState === 'active') {
  try {
    logger.log('🔄 Re-initializing FreeRASP on foreground...');
    
    // Remove existing threat listeners
    removeThreatListeners();
    
    // Set new threat listeners for re-check
    setThreatListeners(threatActions);
    
    // Start FreeRASP again to re-execute all security checks
    await talsecStart(freeRaspConfig);
    
    logger.log('✅ FreeRASP re-initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to re-initialize FreeRASP:', error);
  }
}
```

This ensures that every time your app becomes active after being in the background, all security checks are completely refreshed and re-executed.
