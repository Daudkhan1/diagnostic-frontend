import {
  EditAnnotationIcon,
  DeleteAnnotationIcon,
  CloseCircleIcon,
  CheckCircleIcon,
  UndoIcon,
  InfoIcon,
} from "@/assets/svg";
import { Button } from "@/components/common";
import { Tooltip } from "antd";

const AnnotationCard = (props) => {
  const {
    selectedAnnotationId,
    annotation,
    handleAnnotationClick,
    showDeleteModal,
    handleAcceptAiModal,
    handleRejectAiModal,
    handleUndoAction,
    isChecked,
    annotationIndex,
    caseStatus,
    toggleAnnotator,
    sideBarTab
  } = props;
  return (
    <section
      className={`annotation-tile-wrapper ${
        (isChecked && annotation.type === "AI") || selectedAnnotationId === annotation.annotation_id
          ? "active-card"
          : ""
      }`}
      onClick={() => {
        handleAnnotationClick(annotation);
      }}
    >
      <section className="card-body">
        <article className="details-wrapper">
          <section className="card-header">
          <div className="info-icon-section">
            <p className="annotation_count">Annotation {annotationIndex}</p> 
              <Tooltip 
                title={annotation.description || "No description available"}
                placement="bottom" 
                overlayClassName="custom-tooltip"
              >
                {annotation.type === "AI" && (
                <span>
                  <InfoIcon />
                </span>
                )}
            </Tooltip>
          </div>

            {annotation.type === "MANUAL" && (
              <section className="button-section">
                {(caseStatus === "IN_PROGRESS" || caseStatus === "INCOMING") && (
                  <Button
                    buttonType="iconOnly"
                    icon={<EditAnnotationIcon />}
                    classes="annotation-action-button edit"
                    handleClick={(e) => {
                      e.stopPropagation();
                      toggleAnnotator("rectangle", annotation)
                    }}
                  />
                )}
                <Button
                  buttonType="iconOnly"
                  classes="annotation-action-button delete"
                  icon={<DeleteAnnotationIcon />}
                  handleClick={(e) => {
                    e.stopPropagation();
                    showDeleteModal(annotation);
                  }}
                />
              </section>
            )} 
          </section>
          <section className="content-section-details">
            <section className="header-content">
              <section className="name-section">
                <p className="name-heading">Name</p>
                <p className="row-content row-content-ellipsis">{annotation?.name}</p>
              </section>
              {sideBarTab === "PATHOLOGY" ? (
                <section className="name-section">
                  <p className="type-heading">Type</p>
                  <p className="row-content row-content-ellipsis">{annotation?.subtype?.name}</p>
                </section>
              ) : (
                <section className="name-section"> 
                  <p className="type-heading">Disease</p> 
                  <p className="row-content row-content-ellipsis">{annotation?.diseaseSpectrum?.name}</p> 
                </section>
              )}
            </section>
            {annotation.type === "AI" && (
              <section className="button-section">
                {annotation.state === "NEW"  ? (
                  <>
                    <Button
                      buttonType="iconOnly"
                      classes="annotation-action-button cross"
                      icon={<CloseCircleIcon />}
                      handleClick={(e) => {
                        e.stopPropagation();
                        handleRejectAiModal(annotation);
                      }}
                    />
                    <Button
                      buttonType="iconOnly"
                      icon={<CheckCircleIcon />}
                      classes="annotation-action-button tick"
                      handleClick={(e) => {
                        e.stopPropagation();
                        handleAcceptAiModal(annotation);
                      }}
                    />
                  </>
                ) : (
                    <Button
                      buttonType="iconOnly"
                      icon={<UndoIcon />}
                      classes="annotation-action-button undo"
                      handleClick={(e) => {
                        e.stopPropagation();
                        handleUndoAction(annotation);
                      }}
                    />
                )}
              </section>
            )} 
          </section>
        </article>
      </section>
    </section>
  );
};

export default AnnotationCard;
