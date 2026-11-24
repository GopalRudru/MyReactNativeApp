// Function to format date from yyyy-mm-dd to dd-mm-yyyy
export const formatDate = (inputDate: string): string => {
  if (!inputDate) {
    return "-"; // Return an empty string if inputDate is undefined or empty
  }

  // Split inputDate into year, month, and day
  const [year, month, day] = inputDate.split("T")?.[0]?.split("-");
  if (!year || !month || !day) {
    return "-";
  }
  // Create a new Date object with yyyy-mm-dd format
  const dateObject = new Date(`${year}-${month}-${day}`);

  // Extract day, month, and year from dateObject
  const formattedDay = ("0" + dateObject.getDate()).slice(-2);
  const formattedMonth = ("0" + (dateObject.getMonth() + 1)).slice(-2);
  const formattedYear = dateObject.getFullYear();

  // Return formatted date in dd-mm-yyyy format
  return `${formattedDay}-${formattedMonth}-${formattedYear}`;
};

// if date format like this "Mon Jul 30 2018 05:30:00 GMT+0530 (India Standard Time)" format to "dd-mm-yyyy"
export const parseAndFormatDate = (inputDate: string): string => {
  if (!inputDate) {
    return ""; // Return an empty string if inputDate is undefined or empty
  }

  const dateObject = new Date(inputDate);

  if (isNaN(dateObject.getTime())) {
    return ""; // Return an empty string if inputDate is not a valid date
  }

  const formattedDay = ("0" + dateObject.getDate()).slice(-2);
  const formattedMonth = ("0" + (dateObject.getMonth() + 1)).slice(-2);
  const formattedYear = dateObject.getFullYear();

  return `${formattedDay}-${formattedMonth}-${formattedYear}`;
};

export const formatNormalDate = (dateString: string) => {
  const [year, month, day] = dateString?.split("-");
  return `${day}-${month}-${year}`;
};
// Function to limit a number to two decimal places
export const formatNumberToTwoDecimals = (value: unknown): string => {
  try {
    const num = Number(value);
    if (isNaN(num)) {
      return ""; // Return an empty string if value is not a valid number
    }
    return num.toFixed(2);
  } catch (error) {
    return "";
  }
};
export const formatDateTime = (isoTime: string) => {
  const hours = isoTime.split(".");
  // const dateObj = new Date(`1970-01-01T${isoTime}`.toString());
  // const hours = String(dateObj.getHours()).padStart(2, '0');
  // const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  // const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${hours[0]}`;
};

export const getDateRangeObject = (loanEndDateStr: string) => {
  const currentDate = new Date();
  const loanEndDate = new Date(loanEndDateStr);

  // Start Date: Current Date - 6 months
  const startDate = new Date(currentDate);
  startDate.setMonth(startDate.getMonth() - 6);
  startDate.setDate(startDate.getDate() + 1);

  // Option 1: Current Date + 5 years
  const datePlus5Years = new Date(currentDate);
  datePlus5Years.setFullYear(datePlus5Years.getFullYear() + 5);

  // End Date: whichever is earlier between datePlus5Years and loanEndDate
  const endDate = loanEndDate < datePlus5Years ? loanEndDate : datePlus5Years;

  // Format date as DD.MM.YYYY
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const year = date.getFullYear();
    return `${year}-${month}-${day}T00:00:00Z`;
  };

  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

export const getDaysBetween = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getDateRange = (loanEndDateStr: string) => {
  const currentDate = new Date();
  const loanEndDate = new Date(loanEndDateStr);

  // Start Date: Current Date - 6 months
  const startDate = new Date(currentDate);
  startDate.setMonth(startDate.getMonth() - 6);

  // Option 1: Current Date + 5 years
  const datePlus5Years = new Date(currentDate);
  datePlus5Years.setFullYear(datePlus5Years.getFullYear() + 4);

  // End Date: whichever is earlier between datePlus5Years and loanEndDate
  const endDate = loanEndDate < datePlus5Years ? loanEndDate : datePlus5Years;

  // Format date as DD.MM.YYYY
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return `(Date range: ${formatDate(startDate)} to ${formatDate(endDate)})`;
};
