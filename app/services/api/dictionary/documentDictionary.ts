const documentDictionary = {
    docList: () => "api/v1/lpt-doc-map/list",
    docFileList: () => "api/v1/disbursement-form/preview-document",
    docUpload: () => "api/v1/disbursement-form/upload-document/",
    docDelete: () => "api/v1/disbursement-form/delete-document/",
    docNewList: () => "api/v1/dmsdocument/get-documents",
    saveAllDocument: () => "api/v1/disbursement-form/save-document",
    deleteAllDocument: () => "api/v1/disbursement-form/discard-temp-docs",
    allDocFileList: () => "api/v1/disbursement-form/disb-doc-list",
    submitDocument: () => "api/v1/disbursement-form/submit-disbursement-form",
 }
 
 export default documentDictionary;