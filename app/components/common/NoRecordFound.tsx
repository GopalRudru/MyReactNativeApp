import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import fonts from '../../res/fonts'
import { moderateScale } from 'react-native-size-matters'
import strings from '../../res/strings'
import colors from '../../res/colors'
import { isEmpty } from '../../utils/helpers'

const NoRecordFound = ({textmainStyle={}, textStyle={}, text=''}) => {
  return (
    <View style={textmainStyle}>
      <Text style={[styles.noRecordTextStyle, textStyle]}>{isEmpty(text) ? strings.noRecordFound : text}</Text>
    </View>
  )
}

export default NoRecordFound

const styles = StyleSheet.create({
    noRecordTextStyle: {
        color: colors.guidelinesTextColor,
        fontFamily: fonts.regular,
        fontSize: moderateScale(12),
        fontWeight: '400',
        textAlign:'center',
        
    }
})