import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Platform,
  StyleSheet,
} from 'react-native';
import GifView from './common/GifView';
import AppConstants from '../constant/AppConstants';
import { quickHelpIcon } from '../utils/helpers';
import fonts from '../res/fonts';
import strings from '../res/strings';

interface QuickHelpItemProps {
  item: {
    fieldName: string;
  };
  handleCard: (titleVal: string) => void;
}

const QuickHelpItem = React.memo(({ item, handleCard }: QuickHelpItemProps) => {
  return (
    <TouchableOpacity
      key={item.fieldName}
      style={styles.itemContainer}
      activeOpacity={AppConstants.textActiveOpacity}
      onPress={() => handleCard(item.fieldName)}
    >
      <View>
        <View style={styles.imageWrapper}>
          <GifView
            source={
              Platform.OS === 'android'
                ? quickHelpIcon(item.fieldName, 'android')
                : quickHelpIcon(item.fieldName, 'ios')
            }
            style={styles.image}
          />
        </View>

        <View style={styles.imageTitleWrapper}>
          <Text style={styles.imageTitle}>{item.fieldName==="Disbursement Request"? strings.fund_request : item.fieldName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default QuickHelpItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    margin: 8,
  },
  image: {
    height: 56,
    width: 56,
    aspectRatio: 1,
  },
  imageTitle: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.regular,
    paddingHorizontal: 5,
  },
  imageWrapper: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitleWrapper: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
