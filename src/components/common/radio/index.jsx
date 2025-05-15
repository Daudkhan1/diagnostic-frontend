import { Radio as AntdRadio } from "antd";

import "./styles.scss";

const Radio = (props) => {
  const { value, defaultValue, onChange, options, disabled = false } = props;

  return (
    <section className="admin-table-type-selection-container">
      <AntdRadio.Group
        onChange={onChange}
        value={value}
        className="custom-selection-radio-group"
        options={options}
        defaultValue={defaultValue}
        optionType="button"
        buttonStyle="solid"
        disabled={disabled}
      />
    </section>
  );
};

export default Radio;
