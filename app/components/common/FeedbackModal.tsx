import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Image,
  Linking,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import imagePath from "../../constant/imagePath";
import fonts from "../../res/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../../res/colors";
import { authSelector } from "../../services/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { decrypt, encrypt, encryptObject } from "../../utils/crypto";
import service from "../../services/api/service";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import DialogStatusPopup from "./DialogStatusPopup";
import AppConstants from "../../constant/AppConstants";
import Toast from "./Toast";
import logger from "../../utils/logger";
import LoaderView from "./LoaderView";

type FeedbackType = "initial" | "like" | "dislike" | null;

const BottomSheet: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <View style={styles.handle} />
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

interface FeedbackModalProps {
  // handleSubmitFeedback: (value: string) => void;
  setShowCustomerRating?: (value: boolean) => void;
  screen: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  setShowCustomerRating,
  screen,
}) => {
  const [activeModal, setActiveModal] = useState<FeedbackType>("initial");
  const [feedback, setFeedback] = useState<string>('');
  const { userProfile } = useSelector(authSelector);
  const dispatch = useDispatch();
  const [invalidInput, setInvalidInput] = useState(false);
  const selectedLoanNumber = useSelector(
    (state: RootState) => state.dashboardData.selectedLoanNumber,
  );

  const closeModal = async () => {
    const val = await AsyncStorage.getItem("reviewAsked");
    setActiveModal(null);
    setShowCustomerRating?.(false);
  };
  const [showTost, setShowTost] = useState(false);
  const [tostMessage, setTostMessage] = useState("Thank you for sharing your thoughts with us. We appreciate your feedback!");
  const [severity, setSeverity] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  const PrimaryButton = ({ label, onPress }: any) => (
    <TouchableOpacity
      style={[
        label === "Rate Now"
          ? styles.primaryBtn
          : feedback.length > 0
          ? styles.primaryBtn
          : styles.primaryBtnDisable,
      ]}
      activeOpacity={AppConstants.buttonActiveOpacity}
      onPress={onPress}
      disabled={label === "Rate Now" ? false : feedback.length === 0}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  );

  const OutlineButton = ({ label, onPress }: any) => (
    <TouchableOpacity style={styles.outlineBtn} activeOpacity={AppConstants.buttonActiveOpacity} onPress={onPress}>
      <Text style={styles.outlineText}>{label}</Text>
    </TouchableOpacity>
  );
  const handleThumbsUp = async () => {
    setActiveModal("like");
    await AsyncStorage.setItem("reviewAsked", "true");
    // const version = DeviceInfo.getVersion();
    // await AsyncStorage.setItem(REVIEW_KEY, version);

    // setTimeout(() => {
    //   console.log("InAppReview.isAvailable()", InAppReview.isAvailable());
    //   if (InAppReview.isAvailable()) {
    //     InAppReview.RequestInAppReview();
    //   } else {
    //     openStore();
    //   }
    // }, 400);
  };

  const handleSubmit = async () => {
    setActiveModal(null);

    // const res=await
  };

  const handleFeedback = async (
    feedbackType: string,
    clickedRateUs?: boolean,
    thumbsDownMaybeLater?: boolean,
  ) => {
    Keyboard.dismiss()
    if (
      !thumbsDownMaybeLater && feedbackType === "ThumbsDown" &&
      (feedback === null || feedback === undefined || feedback.trim() === "")
    ) {
      setInvalidInput(true);
      setFeedback("");
      return;
    }

    // setInvalidInput(false);
    // setActiveModal(null);
    // setShowCustomerRating?.(false);

    const data = {
      cifNumber: decrypt(userProfile?.cifNumber),
      lan: selectedLoanNumber?.trim(),
      journeyType: screen,
      feedbackType: feedbackType,
      feedbackComment: feedback?.trim(),
      clickedRateUs: clickedRateUs ?? false,
    };
    setIsLoading(true);
    const payload = { data: encryptObject(data) };
    try {
      const res = await service.posts.secureAddPost(
        "api/v1/user/give-ratings",
        payload,
      );
      if (
        !clickedRateUs &&
        feedback?.trim() === "" &&
        feedbackType === "ThumbsUp"
      ) {
        setShowTost(false);
        setInvalidInput(false);
        setActiveModal(null);
        setShowCustomerRating?.(false);
      } else if (
        !clickedRateUs &&
        feedback?.trim() === "" &&
        feedbackType === "Skip"
      ) {
        setShowTost(false);
        setInvalidInput(false);
        setActiveModal(null);
        setShowCustomerRating?.(false);
      } else if (
        clickedRateUs &&
        feedback?.trim() === "" &&
        feedbackType === "ThumbsUp"
      ) {
        setShowTost(false);
        setInvalidInput(false);
        setActiveModal(null);
        setShowCustomerRating?.(false);
      } else {
        setFeedback("");
        setSeverity("success");
        setTostMessage(
          "Thank you for sharing your thoughts with us. We appreciate your feedback!",
        );
        setShowTost(true);
      }
    } catch (error) {
      setSeverity("error")
      setTostMessage("An error occurred. Please try again.")
      setShowTost(true);
      // dispatch(
      //   setStatusPopup({
      //     status: "error",
      //     message: "Please enter a valid mobile number",
      //   }),
      // );
    } finally {
      setIsLoading(false);
    }
  };

  const openPlayStoreRating = () => {
    // setActiveModal(null);
    handleFeedback("ThumbsUp", true);
    const packageName = "com.customermobapp.avanse";

    const playStoreUrl =
      "market://details?id=com.customermobapp.avanse&reviewId=0";
    const iosReviewUrl =
      "itms-apps://itunes.apple.com/app/id6752022757?action=write-review";
    const webFallbackUrl = Platform.OS === "ios"
      ? "https://apps.apple.com/app/id6752022757?action=write-review"
      : "https://play.google.com/store/apps/details?id=com.customermobapp.avanse";

    Linking.openURL(Platform.OS === "ios" ? iosReviewUrl : playStoreUrl).catch(
      () => {
        Linking.openURL(webFallbackUrl);
      },
    );
  };

  const openStore = () => {
    const url =
      Platform.OS === "ios"
        ? "itms-apps://itunes.apple.com/app/idYOUR_APP_ID?action=write-review"
        : "market://details?id=YOUR_PACKAGE_NAME";

    Linking.openURL(url);
  };

  return (
    <>
      <Modal
        transparent
        visible={activeModal === "initial"}
        animationType="slide"
      >
        <BottomSheet>
          <Text style={styles.title}>How was your experience?</Text>

          <View style={styles.iconRow}>
            <TouchableOpacity
              style={styles.likeBtn}
              onPress={() => handleThumbsUp()}
            >
              <Image
                source={imagePath.like}
                style={{ height: 20, width: 20 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dislikeBtn}
              onPress={() => setActiveModal("dislike")}
            >
              <Image
                source={imagePath.disLike}
                style={{ height: 20, width: 20 }}
              />
            </TouchableOpacity>
          </View>

          <OutlineButton label="Skip" onPress={() => handleFeedback("Skip")} />
        </BottomSheet>
      </Modal>

      <Modal transparent visible={activeModal === "like"} animationType="slide">
        <BottomSheet>
          {/* <Text style={styles.emoji}>🙏</Text> */}
          <Image
            source={imagePath.thankYou}
            style={{ height: 40, width: 40, marginBottom: 10 }}
          />
          <Text style={styles.title}>Glad you liked it!</Text>
          <Text style={styles.subTitle}>Would you like to rate us?</Text>

          <PrimaryButton label="Rate Now" onPress={openPlayStoreRating} />
          <OutlineButton
            label="Maybe later"
            //onPress={() => handleFeedback("Maybe Later", true)}
            onPress={() => handleFeedback("ThumbsUp", false)}
          />
        </BottomSheet>
      </Modal>

      <Modal
        transparent
        visible={activeModal === "dislike"}
        animationType="slide"
      >
        <Toast
          open={showTost}
          message={tostMessage}
          severity={severity}
          onClose={() => {
            setShowTost(false);
            setInvalidInput(false);
            setActiveModal(null);
            setShowCustomerRating?.(false);
          }}
        />
        <BottomSheet>
          <Text style={[styles.title, { marginBottom: 12 }]}>
            We're sorry this didn’t meet your expectations.
          </Text>

          <TextInput
            placeholder="Please tell us what we can improve..."
            style={[
              styles.input,
              {
                borderColor: invalidInput ? "red" : "#D1D5DB",
                marginBottom: invalidInput ? 0 : 16,
              },
            ]}
            multiline
            value={feedback}
            maxLength={500}
            onChangeText={(text) => {
              setFeedback(text);
              if (invalidInput) {
                setInvalidInput(false);
              }
            }}
          />

          {!!invalidInput && (
            <Text style={styles.helperText}>Please enter a valid input.</Text>
          )}

          <PrimaryButton
            label="Submit feedback"
            onPress={() => handleFeedback("ThumbsDown")}
          />
          {/* <OutlineButton
            label="Maybe later"
            onPress={() => handleFeedback("ThumbsDown", false, true)}
          /> */}

          { isLoading && <LoaderView /> }
        </BottomSheet>
      </Modal>
      <DialogStatusPopup />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: "#CDCFD0",
    borderRadius: 2.5,
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    color: "#212226",
    fontFamily: fonts.semiBold,
    // fontWeight: "600",
    textAlign: "center",
    // marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#090A0A",
    marginBottom: 20,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: "row",
    gap: 20,
    marginVertical: 20,
  },
  likeBtn: {
    backgroundColor: "#EDF9F9",
    padding: 18,
    borderRadius: 8,
  },
  dislikeBtn: {
    backgroundColor: "#FAE3E3",
    padding: 18,
    borderRadius: 8,
  },
  icon: {
    fontSize: 26,
  },
  input: {
    borderWidth: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    height: 90,
    width: "100%",
    marginBottom: 16,
    textAlignVertical: "top",
  },
  primaryBtn: {
    backgroundColor: "#0BB3B3",
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryBtnDisable: {
    backgroundColor: colors.disabledBackGroundColor,
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#FFF",

    textAlign: "center",
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#0BB3B3",
    width: "100%",
    padding: 12,
    borderRadius: 8,
  },
  outlineText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: "#0BB3B3",

    textAlign: "center",
  },
  helperText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    alignContent: "flex-start",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
});

export default FeedbackModal;
