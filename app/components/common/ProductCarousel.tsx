import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import fonts from "../../res/fonts";
import * as NavigationService from "../../navigation/NavigationService";
import colors from "../../res/colors";
import navigationStrings from "../../constant/navigationStrings";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.82;
const SPACING = 10;

const DATA = [
  {
    id: "1",
    title: "Education Loan: Fuel Your Dreams with Avanse",
    image:
      "https://www.avanse.com/viewPagesAssets/img/study-abroad-home-new.webp",
  },
  {
    id: "2",
    title: "Get an Avanse Loan for Students",
    image:
      "https://www.avanse.com/viewPagesAssets/img/home-banner-new-girl.webp",
  },
  {
    id: "3",
    title: "Study Abroad Loans Made Easy",
    image:
      "https://www.avanse.com/viewPagesAssets/img/ticket-to-our-dreams2.webp",
  },
];

const ProductCarousel = () => {
  return (
    <View>
      <Text style={styles.heading}>Our Popular Products</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        bounces={false}
        snapToAlignment="start"
        contentContainerStyle={{
          paddingHorizontal: SPACING,
        }}
      >
        {DATA?.map((item) => (
          <View style={styles.shadowWrapper} key={item.id}>
            <View key={item.id} style={styles.card}>
              <View style={{ padding: 16 }}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="contain"
                />

                {/* Text overlay */}
                <View
                  style={[
                    styles.overlay,
                    { paddingHorizontal: 16, paddingBottom: 0 },
                  ]}
                >
                  <Text numberOfLines={2} style={styles.title}>
                    {item.title}
                  </Text>
                </View>

                {/* CTA */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.button}
                  onPress={() => {
                    NavigationService.navigate("Register", {applyNowRegisterFlow: true});
                  }}
                >
                  <Text style={styles.buttonText}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    //marginLeft: 16,
    //marginBottom: 12,
  },
  shadowWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginRight: SPACING,
    overflow: "hidden",
    elevation: 6,
    marginVertical: 13,
  },
  image: {
    width: "100%",
    height: 190,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  overlay: {
    position: "absolute",
    bottom: 64,
    left: 1,
    right: 1,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    paddingHorizontal: 16,
    fontFamily: fonts.semiBold,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    // backgroundColor: "#DDDDDD",
    // fontWeight: "600",
  },
  button: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});

export default ProductCarousel;
