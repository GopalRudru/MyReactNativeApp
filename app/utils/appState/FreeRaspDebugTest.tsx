import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { freeRaspManager } from '../../security/FreeRaspManager';
import { useAppState } from './useAppState';
import { createModuleLogger } from '../logger';

const logger = createModuleLogger("FreeRaspDebugTest");

export const FreeRaspDebugTest: React.FC = () => {
  const { currentState } = useAppState();

  const testObfuscationIssues = () => {
    Alert.alert(
      'Testing Obfuscation Issues',
      'This will trigger the obfuscationIssues threat that you mentioned. You should see a security popup.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Test',
          onPress: () => {
            freeRaspManager.testObfuscationIssues();
          }
        }
      ]
    );
  };

  const forceReInitialize = () => {
    Alert.alert(
      'Force Re-Initialize FreeRASP',
      'This will manually trigger FreeRASP re-initialization. Use this to test if re-initialization works.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Re-Initialize',
          onPress: () => {
            freeRaspManager.forceReInitialize().catch(error => {
              logger.error('Re-initialization failed:', error);
            });
          }
        }
      ]
    );
  };

  const simulateBackgroundForeground = () => {
    Alert.alert(
      'Test Background/Foreground Flow',
      'To test the issue:\n\n' +
      '1. Press "Test Obfuscation" first to see the security popup\n' +
      '2. Close the popup\n' +
      '3. Go to background (press home button)\n' +
      '4. Return to foreground\n' +
      '5. The security popup should appear again\n\n' +
      'If it doesn\'t appear, the re-initialization is not working correctly.',
      [{ text: 'OK' }]
    );
  };

  const status = freeRaspManager.getStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FreeRASP Debug Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>App State:</Text>
        <Text style={[styles.statusValue, { color: currentState === 'active' ? '#4CAF50' : '#FF9800' }]}>
          {currentState.toUpperCase()}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>FreeRASP Status:</Text>
        <Text style={styles.statusItem}>
          Initialized: {status.isInitialized ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusItem}>
          Re-initializing: {status.isReInitializing ? '🔄' : '⏸️'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Test Obfuscation Issues"
          onPress={testObfuscationIssues}
          color="#FF5722"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Force Re-Initialize"
          onPress={forceReInitialize}
          color="#2196F3"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="How to Test"
          onPress={simulateBackgroundForeground}
          color="#4CAF50"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Debug Info:</Text>
        <Text style={styles.infoItem}>• Check console logs for detailed information</Text>
        <Text style={styles.infoItem}>• Look for "🔄 Re-initializing FreeRASP" logs</Text>
        <Text style={styles.infoItem}>• Security popup flag should reset on foreground</Text>
        <Text style={styles.infoItem}>• All security checks should re-execute</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  infoContainer: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  infoItem: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 3,
  },
});

export default FreeRaspDebugTest;
