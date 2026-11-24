/**
 * iOS-Specific Optimizations for FreeRASP Security
 * 
 * This module contains iOS-specific timing and configuration optimizations
 * to ensure security alerts appear promptly on iOS devices.
 */

import { Platform } from 'react-native';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('iOSOptimizations');

/**
 * iOS-specific timing configurations
 */
export const iOSTimingConfig = {
  // Delay for security flag reset (iOS needs more time)
  securityFlagResetDelay: 250,
  
  // Delay for persistent threat recheck (iOS security subsystem needs more time)
  persistentThreatRecheckDelay: 500,
  
  // Delay for security popup cleanup
  securityPopupCleanupDelay: 500,
  
  // Initial security subsystem initialization delay
  securitySubsystemInitDelay: 300,
  
  // Immediate security check after initialization
  immediateSecurityCheckDelay: 100,
  
  // Pre-initialization delay when app comes to foreground
  foregroundPreInitDelay: 150,
};

/**
 * Get platform-specific timing for security operations
 */
export const getPlatformTiming = (operation: keyof typeof iOSTimingConfig): number => {
  if (Platform.OS === 'ios') {
    const timing = iOSTimingConfig[operation];
    logger.log(`🍎 iOS timing for ${operation}: ${timing}ms`);
    return timing;
  }
  
  // Android defaults (faster timing)
  const androidDefaults = {
    securityFlagResetDelay: 100,
    persistentThreatRecheckDelay: 200,
    securityPopupCleanupDelay: 200,
    securitySubsystemInitDelay: 0,
    immediateSecurityCheckDelay: 50,
    foregroundPreInitDelay: 0,
  };
  
  const timing = androidDefaults[operation];
  logger.log(`🤖 Android timing for ${operation}: ${timing}ms`);
  return timing;
};

/**
 * iOS-specific security optimization utilities
 */
export const iOSSecurityOptimizations = {
  /**
   * Perform iOS-specific pre-initialization steps
   */
  async performPreInitialization(): Promise<void> {
    if (Platform.OS !== 'ios') return;
    
    logger.log('🍎 Performing iOS pre-initialization security optimization...');
    
    // Wait for iOS security context to be ready
    await new Promise(resolve => 
      setTimeout(resolve, getPlatformTiming('foregroundPreInitDelay'))
    );
    
    logger.log('🍎 iOS pre-initialization complete');
  },

  /**
   * Perform iOS-specific post-initialization steps
   */
  async performPostInitialization(): Promise<void> {
    if (Platform.OS !== 'ios') return;
    
    logger.log('🍎 Performing iOS post-initialization security optimization...');
    
    // Wait for iOS security subsystem to be fully ready
    await new Promise(resolve => 
      setTimeout(resolve, getPlatformTiming('securitySubsystemInitDelay'))
    );
    
    logger.log('🍎 iOS post-initialization complete');
  },

  /**
   * Schedule immediate security check for iOS
   */
  scheduleImmediateSecurityCheck(callback: () => Promise<void>): void {
    if (Platform.OS !== 'ios') return;
    
    logger.log('🍎 Scheduling immediate iOS security check...');
    
    setTimeout(async () => {
      try {
        await callback();
        logger.log('🍎 iOS immediate security check completed');
      } catch (error) {
        logger.error('🍎 iOS immediate security check failed:', error);
      }
    }, getPlatformTiming('immediateSecurityCheckDelay'));
  },
};

/**
 * Enhanced logging for iOS security operations
 */
export const iOSSecurityLogger = {
  logSecurityOperation(operation: string, details?: any): void {
    if (Platform.OS === 'ios') {
      logger.log(`🍎 iOS Security Operation: ${operation}`, details);
    }
  },
  
  logSecurityTiming(operation: string, startTime: number): void {
    if (Platform.OS === 'ios') {
      const duration = Date.now() - startTime;
      logger.log(`🍎 iOS Security Timing: ${operation} took ${duration}ms`);
    }
  },
};
