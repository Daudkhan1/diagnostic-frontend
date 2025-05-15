import "./styles.scss";

const PreviewContent = (props) => {
  const { heading, subheading, status, content, contentClass } = props;

  return (
    <article className="preview-content-wrapper">
      {heading && <p className="main-heading">{heading}</p>}

      {subheading && <p className="heading">{subheading}</p>}

      {status && <p className="status-box">{status}</p>}

      {content && <p className={`content ${contentClass}`}>{content}</p>}
    </article>
  );
};

export default PreviewContent;
