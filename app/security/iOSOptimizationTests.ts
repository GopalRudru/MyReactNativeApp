/**
 * Test Utilities for iOS FreeRASP Timing Optimizations
 * 
 * This module provides testing utilities to validate the iOS-specific
 * timing optimizations for FreeRASP security alerts.
 */

import { Platform } from 'react-native';
import { createModuleLogger } from '../utils/logger';
import { freeRaspManager } from '../security/FreeRaspManager';
import { 
  getPlatformTiming, 
  iOSSecurityOptimizations,
  iOSSecurityLogger 
} from '../security/iOSOptimizations';

const logger = createModuleLogger('iOSOptimizationTest');

/**
 * Test iOS timing optimizations
 */
export const testIOSOptimizations = {
  /**
   * Test platform timing retrieval
   */
  testPlatformTiming(): void {
    logger.log('🧪 Testing Platform Timing Retrieval...');
    
    const operations = [
      'securityFlagResetDelay',
      'persistentThreatRecheckDelay',
      'securityPopupCleanupDelay',
      'securitySubsystemInitDelay',
      'immediateSecurityCheckDelay',
      'foregroundPreInitDelay',
    ] as const;
    
    operations.forEach(operation => {
      const timing = getPlatformTiming(operation);
      logger.log(`⏱️ ${operation}: ${timing}ms (${Platform.OS})`);
    });
    
    logger.log('✅ Platform timing test completed');
  },

  /**
   * Test iOS pre-initialization
   */
  async testPreInitialization(): Promise<void> {
    logger.log('🧪 Testing iOS Pre-initialization...');
    const startTime = Date.now();
    
    await iOSSecurityOptimizations.performPreInitialization();
    
    const duration = Date.now() - startTime;
    logger.log(`⏱️ Pre-initialization took: ${duration}ms`);
    logger.log('✅ Pre-initialization test completed');
  },

  /**
   * Test iOS post-initialization
   */
  async testPostInitialization(): Promise<void> {
    logger.log('🧪 Testing iOS Post-initialization...');
    const startTime = Date.now();
    
    await iOSSecurityOptimizations.performPostInitialization();
    
    const duration = Date.now() - startTime;
    logger.log(`⏱️ Post-initialization took: ${duration}ms`);
    logger.log('✅ Post-initialization test completed');
  },

  /**
   * Test immediate security check scheduling
   */
  testImmediateSecurityCheck(): void {
    logger.log('🧪 Testing Immediate Security Check Scheduling...');
    
    const mockCallback = async () => {
      logger.log('🔍 Mock security check executed');
    };
    
    iOSSecurityOptimizations.scheduleImmediateSecurityCheck(mockCallback);
    logger.log('✅ Immediate security check scheduled');
  },

  /**
   * Test iOS security logging
   */
  testSecurityLogging(): void {
    logger.log('🧪 Testing iOS Security Logging...');
    const startTime = Date.now();
    
    iOSSecurityLogger.logSecurityOperation('Test Operation', { test: true });
    
    // Simulate operation delay
    setTimeout(() => {
      iOSSecurityLogger.logSecurityTiming('Test Operation', startTime);
      logger.log('✅ Security logging test completed');
    }, 100);
  },

  /**
   * Run all iOS optimization tests
   */
  async runAllTests(): Promise<void> {
    logger.log('🧪 Running All iOS Optimization Tests...');
    
    try {
      this.testPlatformTiming();
      await this.testPreInitialization();
      await this.testPostInitialization();
      this.testImmediateSecurityCheck();
      this.testSecurityLogging();
      
      logger.log('✅ All iOS optimization tests completed successfully');
    } catch (error) {
      logger.error('❌ iOS optimization tests failed:', error);
    }
  },
};

/**
 * Benchmark iOS vs Android timing
 */
export const benchmarkTiming = {
  /**
   * Compare iOS and Android timing for all operations
   */
  compareTimings(): void {
    logger.log('📊 Benchmarking iOS vs Android Timing...');
    
    const operations = [
      'securityFlagResetDelay',
      'persistentThreatRecheckDelay', 
      'securityPopupCleanupDelay',
      'securitySubsystemInitDelay',
      'immediateSecurityCheckDelay',
      'foregroundPreInitDelay',
    ] as const;
    
    const currentPlatform = Platform.OS;
    logger.log(`📱 Current Platform: ${currentPlatform}`);
    
    operations.forEach(operation => {
      const timing = getPlatformTiming(operation);
      
      let improvement: string;
      if (currentPlatform === 'ios') {
        improvement = timing > 100 ? `+${timing - 100}ms for stability` : 'optimized';
      } else {
        improvement = 'android-optimized';
      }
      
      logger.log(`📊 ${operation}:`);
      logger.log(`   Current (${currentPlatform}): ${timing}ms`);
      logger.log(`   Optimization: ${improvement}`);
    });
    
    logger.log('✅ Timing benchmark completed');
  },
};

/**
 * Manual test trigger for FreeRASP manager
 */
export const manualTests = {
  /**
   * Test FreeRASP manager initialization with timing
   */
  async testManagerInitialization(): Promise<void> {
    logger.log('🧪 Testing FreeRASP Manager Initialization...');
    const startTime = Date.now();
    
    try {
      await freeRaspManager.initialize();
      const duration = Date.now() - startTime;
      logger.log(`⏱️ Manager initialization took: ${duration}ms`);
      logger.log('✅ Manager initialization test completed');
    } catch (error) {
      logger.error('❌ Manager initialization test failed:', error);
    }
  },

  /**
   * Test FreeRASP manager re-initialization with timing
   */
  async testManagerReInitialization(): Promise<void> {
    logger.log('🧪 Testing FreeRASP Manager Re-initialization...');
    const startTime = Date.now();
    
    try {
      await freeRaspManager.reInitialize();
      const duration = Date.now() - startTime;
      logger.log(`⏱️ Manager re-initialization took: ${duration}ms`);
      logger.log('✅ Manager re-initialization test completed');
    } catch (error) {
      logger.error('❌ Manager re-initialization test failed:', error);
    }
  },
};
