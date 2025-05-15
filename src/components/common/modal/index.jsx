import { Modal as AntdModal } from "antd";

import { AlertIcon, DeleteAlertIcon } from "@/assets/svg";

import "./styles.scss";

const getTitle = (title, alertIcon, deleteIcon) => {
  return (
    <section className="modal-custom-title">
      {alertIcon && (
        <span className="title-icon">
          <AlertIcon />
        </span>
      )}

      {deleteIcon && (
        <span className="title-icon">
          <DeleteAlertIcon />
        </span>
      )}

      <p className="title-heading">{title}</p>
    </section>
  );
};

const Modal = (props) => {
  const {
    alertIcon,
    deleteIcon,
    title,
    open,
    onCancel,
    onSubmit,
    children,
    footer,
  } = props;

  return (
    <AntdModal
      className="common-modal"
      title={getTitle(title, alertIcon, deleteIcon)}
      centered
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      footer={footer || false}
    >
      {children}
    </AntdModal>
  );
};

export default Modal;
