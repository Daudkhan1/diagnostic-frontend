export const CHUNK_SIZE = 10 * 1024 * 1024;
export const MAX_RETRIES = 5;
//size in bytes
export const PATHOLOGY_MAX_FILE_SIZE = 3221225472; //2*1024*1024*1024 = 2GB
export const RADIOLOGY_MAX_FILE_SIZE = 26214400; //25*1024*1024 = 25MB

export const getFileFormats = (fileFormat) => {
  if (Array.isArray(fileFormat)) {
    return {
      accept: fileFormat.map((format) => `.${format}`).join(","),
      allowedFormats: fileFormat,
    };
  } else {
    return { accept: `.${fileFormat}`, allowedFormats: [fileFormat] };
  }
};

export const getMaxSize = (caseType) => {
  const maxFileSize = maxFileSizeAllowed(caseType);
  const errorMessage = `The file exceeds the allowed size of ${maxFileSize}`;

  if (caseType === "PATHOLOGY") {
    return {
      maxSize: PATHOLOGY_MAX_FILE_SIZE,
      errorMessage,
    };
  }

  return {
    maxSize: RADIOLOGY_MAX_FILE_SIZE,
    errorMessage,
  };
};

export const maxFileSizeAllowed = (caseType) => {
  if (caseType === "PATHOLOGY") {
    return `${PATHOLOGY_MAX_FILE_SIZE / 1024 / 1024 / 1024} GB max`;
  }

  return `${RADIOLOGY_MAX_FILE_SIZE / 1024 / 1024} MB max`;
};

export const successMessage = (caseType) =>
  caseType === "PATHOLOGY"
    ? "Slide added successfully!"
    : "Scan added successfully!";
