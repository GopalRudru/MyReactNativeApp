import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import fonts from '../../res/fonts'
import { moderateScale } from 'react-native-size-matters'
import strings from '../../res/strings'
import colors from '../../res/colors'

const LoadingText = ({mainStyle={}, textStyle={}}) => {
  return (
    <View style={mainStyle}>
      <Text style={[styles.noRecordTextStyle, textStyle]}>{strings.loading}</Text>
    </View>
  )
}

export default LoadingText

const styles = StyleSheet.create({
    noRecordTextStyle: {
        color: colors.guidelinesTextColor,
        fontFamily: fonts.regular,
        fontSize: moderateScale(12),
        fontWeight: '400',
        textAlign:'center',
        
    }
})