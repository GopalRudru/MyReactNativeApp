export default {
  SPLASH_TIME: 3000,
  FontWeight_500: "500",
  FontWeight_600: "600",
  FontWeight_700: "700",
  FontWeight_300: "300",
  FontWeight_400: "400",
  PERCENT_HUNDRED: "100%",
  privacyPolicy: "https://www.avanse.com/privacy-policy",
  applyNow: 'https://customerportal-sit2.avanse.com/apply-now',
  termsCondition: "https://www.avanse.com/terms-conditions",
  helpUS: "https://www.avanse.com/contact-us",
  responsibleLending: "https://www.avanse.com/responsible-lending",
  scheduleOfCharges: "https://www.avanse.com/schedule-of-charges",
  mailTo: "mailto:noreply@avanse.com",
  textActiveOpacity: 0.6,
  buttonActiveOpacity: 0.8,
  elfornFaqUrl: "https://www.avanse.com/sli-faq-customer",
  faqUrl: "https://www.avanse.com/faqs",
  referralBannerUrl: "https://www.avanse.com/referral-program?source=SocialMedia&campaignid=CP_Banner1"
};

const URL = {};

const messages = {
  noPermission: {
    module: "You don't have access to",
    section: "You don't have access to make",
    action: "You don't have access to",
  },
  withdrErrorMessages: {
    overdue:
      "Please settle your overdue amount before raising a disbursement request.",
    commonError: "An error occurred",
    enterAmountError: "The entered amount is grater than available limit.",
    otpVerify:
      "Withdrawal Request is successfully captured. We will update you once request is processed",
  },
  paymentErrorMessages: {
    timeout: "Timeout waiting for API response",
    inProgress:
      "Final status of your transaction is awaited. Please check the latest status in transaction history.",
    partPayment:
      "Part Payment is not allowed if Principal Outstanding Amount is less than or equal to Rs.2",
    partPayment2: "The entered amount should be less than or equal to",
    overdue: "The entered amount is more than Over Due Amount",
  },
};

const maxFileSize = 10000000;

const documentsItOptions = {
  certificate: [
    {
      label: "Get Provisional Interest Certificate",
      value: "provsonintstcert",
    },
    { label: "Get Interest Certificate", value: "instcert" },
  ],
  years: [
    { label: "FY22-23", value: "2022" },
    { label: "FY23-24", value: "2023" },
  ],
  payment_secret_key: "A745F72A4230A1CBF4D93EA702687567",
};

const validStatuses = ["M", "C", "W", "E", "S"];

const paymentInstructions = [
  "Please ensure that the payment is made using all the generated payment links to complete the payment process for the entire amount.",
  "Multiple payment links are generated if the total payable amount exceeds ₹ 9 lakhs.",
  "The payment links will be activated in the same order as they appear on the customer portal. This will ensure that the total loan amount paid is aligned with the minimum allowed part payment amount, i.e., 3 times the EMI and the applicable charges.",
  "Each payment link will remain valid for 1 hour after being opened. If a payment fails, you are allowed up to 2 retry attempts.",
];
const overdueInstructions = [
  "Please ensure that the payment is made using all the generated payment links to complete the payment process for the entire amount.",
  "Multiple payment links are generated if the total payable amount exceeds ₹ 9 lakhs.",
  "Each payment link will remain valid for 1 hour after being opened. If a payment fails, you are allowed up to 2 retry attempts.",
];

const screenName = {
  DASHBOARD: "Dashboard",
};

export {
  messages,
  maxFileSize,
  documentsItOptions,
  screenName,
  paymentInstructions,
  overdueInstructions,
  validStatuses,
};
