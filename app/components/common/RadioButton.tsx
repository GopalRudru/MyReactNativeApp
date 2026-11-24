// RadioButton.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AppConstants from '../../constant/AppConstants';

const RadioButton = ({ selected, onPress }) => (
  <TouchableOpacity activeOpacity={AppConstants.buttonActiveOpacity} onPress={onPress} style={styles.outer}>
    {selected && <View style={styles.inner} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  outer: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00B3B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#00B3B5',
  },
});

export default RadioButton;
