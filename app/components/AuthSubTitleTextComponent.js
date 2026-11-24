import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import colors from '../res/colors'
import { moderateScale, moderateVerticalScale } from 'react-native-size-matters'
import fonts from '../res/fonts'

const AuthSubTitleTextComponent = ({text, textStyle={}}) => {
  return (
    <View>
      <Text style={{...styles.textStyle, ...textStyle}}>{text}</Text>
    </View>
  )
}

export default AuthSubTitleTextComponent

const styles = StyleSheet.create({
    textStyle: {
        color: colors.timerTextColor,
        fontSize: 15,
        //fontWeight:'500',
        fontFamily: fonts.medium,
    }
})