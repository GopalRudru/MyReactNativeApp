import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDispatch } from "react-redux";

import imagePath from "../../../constant/imagePath";
import { createModuleLogger } from "../../../utils/logger";
import fonts from "../../../res/fonts";
import LoaderView from "../../../components/common/LoaderView";
import colors from "../../../res/colors";
import Header from "../../../components/common/Header";

const features = [
  { icon: imagePath.clipboardCheck, text: "View Account Statement" },
  { icon: imagePath.transferIn, text: "Tranche Request" },
  { icon: imagePath.coin, text: "Make Payment" },
  { icon: imagePath.fileText, text: "View Loan Details" },
  { icon: imagePath.calenderTime, text: "View Repayment Schedule" },
  { icon: imagePath.fileDollar, text: "View Loan Documents" },
];

const { width } = Dimensions.get("window");

interface NewApplicationScreenProps {
  updateLoadingFlag: (flag: boolean) => void;
}

const NewApplicationScreen = ({ updateLoadingFlag }: NewApplicationScreenProps) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const logger = createModuleLogger("WelcomeScreen");
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const stepsData = [
    {
      id: 1,
      title: "Eligibility Check",
      icon: imagePath.clipboardCheck,
    },
    {
      id: 2,
      title: "Applicant & Loan Details",
      icon: imagePath.listDetails,
    },
    {
      id: 3,
      title: "Provisional Offer Letter",
      icon: imagePath.mailOpened,
    },
    {
      id: 4,
      title: "Additional Details & Documents",
      icon: imagePath.id,
    },
    {
      id: 5,
      title: "Final Verification & Sanction",
      icon: imagePath.fileText,
    },
    {
      id: 6,
      title: "Disbursement of Funds",
      icon: imagePath.fileCheck,
    },
  ];

  const whyChooseData = [
    {
      id: 1,
      icon: imagePath.bolt,
      title: "Quick Approvals",
      description:
        "Get your loan approved in as little as 3 days with our streamlined digital process and minimal documentation.",
    },
    {
      id: 2,
      icon: imagePath.settings,
      title: "Customized Solutions",
      description:
        "Tailored loan structures based on your course, institution, and financial situation with flexible repayment options.",
    },
    {
      id: 3,
      icon: imagePath.currencyDollar,
      title: "100% Financing",
      description:
        "Cover all education expenses including tuition, accommodation, travel, and study materials with no hidden charges.",
    },
    {
      id: 4,
      icon: imagePath.headphones,
      title: "Expert Guidance",
      description:
        "Dedicated loan counselors to assist you throughout the application process and during your education journey.",
    },
  ];

  const stories = [
    {
      id: 1,
      text: "Avanse helped me pursue my MBA at ISB. Their quick processing and competitive interest rates made my dream possible.",
      name: "Priya Sharma",
    },
    {
      id: 2,
      text: "Thanks to Avanse's study abroad loan, I completed my MS in Computer Science from Stanford University.",
      name: "Rahul Gupta",
    },
    {
      id: 3,
      text: "The flexible repayment options from Avanse allowed me to focus on my medical studies without financial stress.",
      name: "Sanjeev Patel",
    },
  ];

  const loanCards = [
    {
      id: 1,
      icon: imagePath.academicCap,
      title: "Undergraduate Loans",
      bgColor: "#4FB2B2",
      points: [
        "Competitive interest rates",
        "Extended repayment terms",
        "Flexible financing options",
        "No collateral for loans under ₹10L",
      ],
    },
    {
      id: 2,
      icon: imagePath.book,
      title: "Postgraduate Loans",
      bgColor: "#F6B26B",
      points: [
        "Higher loan limits",
        "Deferred payment options",
        "Interest-only payment during study",
        "Special rates for premier institutes",
      ],
    },
    {
      id: 3,
      icon: imagePath.planeDeparture,
      title: "Study Abroad",
      bgColor: "#ED6C6D",
      points: [
        "Forex benefits",
        "International institution coverage",
        "Visa assistance",
        "Higher loan amounts upto ₹75L",
      ],
    },
  ];

  return (
    <SafeAreaView style={styless.safeArea}>
      <StatusBar backgroundColor={colors.white} barStyle="dark-content" />
      <Header
        onMenuPress={() => {}}
        onAvatarPress={() => {}}
        backIconNeeded={false}
        onBackPress={() => {}}
        onNotiIconPress={() => {}}
      />
      {/* <Header /> */}
      {/* <View style={styles.container}>
        <View style={styles.topSection}>
          <Image source={imagePath.avanseLogo} />
          <Image source={imagePath.avansePreLogin} style={styles.bannerImage} />
        </View>
        <View style={{ marginHorizontal: 20 }}>
          <Text style={styles.heading}>
            {strings.get_ready_to_revolutionize}
          </Text>
          <View style={styles.featuresContainer}>
            {features.map((feature) => (
              <View key={feature.text} style={styles.featureItem}>
                <Image source={feature.icon} style={styles.iconStyle} />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View> */}
      {/* <View style={{ backgroundColor: "#F5F6FA", flex: 1 }}> */}
      <ScrollView contentContainerStyle={styless.container1}>
        <View style={{ marginLeft: 16, marginTop: 16 }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: fonts.semiBold,
              color: "#168794",
              marginBottom: 16,
            }}
          >
            Our Loan Products
          </Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styless.scrollContainer}
          >
            {loanCards.map((item) => (
              <View
                key={item.id}
                style={[styless.card2, { backgroundColor: item.bgColor }]}
              >
                <View>
                  <Image
                    source={item.icon}
                    style={{ width: 18, height: 18, marginBottom: 10 }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: fonts.regular,
                    color: "white",
                    marginBottom: 15,
                  }}
                >
                  {item.title}
                </Text>

                {item.points.map((point, index) => (
                  <View key={index} style={styless.pointRow}>
                    <Text style={styless.tick}>✓</Text>
                    <Text style={styless.pointText}>{point}</Text>
                  </View>
                ))}

                <TouchableOpacity style={styless.button}>
                  <Text style={styless.buttonText}>APPLY NOW</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        <View
          style={{
            margin: 16,
            padding: 24,
            backgroundColor: "white",
            borderRadius: 8,
            elevation: 6,
            shadowColor: "#000000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          }}
        >
          <Text style={styless.headerText}>
            Your Path To Admission At Your Dream University
          </Text>

          {stepsData.map((item) => (
            <View key={item.id} style={styless.card}>
              <Image source={item.icon} style={styless.icon} />
              <Text style={styless.title}>{item.title}</Text>
            </View>
          ))}
        </View>
        <View
          style={{
            margin: 16,
            padding: 24,
            backgroundColor: "white",
            borderRadius: 8,
            elevation: 6,
            shadowColor: "#000000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
          }}
        >
          <Text style={styless.headerText}>Why You Should Choose Avanse?</Text>

          {whyChooseData.map((item) => (
            <View key={item.id} style={styless.itemContainer}>
              <Image
                source={item.icon}
                style={{
                  height: 56,
                  width: 56,
                  tintColor: colors.appThemeColor,
                }}
              />
              <Text style={[styless.title, { padding: 16, color: "#5D586C" }]}>
                {item.title}
              </Text>
              <Text style={styless.description}>{item.description}</Text>
            </View>
          ))}
        </View>
        <View
          style={{
            backgroundColor: "#4BA8A9",
            margin: 16,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
        >
          <Text
            style={[
              styless.headerText,
              { color: "white", marginHorizontal: 10 },
            ]}
          >
            Success Stories
          </Text>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
          >
            {stories.map((item) => (
              <View key={item.id} style={styless.card1}>
                <Text style={styless.quote}>“</Text>
                <Text style={styless.text}>{item.text}</Text>
                <Text style={styless.name}>{item.name}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styless.dotContainer}>
            {stories.map((_, index) => (
              <View
                key={index}
                style={[
                  styless.dot,
                  activeIndex === index && styless.activeDot,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      {/* <View style={{ paddingBottom: 24, marginHorizontal: 20 }}>
          <CustomButton
            title={strings.login_to_manage_loan}
            fontFamily={fonts.bold}
            // onPress={handleProceed}
            backgroundColor={colors.appThemeColor}
            imageNeeded={false}
            logoutImage={false}
            isDisabled={false}
          />
        </View> */}
      {isLoading && <LoaderView />}
      {/* </View> */}
    </SafeAreaView>
  );
};

const styless = StyleSheet.create({
  container: {
    padding: 16,
    // backgroundColor: "red",
    // backgroundColor: "#F7F9FB",
    backgroundColor: "#F5F6FA",
  },
  headerText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    // fontWeight: "600",
    color: "#168794",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF7F8",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#4CBEC7",
    borderStyle: "dotted",
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 16,
  },
  title: {
    fontSize: 15,
    // fontWeight: "500",
    fontFamily: fonts.semiBold,
    color: "#5A5959",
  },
  description: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: "#4B4B4B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  itemContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  quote: {
    fontSize: 50,
    color: "#F5C242",
    lineHeight: 50,
  },
  text: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#4B4B4B",
    marginVertical: 10,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#008688",
    marginTop: 10,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D3EAEA",
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: "#000000",
  },
  card1: {
    width: width - 90,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 5,
    borderRadius: 8,
    padding: 20,
  },
  scrollContainer: {
    marginBottom: 16,
    // margin: 16,
    // backgroundColor: "green",
    // paddingHorizontal: 16,
  },
  card2: {
    width: width - 35,
    borderRadius: 16,
    // margin: 16,
    padding: 20,
    // marginHorizontal: 5,
    marginRight: 10,
  },
  // title: {
  //   fontSize: 18,
  //   fontWeight: '600',
  //   color: '#FFFFFF',
  //   marginBottom: 16,
  // },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tick: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 10,
  },
  pointText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.regular,
    flex: 1,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "flex-start",
    elevation: 3,
  },
  buttonText: {
    color: "#000000",
    fontFamily: fonts.bold,
    // fontWeight: "600",
    fontSize: 14,
  },
  safeArea: {
    // height: "80%",
    // width: "100%",
    flex: 1,
    // backgroundColor: "#fff",
    //paddingBottom: 70,
    // backgroundColor: "green",
  },
  container1: {
    // padding: 16,
    flexGrow: 1,
    //justifyContent: 'space-between',
  },
});

export default NewApplicationScreen;
