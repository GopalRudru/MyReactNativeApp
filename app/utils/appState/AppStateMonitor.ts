/**
 * Global App State Monitor
 * Simple implementation to track app state changes (active, background, inactive)
 * Enhanced with FreeRASP re-initialization on foreground
 */

import { AppState, AppStateStatus } from 'react-native';
import { createModuleLogger } from '../logger';
import { freeRaspManager } from '../../security/FreeRaspManager';
import { iOSSecurityOptimizations } from '../../security/iOSOptimizations';

const logger = createModuleLogger('AppStateMonitor');

type AppStateChangeCallback = (state: AppStateStatus) => void;

class AppStateMonitor {
  private currentState: AppStateStatus = AppState.currentState;
  private subscription: any = null;
  private readonly callbacks: Set<AppStateChangeCallback> = new Set();

  /**
   * Initialize the app state monitoring
   */
  public initialize(): void {
    logger.log(`🚀 Initializing app state monitor. Current state: ${this.currentState}`);
    
    this.subscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    
    logger.log('✅ App state monitor initialized');
  }

  /**
   * Handle app state changes
   */
  private readonly handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    const previousState = this.currentState;
    this.currentState = nextAppState;

    logger.log(`📱 App state changed: ${previousState} → ${nextAppState}`);

    // Log specific state transitions
    if (nextAppState === 'active') {
      logger.log('✅ App became ACTIVE');
      
      // Re-initialize FreeRASP when app comes to foreground
      if (previousState === 'background') {
        try {
          logger.log('🔄 Re-initializing FreeRASP on foreground...');
          
          // iOS-specific: Add immediate trigger before re-initialization
          await iOSSecurityOptimizations.performPreInitialization();
          
          // Use centralized FreeRASP manager for re-initialization
          await freeRaspManager.reInitialize();
          
        } catch (error) {
          logger.error('❌ Failed to re-initialize FreeRASP:', error);
        }
      }
    } else if (nextAppState === 'background') {
      logger.log('📱 App moved to BACKGROUND');
    } else if (nextAppState === 'inactive') {
      logger.log('⏸️ App became INACTIVE');
    }

    // Notify all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(nextAppState);
      } catch (error) {
        logger.error('Error in app state callback:', error);
      }
    });
  };

  /**
   * Get current app state
   */
  public getCurrentState(): AppStateStatus {
    return this.currentState;
  }

  /**
   * Check if app is currently active
   */
  public isActive(): boolean {
    return this.currentState === 'active';
  }

  /**
   * Check if app is in background
   */
  public isBackground(): boolean {
    return this.currentState === 'background';
  }

  /**
   * Check if app is inactive
   */
  public isInactive(): boolean {
    return this.currentState === 'inactive';
  }

  /**
   * Add callback for app state changes
   */
  public addCallback(callback: AppStateChangeCallback): void {
    this.callbacks.add(callback);
    logger.log(`📝 Added app state callback. Total callbacks: ${this.callbacks.size}`);
  }

  /**
   * Remove callback
   */
  public removeCallback(callback: AppStateChangeCallback): void {
    this.callbacks.delete(callback);
    logger.log(`🗑️ Removed app state callback. Total callbacks: ${this.callbacks.size}`);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.callbacks.clear();
    logger.log('🧹 App state monitor cleaned up');
  }
}

// Export singleton instance
export const appStateMonitor = new AppStateMonitor();

// Export class for testing
export { AppStateMonitor };
