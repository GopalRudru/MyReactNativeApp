import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageStyle,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import imagePath from "../constant/imagePath";
import {
  moderateScale,
  moderateVerticalScale,
  scale,
} from "react-native-size-matters";
import mainStyle from "../res/mainStyles";
import colors from "../res/colors";
import {
  businessTypeLabel,
  capitalizeFirstLetter,
  loginTypeIcon,
} from "../utils/helpers";
import fonts from "../res/fonts";
import AppConstants from "../constant/AppConstants";
import logiTypeStyle from "../screens/auth/loginType/styles";
import { decrypt } from "../utils/crypto";

const ListComponent = ({
  data,
  selectedTypeId,
  setSelectedTypeId,
  registerKey,
}) => {
  const [cifVisisble, setCifVisisble] = useState(true);

  useEffect(() => {
    if (data?.length === 2) {
      const shouldHideCif = data.some(
        (item) =>
          item?.name?.toLowerCase().includes("retail") ||
          item?.name?.toLowerCase().includes("entity")
      );
      if (shouldHideCif) {
        setCifVisisble(false);
      }
    }
  }, [data]);

  const renderOption = ({ item }) => {
    const isSelected =
      registerKey === "register"
        ? selectedTypeId === item?.custcif
        : selectedTypeId === item?.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          logiTypeStyle.optionContainer,
          isSelected && logiTypeStyle.selectedContainer,
          { justifyContent: "space-between" },
        ]}
        onPress={() =>
          setSelectedTypeId(
            registerKey === "register" ? item?.custcif : item?.id
          )
        }
        activeOpacity={0.8}
      >
        <View style={mainStyle.horizontalView}>
          <View
            style={[
              logiTypeStyle.iconContainer,
              {
                backgroundColor: isSelected
                  ? colors.appThemeColor
                  : colors.iconContainerUnselectedColor,
              },
            ]}
          >
            <Image
              source={loginTypeIcon(item.name)}
              style={[
                logiTypeStyle.optionContainerIcon as ImageStyle,
                { tintColor: isSelected ? colors.white : colors.appThemeColor },
              ]}
            />
          </View>

          <View>
            <Text style={logiTypeStyle.optionText}>
              {registerKey === "register"
                ? item.custfname
                : capitalizeFirstLetter(item?.name)}
            </Text>
            <Text style={styles.cifTextStyle}>
              {registerKey === "register"
                ? item.custcif
                : decrypt(item?.cifNumber)}
            </Text>
          </View>
        </View>

        <View style={logiTypeStyle.radioCircle}>
          {isSelected && <View style={logiTypeStyle.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View
      style={{
        maxHeight: 264,
        borderWidth: 1,
        borderColor: colors.guidelinesTextColor,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingTop: 10,
      }}
    >
      <FlatList
        data={data}
        horizontal={false}
        showsVerticalScrollIndicator={true}
        renderItem={renderOption}
        // renderItem={({ item }) => (
        //     <Item item={item} cifVisisble={cifVisisble}  />
        // )}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={false}
        windowSize={5}
        initialNumToRender={data?.length || 0}
      />
    </View>
  );
};

const Item = ({ item, cifVisisble }) => {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={() => {}}>
      <View style={{ ...mainStyle.horizontalView, ...styles.mainContainer }}>
        <View style={[mainStyle.horizontalView, { alignItems: "center" }]}>
          <Image
            source={imagePath.profileIcon}
            style={styles.profileIconStyle}
          />

          <View style={styles.nameContainerStyle}>
            <Text style={styles.nameTextStyle}>
              {capitalizeFirstLetter(item.name)}
            </Text>
            <Text style={styles.cifTextStyle}>{item.id}</Text>
          </View>
        </View>

        <Image
          source={imagePath.rbSelected}
          style={styles.rbSelectedIconStyle}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ListComponent;

const styles = StyleSheet.create({
  mainContainer: {
    borderColor: colors.black,
    borderWidth: scale(1),
    borderRadius: scale(4),
    marginTop: moderateVerticalScale(15),
    paddingVertical: moderateVerticalScale(7),
    paddingHorizontal: moderateScale(7),
    justifyContent: "space-between",
  },
  profileIconStyle: {
    width: scale(33),
    height: scale(33),
  },
  nameContainerStyle: {
    marginStart: scale(16),
  },
  nameTextStyle: {
    fontSize: 18,
    color: colors.darkGrayColor,
    fontWeight: AppConstants.FontWeight_400,
    fontFamily: fonts.regular,
  },
  cifTextStyle: {
    fontSize: moderateScale(15),
    color: colors.cifNumberTextColor,
    fontWeight: "400",
  },
  rbSelectedIconStyle: {
    width: scale(18),
    height: scale(18),
    alignSelf: "center",
  },
});
