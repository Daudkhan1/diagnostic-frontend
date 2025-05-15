import httpService from "./axios";

export const fileUploadStart = async (fileName) => {
  const response = await httpService.post(
    `/api/upload/start?fileName=${fileName}`
  );

  return response.data;
};

export const fileChunkUpload = async (
  uploadID,
  chunkIndex,
  temporaryName,
  formData,
  abortController
) => {
  const response = await httpService.post(
    `/api/upload/chunk?uploadId=${uploadID}&partNumber=${chunkIndex}&fileName=${temporaryName}`,
    formData,
    {
      signal: abortController?.signal,
    }
  );

  return response.data;
};

export const checkFileExists = async (fileName, fileSize) => {
  const response = await httpService.get(
    `/api/upload/check-file-exists?fileName=${fileName}&fileSize=${fileSize}`
  );
  return response.data;
};

export const finalizeFileUpload = async (
  uploadID,
  name,
  temporaryName,
  chunkResponses
) => {
  const response = await httpService.post(
    `/api/upload/complete-multipart-upload?uploadId=${uploadID}&newFileName=${name}&fileName=${temporaryName}`,
    chunkResponses,
    {
      customHeaders: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const abortFileUpload = async (uploadID, temporaryName) => {
  const response = await httpService.post(
    `/api/upload/abort?uploadId=${uploadID}&fileName=${temporaryName}`
  );

  return response;
};
