import { useState } from "react";
import { Tooltip } from "antd";

import { Button, Modal, Radio, Checkbox } from "@/components/common";
import { InfoIcon, RightArrowIcon, ArrowLeftIcon } from "@/assets/svg";

import "./styles.scss";

const EditorCardHeader = (props) => {
  const {
    mainHeading,
    manualCount,
    aiCount,
    enableAI,
    filterAnnotations,
    isChecked,
    setIsChecked,
    handleAllAnnotationAction,
    savedAnnotations,
    caseDataState,
    handleCompleteSlide,
    slideID,
    caseStatus,
    handleBack,
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const aiOptions = [
    { label: "Manual Annotations", value: false },
    { label: "AI Annotations", value: true },
  ];

  const [annotationState, setAnnotationState] = useState({
    modalType: null,
    isModalVisible: false,
  });

  const showCompleteButton = () => {
    const currentSlide = caseDataState?.slides?.find(
      (slide) => slide.id === slideID
    );

    if (currentSlide?.annotationCount > 0 && caseStatus !== 'TRANSFERRED') {
      if ( currentSlide?.status !== "COMPLETED" ) {
        return true;
      }
      return;
    }
    return false;
  };

  const showCompleteSlideModal = (isOpen) => {
    setIsModalOpen(isOpen);
    setAnnotationState({ modalType: null });
  };

  const showModal = (modalType) => {
    setAnnotationState({ modalType, isModalVisible: true });
  };

  const hideModal = () => {
    setIsModalOpen(false);
    setAnnotationState({ modalType: null, isModalVisible: false });
  };
 
  const handleModalConfirm = async () => {
    await handleAllAnnotationAction(annotationState.modalType);
    hideModal();
  };

  return (
    <>
      <section className="annotation-header-details-wrapper">
 
      {annotationState.isModalVisible && (
        <Modal
          title="Alert"
          alertIcon
          open={annotationState.isModalVisible}
          onCancel={hideModal}
          footer={[
            <Button key="no"
              title="No"
              classes="simple"
              handleClick={hideModal} 
             />,
            <Button key="yes"
              title="Yes"
              handleClick={handleModalConfirm} 
             />,
          ]}
        >
          <p className="status-update">
            {annotationState.modalType === "ACCEPTED"
              ? "Are you sure you want to accept all AI annotations?"
              : "Are you sure you want to undo your last operation for all AI annotations?"}
          </p>
        </Modal>
      )}

        {isModalOpen && (
          <Modal
            title="Alert"
            alertIcon
            open={isModalOpen}
            onCancel={hideModal}
            footer={[
              <Button
                key="no"
                title="No"
                classes="simple"
                handleClick={hideModal}
              />,
              <Button
                key="save"
                title="Yes"
                handleClick={async () => {
                  await handleCompleteSlide();
                  hideModal();
                }}
              />,
            ]}
          >
            <p className="status-update">
              Are you sure do you want complete this slide?
            </p>
          </Modal>
        )}

        <section className="content-wrapper">
          <div className="header-wrapper">
            <Button
              buttonType="iconOnly"
              classes="navigate-annotation-button"
              icon={<ArrowLeftIcon />}
              handleClick={handleBack} 
            />
            <p className="strong-heading">{mainHeading}</p>
          </div>
        </section>

        {showCompleteButton() && (
          <section className="content-wrapper">
            <Button
              title="Complete Slide"
              classes="complete-slide"
              icon={<RightArrowIcon />}
              handleClick={showCompleteSlideModal}
            />
          </section>
        )}
      </section>

      <div className="button-radio">
        <section className="ai-annotation-actions">
          <Radio
            options={aiOptions}
            value={enableAI}
            onChange={(e) => filterAnnotations(e.target.value)}
          />
        </section>
      </div>

      {enableAI &&
        savedAnnotations?.some((annotation) => annotation.type === "AI") && (
          <section className="select-section">
            <section className="ai-annotation-count">
              <div className="annotation-count">
                <p className="strong-heading">All AI Annotations ({aiCount})</p>

                <Tooltip
                  title="This panel show AI annotations done by our models."
                  placement="bottom"
                  overlayClassName="custom-tooltip"
                >
                  <span>
                    <InfoIcon />
                  </span>
                </Tooltip>
              </div>
            </section>

            <section className="checkbox-section">
              <Checkbox
                label="Select All"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                classes="extra-class"
              />

              {isChecked &&
                savedAnnotations?.every(
                  (annotation) => annotation.state == "NEW"
                ) && (
                  <Button
                    title="Accept all annotations"
                    classes="accept-btn"
                    handleClick={() => 
                      showModal("ACCEPTED")}
                  />
                )}

              {isChecked &&
                savedAnnotations?.every(
                  (annotation) => annotation.state == "ACCEPTED"
                ) && (
                  <Button
                    title="Undo all annotations"
                    classes="undo-btn"
                    handleClick={() => 
                      showModal("NEW")}
                  />
                )}
            </section>
          </section>
        )}
    </>
  );
};

export default EditorCardHeader;
