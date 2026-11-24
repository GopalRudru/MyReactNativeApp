import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useAppState } from './useAppState';
import { appStateMonitor } from './AppStateMonitor';

export const FreeRaspReInitTest: React.FC = () => {
  const appState = useAppState();
  const [stateHistory, setStateHistory] = useState<string[]>([]);

  useEffect(() => {
    // Add callback to track state changes for testing
    const callback = (state: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setStateHistory(prev => [...prev.slice(-4), `${timestamp}: ${state}`]);
    };

    appStateMonitor.addCallback(callback);

    return () => {
      appStateMonitor.removeCallback(callback);
    };
  }, []);

  const simulateBackgroundForeground = () => {
    Alert.alert(
      'Test Instructions',
      'To test FreeRASP re-initialization:\n\n' +
      '1. Press Home button to background the app\n' +
      '2. Wait a moment\n' +
      '3. Return to the app\n' +
      '4. Check console logs for re-initialization messages\n\n' +
      'Look for:\n' +
      '🔄 Re-initializing FreeRASP on foreground...\n' +
      '✅ FreeRASP re-initialized successfully',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FreeRASP Re-Init Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Current App State:</Text>
        <Text style={[styles.statusValue, { color: appState.currentState === 'active' ? '#4CAF50' : '#FF9800' }]}>
          {appState.currentState.toUpperCase()}
        </Text>
      </View>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent State Changes:</Text>
        {stateHistory.map((entry) => (
          <Text key={entry} style={styles.historyItem}>
            {entry}
          </Text>
        ))}
      </View>

      <Button
        title="How to Test FreeRASP Re-Init"
        onPress={simulateBackgroundForeground}
        color="#2196F3"
      />

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>What happens on foreground:</Text>
        <Text style={styles.infoItem}>• FreeRASP listeners removed</Text>
        <Text style={styles.infoItem}>• New threat listeners set</Text>
        <Text style={styles.infoItem}>• All security checks re-executed</Text>
        <Text style={styles.infoItem}>• Fresh security validation</Text>
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
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  historyItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
  },
  infoItem: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 3,
  },
});

export default FreeRaspReInitTest;
