import * as moment from "moment";

export const formatIndianRupees = (amount: number): string => {
  if (amount < 0) {
    amount = 0;
  }
  amount /= 100;
  if (amount === undefined || isNaN(amount)) {
    // Handle the case where amount is undefined or not a number
    return "₹ 0.00"; // Or any default value you prefer
  }
  let strAmount = amount.toString();

  let [integerPart, decimalPart] = strAmount.split(".");

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart) {
    decimalPart = decimalPart.slice(0, 3);
  } else {
    decimalPart = "00";
  }
  return `₹ ${integerPart}.${decimalPart}`;
};

export const formatNormalIndianRupees = (amount: any) => {
  if (amount < 0) {
    amount = 0;
  }
  if (amount === undefined || isNaN(amount)) {
    // Handle the case where amount is undefined or not a number
    return "₹ 0.00"; // Or any default value you prefer
  }
  let strAmount = String(amount);
  let [integerPart = "0", decimalPart = "00"] = strAmount.split(".");
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart) {
    decimalPart = decimalPart.slice(0, 3);
  } else {
    decimalPart = "00";
  }
  return `₹ ${integerPart}.${decimalPart}`;
};

export const dateParser = (date: string = "", format: string = "") => {
  if (date?.length) return moment.parseZone(date).format(format);
  else return moment.parseZone().format(format);
};

export const handlePercentAmount = (
  loanAmount: number,
  repayAmount: number,
  type: string
) => {
  if (type === "disburse") {
    return ((loanAmount / repayAmount) * 100).toFixed(2);
  }
  if (type === "sanction") {
    let remainingAmount = repayAmount - loanAmount;
    return ((remainingAmount / repayAmount) * 100).toFixed(2);
  }
};
export const checkPercentage = (item: any) => {
  return ((item?.loanAmount / item?.repayAmount) * 100).toFixed(2);
};

export const formattedDate = (createdAt) => {
  // Parse the date string
  const date = moment.parseZone(createdAt);

  // Convert to Indian Standard Time (IST)
  const istDate = date.clone().utcOffset("+05:30");

  // Calculate the difference from the current time
  const now = moment.default();
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
  //console.log("displ", displayTime);

  return displayTime;
};

export const toPascalCase = (str: string) => {
  if (!str) return "";
  return str
    .replace(/[_\s-]+/g, " ") // replace underscores, hyphens with space
    .toLowerCase()
    .replace(/(?:^|\s)(\w)/g, (_, c) => c.toUpperCase()) // capitalize first letter of each word
    .replace(/\s+/g, ""); // remove remaining spaces
};
