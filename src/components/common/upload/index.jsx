import React, { useEffect, useState, useMemo } from "react";
import { Upload as AntUpload } from "antd";
import { UploaderIcon, DeleteTableButtonIcon } from "@/assets/svg";
import { Button } from "@/components/common";
import { dummyRequest, maxFileSizeAllowed } from "./uploadUtils";

import "./styles.scss";

const { Dragger } = AntUpload;

const Upload = ({
  setFileData,
  handleRemove,
  isReset,
  fileFormat,
  maxFileSize,
  label,
  disabled,
}) => {
  const [state, setState] = useState({
    fileList: [],
    file: {},
    error: false,
  });
  const fileType = fileFormat?.includes("dcm" || "svs" || "tiff" || "tif");
  const { accept, allowedFormats } = useMemo(() => {
    if (Array.isArray(fileFormat)) {
      return {
        accept: fileFormat.map((format) => `.${format}`).join(","),
        allowedFormats: fileFormat,
      };
    } else {
      return { accept: `.${fileFormat}`, allowedFormats: [fileFormat] };
    }
  }, [fileFormat]);
  useEffect(() => {
    if (isReset) {
      setState((st) => ({
        ...st,
        fileList: [],
      }));
    }
  }, [isReset]);
  const fileProps = {
    name: "file",
    listType: "picture",
    multiple: false,
    // multiple: true,
    accept,
    className: "custom-file-uploader",
    customRequest: dummyRequest(allowedFormats, maxFileSize),
    showUploadList: {
      removeIcon: <DeleteTableButtonIcon />,
    },
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    onChange(info) {
      let list = [...info.fileList];
      list = list.map((file) => {
        if (file.response) {
          file.url = file.response.url;
        }
        return file;
      });
      const isError =
        info.file &&
        (info.file.status === "error" || info.file.status === "uploading")
          ? true
          : false;
      setState((st) => ({
        ...st,
        fileList: list,
        error: isError,
      }));
      setFileData(
        isError || info.fileList.length === 0 ? [] : state.fileList,
        isError
      );
    },
    onRemove: (info) => {
      setState((st) => ({
        ...st,
        fileList: [],
      }));
      handleRemove();
    },
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.readAsText(file);
      setState((st) => ({
        ...st,
        fileList: [file],
      }));
      // setFileData([file], state.error);
    },
    fileList: state.fileList,
    progress: {
      strokeColor: {
        "0%": "#418cfd",
        "100%": "#418cfd",
      },
      trailColor: "#418cfd",
      size: 4,
      showInfo: true,
      success: {
        strokeColor: "#418cfd",
      },
      status: "active",
      format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
    },
  };
  return (
    <section className="image-uploader-container">
      {label && <p className="uploader-heading">{label}</p>}
      <Dragger {...fileProps} disabled={disabled}>
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
              File size: {maxFileSizeAllowed()}
            </p>
          </article>
        </section>

        <Button
          classes="file-uploader-button"
          title="Upload File"
          disabled={disabled}
        />
      </Dragger>
    </section>
  );
};
export default Upload;
