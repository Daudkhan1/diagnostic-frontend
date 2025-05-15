import "./styles.scss";

const PatientDetail = (props) => {
  const { section, heading, content, details, classes, parentClass } = props;

  return (
    <article className={`patient-detail ${parentClass}`}>
      {section && <p className="section-heading">{section}</p>}

      <p className="heading">{heading}</p>

      {typeof content === "string" ? (
        <p className={`content ${classes}`}>{content}</p>
      ) : (
        <div className="content">{content}</div>
      )}

      {details && <p className="details">{details}</p>}
    </article>
  );
};

export default PatientDetail;
