# Global App State Monitor - Simple Implementation

## Overview
A simple global handler to monitor when your app is in **active**, **background**, or **inactive** state.

## Files Created

### 1. **AppStateMonitor Service**
**File**: `app/utils/appState/AppStateMonitor.ts`
- Tracks app state changes globally
- Provides callbacks for state changes
- Singleton instance for app-wide access

### 2. **React Hook**
**File**: `app/utils/appState/useAppState.ts`
- `useAppState()` - Full state monitoring with current state info
- `useAppStateMonitoring()` - Simple initialization hook

### 3. **Test Component** (Optional)
**File**: `app/utils/appState/AppStateTest.tsx`
- Visual component to test app state monitoring
- Shows current state with colors and icons

## Integration

### Already Integrated in App.tsx:
```tsx
import { useAppStateMonitoring } from "./app/utils/appState/useAppState";

const App = () => {
  useFreeRaspSecurity();
  useAppStateMonitoring(); // ← App state monitoring initialized
  // ...
};
```

## Usage Examples

### 1. **Basic Usage in Components**
```tsx
import { useAppState } from "./app/utils/appState/useAppState";

const MyComponent = () => {
  const { currentState, isActive, isBackground } = useAppState();
  
  return (
    <Text>App is currently: {currentState}</Text>
  );
};
```

### 2. **Direct Service Access**
```tsx
import { appStateMonitor } from "./app/utils/appState/AppStateMonitor";

// Check current state
const isActive = appStateMonitor.isActive();
const currentState = appStateMonitor.getCurrentState();

// Add callback for state changes
appStateMonitor.addCallback((newState) => {
  console.log(`App state changed to: ${newState}`);
});
```

### 3. **Add Custom State Change Logic**
```tsx
import { appStateMonitor } from "./app/utils/appState/AppStateMonitor";

// Add your custom logic
appStateMonitor.addCallback((state) => {
  if (state === 'background') {
    console.log('App went to background - pause activities');
  } else if (state === 'active') {
    console.log('App became active - resume activities');
  }
});
```

## App States

| State | Description | When it occurs |
|-------|-------------|----------------|
| **active** | App is in foreground and receiving events | User is actively using the app |
| **background** | App is running but not visible | User switched to another app or home screen |
| **inactive** | App is in foreground but not receiving events | Transitional state (phone calls, notifications) |

## Console Logs

The monitor logs all state changes:
```
📱 App state changed: active → background
📱 App moved to BACKGROUND

📱 App state changed: background → active  
✅ App became ACTIVE
```

## API Reference

### AppStateMonitor Methods:
- `initialize()` - Start monitoring
- `getCurrentState()` - Get current app state
- `isActive()` - Check if app is active
- `isBackground()` - Check if app is in background
- `isInactive()` - Check if app is inactive
- `addCallback(callback)` - Add state change listener
- `removeCallback(callback)` - Remove state change listener
- `cleanup()` - Stop monitoring and cleanup

### useAppState Hook Returns:
- `currentState` - Current app state string
- `isActive` - Boolean if app is active
- `isBackground` - Boolean if app is in background
- `isInactive` - Boolean if app is inactive

## Testing

To test the app state monitoring:

1. **Use the test component** (optional):
   ```tsx
   import AppStateTest from "./app/utils/appState/AppStateTest";
   
   // Add to any screen to see live state changes
   <AppStateTest />
   ```

2. **Check console logs** - All state changes are logged

3. **Test transitions**:
   - Put app in background (home button/app switcher)
   - Return to app
   - Receive phone call (inactive state)

## Integration Benefits

✅ **Simple**: Minimal code, easy to integrate
✅ **Global**: Works across your entire app
✅ **Lightweight**: No performance impact
✅ **Reactive**: React hooks for component integration
✅ **Logged**: All state changes logged for debugging
