import { Switch, Case, Default } from "react-if";
import { Select as AntdSelect } from "antd";

import "./styles.scss";

const CommonSelect = (props) => {
  const {
    value,
    defaultValue,
    options,
    onChange,
    classes,
    label,
    height,
    name,
    onBlur,
    required,
    errors,
  } = props;

  return (
    <section className="form-field-wrapper">
      {label && (
        <label className="form-field-label">
          {label}
          {required && <span className="label-asteric">*</span>}
        </label>
      )}

      <AntdSelect
        className={`common-select-field ${classes} ${
          errors && errors[name] && "common-select-field-error"
        }`}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        options={options}
        value={value}
        style={{
          height: height,
        }}
      />

      {errors && errors[name] && (
        <section className="error-message-container">
          <p className="error-message">{errors[name]?.message}</p>
        </section>
      )}
    </section>
  );
};

const LanguageSelect = (props) => {
  const {
    suffixIcon,
    prefixIcon,
    value,
    defaultValue,
    options,
    onChange,
    classes,
    disabled,
  } = props;

  return (
    <section
      className={`select-container ${prefixIcon && "prefix-icon"} ${
        disabled && "disabled"
      }`}
    >
      {prefixIcon && <div className="prefix-icon-wrapper">{prefixIcon}</div>}

      <AntdSelect
        suffixIcon={suffixIcon}
        className={`custom-select ${classes}`}
        defaultValue={defaultValue}
        onChange={onChange}
        options={options}
        value={value}
        disabled={disabled || false}
        // open={true}
        getPopupContainer={(trigger) => trigger.parentNode}
      />
    </section>
  );
};

const Select = (props) => {
  const { selectType } = props;

  return (
    <Switch>
      <Case condition={selectType === "language"}>
        <LanguageSelect {...props} />
      </Case>

      <Default>
        <CommonSelect {...props} />
      </Default>
    </Switch>
  );
};

export default Select;
