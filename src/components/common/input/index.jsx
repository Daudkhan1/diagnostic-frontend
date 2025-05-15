import { Switch, Case, Default } from "react-if";
import { Input as AntdInput } from "antd";

import { SearchIcon } from "@/assets/svg";

import "./styles.scss";

const { TextArea } = AntdInput;

const PasswordInput = (props) => {
  const { label, type, name, placeholder, classes, onChange, value } = props;

  return (
    <section className="form-field-wrapper">
      {label && <label className="form-field-label">{label}</label>}

      <AntdInput.Password
        type={type}
        name={name}
        className={`common-password-field ${classes}`}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
    </section>
  );
};

const TextAreaInput = (props) => {
  const {
    label,
    name,
    placeholder,
    classes,
    required,
    height,
    value,
    onChange,
    onBlur,
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

      <TextArea
        placeholder={placeholder}
        className={`common-textarea-field ${classes} ${
          errors && errors[name] && "common-textarea-field-error"
        }`}
        style={{
          height: height || 190,
          resize: "none",
        }}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />

      {errors && errors[name] && (
        <section className="error-message-container">
          <p className="error-message">{errors[name]?.message}</p>
        </section>
      )}
    </section>
  );
};

const SearchInput = (props) => {
  const {
    label,
    type,
    name,
    placeholder,
    classes,
    onChange,
    value,
    maxLength,
    width,
    height,
  } = props;

  return (
    <section className="form-field-wrapper">
      {label && <label className="form-field-label">{label}</label>}

      <AntdInput
        type={type}
        name={name}
        prefix={<SearchIcon />}
        className={`common-search-field ${classes}`}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
        maxLength={maxLength}
        style={{
          width: width,
          height: height,
        }}
      />
    </section>
  );
};

const CommonInput = (props) => {
  const {
    label,
    type,
    name,
    height,
    placeholder,
    classes,
    value,
    disabled,
    onChange,
    onBlur,
    required,
    errors,
    maxLength,
  } = props;

  return (
    <section className="form-field-wrapper">
      {label && (
        <label className="form-field-label">
          {label}
          {required && <span className="label-asteric">*</span>}
        </label>
      )}

      <AntdInput
        type={type}
        maxLength={maxLength}
        name={name}
        className={`common-input-field ${classes} ${
          errors && errors[name] && "common-input-field-error"
        }`}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        disabled={disabled || false}
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

const Input = (props) => {
  const { inputType } = props;

  return (
    <Switch>
      <Case condition={inputType === "searchField"}>
        <SearchInput {...props} />
      </Case>
      <Case condition={inputType === "password"}>
        <PasswordInput {...props} />
      </Case>
      <Case condition={inputType === "textarea"}>
        <TextAreaInput {...props} />
      </Case>
      <Default>
        <CommonInput {...props} />
      </Default>
    </Switch>
  );
};

export default Input;
