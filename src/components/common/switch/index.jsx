import { Switch as AntdSwitch } from "antd";

import "./styles.scss";

const Switch = (props) => {
  const { leftLabel, classes, rightLabel, checked, onChange } = props;
  return (
    <AntdSwitch
      className={`common-switch ${classes}`}
      checked={checked}
      onChange={onChange}
      checkedChildren={leftLabel || ""}
      unCheckedChildren={rightLabel || ""}
    />
  );
};

export default Switch;
