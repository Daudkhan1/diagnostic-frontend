import React, { useState, useEffect, useMemo } from "react";
import { Upload, Progress } from "antd";
import { v4 as uuidV4 } from "uuid";
import { toast } from "react-toastify";

import { UploaderIcon, DeleteTableButtonIcon } from "@/assets/svg";
import { Button } from "@/components/common";
import { Loader } from "@/components";
import {
  CHUNK_SIZE,
  MAX_RETRIES,
  getFileFormats,
  getMaxSize,
  maxFileSizeAllowed,
  successMessage,
} from "./chunkUploadUtils";
import {
  fileUploadStart,
  fileChunkUpload,
  finalizeFileUpload,
  abortFileUpload,
  checkFileExists,
} from "@/services/uploadService";
import { getAnonymiserStatus } from "@/services/ec2Service";
import { uploadPatientSlide } from "@/services/patientService";

import "./styles.scss";

const { Dragger } = Upload;

const ChunkUpload = (props) => {
  const {
    label,
    fileFormat,
    caseType,
    currentCase,
    caseID,
    setRefresh,
    handleNavigate,
    micronPerMeterValue,
    organValue,
    disabled,
  } = props;

  const [fileInfo, setFileInfo] = useState({
    temporaryName: "",
    uploadID: "",
  });
  const [reset, setReset] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [chunksLength, setChunksLength] = useState(0);
  const [failedChunks, setFailedChunks] = useState([]);
  const [chunkResponses, setChunkResponses] = useState([]);
  const [progress, setProgress] = useState(0);
  const [abortController, setAbortController] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anonymizerStatus, setAnonymizerStatus] = useState(null);

  const { accept, allowedFormats } = useMemo(
    () => getFileFormats(fileFormat),
    [fileFormat]
  );

  const startFileUpload = async () => {
    const randomID = uuidV4();
    const temporaryName = `temporary-${randomID}`;

    try {
      const response = await fileUploadStart(temporaryName);

      setFileInfo(() => ({
        temporaryName: temporaryName,
        uploadID: response,
      }));
    } catch (err) {
      toast.error(err);
    }
  };
  const fetchAnonymizerStatus = async () => {
    try {
      const status = await getAnonymiserStatus();
      setAnonymizerStatus(status);
    } catch (error) {
      console.error("Error fetching anonymizer status:", error);
    }
  };

  useEffect(() => {
    startFileUpload();
    fetchAnonymizerStatus();
  }, [reset]);

  const { maxSize, errorMessage } = getMaxSize(caseType);

  const handleFileUpload = async (file) => {
    if (file.size > maxSize) {
      toast.error(errorMessage);
      return;
    }

    try {
      const fileAlreadyExists = await checkFileExists(file.name, file.size);
      if (fileAlreadyExists?.exists) {
        toast.error(fileAlreadyExists?.message);
        handleUploadFile(file?.name);
        return;
      }
    } catch (error) {
      toast.error(error.message);
      return;
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let start = 0;

    setUploading(true);
    setFailedChunks([]);
    setChunkResponses([]);
    setProgress(0);
    setChunksLength(() => totalChunks);

    const controller = new AbortController();
    setAbortController(controller);

    let aborted = false;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunk = file.slice(start, start + CHUNK_SIZE);
      await uploadChunk(chunk, chunkIndex, totalChunks);
      start += CHUNK_SIZE;

      if (controller.signal.aborted) {
        aborted = true;
        break;
      }
    }

    setUploading(false);

    if (failedChunks.length > 0) {
      console.log(`Upload completed with ${failedChunks.length} failed chunks`);
    } else {
      console.log(`${file.name} uploaded successfully`);
    }
  };

  const uploadChunk = async (chunk, chunkIndex, totalChunks, retries = 0) => {
    const chunkFile = new File([chunk], `chunk-${chunkIndex}`, {
      type: chunk.type,
    });

    const formData = new FormData();
    formData.append("file", chunkFile);
    formData.append("chunkIndex", chunkIndex + 1);

    if (abortController && abortController.signal.aborted) {
      return;
    }

    try {
      const response = await fileChunkUpload(
        fileInfo.uploadID,
        chunkIndex + 1,
        fileInfo.temporaryName,
        formData,
        abortController
      );

      if (response.etag) {
        setChunkResponses((prevResponses) => [
          ...prevResponses,
          { etag: response.etag, partNumber: response.partNumber },
        ]);

        // After uploading, discard the chunk from memory
        chunk = null;

        const newProgress = Math.floor(((chunkIndex + 1) / totalChunks) * 100);
        setProgress(newProgress);
      } else {
        throw new Error("Chunk upload failed");
      }
    } catch (error) {
      if (abortController && abortController.signal.aborted) {
        return;
      }

      if (retries < MAX_RETRIES) {
        await uploadChunk(chunk, chunkIndex, totalChunks, retries + 1);
      } else {
        setFailedChunks((prevFailedChunks) => [
          ...prevFailedChunks,
          chunkIndex,
        ]);
        chunk = null;
      }
    }
  };

  useEffect(() => {
    if (chunkResponses.length === chunksLength && chunksLength !== 0) {
      finalizeUpload();
    }
  }, [chunkResponses]);

  const finalizeUpload = async () => {
    try {
      if (anonymizerStatus === true) {
        setLoading(true);
      }
      const response = await finalizeFileUpload(
        fileInfo.uploadID,
        name,
        fileInfo.temporaryName,
        chunkResponses
      );

      if (response) {
        handleUploadFile();
      } else {
        toast.error("Something went wrong. Please try again!");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (fileName) => {
    const newFileName = fileName?.replace("dcm", "tiff");
    const slideName = name?.replace("dcm", "tiff");

    try {
      const payload = {
        caseId: currentCase || caseID,
        slideImagePath: newFileName || slideName,
        showImagePath: newFileName || slideName,
        microMeterPerPixel: micronPerMeterValue,
        organ: organValue,
      };

      const uploadPatientSlideData = await uploadPatientSlide(payload);

      if (uploadPatientSlideData?.id) {
        if (currentCase) {
          setRefresh((st) => !st);
        } else {
          handleNavigate(uploadPatientSlideData.caseId);
        }

        toast.success(successMessage(caseType));
      }
    } catch (err) {
      toast.error(err);
    }
  };

  const resetAllStates = () => {
    setReset((st) => !st);
    setUploading(false);
    setName("");
    setChunksLength(0);
    setFailedChunks([]);
    setChunkResponses([]);
    setProgress(0);
    setAbortController(() => null);
  };

  const cancelUpload = async () => {
    if (abortController) {
      abortController.abort();

      try {
        const { status } = await abortFileUpload(
          fileInfo.uploadID,
          fileInfo.temporaryName
        );

        if (status === 200) {
          toast.warn("Uploading cancelled!");
        } else {
          toast.error("Failed to abort uploading. Please try again!");
        }

        resetAllStates();
      } catch (error) {
        toast.error("Failed to abort uploading. Please try again!");
      }
    }
  };

  const draggerProps = {
    name: "file",
    listType: "picture",
    className: "custom-file-uploader",
    multiple: false,
    accept,
    showUploadList: false,
    customRequest: ({ file, onSuccess, onError }) => {
      const isFileAccepted = (file) => {
        const mimeTypes = accept.split(",").map((type) => type.trim());
        const fileType = file.type || "";
        const fileExtension = file.name.split(".").pop().toLowerCase();

        return mimeTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension === type.slice(1).toLowerCase();
          } else {
            return fileType === type;
          }
        });
      };

      if (!isFileAccepted(file)) {
        toast.error(`Unsupported file format. Allowed formats: ${accept}`);
        onError(new Error("Unsupported file format"));
        return;
      }
      setName(() => file.name);
      handleFileUpload(file);
      onSuccess();
    },
  };

  return (
    <section className="image-uploader-container">
      {loading && <Loader heading="Anonymizing..." />}
      {label && <p className="uploader-heading">{label}</p>}
      <Dragger {...draggerProps} disabled={disabled || uploading}>
        <section className="ant-upload-drag-inner-layout">
          <span className="ant-upload-drag-icon">
            <UploaderIcon />
          </span>

          <article className="ant-upload-heading-wrapper">
            <p className="ant-upload-text">Drag and drop your file here</p>

            <p className="ant-upload-hint">
              File format :{" "}
              {allowedFormats.map((item) => (
                <span>{item?.toUpperCase()} </span>
              ))}{" "}
              <br />
              File size: {maxFileSizeAllowed(caseType)}
            </p>
          </article>
        </section>

        <Button
          classes="file-uploader-button"
          title="Upload File"
          disabled={disabled || uploading}
        />
      </Dragger>

      {uploading && (
        <section className="upload-progress-with-cancel">
          <Progress
            percent={progress}
            className="uploader-progress-bar"
            status="active"
            strokeColor="#418cfd"
          />

          <Button
            buttonType="iconOnly"
            classes="uploading-abort-button"
            icon={<DeleteTableButtonIcon />}
            handleClick={cancelUpload}
          />
        </section>
      )}
    </section>
  );
};

export default ChunkUpload;
