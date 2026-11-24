import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useRef } from 'react'
import LottieView from 'lottie-react-native';
import imagePath from '../../constant/imagePath'

const AppLoadingView = () => {
  const animationRef = useRef<LottieView>(null);
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={imagePath.loaderLogo} style={styles.overlayImage} />
        <LottieView
          ref={animationRef}
          source={imagePath.loading}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    </View>
  );
}

export default AppLoadingView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.blackOpacity10,
    backgroundColor: "rgba(0,0,0)",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    width: 140,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    padding: 0,
    //borderRadius: 6,
    backgroundColor: 'transparent',
    position: 'relative',
    // elevation: 2

  },
  image: {
    height: 140,
    width: 140,
    aspectRatio: 1,
    borderRadius: 6
  },
  lottie: {
    position: 'absolute',
    width: 180,
    height: 180,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -90 }, { translateY: -90 }],
    zIndex: 2,
  },
  overlayImage: {
    position: 'absolute',
    width: 28,
    height: 28,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -14 }, { translateY: -14 }],
    zIndex: 1,
  },
});