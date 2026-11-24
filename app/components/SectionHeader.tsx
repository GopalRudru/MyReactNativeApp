import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import fonts from '../res/fonts';
import strings from '../res/strings';

type SectionHeaderProps = {
  title: string;
  showViewAll?: boolean;
  onPressViewAll?: () => void;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, showViewAll, onPressViewAll }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {showViewAll && (
        <TouchableOpacity onPress={onPressViewAll}>
          <Text style={styles.viewAll}>{strings.View_all_loans}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontWeight: "600",
    fontSize: 13,
    color: "#168794",
    lineHeight: 24,
    fontFamily: fonts.bold,
  },
  viewAll: {
    fontSize: 13,
    color: "#168794",
    fontWeight: "600",
    lineHeight: 24,
    fontFamily: fonts.bold,
  },
});