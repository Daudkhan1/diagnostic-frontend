import { Checkbox as AntdCheckbox } from "antd";
import "./style.scss";


const CommonCheckbox = (props) => {
  const { label, checked, onChange, classes, disabled, name, errors } = props;

  return (
    <section className="checkbox-wrapper">
      <AntdCheckbox
        className={`custom-checkbox ${classes} ${
          errors && errors[name] && "checkbox-error"
        }`}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      >
        {label}
      </AntdCheckbox>

      {errors && errors[name] && (
        <p className="error-message">{errors[name]?.message}</p>
      )}
    </section>
  );
};

const Checkbox = (props) => {
  return <CommonCheckbox {...props} />;
};

export default Checkbox;
