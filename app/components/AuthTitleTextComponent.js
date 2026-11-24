import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import colors from '../res/colors'
import fonts from '../res/fonts'
const AuthTitleTextComponent = ({text, textStyle={}}) => {
  return (
    <View>
      <Text style={[styles.textStyle, textStyle]}>{text}</Text>
    </View>
  )
}

export default AuthTitleTextComponent

const styles = StyleSheet.create({
    textStyle: {
        color: colors.colorTitleText,
        fontSize: 23,
       // fontWeight:'700',
        letterSpacing: -2,
        lineHeight:48.41,
        fontFamily: fonts.bold,

    }
})