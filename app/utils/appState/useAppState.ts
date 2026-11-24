/**
 * React Hook for App State Monitoring
 * Simple hook to track app state changes in React components
 */

import { useEffect, useState } from 'react';
import { AppStateStatus } from 'react-native';
import { appStateMonitor } from './AppStateMonitor';
import { createModuleLogger } from '../logger';

const logger = createModuleLogger('useAppState');

export interface UseAppStateReturn {
  currentState: AppStateStatus;
  isActive: boolean;
  isBackground: boolean;
  isInactive: boolean;
}

/**
 * Hook to monitor app state changes
 */
export const useAppState = (): UseAppStateReturn => {
  const [currentState, setCurrentState] = useState<AppStateStatus>(
    appStateMonitor.getCurrentState()
  );

  useEffect(() => {
    // Initialize app state monitor if not already done
    appStateMonitor.initialize();

    // Add callback to update state
    const handleStateChange = (newState: AppStateStatus) => {
      setCurrentState(newState);
      logger.log(`🔄 Hook state updated: ${newState}`);
    };

    appStateMonitor.addCallback(handleStateChange);

    // Cleanup on unmount
    return () => {
      appStateMonitor.removeCallback(handleStateChange);
    };
  }, []);

  return {
    currentState,
    isActive: currentState === 'active',
    isBackground: currentState === 'background',
    isInactive: currentState === 'inactive',
  };
};

/**
 * Simple hook that just initializes app state monitoring
 */
export const useAppStateMonitoring = () => {
  useEffect(() => {
    logger.log('🔄 Initializing app state monitoring');
    appStateMonitor.initialize();
    
    return () => {
      // Don't cleanup here since other components might need it
      logger.log('🔄 Component unmounted, monitoring continues');
    };
  }, []);
};
