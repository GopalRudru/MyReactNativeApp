import axiosInstance, { secureFetch } from "../apiClient/apiClient"; // Assuming axiosInstance is correctly configured
import dictionary from "../dictionary";

const { document } = dictionary;

const documentsServices = {
  getDocumentList: async (
    paymentTypeId: any,
    loanTypeId?: any,
    isNewUniversity?: boolean
  ) => {
    let url = `${document?.docList()}?payment_type_id=${paymentTypeId}&isNewUniversity=${isNewUniversity}`;
    if (loanTypeId) {
      url += `&loan_type_id=${loanTypeId}`;
    }
    //console.log("url realk", url);
    // console.log(
    //   "axiosInstance.get(url) from instance",
    //   await axiosInstance.get(url)
    // );
    let data = await axiosInstance.get(url);
    //console.log("dataat", data?.data);
    return await axiosInstance.get(url);
  },
  getDocumentFileList: (body: any) =>
    axiosInstance.post(document?.docFileList(), body),
  postDocumentUpload: (body: any) =>
    axiosInstance.post(document?.docUpload(), body),
  deleteDocumentFile: (body: any) =>
    axiosInstance.post(document?.docDelete(), body),
  getNewDocumentList: () => axiosInstance.get(document?.docNewList()),
  saveAllDocument: (body: any) =>
    axiosInstance.post(document?.saveAllDocument(), body),
  deleteAllDocument: (body: any) =>
    axiosInstance.post(document?.deleteAllDocument(), body),
  getAllDocumentFileList: (disbursementFormId: any) =>
    axiosInstance.get(
      `${document?.allDocFileList()}?disbursementFormId=${disbursementFormId}`
    ),
  submitAllDocument: (body: any) =>
    axiosInstance.post(document?.submitDocument(), body),

  //   secureGetDocumentList: (paymentTypeId, loanTypeId, isNewUniversity) => {
  //   let url = `${document?.docList()}?payment_type_id=${paymentTypeId}&isNewUniversity=${isNewUniversity}`;
  //   if (loanTypeId) {
  //     url += `&loan_type_id=${loanTypeId}`;
  //   }
  //   return axiosInstance.get(url);
  // },
  // 🔐 New methods using SSL pinning

  secureGetDocumentList: (paymentTypeId, loanTypeId, isNewUniversity) => {
    let url = `${document?.docList()}?payment_type_id=${paymentTypeId}&isNewUniversity=${isNewUniversity}`;
    if (loanTypeId) {
      url += `&loan_type_id=${loanTypeId}`;
    }
    return secureFetch({
      url,
      method: "GET",
    });
  },

  secureGetDocumentFileList: (body) =>
    secureFetch({
      url: document?.docFileList(),
      method: "POST",
      body,
    }),

  securePostDocumentUpload: (body) =>
    secureFetch({
      url: document?.docUpload(),
      method: "POST",
      body,
    }),

  secureDeleteDocumentFile: (body) =>
    secureFetch({
      url: document?.docDelete(),
      method: "POST",
      body,
    }),

  secureGetNewDocumentList: () =>
    secureFetch({
      url: document?.docNewList(),
      method: "GET",
    }),

  secureSaveAllDocument: (body) =>
    secureFetch({
      url: document?.saveAllDocument(),
      method: "POST",
      body,
    }),

  secureDeleteAllDocument: (body) =>
    secureFetch({
      url: document?.deleteAllDocument(),
      method: "POST",
      body,
    }),

  secureGetAllDocumentFileList: (disbursementFormId) =>
    secureFetch({
      url: `${document?.allDocFileList()}?disbursementFormId=${disbursementFormId}`,
      method: "GET",
    }),

  secureSubmitAllDocument: (body) =>
    secureFetch({
      url: document?.submitDocument(),
      method: "POST",
      body,
    }),
};

export default documentsServices;
