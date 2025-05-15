import { ChevronRightIcon } from "@/assets/svg";
import { PreviewContent } from "@/components";
import { Button } from "@/components/common";
import { CANTALOUPE_SERVER } from "@/constants";
import { DeleteAnnotationIcon } from "@/assets/svg";

import "./styles.scss";

const SlidePreview = (props) => {
  const {
    slide,
    status,
    content,
    currentSlide,
    handleSelectSlide,
    slideData,
    handleDeletePatient,
    showDel = false,
  } = props;

  const src = `${
    CANTALOUPE_SERVER + slideData?.slideImagePath
  }/full/73,72/0/default.jpg`;

  return (
    <section
      className={`slide-preview-container ${
        currentSlide.slide === slide - 1 && "active"
      }`}
    >
      <img src={src} alt="Preview" className="icon" />

      <PreviewContent heading={`Slide ${slide}`} content={content} />

      <PreviewContent subheading="Status" status={status} />

      <PreviewContent
        subheading="Annotations"
        contentClass="annotations"
        // content="12"
      />
      <div className="buttons-section">
        <Button
          buttonType="iconOnly"
          classes="slider-go-to-button"
          icon={<ChevronRightIcon />}
          handleClick={() =>
            handleSelectSlide(slide - 1, content, slideData?.id)
          }
        />

        {showDel && (
          <Button
            buttonType="iconOnly"
            classes="delete-slide-button"
            icon={<DeleteAnnotationIcon />}
            handleClick={() => handleDeletePatient(slideData.id)}
          />
        )}
      </div>
    </section>
  );
};

export default SlidePreview;
