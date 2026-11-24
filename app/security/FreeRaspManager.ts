import { 
  talsecStart, 
  setThreatListeners, 
  removeThreatListeners 
} from 'freerasp-react-native';
import { createModuleLogger } from '../utils/logger';
import { freeRaspConfig, securityConfig, threatActions } from './freeRaspConfig';
import { resetSecurityPopupFlag, setFreeRaspManagerRef } from './threatHandlers';
import { getItem, SECURITY_THREAT_KEY } from '../utils/storageUtils';
import { 
  getPlatformTiming, 
  iOSSecurityOptimizations, 
  iOSSecurityLogger 
} from './iOSOptimizations';

const logger = createModuleLogger('FreeRaspManager');

class FreeRaspManager {
  private isInitialized = false;
  private isReInitializing = false;
  private readonly lastDetectedThreats: Set<string> = new Set();

  constructor() {
    // Set the reference in threat handlers
    setFreeRaspManagerRef(this);
  }

  /**
   * Initialize FreeRASP for the first time (called from App.tsx)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.log('🔒 FreeRASP already initialized, skipping...');
      return;
    }

    const startTime = Date.now();
    iOSSecurityLogger.logSecurityOperation('FreeRASP Initialization Started');

    logger.log('🔒 Initializing FreeRASP security monitoring...');
    logger.log('Environment:', process.env.NODE_ENV);
    logger.log('Security Config:', securityConfig);
    logger.log('FreeRASP Config:', freeRaspConfig);
    logger.log('Threat Actions Available:', Object.keys(threatActions));
    
    try {
      // Set threat listeners first
      logger.log('🔧 Setting threat listeners...');
      setThreatListeners(threatActions);
      
      // Start FreeRASP with config
      logger.log('🚀 Starting FreeRASP...');
      await talsecStart(freeRaspConfig);
      
      // iOS-specific: Additional delay to ensure security subsystem is fully initialized
      await iOSSecurityOptimizations.performPostInitialization();
      
      this.isInitialized = true;
      logger.log('✅ FreeRASP security monitoring started successfully');
      
      // iOS-specific: Force an immediate security check after initialization
      iOSSecurityOptimizations.scheduleImmediateSecurityCheck(async () => {
        await this.recheckPersistentThreats();
      });

      iOSSecurityLogger.logSecurityTiming('FreeRASP Initialization', startTime);
      
      if (securityConfig.enableConsoleLogging) {
        this.logSecurityFeatures();
      }
    } catch (error) {
      logger.error('❌ FreeRASP initialization failed:', error);
    }
  }

  /**
   * Re-initialize FreeRASP when app comes to foreground
   * This ensures fresh security checks are executed
   */
  public async reInitialize(): Promise<void> {
    if (!this.isInitialized) {
      logger.error('❌ Cannot re-initialize FreeRASP - not initially initialized');
      return;
    }

    if (this.isReInitializing) {
      logger.log('🔄 FreeRASP re-initialization already in progress, skipping...');
      return;
    }

    this.isReInitializing = true;
    const startTime = Date.now();
    iOSSecurityLogger.logSecurityOperation('FreeRASP Re-initialization Started');

    try {
      logger.log('🔄 Re-initializing FreeRASP on foreground...');
      
      // Step 1: Remove existing threat listeners
      logger.log('🧹 Removing existing threat listeners...');
      removeThreatListeners();
      
      // Step 2: Reset the security popup flag to allow new alerts
      this.resetSecurityPopupFlag();
      
      // Step 3: Platform-specific delay to ensure flag reset takes effect
      const resetDelay = getPlatformTiming('securityFlagResetDelay');
      await new Promise(resolve => setTimeout(resolve, resetDelay));
      
      // Step 4: Set fresh threat listeners
      logger.log('🔧 Setting fresh threat listeners...');
      setThreatListeners(threatActions);
      
      // Step 5: Start FreeRASP again to re-execute all security checks
      logger.log('🚀 Starting FreeRASP to re-execute security checks...');
      await talsecStart(freeRaspConfig);
      
      // Step 6: Platform-specific delay for persistent threat recheck
      const recheckDelay = getPlatformTiming('persistentThreatRecheckDelay');
      setTimeout(async () => {
        await this.recheckPersistentThreats();
      }, recheckDelay);
      
      logger.log('✅ FreeRASP re-initialized successfully - all security checks re-executed');
      iOSSecurityLogger.logSecurityTiming('FreeRASP Re-initialization', startTime);
      
    } catch (error) {
      logger.error('❌ Failed to re-initialize FreeRASP:', error);
    } finally {
      this.isReInitializing = false;
    }
  }

  /**
   * Reset the security popup flag to allow new alerts
   * This is crucial for showing alerts on re-initialization
   */
  private resetSecurityPopupFlag(): void {
    resetSecurityPopupFlag();
    logger.log('🔄 Security popup flag reset - alerts can now be shown');
  }

  /**
   * Manually re-check for persistent threats
   * This forces re-evaluation of threats that may not be automatically re-detected
   */
  private async recheckPersistentThreats(): Promise<void> {
    logger.log('🔍 Manually re-checking for persistent threats...');
    
    try {
      // Try to re-trigger tracked threats first
      if (await this.retriggerTrackedThreats()) {
        return;
      }
      
      // Try to re-trigger persisted threats
      if (await this.retriggerPersistedThreats()) {
        return;
      }
      
      // Fallback to obfuscation check
      this.triggerFallbackThreat();
      
    } catch (error) {
      logger.error('❌ Failed to re-check persistent threats:', error);
      this.triggerFallbackThreat();
    }
  }

  private async retriggerTrackedThreats(): Promise<boolean> {
    if (this.lastDetectedThreats.size === 0) {
      return false;
    }
    
    logger.log(`🔄 Re-triggering ${this.lastDetectedThreats.size} tracked threats...`);
    
    // Get the first tracked threat and trigger it
    const threatsArray = Array.from(this.lastDetectedThreats);
    if (threatsArray.length > 0) {
      const threatType = threatsArray[0];
      const threatKey = threatType as keyof typeof threatActions;
      if (threatActions[threatKey]) {
        logger.log(`🚨 Re-triggering tracked threat: ${threatType}`);
        threatActions[threatKey]();
        return true;
      }
    }
    
    return false;
  }

  private async retriggerPersistedThreats(): Promise<boolean> {
    const persistentThreat = await getItem(SECURITY_THREAT_KEY);
    
    if (!persistentThreat || typeof persistentThreat !== 'string') {
      return false;
    }
    
    const threat = JSON.parse(persistentThreat);
    logger.log(`🔄 Found persistent threat: ${threat.type}, re-triggering...`);
    
    const threatType = threat.type as keyof typeof threatActions;
    if (threatActions[threatType]) {
      threatActions[threatType]();
      return true;
    }
    
    logger.error(`❌ Unknown threat type: ${threat.type}`);
    return false;
  }

  private triggerFallbackThreat(): void {
    if (securityConfig.enableObfuscationChecks) {
      logger.log('🔀 Triggering obfuscation check as fallback...');
      threatActions.obfuscationIssues();
    }
    logger.log('✅ Persistent threat re-check completed');
  }

  /**
   * Test function to manually trigger privileged access callback
   */
  public testPrivilegedAccess(): void {
    logger.log('🧪 TEST: Manually triggering privileged access callback');
    threatActions.privilegedAccess();
  }

  /**
   * Test function to manually trigger any threat
   */
  public testThreat(threatType: keyof typeof threatActions): void {
    logger.log(`🧪 TEST: Manually triggering ${threatType} callback`);
    if (threatActions[threatType]) {
      threatActions[threatType]();
    } else {
      logger.error(`❌ Unknown threat type: ${threatType}`);
    }
  }

  /**
   * Test obfuscation issues (the current security threat you're seeing)
   */
  public testObfuscationIssues(): void {
    logger.log('🧪 TEST: Manually triggering obfuscationIssues callback');
    threatActions.obfuscationIssues();
  }

  /**
   * Force re-initialization for testing purposes
   */
  public async forceReInitialize(): Promise<void> {
    logger.log('🧪 TEST: Force re-initializing FreeRASP...');
    await this.reInitialize();
  }

  /**
   * Track a detected threat for re-triggering on foreground
   */
  public trackThreat(threatType: string): void {
    this.lastDetectedThreats.add(threatType);
    logger.log(`📝 Tracking threat for re-detection: ${threatType}`);
  }

  /**
   * Clear tracked threats
   */
  public clearTrackedThreats(): void {
    this.lastDetectedThreats.clear();
    logger.log('🧹 Cleared all tracked threats');
  }

  /**
   * Get current initialization status
   */
  public getStatus(): { isInitialized: boolean; isReInitializing: boolean } {
    return {
      isInitialized: this.isInitialized,
      isReInitializing: this.isReInitializing
    };
  }

  /**
   * Helper function to log security features status
   */
  private logSecurityFeatures(): void {
    logger.log('🔐 Active Security Features:');
    logger.log(`  - Root/Jailbreak Detection: ${securityConfig.enableRootJailbreakDetection ? '✅' : '❌'}`);
    logger.log(`  - Debugger Detection: ${securityConfig.enableDebuggerDetection ? '✅' : '❌'}`);
    logger.log(`  - App Integrity Check: ${securityConfig.enableAppIntegrityCheck ? '✅' : '❌'}`);
    logger.log(`  - Runtime Manipulation Detection: ${securityConfig.enableRuntimeManipulationDetection ? '✅' : '❌'}`);
    logger.log(`  - Device Security Checks: ${securityConfig.enableDeviceSecurityChecks ? '✅' : '❌'}`);
    logger.log(`  - Simulator Detection: ${securityConfig.enableSimulatorDetection ? '✅' : '❌'}`);
    logger.log(`  - Store Verification: ${securityConfig.enableStoreVerification ? '✅' : '❌'}`);
    logger.log(`  - VPN Detection: ${securityConfig.enableVPNDetection ? '✅' : '❌'}`);
    logger.log(`  - Developer Mode Detection: ${securityConfig.enableDeveloperModeDetection ? '✅' : '❌'}`);
    logger.log(`  - Device Binding Checks: ${securityConfig.enableDeviceBindingChecks ? '✅' : '❌'}`);
    logger.log(`  - Secure Hardware Checks: ${securityConfig.enableSecureHardwareChecks ? '✅' : '❌'}`);
    logger.log(`  - Obfuscation Checks: ${securityConfig.enableObfuscationChecks ? '✅' : '❌'}`);
  }
}

// Export singleton instance
export const freeRaspManager = new FreeRaspManager();

// Export class for testing
export { FreeRaspManager };

// Hook for backward compatibility with existing App.tsx
export const useFreeRaspSecurity = () => {
  // Note: This needs to be called from a useEffect in React components
  // since it's async now
  freeRaspManager.initialize();
};
