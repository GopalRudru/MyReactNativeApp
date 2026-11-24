/**
 * App State Test Component
 * Simple component to test and display app state monitoring
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppState } from './useAppState';

export const AppStateTest: React.FC = () => {
  const { currentState, isActive, isBackground, isInactive } = useAppState();

  const getStateColor = () => {
    switch (currentState) {
      case 'active': return '#4CAF50';
      case 'background': return '#FF9800';
      case 'inactive': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStateIcon = () => {
    switch (currentState) {
      case 'active': return '✅';
      case 'background': return '📱';
      case 'inactive': return '⏸️';
      default: return '❓';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App State Monitor</Text>
      
      <View style={[styles.stateContainer, { backgroundColor: getStateColor() }]}>
        <Text style={styles.stateIcon}>{getStateIcon()}</Text>
        <Text style={styles.stateText}>{currentState.toUpperCase()}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Is Active:</Text>
          <Text style={[styles.value, { color: isActive ? '#4CAF50' : '#F44336' }]}>
            {isActive ? 'YES' : 'NO'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Is Background:</Text>
          <Text style={[styles.value, { color: isBackground ? '#FF9800' : '#F44336' }]}>
            {isBackground ? 'YES' : 'NO'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Is Inactive:</Text>
          <Text style={[styles.value, { color: isInactive ? '#F44336' : '#4CAF50' }]}>
            {isInactive ? 'YES' : 'NO'}
          </Text>
        </View>
      </View>

      <Text style={styles.instructions}>
        • Put app in background to see state change{'\n'}
        • Return to app to see it become active{'\n'}
        • Check console logs for detailed state transitions
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  stateIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  stateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AppStateTest;
