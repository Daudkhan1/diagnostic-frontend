import { Drawer as AntdDrawer } from "antd";

import { ArrowRightIcon } from "@/assets/svg";

import "./styles.scss";

const Drawer = (props) => {
  const {
    maskClosable = true,
    open,
    closeIcon,
    classes,
    onClose,
    title,
    children,
  } = props;

  return (
    <AntdDrawer
      title={title && title}
      className={`common-drawer-container ${classes}`}
      closeIcon={
        !closeIcon ? (
          <span className="custom-close-icon">
            <ArrowRightIcon />
          </span>
        ) : (
          true
        )
      }
      destroyOnClose={true}
      onClose={onClose}
      open={open}
      width={671}
      zIndex={12}
      maskClosable={maskClosable}
      getPopupContainer={(trigger) => trigger.parentNode}
    >
      {children}
    </AntdDrawer>
  );
};

export default Drawer;
