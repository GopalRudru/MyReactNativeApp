import React from "react";
import moment from "moment";
import { StyleSheet, Text } from "react-native";
import colors from "../../res/colors";
import fonts from "../../res/fonts";

type FormattedDateProps = {
  createdAt: string;
};

const FormattedDate: React.FC<FormattedDateProps> = ({ createdAt }) => {
  // Parse the date string
  const date = moment.parseZone(createdAt);

  // Convert to Indian Standard Time (IST)
  const istDate = date.clone().utcOffset("+05:30");

  // Calculate the difference from the current time
  const now = moment();
  const secondsDifference = now.diff(date, "seconds");
  const minutesDifference = now.diff(date, "minutes");
  const hoursDifference = now.diff(date, "hours");
  const daysDifference = now.diff(date, "days");

  // Format the IST date and time with AM/PM notation
  const formattedDate = istDate.format("DD-MM-YYYY hh:mm:ss A");

  let displayTime;
  if (secondsDifference < 60) {
    displayTime = `${secondsDifference} seconds ago`;
  } else if (minutesDifference < 60) {
    displayTime = `${minutesDifference} minutes ago`;
  } else if (hoursDifference < 24) {
    displayTime = `${hoursDifference} hours ago`;
  } else if (daysDifference <= 5) {
    displayTime = `${daysDifference} days ago`;
  } else {
    displayTime = `${formattedDate}`;
  }

  return (
    <>
      <Text style={styles.time}>{displayTime}</Text>
    </>
  );
};

export default FormattedDate;

const styles = StyleSheet.create({
  time: {
    fontSize: 11,
    color: colors.subHeaderTextColor,
    fontFamily: fonts.regular,
  },
});
