import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import imagePath from "../../../constant/imagePath";
import AppConstants from "../../../constant/AppConstants";
import * as NavigationService from "../../../navigation/NavigationService";
import navigationStrings from "../../../constant/navigationStrings";
import ShadowCardComponent from "../../../components/ShadowCardComponent";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import Carousel from "react-native-reanimated-carousel";

interface ReferralBannersProps {
  isTermLoanLoading?: boolean;
  awsBannerVisible?: boolean;
}

const NAVIGATION_TYPE = {
  WEBVIEW: "WEBVIEW",
  SCREEN: "SCREEN",
};

const ReferralBanners: React.FC<ReferralBannersProps> = ({
  isTermLoanLoading,
  awsBannerVisible,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const bannerHeight = screenWidth / 2.4;
  const [showAwsBanner, setShowAwsBanner] = React.useState(awsBannerVisible);

  const bannerData = [
    {
      id: 1,
      imagePath: imagePath.referralBanner,
      bannerType: "REFERRAL",
      navigation: {
        type: NAVIGATION_TYPE.WEBVIEW,
        screen: navigationStrings.WEB_VIEW_SCREEN,
        url: AppConstants.referralBannerUrl,
      },
    },
    {
      id: 2,
      imagePath: imagePath.awsBanner,
      bannerType: "AWS",
      navigation: {
        type: NAVIGATION_TYPE.SCREEN,
        screen: navigationStrings.AWS_FORM,
        url: "",
      },
    },
  ];

  useEffect(() => {
    setShowAwsBanner(awsBannerVisible);
  }, [awsBannerVisible]);

  let filteredBannerData = bannerData.filter(
    (item) =>
      item.bannerType === "REFERRAL" ||
      (item.bannerType === "AWS" && showAwsBanner === true),
  );

  const onBannerImagePress = (item) => {
    if (item.navigation.type === NAVIGATION_TYPE.WEBVIEW) {
      NavigationService.navigate(item.navigation.screen, {
        URL: item.navigation.url,
      });
    } else if (item.navigation.type === NAVIGATION_TYPE.SCREEN) {
      NavigationService.navigate(item.navigation.screen);
    }
  };

  const ShimmerCard = () => {
    return (
      <View>
        <View style={styles.row}>
          <ShimmerPlaceHolder
            style={{ width: "100%", height: bannerHeight }}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ marginHorizontal: 0, borderRadius: 0 }}>
      <ShadowCardComponent
        paddingHorizonatal={0.1}
        paddingVertical={0.1}
        marginVertical={1}
        marginHorizontal={16}
      >
        {isTermLoanLoading ? (
          <ShimmerCard />
        ) : (
          <View>
            <Carousel
              key={filteredBannerData.length}
              loop={filteredBannerData.length > 1}
              width={screenWidth - 32}
              height={bannerHeight}
              autoPlay
              data={filteredBannerData}
              scrollAnimationDuration={3000}
              renderItem={({ item }) => (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={[styles.bannerImage, { height: bannerHeight }]}
                    activeOpacity={AppConstants.buttonActiveOpacity}
                    onPress={() => onBannerImagePress(item)}
                  >
                    <Image
                      source={item.imagePath}
                      style={[styles.bannerImage, { height: bannerHeight }]}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </ShadowCardComponent>
    </View>
  );
};

export default ReferralBanners;

const styles = StyleSheet.create({
  bannerImage: {
    width: "100%",
    resizeMode: "stretch",
    backgroundColor: "white",
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    padding: 1,
  },
});
