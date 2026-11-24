import { createTransform } from "redux-persist";
import CryptoJS from "crypto-js";

//UAT
// const secretKey = "b7f19f8bc271ceaa25d4feb2ced4342fe61cdf3349d2b380ae4824bd23a7bdfa" ?? "";
//Pre-Prod
// const secretKey = "28518aa3b5b94e86198d91bac18af0ad05f245b01f0f8db1490a29f1021f5338" ?? "";
//Prod
const secretKey = "GKs2aGcrEvD4f90Jmu0/tuzzoWUD4qKNu81oA2DuTDI=" ?? "";

export const encrypt = (dataText: any) => {
  const payloadEnc: boolean = true;
  if (payloadEnc === false) {
    return dataText;
  }
  const encryptedData = CryptoJS.AES.encrypt(
    dataText?.toString(),
    secretKey ?? ""
  ).toString();
  return encryptedData;
};

export const decrypt = (cipherText: string) => {
  // Check for null, undefined, or empty string
  if (
    !cipherText ||
    typeof cipherText !== "string" ||
    cipherText.trim() === ""
  ) {
    return "";
  }

  const payloadEnc: boolean = true;
  if (payloadEnc === false) {
    return cipherText;
  }
  return CryptoJS.AES.decrypt(
    cipherText, 
    secretKey ?? ""
  ).toString(CryptoJS.enc.Utf8);
};

export const encryptObject = (data: any) => {
  const stringData = typeof data === "string" ? data : JSON.stringify(data); // Ensure string format
  //const payloadEnc: boolean = process.env.REACT_APP_PAYLOAD_ENCRYPTION === 'true' || false;
  const payloadEnc: boolean = true;
  if (payloadEnc === false) {
    return data;
  }
  const encryptedData = CryptoJS.AES.encrypt(
    stringData,
    secretKey ?? ""
  ).toString();
  return encryptedData;
};

export const decryptObject = (cipherText: string) => {
  // Check for null, undefined, or empty string
  if (
    !cipherText ||
    typeof cipherText !== "string" ||
    cipherText.trim() === ""
  ) {
    return "";
  }

  //const payloadEnc: boolean = process.env.REACT_APP_PAYLOAD_ENCRYPTION === 'true' || false;
  const payloadEnc: boolean = true;
  if (payloadEnc === false) {
    return cipherText;
  }
  const decryptedData = CryptoJS.AES.decrypt(
    cipherText,
    secretKey ?? ""
  ).toString(CryptoJS.enc.Utf8);

  try {
    return JSON.parse(decryptedData); // Attempt to parse JSON if data was originally an object
  } catch {
    return decryptedData; // Return as-is if it's a plain string
  }
};

const encryptor = createTransform(
  //Transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    const stringifiedState = JSON.stringify(inboundState);
    const encryptedState = CryptoJS.AES.encrypt(
      stringifiedState,
      "Sq@r3G@m3-$3cr3t-k3y"
    ).toString();
    return encryptedState;
  },
  //Transform state being rehydrated
  (outboundState, key) => {
    const bytes = CryptoJS.AES.decrypt(outboundState, "Sq@r3G@m3-$3cr3t-k3y");
    const decryptedState = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedState);
  }
);

export default encryptor;
