import { RADIOLOGY_MAX_FILE_SIZE } from "@/constants";

const getLastElement = (array = []) => {
  return array.slice(-1)[0];
};

export const dummyRequest =
  (fileFormats = [], maxFileSize) =>
  ({ file, onSuccess, onProgress, onError }) => {
    let progress = 0;
    const progressLoader = setInterval(() => {
      onProgress({ percent: progress });
      progress += 10;
    }, 100);
    setTimeout(() => {
      clearInterval(progressLoader);
      const parts = file.name.split(".");
      const extension = getLastElement(parts).toLowerCase();
      let error = "";
      if (fileFormats?.includes(extension)) {
        if (maxFileSize && file.size > maxFileSize) {
          error = "File exceeds max limit";
        } else {
          onSuccess("ok");
        }
      } else {
        error = "Invalid file format";
      }
      if (error) {
        onError(error);
      }
    }, 1500);
  };

export const maxFileSizeAllowed = () => {
  return `${RADIOLOGY_MAX_FILE_SIZE / 1000} KB max`;
};
