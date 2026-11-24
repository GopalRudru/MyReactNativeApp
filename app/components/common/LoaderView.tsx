import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { scale } from 'react-native-size-matters'
import colors from '../../res/colors'

const LoaderView = () => {
    return (
        <View style={styles.mainContainerStyle}>

            <ActivityIndicator
                size={scale(50)}
                color={colors.appThemeColor}
                style={{}} />
                
        </View>
    )
}

export default LoaderView

const styles = StyleSheet.create({
    mainContainerStyle: {
        flex: 1,
        backgroundColor: colors.blackOpacity01,
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
    }
})