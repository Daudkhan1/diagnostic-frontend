import { Switch, Case, Default } from "react-if";
import { Button as AntdButton } from "antd";

import "./styles.scss";

const CommonButton = (props) => {
  const { title, classes, handleClick, disabled, icon } = props;

  return (
    <AntdButton
      type="primary"
      className={`common-primary-button ${classes} ${disabled && "disabled"}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && <span className="primary-button-icon">{icon}</span>}

      <span className="primary-button-title">{title}</span>
    </AntdButton>
  );
};

const TextButton = (props) => {
  const { icon, title, classes, handleClick } = props;

  return (
    <AntdButton
      type="text"
      className={`common-text-only-button ${classes}`}
      onClick={handleClick}
    >
      {icon && <span className="text-only-button-icon">{icon}</span>}

      <span className="text-only-button-title">{title}</span>
    </AntdButton>
  );
};

const IconButton = (props) => {
  const { icon, classes, handleClick } = props;

  return (
    <AntdButton
      type="primary"
      shape="circle"
      icon={icon}
      className={`common-icon-only-button ${classes}`}
      onClick={handleClick}
    />
  );
};

const Button = (props) => {
  const { buttonType } = props;

  return (
    <Switch>
      <Case condition={buttonType === "textOnly"}>
        <TextButton {...props} />
      </Case>

      <Case condition={buttonType === "iconOnly"}>
        <IconButton {...props} />
      </Case>

      <Default>
        <CommonButton {...props} />
      </Default>
    </Switch>
  );
};

export default Button;
