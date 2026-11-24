import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import imagePath from "../../constant/imagePath";
import colors from "../../res/colors";
import fonts from "../../res/fonts";
import AppConstants from "../../constant/AppConstants";
import { AstricString } from "../../utils/helpers";
import strings from "../../res/strings";
import UploadDocumentModal from "../../components/UploadDocumentModal";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DocumentPicker from "react-native-document-picker";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { Dropdown, IDropdownRef } from "react-native-element-dropdown";
import {
  authSelector,
  userLoanCatSelector,
} from "../../services/redux/slices/authSlice";
import {
  clearDocumentFormType,
  setDocumentNewData,
} from "../../services/redux/slices/documentFormSlice";
import RNFS from "react-native-fs";
import { setStatusPopup } from "../../services/redux/slices/statusPopupSlice";
import Pdf from "react-native-pdf";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { checkConnectivity } from "../../services/api/apiClient/apiClient";
import service from "../../services/api/service";
import { createModuleLogger } from "../../utils/logger";
import FastImage from "react-native-fast-image";
const { height, width } = Dimensions.get("window");

interface FormData {
  step1Input: string;
  step2Select: string;
}
interface Option {
  value: string;
  label: string;
}

interface FormValue {
  id: number; // Use `number` instead of `Number`
  documentFiles: File[];
  isOldValue: boolean;
  docId: number;
  docName?: string;
  otherDocName?: string;
  otherDoc?: boolean;
}
interface AddNewDocumentsProps {
  disbursementFormId: number;
  activeFunction: number;
  setActiveFunction: (value: number) => void;
  setStep: (value: number) => void;
  paymentTypeId: number;
  setActiveStep: (value: number) => void;
  remarkId: number;
  remark: string;
  isNewUniversity: boolean;
  accountTypeId: number;
  isMoveToNext: boolean;
  setIsLoadingUpdate: any;
  isLoadingUpdate: boolean;
  requestType?: any;
  setallDocsPresent: (value: boolean) => void;
  isAddNewDocumnet: boolean;
  setIsAddNewDocumnet: any;
  step: number;
  activeStep: number;
}

/**
 * Component for adding new documents in the disbursement form.
 *
 * @component
 * @param {AddNewDocumentsProps} props - The props for the component.
 * @param {string} props.disbursementFormId - The ID of the disbursement form.
 * @param {number} props.activeFunction - The active function identifier.
 * @param {Function} props.setActiveFunction - Function to set the active function.
 * @param {string} props.paymentTypeId - The ID of the payment type.
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <AddNewDocuments
 *   disbursementFormId="12345"
 *   activeFunction={0}
 *   setActiveFunction={setActiveFunction}
 *   paymentTypeId="67890"
 * />
 *
 * @remarks
 * This component handles the addition, deletion, and preview of documents.
 * It also manages the state of the form and interacts with the document services API.
 *
 * @function handleNext - Advances the active step.
 * @function handleBack - Moves back the active step.
 * @function handleToastClose - Closes the toast notification.
 * @function handleLoanTypeId - Memoized function to get the loan type ID.
 * @function handleAddNewField - Adds a new document field.
 * @function handleDeleteField - Deletes a document field.
 * @function handleGetDocsFileList - Fetches the list of document files for a given document ID.
 * @function handleGetAllDocumentFileList - Fetches the list of all document files.
 * @function handleGetDocsList - Fetches the list of documents.
 * @function handleGetListForNewFields - Fetches the list of new documents.
 * @function convertToBase64 - Converts a file to base64 format.
 * @function handleFileChange - Handles file change events.
 * @function handleDeleteFile - Deletes a file.
 * @function handleCloseModal - Closes the modal and fetches document files.
 * @function handleSelectedNewFieldValue - Handles the selection of a new field value.
 * @function handleSaveAllDocument - Saves all documents.
 * @function handleDeleteAllDocument - Deletes all documents.
 * @function handleContinousSave - Placeholder for continuous save functionality.
 * @function handleShowImageMList - Memoized function to render the list of images and documents.
 * @function renderStepContent - Renders the content for the current step.
 *
 * @hook useEffect - Fetches the document list on component mount.
 * @hook useEffect - Updates the form value when the file list or non-mandatory list changes.
 * @hook useEffect - Handles active function changes.
 */
const placeholders = [1, 2, 3, 4];
const documentOptions = [
  { label: "Aadhar Card", value: "aadhar" },
  { label: "PAN Card", value: "pan" },
  { label: "Passport", value: "passport" },
  { label: "Passport1", value: "passport1" },
  { label: "Passport2", value: "passport2" },
  { label: "Passport3", value: "passport3" },
];
const allowedFormats = ["pdf", "png", "jpeg", "jpg"];
const maxFileSize = 10 * 1024 * 1024; // 10MB

const AddNewDocuments: React.FC<AddNewDocumentsProps> = ({
  disbursementFormId,
  activeFunction,
  setActiveFunction,
  setStep,
  paymentTypeId,
  setActiveStep,
  remarkId,
  remark,
  isNewUniversity = false,
  accountTypeId,
  isMoveToNext,
  setIsLoadingUpdate,
  isLoadingUpdate,
  requestType,
  setallDocsPresent,
  isAddNewDocumnet = false,
  setIsAddNewDocumnet,
  step,
}) => {
  const dropdownRef = useRef<IDropdownRef | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isRemarkVisible, setRemarkVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const isUploaded = false;
  const isViewOnly = false;
  const [isPreview, setIsPreview] = useState(false);
  const [documentType, setDocumentType] = React.useState(null);
  const [internalIsUploaded, setInternalIsUploaded] =
    React.useState(isUploaded);
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(isPreview);
  const [dropDownValue, setDropDownValue] = React.useState("");
  const [previewModal, setPreviewModal] = React.useState(false);
  const [newDoocIdList, setNewDocIdList] = React.useState([]);

  const dispatch = useDispatch();
  const logger = createModuleLogger("AddNewDocuments");

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUploadModal, setIsUploadModal] = React.useState(false);
  const [isAddNewDocModal, setIsAddNewDocModal] = React.useState(false);

  const [isDocumentData, setIsDocumentData] = React.useState(false);

  const [newDocumentValue, setNewDocumentValue] = React.useState(0);
  const [newDocumentValueExtra, setNewDocumentValueExtra] = React.useState(0);

  const [documentId, setDocumentId] = React.useState(0);
  const [documentIndex, setDocumentIndex] = React.useState(0);

  const [docIndex, setDocIndex] = React.useState(0);
  const [formData, setFormData] = React.useState<FormData>({
    step1Input: "",
    step2Select: "",
  });
  const [formValue, setFormValue] = React.useState<FormValue[]>([]);
  const [nonMandatoryList, setNonMandatoryList] = React.useState([]);
  const [documentListValue, setDoumentListValues] = React.useState([]);
  const [fileList, setFileList] = React.useState([]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploadLoading, setIsUploadLoading] = React.useState(false);
  const [triggerStatusPopup, setTriggerStatusPopup] = useState(false);

  const [toastOpen, setToastOpen] = React.useState(false);
  const [severity, setSeverity] = React.useState<
    "error" | "warning" | "info" | "success"
  >("error");
  const [message, setMessage] = React.useState("");
  const selectedLoanNumber = useSelector(
    (state: RootState) => state?.dashboardData?.selectedLoanNumber
  );
  const loanData = useSelector((state: RootState) => state?.dashboardData);
  const selectedFormType = useSelector(
    (state: RootState) => state?.documentFormSlice
  );
  const [otherDocName, setOtherDocName] = React.useState("");
  const [otherDocNameError, setOtherDocNameError] = useState("");
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>(
    []
  );

  const { businessType } = useSelector(authSelector);
  const userLoanCategory = useSelector(userLoanCatSelector);

  useEffect(() => {
    handleGetDocsList(0);
  }, [isNewUniversity]);

  useEffect(() => {
    if (isModalVisible) {
      setDocumentType(null);
      setNewDocumentValue(0);
      setOtherDocNameError("");
    }
  }, [isModalVisible]);

  // 2. useEffect to detect when modal is actually closed
  useEffect(() => {
    if (Platform.OS === "ios") {
      if (!isModalVisible && triggerStatusPopup) {
        setTimeout(() => {
          dispatch(
            setStatusPopup({
              status: "warning",
              message:
                "You have already selected this document, Please select another one.",
            })
          );
          setTriggerStatusPopup(false); // reset flag
        }, 300);
      }
    } // wait for modal close animation
    if (Platform.OS === "android") {
      setTriggerStatusPopup(false);
      setDocumentType(null);
      setNewDocumentValue(0);
    }
  }, [isModalVisible, triggerStatusPopup]);
  useEffect(() => {
    // Only set specific documents for paymentTypeId 5 when nonMandatoryList is populated
    // and formValue is empty or doesn't contain the required documents
    if (paymentTypeId === 5 && nonMandatoryList?.length > 0) {
      const valueName = ["Visa Copy", "Forex Remittance 1", "Demand Letter"];
      let filterData: any[] = nonMandatoryList.filter((elem: any) =>
        valueName.includes(elem?.label)
      );
      if (filterData.length > 0) {
        const transformedData = filterData.map((item: any, index: number) => {
          return {
            docDms: item.dmsCode,
            docId: item.value,
            docName: item.label,
            otherDoc: false,
            otherDocName: "",
            docOtherName: "",
            documentFiles: [],
            id: index + 1,
            isOldValue: true,
            isCheckNon: true,
          };
        });
        setFormValue(transformedData);
      }
    }
  }, [nonMandatoryList, paymentTypeId]);

  useEffect(() => {
    const updatedFormValue: any = [...formValue]; // Create a shallow copy of formValue

    // Step 1: Remove documentFiles that no longer exist in fileList
    updatedFormValue.forEach((itemA: any) => {
      itemA.documentFiles = itemA?.documentFiles?.filter((docFile: any) =>
        fileList?.some((fileItem: any) => fileItem.id === docFile.id)
      );
    });

    // Step 2: If fileList is empty, remove entries in formValue with no documentFiles and isOldValue set to false
    if (fileList.length === 0) {
      for (let i = updatedFormValue.length - 1; i >= 0; i--) {
        if (
          !updatedFormValue[i].isOldValue &&
          updatedFormValue[i].documentFiles.length === 0
        ) {
          updatedFormValue.splice(i, 1);
        }
      }
    }
    // Step 3: Add any new documentFiles from fileList that are missing in formValue
    updatedFormValue.forEach((itemA: any) => {
      const matchingDocs = fileList?.filter(
        (itemB: any) => itemB.docId === itemA.docId
      );

      matchingDocs.forEach((matchingDoc: any) => {
        const isAlreadyPresent = itemA?.documentFiles?.some(
          (docFile: any) => docFile.id === matchingDoc.id
        );
        if (!isAlreadyPresent) {
          itemA?.documentFiles?.push(matchingDoc);
          itemA["uploadedBy"] = matchingDoc?.uploadedBy;
        }
      });
    });

    // Step 4: Loop through nonMandatoryList and add matching entries to formValue if they don't already exist
    nonMandatoryList.forEach((nonMandatoryItem: any) => {
      //logger.debug("nonma", nonMandatoryItem);
      //logger.debug("list", fileList);
      const matchingFiles: any = fileList?.filter(
        (fileItem: any) => fileItem.docId === nonMandatoryItem.value
      );

      if (matchingFiles.length > 0) {
        const existingEntry: any = updatedFormValue?.find(
          (oldFileItem: any) => {
            const isMatch = oldFileItem.docId == nonMandatoryItem.value;
            logger.debug(
              "Checking:",
              oldFileItem.docId,
              "==",
              nonMandatoryItem.value,
              "=>",
              isMatch
            );
            return isMatch;
          }
        );
        if (!existingEntry) {
          const newEntry: any = {
            id: updatedFormValue.length + 1,
            documentFiles: [...matchingFiles],
            isOldValue: false,
            docId: nonMandatoryItem.value,
            docName: nonMandatoryItem.label,
            docDms: nonMandatoryItem.dmsCode,
            docOtherName: matchingFiles?.[0]?.docOtherName,
            uploadedBy: matchingFiles?.[0]?.uploadedBy,
          };
          updatedFormValue.push(newEntry);
        } else {
          matchingFiles.forEach((matchingFile: any) => {
            const isFileAlreadyAdded = existingEntry?.documentFiles?.some(
              (docFile: any) => docFile.id === matchingFile.id
            );
            if (!isFileAlreadyAdded) {
              existingEntry.documentFiles.push(matchingFile);
            }
          });
        }
      }
    });
    // Step 6: Update the state with the modified formValue
    setFormValue(updatedFormValue);
  }, [fileList]);

  useEffect(() => {
    if (activeFunction == 1) {
      handleDeletFilesModal();
    } else if (activeFunction == 2) {
      handleSaveAllDocument("NAVIGATE");
    }
  }, [activeFunction]);

  const validateOtherDocName = () => {
    if (otherDocName.trim().length === 0) {
      setOtherDocName("");
      setOtherDocNameError("This Field is required.");
      return false;
    }
    return true;
  };

  /**
   * Handles the saving of all documents.
   *
   * This function performs the following steps:
   * 1. Checks if there are any documents in the form value. If not, it sets an error message and returns.
   * 2. Validates that every document has files associated with it.
   * 3. If validation passes, it sends a request to save all documents.
   * 4. Based on the response, it sets the appropriate state and displays a success or error message.
   *
   * @async
   * @function handleSaveAllDocument
   * @returns {Promise<void>} A promise that resolves when the save operation is complete.
   */
  const handleSaveAllDocument = async (type: string): Promise<void> => {
    setIsLoadingUpdate(true);
    // const isValid = formValue.every((item) => item.documentFiles.length > 0);
    const isValid = formValue.every((item) => {
      if ("isOldValue" in item && item?.isOldValue === true) {
        if (item?.isCheckNon == true) return true;
        else return item.documentFiles.length > 0; // must have files
      }
      return true; // pass if isOldValue is false OR missing
    });

    if (type == "NAVIGATE" && !isValid) {
      dispatch(
        setStatusPopup({
          status: "Error",
          message: "Please upload all required documents.",
        })
      );

      setStep(2);
      setActiveFunction(0);
      setIsLoadingUpdate(false);
      return;
    } else {
      
      // if (requestType === "lien") {
      //   setStep(3);
      //   // if (activeStep === 1 && step === 2 && nextClick) {
      //   //   setStep(3);
      //   // } else {
      //   //   setStep(step);
      //   // }
      // }

      setActiveStep(3);
      setActiveFunction(0);
      const body = {
        disbursementFormId: disbursementFormId,
        remark: remark,
        remarkId: remarkId,
      };
      if (isMoveToNext === true) {
        setallDocsPresent(true);
        if (requestType === "lien") {
          if (step == 2) setActiveStep(1);
          else setActiveStep(2);
        }
        setIsLoadingUpdate(false);
      }
      if (isMoveToNext === false) {
        const response: any = await service.docs.secureSaveAllDocument(body);
        if (response?.status == 200) {
          setIsLoadingUpdate(false);
          dispatch(clearDocumentFormType());
          setallDocsPresent(true);
          setActiveFunction(0);
          if (type == "NAVIGATE") {
            if (requestType === "lien") {
              if (step == 2) setActiveStep(1);
              else setActiveStep(2);
            } else {
              setActiveStep(3);
            }
          }
        }
      }
    }
  };

  /**
   * Handles the deletion of all documents associated with a disbursement form.
   *
   * This function sets the loading state to true, constructs a request body with the
   * disbursement form ID, and sends a request to delete all documents. If the response
   * status is 200, it resets the loading state and updates the active function and step.
   *
   * @async
   * @function handleDeleteAllDocument
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */

  const handleDeletFilesModal = () => {
    if (selectedFormType?.isNewData) {
      setActiveFunction(0);
      dispatch(
        setStatusPopup({
          status: "info",
          message:
            "Unsaved data will be lost. Please save your changes before leaving this page.",
          isFunction: true,
          locationFunction: () => handleDeleteAllDocument(),
        })
      );
    } else {
      dispatch(clearDocumentFormType());
      setActiveStep(0);
      setActiveFunction(0);
    }
  };

  const handleDeleteAllDocument = async () => {
    setIsLoading(true);
    const body = {
      disbursementFormId: disbursementFormId,
    };
    const response: any = await service.docs.secureDeleteAllDocument(body);
    if (response?.status == 200) {
      dispatch(clearDocumentFormType());
      setIsLoading(false);
      setIsAddNewDocumnet(false);
      setIsAddNewDocModal(false);
      setActiveFunction(0);
      setActiveStep(0);
    }
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Converts a given file to a base64 encoded string.
   *
   * @param file - The file to be converted.
   * @returns A promise that resolves with an object containing the file name, base64 encoded data, and file format.
   *
   * The function performs the following checks and operations:
   * - Ensures the file size does not exceed 10MB.
   * - Validates the file format to be one of the allowed formats: PDF, PNG, JPEG, JPG.
   * - Converts the file to a base64 encoded string.
   *
   * If the file size exceeds the limit or the format is invalid, the function will reject the promise with an appropriate error message.
   *
   * @throws Will throw an error if the file size exceeds 10MB or if the file format is not allowed.
   */
  const convertToBase64 = async (file: any) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    // Validate format
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      throw new Error(
        "Invalid file format. Only PDF, PNG, JPEG, and JPG are allowed."
      );
    }

    // Validate size
    if (file.size > maxFileSize) {
      throw new Error("File size exceeds the 10MB limit");
    }

    // Convert to base64
    let uri = file.uri;
    if (Platform.OS === "ios") {
      uri = decodeURI(uri.replace("file://", "")); // 👈 important
    } else {
      uri = file.uri;
    }

    const base64Data = await RNFS.readFile(uri, "base64");

    return {
      name: file.name,
      base64Data: base64Data,
      format: fileExtension,
    };
  };

  /**
   * Handles the file change event, converts the selected files to base64, and updates the form values accordingly.
   * If the document has a valid ID, it uploads the files to the server.
   *
   * @param id - The ID of the document.
   * @param files - The list of files selected by the user.
   * @param index - The index of the document in the form values.
   *
   * @returns {Promise<void>} - A promise that resolves when the file handling is complete.
   *
   * @throws Will throw an error if there is an issue converting files to base64.
   */

  const handleFileChange = async (id: number, index: number) => {
    let filesArray = [];
    try {
      const files = await DocumentPicker.pick(
        Platform.OS === "ios"
          ? {
              type: [
                "com.adobe.pdf", // PDF files
                "public.png", // PNG files
                "public.jpeg", // JPG/JPEG files
              ],
              allowMultiSelection: false,
            }
          : {
              type: [
                "application/pdf", // PDF files
                "image/jpeg", // .jpg files
                "image/png", // .png files
              ],
              allowMultiSelection: false,
            }
      );
      filesArray = files;
      let fileArray = await Promise.all(
        files.map((file) => convertToBase64(file))
      );

      const fieldsValue = formValue[index];
      //logger.debug("index>>>>>>>", fieldsValue, index);
      if (
        !fieldsValue?.documentUploadCount ||
        fieldsValue?.documentFiles?.length < fieldsValue?.documentUploadCount
      ) {
        setIsUploadLoading(true);

        const updatedFields = formValue.map((field, i) =>
          i === index ? { ...field, documentFiles: fileArray } : field
        );
        //logger.debug("updatedfields>>>>>>", updatedFields);
        const findValue = updatedFields[index];

        if (findValue?.docId != 0) {
          setIsLoading(true);
          const bodyObj = {
            disbursementFormId,
            documentId: findValue.docId.value || findValue.docId,
            docTitle: findValue?.docName || findValue.docId.label,
            dmsCode:
              String(findValue?.docDms) || String(findValue.docId.dmsCode),
            documentFiles: fileArray.map((elem) => ({
              base64Data: elem.base64Data,
              format: elem.format,
            })),
            otherDoc: findValue.otherDoc,
            docName: findValue.otherDocName,
          };

          const response = await service?.docs?.securePostDocumentUpload(
            bodyObj
          );

          if (response?.status == 200) {
            dispatch(setDocumentNewData(true));
            handleGetDocsList(1);
            setIsDocumentData(true);
            setModalVisible(false);
            setNewDocumentValue(0);
            setSelectedDocuments([]);
          }
        } else {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: "Please select document!",
            })
          );
        }
      } else {
        dispatch(
          setStatusPopup({
            status: "Error",
            message: `You cannot upload file more than the ${fieldsValue?.documentUploadCount}`,
          })
        );
      }
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // user cancelled the picker
      } else {
        logger.error("File upload error:", err);
        const isConnected = await checkConnectivity();
        if (isConnected) {
          dispatch(
            setStatusPopup({
              status: "Error",
              message: err.message || "Something went wrong",
            })
          );
        }
      }
    } finally {
      if (filesArray?.length > 0) {
        setDocumentType(null);
      }
      // setIsUploadLoading(false);
      setIsLoading(false);
      setIsAddNewDocumnet(false);
      //logger.debug("setisuploading >>>>>>", isUploadLoading);
      setTimeout(() => {
        //logger.debug("setisuploading", isUploadLoading);
        setIsUploadLoading(false);
      }, 2000);
    }
  };

  const handleDeleteSingleFileModal = (
    fieldId: number,
    fileIndex: number,
    type: number,
    deleteType: string
  ) => {
    handleDeleteField(fileIndex, deleteType);
  };

  /**
   * Handles the selection of a new field value.
   *
   * @param {any} value - The selected value.
   * @param {number} index - The index of the form value to update.
   *
   * This function updates the form value and selected documents based on the selected value.
   * It checks if the selected value's label contains "other" (case-insensitive) and updates the form value accordingly.
   * If the label contains "other", it sets the `otherDoc` property to true and clears the `otherDocName`.
   * Otherwise, it sets the `otherDoc` property to false and clears both `otherDocName` and `docOtherName`.
   * It also updates the selected documents list by adding or removing the selected value.
   */
  const handleSelectedNewFieldValue = (value: any) => {
    setDocumentType(value);
    setOtherDocName("");
    logger.debug("in vakue", value);
    logger.debug("inside handleSelectedNewFieldValue", value);
    const copyFormValue: any = [...formValue];
    const copySelectedDocuments = [...selectedDocuments];
    const findValue: any = nonMandatoryList.find((elem: any) => {
      logger.debug("Checking element:", elem); // 👈 logs each element
      return elem?.value == value.value;
    });
    logger.debug("findvalue", findValue);
    const labelContainsOther: boolean = findValue?.label
      ? /other/i.test(findValue.label) // Case-insensitive check
      : false;
    logger.debug("labelcontains other", labelContainsOther);
    const fileterData: any = nonMandatoryList.find(
      (elem: any) => elem?.value == value.value
    );
    logger.debug("filterDatat", fileterData);
    const jsonData: any = {
      docDms: fileterData?.dmsCode,
      docId: value.value,
      docName: fileterData?.label,
      otherDoc: labelContainsOther ? true : false,
      otherDocName: labelContainsOther ? "" : "",
      docOtherName: labelContainsOther ? undefined : "",
      documentFiles: [],
    };

    const findValueById: any = copyFormValue.filter(
      (elem: any) => elem?.docId == value.value
    );
    // logger.debug("copy formvalue length>>>>>>>", copyFormValue.length);
    // logger.debug(" findValueById>>>>>", findValueById);
    // logger.debug("wgfyegfyegfyegf", jsonData);
    // logger.debug("copySelectedDocuments>>>", copySelectedDocuments);
    // logger.debug("copyformvalue>>>>", copyFormValue);
    // logger.debug("files length", findValueById.documentFiles?.length);

    setNewDocumentValue(value.value);
    if (
      copySelectedDocuments.includes(value) ||
      (findValueById.length > 0 && findValueById[0].documentFiles?.length > 0)
    ) {
      setTriggerStatusPopup(true);
      setDocumentType(null);
      setNewDocumentValue(0);
      // dropdownRef.current?.clear?.();
      dropdownRef.current?.close?.(); // m
      // if (Platform.OS === "ios") {
      //   setModalVisible(false);
      // }
      if (Platform.OS === "android") {
        setTimeout(() => {
          dispatch(
            setStatusPopup({
              status: "warning",
              message:
                "You have already selected this document, Please select other one.",
            })
          );
        }, 1000);
      } // 100ms delay
      // setTriggerStatusPopup(true);
      if (Platform.OS === "ios") {
        setTimeout(() => {
          setModalVisible(false);
        }, 100); // Give time to update state before unmounting modal
      }
    } else {
      if (findValueById.length <= 0) {
        copyFormValue.push(jsonData);
        copySelectedDocuments.push(value.value);
        setSelectedDocuments(copySelectedDocuments);

        setFormValue(copyFormValue);
        setNewDocumentValue(value.value);
        setNewDocumentValueExtra(value.value);
      }
    }
  };

  /**
   * Fetches the list of all document files associated with a specific disbursement form.
   *
   * This function sets the loading state to `true` before making an asynchronous call to
   * `documentsServices.getAllDocumentFileList` with the provided `disbursementFormId`.
   * If the response status is 200, it updates the file list state with the received data
   * and sets the loading state to `false`. In case of an error, it logs the error and
   * sets the loading state to `false`.
   *
   * @async
   * @function handleGetAllDocumentFileList
   * @returns {Promise<void>} A promise that resolves when the document file list is fetched and state is updated.
   */
  const handleGetAllDocumentFileList = async () => {
    try {
      const response = await service.docs.secureGetAllDocumentFileList(
        disbursementFormId
      );
      if (response.status == 200) {
        setIsUploadLoading(false);
        //setIsLoadingUpdate(false);
        //setIsLoading(false);
        setIsAddNewDocumnet(false);
        if (response?.data?.data.length <= 0) {
          dispatch(setDocumentNewData(false));
        }
        const findValue = response?.data?.data?.filter(
          (elem: any) => elem?.docId == documentId
        );

        if (findValue.length > 0) {
          setFileList(response?.data?.data);
        } else {
          setFileList(response?.data?.data);
          setModalVisible(false);
        }

        delay(1500).then(() => {
          setIsLoading(false);
          setIsLoadingUpdate(false)
        });
      }
    } catch (error) {
      setIsLoadingUpdate(false);
      setIsLoading(false);
      setIsAddNewDocumnet(false);
    }
  };

  /**
   * Fetches a new list of documents from the document service, filters out documents
   * that are already present in the provided array of objects, and updates the non-mandatory
   * document list state with the filtered results. Also triggers the retrieval of all document files.
   *
   * @param arrayOfObj - An array of objects containing document information, each object should have a `docId` property.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   *
   * @throws Will log an error to the console and set the loading state to false if the request fails.
   */
  const handleGetListForNewFields = async (arrayOfObj: any) => {
    try {
      // const response: any = await documentsServices.getNewDocumentList();
      const response: any = await service.docs.secureGetNewDocumentList();
      if (response?.status == 200) {
        const docIds = new Set(arrayOfObj.map((item: any) => item?.docId));
        const filteredSecondArray = response?.data
          .filter((item: any) => !docIds.has(item.id))
          .map((elem: any) => {
            return {
              label: elem?.name,
              value: elem?.id,
              dmsCode: elem?.code,
            };
          });
        setIsUploadLoading(false);
        //setIsLoading(false);
        setIsAddNewDocumnet(false);

        setNonMandatoryList(filteredSecondArray);
        handleGetAllDocumentFileList();
      }
    } catch (error) {
      setIsLoading(false);
      setIsAddNewDocumnet(false);
    }
  };

  /**
   * Handles the deletion of a field from the form values.
   *
   * @param indexValue - The index of the field to be deleted.
   *
   * The function first finds the value at the specified index in the form values.
   * It then filters out the value at the specified index to create an updated form values array.
   *
   * If the document files associated with the found value are empty, it updates the form values state.
   * Otherwise, it calls the `handleDeleteFile` function to delete the file.
   */
  const handleDeleteField = (indexValue: number, deleteType: string) => {
    const findValue: any =
      formValue?.[documentIndex]?.documentFiles?.[indexValue];
    if (deleteType == "SINGLE") {
      handleDeleteFile(findValue?.id, indexValue, 1);
    }

    if (deleteType == "ALL") {
      handleDeleteFile(0, indexValue, 2);
    }
  };

  /**
   * Handles the deletion of a file from the form value and updates the document list.
   *
   * @param {number} fieldId - The ID of the field to delete.
   * @param {number} fileIndex - The index of the file in the form value array.
   * @param {number} type - The type of the document.
   * @returns {Promise<void>} - A promise that resolves when the file deletion is complete.
   *
   * The function performs the following steps:
   * 1. Finds the value in the form value array based on the file index.
   * 2. Constructs a delete object with necessary IDs and type.
   * 3. Calls the deleteDocumentFile service to delete the file.
   * 4. If the deletion is successful, updates the UI with a success message and refreshes the document list.
   * 5. If the deletion is unsuccessful, logs the error and stops the loading state.
   */
  const handleDeleteFile = async (
    fieldId: number,
    fileIndex: number,
    type: number
  ): Promise<void> => {
    setIsUploadLoading(true);
    setIsLoading(true);
    logger.info("handleDeleteFile++++++++++++++++++++++++++++++++++++++++++");

    const findValue: any = formValue.find(
      (_: any, indexValue: number) => indexValue == fileIndex
    );

    const deleteObj: any = {
      disbursementFormId: disbursementFormId,
      documentId: findValue?.docId,
      type: type,
    };

    if (fieldId != 0) {
      deleteObj["disbursemntDocId"] = fieldId;
    } else {
      deleteObj["disbursemntDocId"] = 0;
    }
    try {
      const response: any = await service.docs.secureDeleteDocumentFile(
        deleteObj
      );
      if (response?.status == 200) {
        setIsModalOpen(false);
        setIsLoading(false);
        setIsAddNewDocumnet(false);
        setPreviewModal(false);

        if (fieldId == 0) {
          const updateFormValue: any = formValue.filter(
            (_: any, index: number) => index != fileIndex
          );
          setFormValue(updateFormValue);
          handleGetDocsList(0);
        } else {
          if (isModalOpen) {
            handleGetDocsFileList(findValue?.docId);
            handleGetDocsList(0);
          } else {
            handleGetDocsList(0);
          }
        }
      }
    } catch (error: any) {
      logger.error(error);
    } finally {
      setIsLoading(false);
      setIsAddNewDocumnet(false);
    }
  };

  /**
   * Handles the deletion of a selected document from the form value.
   *
   * This function creates a copy of the current form value, filters out the document
   * with the specified `docId`, and updates the form value state with the filtered result.
   *
   * @returns {void}
   */
  const handleDeleteSelectedDocument = () => {
    const copyFormValue = [...formValue];
    const updatedFormValue = copyFormValue.filter(
      (elem: any) => elem.docId !== newDocumentValue
    );
    setFormValue(updatedFormValue);
    setNewDocumentValue(0);
    setSelectedDocuments([]);
  };

  /**
   * Fetches the list of document files for a given document ID and updates the document list state.
   *
   * @param doc_id - The ID of the document to fetch the file list for.
   * @returns A promise that resolves when the document file list has been fetched and the state has been updated.
   */
  const handleGetDocsFileList = async (doc_id: any) => {
    try {
      const body = {
        disbursementFormId: disbursementFormId,
        documentId: doc_id,
      };
      const response = await service?.docs?.secureGetDocumentFileList(body);
      if (response.status == 200) {
        setDoumentListValues(response?.data?.data);
      }
    } catch (error) {
      logger.error(""+error);
    }
  };

  /**
   * Handles the retrieval of the documents list.
   *
   * This function sets the loading state to true, then attempts to fetch the document list
   * from the `documentsServices` based on the `paymentTypeId`. If the response is successful,
   * it processes each document item with a delay and constructs an array of document objects.
   * The constructed array is then set to the form value and used to get additional fields.
   *
   * @async
   * @function handleGetDocsList
   * @returns {Promise<void>} A promise that resolves when the document list has been processed and set.
   * @throws Will log an error and set loading state to false if the request fails.
   */
  const handleGetDocsList = async (apiCallNumber: number): Promise<void> => {
    setIsLoadingUpdate(true);
    try {
      const arrayOfObj: any = [];

      const loan_type_id = loanData?.sanctionedDisbursedData.find(
        (elem: any) => elem?.lanNumber == selectedLoanNumber
      )?.loanTypeId;

      const response: any = await service?.docs?.secureGetDocumentList(
        paymentTypeId,
        loan_type_id,
        isNewUniversity
      );

      if (response.status === 200) {
        //setIsLoading(false);
        setIsAddNewDocumnet(false);
        const filterData: any = response?.data;
        if (paymentTypeId == 1 && accountTypeId != 2) {
          const findIndexValue: any = filterData.findIndex(
            (elem: any) => elem?.docType?.code == 1218
          );
          filterData.splice(findIndexValue, 1);
        }
        await Promise.all(
          filterData.map(async (item: any, index: number) => {
            await delay(index * 300); // Adjust the delay (300ms here) as needed

            const jsonObject = {
              docId: item?.docType?.id,
              docName: item?.docType?.name,
              docDms: item?.docType?.code,
              documentFiles: [],
              isOldValue: false,
              documentUploadCount: item?.document_upload_count,
            };

            jsonObject["isOldValue"] = true;
            arrayOfObj.push(jsonObject);
          })
        );
        if (apiCallNumber == 0) {
          setFormValue(arrayOfObj);
        }
        handleGetListForNewFields(arrayOfObj);
        //setIsLoadingUpdate(false);
      }
    } catch (error) {
      setIsLoading(false);
      setIsAddNewDocumnet(false);
    }
  };

  const titleHeader = (title: string) => {
    return <Text style={styles.headerTitleStyle}>{title}</Text>;
  };

  const documentsList = [
    { id: "1", title: "Visa Copy" },
    { id: "2", title: "Demand Letter" },
    { id: "3", title: "Forex Remittance 1" },
    { id: "4", title: "Last Semester Result" },
  ];

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: false,
      });
    } catch (err: any) {
      // if (!DocumentPicker.isCancel(err))
      //   logger.warn(err);
    }
  };

  const handleOpenUploadDocument = (id: any, index: number) => {
    logger.debug("id, index", id, index);
    const checkDocument: any = formValue.find((elem: any) => elem.docId == id);
    logger.debug("checkDocument?.documentFiles", checkDocument?.documentFiles);
    setIsDocumentData(checkDocument?.documentFiles?.length > 0);
    setDocumentId(id);
    setDocumentIndex(index);
    setVisible(true);
  };

  const toBeUploadDocument = () => {
    //logger.debug("isLoading", isLoading);
    //logger.debug("isLoadingUpdate", isLoadingUpdate);
    return (
      <View>
        {isLoading || isLoadingUpdate ? (
          uploadCardShimmer()
        ) : (
          <>
            {formValue?.some(
              (item) => item?.isOldValue && item?.documentFiles?.length === 0
            ) && titleHeader(strings.TO_BE_UPLOADED)}

            {formValue?.map((item, index) => {
              if (item?.isOldValue && item?.documentFiles?.length === 0) {
                return (
                  <View key={index} style={styles.borderContainer}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "space-between",
                        backgroundColor: "white",
                      }}
                    >
                      {item?.isOldValue && item?.isCheckNon != true ? (
                        <AstricString
                          label={item?.docName}
                          style={styles.titleStyle}
                        />
                      ) : (
                        <Text>{item.docName}</Text>
                      )}
                      <Text style={styles.subTitleStyle}>
                        {strings.Upto_10_mb}
                      </Text>
                    </View>

                    {isMoveToNext === false && (
                      <TouchableOpacity
                        style={styles.uploadBtnStyle}
                        onPress={() => {
                          setIsDocumentData(false);
                          setVisible(true);
                          handleOpenUploadDocument(item.docId, index);
                        }}
                        activeOpacity={AppConstants.buttonActiveOpacity}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            borderWidth: 1,
                            paddingHorizontal: 8,
                            paddingVertical: 8,
                            borderRadius: 6,
                            borderColor: colors.appThemeColor,
                            alignItems: "center",
                          }}
                        >
                          <Image
                            source={imagePath.upload}
                            style={styles.uploadImageStyle}
                          />
                          <Text style={styles.uploadTextStyle}>
                            {strings.Upload}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
              return null;
            })}
          </>
        )}
      </View>
    );
  };

  const uploadCardShimmer = () => {
    const placeholders = [1, 2, 3, 4]; // 4 shimmer items

    return (
      <View style={{ marginTop: 16 }}>
        {placeholders.map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              height: 70,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 16,
              marginBottom: 16,
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  height: 14,
                  width: "70%",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  height: 12,
                  width: "35%",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              />
            </View>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{
                height: 36,
                width: 100,
                borderRadius: 20,
              }}
            />
          </View>
        ))}
      </View>
    );
  };

  const shimmerCardList = () => {
    const shimmerItems = Array(4).fill(0);
    return (
      <ScrollView style={{ marginTop: 16 }}>
        {shimmerItems.map((_, index) => (
          <View
            key={index}
            style={{
              height: 70,
              borderWidth: 1,
              borderColor: "#D3D3D3",
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
          >
            {/* Text section */}
            <View style={{ flex: 1 }}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  width: 120,
                  height: 14,
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  width: 80,
                  height: 12,
                  borderRadius: 4,
                }}
              />
            </View>

            {/* Icon section */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                }}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  marginLeft: 12,
                }}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  const uploadedDocument = () => {
    return (
      <View>
        {isLoading || isLoadingUpdate ? (
          shimmerCardList()
        ) : (
          <>
            {formValue?.some((item) => item?.documentFiles?.length > 0) &&
              titleHeader(strings.UPLOADED)}

            {formValue?.map((item, index) => {
              if (item?.documentFiles?.length > 0) {
                const documentName =
                  item?.docName +
                  (item?.docOtherName
                    ? `, ${item?.docOtherName}`
                    : item?.otherDocName
                    ? `, ${item?.otherDocName}`
                    : "");

                return (
                  <View key={item.id} style={styles.borderContainer}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "space-between",
                        //backgroundColor: "green",
                      }}
                    >
                      {item?.isOldValue && item?.isCheckNon != true ? (
                        <AstricString
                          label={documentName}
                          style={styles.titleStyle}
                        />
                      ) : (
                        <Text>{documentName}</Text>
                      )}
                      <Text style={styles.subTitleStyle}>
                        {strings.Upto_10_mb}
                      </Text>
                    </View>

                    <View style={styles.eyeDeleteIconStyle}>
                      <TouchableOpacity
                        activeOpacity={AppConstants.buttonActiveOpacity}
                        onPress={() =>
                          handleOpenUploadDocument(item?.docId, index)
                        }
                      >
                        <Image
                          source={imagePath.eye}
                          style={[
                            styles.plusIcon,
                            { tintColor: colors.appThemeColor },
                          ]}
                        />
                      </TouchableOpacity>
                      {isMoveToNext === false && (
                        <>
                          {item?.uploadedBy === "customer" && (
                            <TouchableOpacity
                              activeOpacity={AppConstants.buttonActiveOpacity}
                              onPress={() => handleDeleteField(index, "ALL")}
                            >
                              <Image
                                source={imagePath.delete}
                                style={styles.plusIcon}
                              />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                );
              }
              return null;
            })}
          </>
        )}
      </View>
    );
  };

  const handlenewDoc = () => {
    setDocumentType(null);
    setModalVisible(true);
  };

  const previewDocument = () => {
    return (
      <View style={{ width: "100%", height: 500 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
        >
          <Image
            source={imagePath.splashLogo}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </ScrollView>
      </View>
    );
  };

  const memoizedOtherField = useMemo(() => {
    const index = nonMandatoryList.findIndex((elem) => {
      if (!triggerStatusPopup) {
        return (
          elem?.value === newDocumentValue && /others|other/i.test(elem?.label)
        );
      } else {
        return -1;
      }
    });
    if (index !== -1) {
      return (
        <>
          <AstricString
            label={strings.Other_Document_Name}
            style={{ ...styles.label, marginTop: 4 }}
          />
          <TextInput
            style={[
              styles.dropdown,
              { borderColor: otherDocNameError ? "red" : "#ccc" },
            ]}
            placeholder={strings.Enter_Other_Document_Name}
            value={otherDocName}
            onChangeText={(event) => handleAddNewDocName(event)}
          />
          {otherDocNameError ? (
            <Text style={{ color: "red", marginTop: 4 }}>
              {otherDocNameError}
            </Text>
          ) : null}
        </>
      );
    }

    return null;
  }, [
    nonMandatoryList,
    newDocumentValue,
    otherDocName,
    otherDocNameError,
    formValue,
    documentType,
    isModalVisible,
    triggerStatusPopup,
  ]);

  const docNameValidation = useMemo(() => {
    const index = nonMandatoryList.findIndex(
      (elem) =>
        elem?.value === newDocumentValue && /others|other/i.test(elem?.label)
    );

    if (index !== -1) {
      return true;
      // Do something here
    }

    return false; // or whatever you need to return
  }, [nonMandatoryList, newDocumentValue]);

  const getOtherDocumentField = () => {
    return (
      <>
        <AstricString
          label={strings.Other_Document_Name}
          style={{ ...styles.label, marginTop: 4 }}
        />
        <TextInput
          style={styles.dropdown}
          placeholder={strings.Enter_Other_Document_Name}
          onChangeText={(e: any) => handleAddNewDocName(e)}
        />
      </>
    );
  };

  const handleAddNewDocName = (event: any) => {
    setOtherDocName(event);
    if (event.length <= 0) {
      setOtherDocNameError("This field is required.");
    } else {
      setOtherDocNameError("");
    }
    const copyFormValue: any = [...formValue];
    copyFormValue[copyFormValue.length - 1].otherDocName = event;
    setFormValue(copyFormValue);
  };

  const documentContent = () => {
    return internalIsUploaded ? (
      <View>
        {documentsList.map(({ id, title }) => (
          <View key={id} style={styles.borderContainer}>
            <View style={{ justifyContent: "space-between" }}>
              <AstricString label={title} style={styles.titleStyle} />
              <Text style={styles.subTitleStyle}>{strings.Upto_10_mb}</Text>
            </View>
            <View style={styles.eyeDeleteIconStyle}>
              <TouchableOpacity
                activeOpacity={AppConstants.buttonActiveOpacity}
                onPress={() => setIsPreviewVisible(true)}
              >
                <Image
                  source={imagePath.eye}
                  style={[styles.plusIcon, { tintColor: colors.appThemeColor }]}
                />
              </TouchableOpacity>
              {isViewOnly ? null : (
                <TouchableOpacity
                  activeOpacity={AppConstants.buttonActiveOpacity}
                >
                  <Image source={imagePath.delete} style={styles.plusIcon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        {isViewOnly ? null : (
          <Pressable style={styles.uploadSection} onPress={() => {}}>
            <Image source={imagePath.plus} />
            <Text style={styles.uploadText}>{strings.Add_New_Document}</Text>
          </Pressable>
        )}
      </View>
    ) : (
      <>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Document Name</Text>
          <Dropdown
            ref={dropdownRef}
            key={documentType === null ? `null-${Date.now()}` : documentType}
            style={styles.dropdown}
            placeholderStyle={styles.placeholder}
            selectedTextStyle={styles.selectedText}
            iconStyle={styles.iconStyle}
            data={nonMandatoryList}
            labelField="label"
            valueField="value"
            placeholder=""
            value={documentType ? documentType : null}
            onChange={(value: string | number) => {
              handleSelectedNewFieldValue(value);
            }}
          />
          {memoizedOtherField}
        </View>
        <TouchableOpacity
          style={[
            styles.uploadSection,
            !documentType && {  }
          ]}
          disabled={!documentType}
          onPress={() => {
            logger.debug("otherDocName?.length:  ", otherDocName?.length);
            logger.debug("Document Type :  ", documentType);
            if (documentType) {
              if (Platform.OS === "ios") {
                if (docNameValidation) {
                  otherDocName?.length > 0
                    ? setModalVisible(false)
                    : validateOtherDocName();
                } else {
                  setModalVisible(false);
                }
              }
              setIsDocumentData(false);
              setDocumentId(newDocumentValue);
              setDocumentIndex(formValue.length - 1);
              if (docNameValidation) {
                otherDocName?.trim()?.length > 0
                  ? setVisible(true)
                  : validateOtherDocName();
              } else {
                setVisible(true);
              }
            }
          }}
        >
          <Image 
            source={imagePath.plus} 
            style={!documentType && { tintColor: '#a4a4a4' }}
          />
          <Text style={[
            styles.uploadText,
            !documentType && { color: '#a4a4a4' }
          ]}>{strings.Upload_Document}</Text>
        </TouchableOpacity>
      </>
    );
  };

  const handleshowImageList = () => {
    //logger.debug("documentListValue?.[docIndex]", documentListValue);
    const viewData: any = documentListValue?.[docIndex];
    //logger.debug("viewDtaa", viewData);
    const uploadBy: any = formValue.find(
      (elem: any) => elem?.docId == viewData?.docId
    );
    //logger.debug("uploadby", uploadBy);
    const isPdf = viewData?.docName?.includes("pdf");
    //logger.debug("viewData?.docName", viewData?.docName);
    return (
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPreviewModal(false)}
          >
            <View style={{}}>
              <Image
                source={imagePath.cancel} // Add your close icon
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>

          {/* File Viewer */}
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View>
              {uploadBy?.uploadedBy === "customer" &&
                isMoveToNext === false && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      handleDeleteSingleFileModal(
                        viewData?.id,
                        docIndex,
                        1,
                        "SINGLE"
                      )
                    }
                  >
                    <Image
                      source={imagePath.delete} // Add your delete icon
                      style={[styles.icon, { tintColor: "red" }]}
                    />
                  </TouchableOpacity>
                )}
            </View>
            {isPdf ? (
              <Pdf
                trustAllCerts={false}
                source={{ uri: viewData?.docName, cache: false }}
                onLoadComplete={(numberOfPages, filePath) => {
                  logger.debug(`number of pages: ${numberOfPages}`);
                }}
                onError={(error) => {
                  logger.error(""+error);
                }}
                style={{ flex: 1 }}
              />
            ) : (
              <FastImage
                style={styles.imageStyle}
                source={{
                  uri: viewData?.docName,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.web,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  const handleModalClose = () => {
    setModalVisible(false);
    handleDeleteSelectedDocument();
  };

  return (
    <View>
      {uploadedDocument()}
      {toBeUploadDocument()}
      {isLoading || isLoadingUpdate ? (
        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
        >
          {/* Shimmer for the "+" icon */}
          <ShimmerPlaceholder
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              marginRight: 8,
            }}
          />
          {/* Shimmer for the "Add New Document" text */}
          <ShimmerPlaceholder
            style={{
              width: 140,
              height: 20,
              borderRadius: 4,
            }}
          />
        </View>
      ) : (
        isMoveToNext === false && (
          <TouchableOpacity
            activeOpacity={AppConstants.buttonActiveOpacity}
            style={styles.button}
            onPress={handlenewDoc}
          >
            <View style={styles.buttonContent}>
              <Image source={imagePath.plus} style={styles.plusIcon} />
              <Text style={styles.buttonText}>{strings.Add_New_Document}</Text>
            </View>
          </TouchableOpacity>
        )
      )}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDocumentId(0);
          setDocumentIndex(0);
          setVisible(false);
        }}
        style={{ backgroundColor: colors.blackOpacity01 }}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Upload Document</Text>
            {(() => {
              // logger.debug("formValue in render:", formValue);
              // logger.debug(
              //   "formValue?.[documentIndex]?.documentFiles",
              //   formValue?.[documentIndex]?.documentFiles
              // );
              return null;
            })()}
            {isUploadLoading ? (
              shimmerCardList()
            ) : isDocumentData ? (
              formValue?.[documentIndex]?.documentFiles?.map(
                (elem: any, index: number) => (
                  <View key={index} style={styles.fileItem}>
                    <View style={styles.textSection}>
                      <Text numberOfLines={1} style={styles.fileName}>
                        {elem?.docName?.split("/")?.[1] || "Untitled"}
                      </Text>
                      <Text style={styles.subText}>Upto 10 mb</Text>
                    </View>

                    <View style={styles.iconSection}>
                      <TouchableOpacity
                        onPress={() => {
                          if (Platform.OS === "ios") {
                            setVisible(false);
                          }
                          setDocIndex(index);
                          handleGetDocsFileList(elem?.docId).finally(() => {
                            setPreviewModal(true);
                          });
                        }}
                        style={styles.iconButton}
                        activeOpacity={0.5}
                      >
                        <Image
                          source={imagePath.eye}
                          style={[
                            styles.plusIcon,
                            { tintColor: colors.appThemeColor },
                          ]}
                        />
                      </TouchableOpacity>

                      {isMoveToNext === false &&
                        elem?.uploadedBy === "customer" && (
                          <TouchableOpacity
                            onPress={() => handleDeleteField(index, "SINGLE")}
                            style={styles.iconButton}
                            activeOpacity={AppConstants.buttonActiveOpacity}
                          >
                            <Image
                              source={imagePath.delete}
                              style={styles.plusIcon}
                            />
                          </TouchableOpacity>
                        )}
                    </View>
                  </View>
                )
              )
            ) : (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => handleFileChange(documentId, documentIndex)}
                activeOpacity={AppConstants.textActiveOpacity}
              >
                <Image source={imagePath.upload} style={styles.uploadIcon} />
                <Text style={styles.uploadText}>Click to upload</Text>
                <Text style={styles.fileInfo}>
                  File Format: .jpeg, .png & (pdf) File Size: Up to 10 MB
                </Text>
              </TouchableOpacity>
            )}
            {isDocumentData && isMoveToNext === false && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{ flexDirection: "row" }}
                  onPress={() => setIsDocumentData(false)}
                >
                  <Image source={imagePath.plus} style={styles.plusIcon} />
                  <Text style={{ marginRight: 8, fontFamily: fonts.regular }}>
                    Add More
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => handleModalClose()}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Image
                source={imagePath.cross}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
            {!isPreviewVisible && (
              <View style={{ marginLeft: 30, marginRight: 24 }}>
                <Text style={styles.title}>
                  {isUploaded
                    ? strings.Upload_Document
                    : strings.Upload_New_Document}
                </Text>
                {documentContent()}
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={previewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewModal(false)}
      >
        {handleshowImageList()}
      </Modal>
    </View>
  );
};

export default AddNewDocuments;

const styles = StyleSheet.create({
  nextBtnTxt: { color: colors.white, fontFamily: fonts.medium, fontSize: 13 },
  borderTxtStyle: {
    color: colors.appThemeColor,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  remarkHistoryTxtStyle: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  remarkContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  eyeDeleteIconStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  borderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#A8AAAE",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleStyle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.subHeaderTextColor,
  },
  subTitleStyle: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.subHeaderTextColor,
  },
  uploadBtnStyle: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadImageStyle: {
    height: 16,
    width: 16,
    marginRight: 10,
  },
  uploadTextStyle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.appThemeColor,
  },
  headerTitleStyle: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.appThemeColor,
    marginTop: 16,
  },
  nextBtn: {
    padding: 10,
    backgroundColor: colors.appThemeColor,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
  },
  leftArrowIcon: {
    height: 10,
    width: 20,
    marginRight: 5,
    tintColor: colors.appThemeColor,
  },
  label: {
    marginTop: 24,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.paymentTextColor,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    color: colors.subHeaderTextColor,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  righArrowIcon: {
    height: 10,
    width: 20,
    marginLeft: 5,
    tintColor: colors.white,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  secondaryBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.appThemeColor,
    alignItems: "center",
    flexDirection: "row",
  },
  borderBtn: {
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.appThemeColor,
    alignItems: "center",
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  buttonText: {
    color: colors.appThemeColor,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 20,
  },
  plusIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: "contain",
  },
  overlay: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  closeText: {
    fontSize: 20,
    color: "#555",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#bbb",
    paddingHorizontal: 25,
    paddingVertical: 60,
    alignItems: "center",
    borderRadius: 10,
  },
  uploadIcon: {
    width: 30,
    height: 30,
    marginBottom: 10,
  },
  uploadText: {
    fontWeight: "600",
    fontFamily: fonts.regular,
    color: colors.appThemeColor,
    fontSize: 16,
    marginLeft: 8,
  },
  fileInfo: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 20,
    width: width - 48,
    elevation: 10,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  title: {
    color: "rgba(75, 70, 92, 0.9)",
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 20,
    marginTop: 44,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 6,
    color: "#333",
  },
  dropdown: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  placeholder: {
    color: "#aaa",
  },
  selectedText: {
    color: "#000",
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  uploadSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 44,
    marginBottom: 24,
  },
  textSection: {
    flex: 1,
    paddingRight: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b465c",
  },
  subText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  iconSection: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  fileItem: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "contain" },
  modalContainer: {
    width: width * 0.85,
    height: height * 0.5,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    paddingTop: 30,
    paddingBottom: 30,
  },
  deleteButton: {
    position: "absolute",
    top: 40,
    right: 8,
    zIndex: 10,
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 2,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: "#333",
  },
  contentArea: {
    flex: 1,
    marginTop: 10,
  },
  pdfStyle: {
    flex: 1,
    width: "100%",
  },
  imageStyle: {
    width: "100%",
    height: "100%",
  },
});
