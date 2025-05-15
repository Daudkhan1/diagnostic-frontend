import { Rate } from "antd";

const StarRate = (props) => {
  const { name, classes, value, onChange, onBlur, errors, onHoverChange } =
    props;

  return (
    <section className="rating-container">
      <Rate
        className={`common-rate-star ${classes} ${
          errors && errors[name] && "common-rate-star-error"
        }`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onHoverChange={onHoverChange}
      />
    </section>
  );
};

export default StarRate;
