/**
 * Logger Usage Examples
 * 
 * This file demonstrates how to use the logger utility in different scenarios.
 * Copy these examples to your components and replace with your actual logging needs.
 */

import { 
  logger, 
  authLogger, 
  otpLogger, 
  apiLogger, 
  createModuleLogger,
  logNetworkRequest,
  performanceLogger 
} from './logger';

/**
 * Basic logging examples
 */
export const basicLoggingExamples = () => {
  // Simple message
  logger.log('Application started');
  
  // With additional data
  logger.info('User data loaded', { userId: 123, name: 'John' });
  
  // Warning
  logger.warn('API rate limit approaching', { remaining: 5 });
  
  // Error
  logger.error('Failed to load data', new Error('Network timeout'));
  
  // Debug (most verbose)
  logger.debug('Component state updated', { newState: 'loading' });
};

/**
 * Module-specific logging examples
 */
export const moduleLoggingExamples = () => {
  // Authentication logs
  authLogger.info('User login attempt', { email: 'user@example.com' });
  authLogger.error('Login failed', { reason: 'Invalid credentials' });
  
  // OTP logs
  otpLogger.info('OTP sent successfully');
  otpLogger.warn('OTP verification failed', { attempts: 3 });
  
  // API logs
  apiLogger.info('Making API request', { endpoint: '/api/users' });
};

/**
 * Table logging for objects/arrays
 */
export const tableLoggingExample = () => {
  const userData = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ];
  
  logger.table(userData);
};

/**
 * Grouped logging for related operations
 */
export const groupedLoggingExample = () => {
  logger.group('User Registration Process');
  logger.info('Validating input data');
  logger.info('Checking email availability');
  logger.info('Creating user account');
  logger.groupEnd();
};

/**
 * Performance timing example
 */
export const performanceLoggingExample = () => {
  // Start timing
  performanceLogger.start('data-processing');
  
  // Simulate some work
  // ... your code here ...
  
  // End timing (will show elapsed time)
  performanceLogger.end('data-processing');
};

/**
 * Network request logging example
 */
export const networkLoggingExample = () => {
  const payload = { email: 'user@example.com', password: 'secret' };
  const response = { success: true, token: 'abc123' };
  
  logNetworkRequest('POST', '/api/auth/login', payload, response);
};

/**
 * Custom module logger example
 */
export const customModuleLoggerExample = () => {
  const paymentLogger = createModuleLogger('PAYMENT');
  
  paymentLogger.info('Processing payment', { amount: 100, currency: 'USD' });
  paymentLogger.error('Payment failed', { errorCode: 'INSUFFICIENT_FUNDS' });
};

/**
 * React component logging example
 */
export const componentLoggingExample = () => {
  const componentLogger = createModuleLogger('UserProfile');
  
  // In useEffect
  componentLogger.info('Component mounted');
  
  // In event handlers
  componentLogger.debug('Button clicked', { buttonId: 'save-profile' });
  
  // In error boundaries
  componentLogger.error('Component error', { error: 'Render failed' });
};

/**
 * Redux logging example
 */
export const reduxLoggingExample = () => {
  const reduxLogger = createModuleLogger('REDUX');
  
  reduxLogger.info('Action dispatched', { type: 'USER_LOGIN_SUCCESS' });
  reduxLogger.debug('State updated', { 
    previousState: { isLoggedIn: false }, 
    newState: { isLoggedIn: true } 
  });
};
