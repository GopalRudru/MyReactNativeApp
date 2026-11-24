import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { scale } from 'react-native-size-matters'

const Space = ({style={}}) => {
  return (
    <View style={{...styles.viewStyle, ...style}}/>
  )
}

export default Space

const styles = StyleSheet.create({
    viewStyle: {
        height:scale(70),
        width:'100%'
    }
})