import "./styles.scss";

const Card = (props) => {
  const {
    heading,
    count,
    header,
    cardClasses,
    headerClasses,
    bodyClasses,
    children,
  } = props;
  return (
    <section className={`common-card-container ${cardClasses}`}>
      <section className={`common-card-header ${headerClasses}`}>
        <p className="heading">
          {heading} {count && <span className="count">{count}</span>}
        </p>

        {header && header}
      </section>

      <section className={`common-card-body ${bodyClasses}`}>
        {children}
      </section>
    </section>
  );
};

export default Card;
