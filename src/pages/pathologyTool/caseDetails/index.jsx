import { useState, useEffect, useRef } from "react";
import { If, Then, Else } from "react-if";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  NoSlideIcon,
  AddPencilIcon,
  DownloadReportIcon,
  CheckSquareIcon,
  AssignIcon,
  UnAssignIcon,
  TransferCaseIcon,
} from "@/assets/svg";
import {
  DashboardTemplate,
  PatientDetail,
  Comment,
  SlidePreview,
  OpenSeaDragonViewer,
  CaseTransferDrawer,
} from "@/components";
import { Radio, Button, Modal, Input, Card } from "@/components/common";
import { getUserNameInitials } from "@/utils/helpers";
import { getUniqueOrgans } from "@/pages/pathologyScanDetails/utils";
import { getUserData } from "@/utils/storage";
import { formatToDate } from "@/utils/dateUtils";
import {
  getCaseByID,
  downloadPathologyReport,
  getCaseSlidesStatus,
  updateCaseStatus,
  assignCaseToMe,
  unAssignCaseToMe,
  getLatestCaseStatus,
  getTransferStatus,
} from "@/services/caseService";
import { getSlideDetailsByID } from "@/services/slideService";
import {
  addCommentByID,
  getCommentsByID,
  editCommentByID,
} from "@/services/commentService";
import { CANTALOUPE_SERVER, organColorMap } from "@/constants";
import { setFullScreen } from "@/reducers/fullScreen";
import avatar from "@/assets/avatar.png";
import Editor from "../editor"; 

const caseStudyTabOptions = [
  {
    label: "Patient Details",
    value: "patientDetails",
  },
  {
    label: "Slides",
    value: "slides",
  },
];

const CaseDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, email: currentUserEmail, id: userID } = getUserData();
  const { page, type } = location.state;
  const caseID = location.state?.caseID ?? location.pathname.split("/")[2];

  const dispatch = useDispatch();

  const viewerRef = useRef(null);

  const { fullScreen } = useSelector((state) => state.fullScreen);

  const schema = yup.object().shape({
    comment: yup
      .string()
      .required("Comment is required")
      .min(5, "Comment too short!")
      .max(300, "Comment too long!"),
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { comment: "" },
    mode: "all",
  });

  const [tabType, setTabType] = useState(
    location.state?.tabType ?? "patientDetails"
  );
  const [patientData, setPatientData] = useState({
    slides: location.state?.slides ?? [],
  });
  const [comments, setComments] = useState([]);
  const [editComment, setEditComment] = useState(false);
  const [editID, setEditID] = useState("");
  const [commentModal, setCommentModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(
    location.state?.selectedSlide ?? {
      slide: 0,
      id: patientData?.slides[0]?.id ?? "",
      slideID: patientData?.slides[0]?.slideID ?? "",
    }
  );
  const [caseStatus, setCaseStatus] = useState("");
  const [transferCaseModal, setTransferCaseModal] = useState(false);
  const [unAssignCaseModal, setUnAssignCaseModal] = useState(false);
  const [assignToMeModal, setAssignToMeModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [annotationModal, setAnnotationModal] = useState(false);
  const [caseDrawer, setCaseDrawer] = useState(false);
  const [latestCaseStatus, setLatestCaseStatus] = useState(null);
  const [transferStatus, setTransferStatus] = useState(null);
  const [completeCaseModal, setCompleteCaseModal] = useState(false);
  const [slideDetails, setSlideDetails] = useState(null);
  const [reset, setReset] = useState(false);
  const [showAnnotationTool, setShowAnnotationTool] = useState(false);

  useEffect(() => {
    dispatch(setFullScreen(false));
  }, []);

  const showCommentModal = () => {
    setCommentModal(() => true);
  };

  const hideCommentModal = () => {
    setCommentModal(() => false);
    setEditComment(() => false);
    setEditID(() => "");
    setValue("comment", "");
  };

  const handleShowEditModal = (currentComment) => {
    setEditComment(() => true);
    setEditID(() => currentComment.id);
    setValue("comment", currentComment.commentText);
    showCommentModal();
  };

  const handleGoBack = () => {
    navigate(`/pathology-annotation-tool`, {
      state: { page: page, type: type },
    });
  };

  const handleTabChange = (e) => {
    const tabSelected = e.target.value;
    if (tabSelected === "patientDetails") {
      setShowAnnotationTool(false);
      setReset((st) => !st);
    }
    setTabType(() => tabSelected);
    setCurrentSlide(() => ({
      slide: undefined,
      id: "",
      slideID: "",
    }));
  };

  const fetchSlideDetails = async (slideID) => {
    try {
      const slideData = await getSlideDetailsByID(slideID);
      if (slideData) {
        setSlideDetails(slideData);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBackFromEditor = () => {
    setShowAnnotationTool(false);
    setReset((st) => !st);
    fetchSlideDetails(currentSlide.slideID);
  };

  const handleSelectSlide = (slide, id, slideID) => {
    setCurrentSlide(() => ({
      slide,
      id,
      slideID,
    }));
    fetchSlideDetails(slideID);
  };

  const navigateToTool = () => {
    if (patientData?.status === "NEW") {
      setAssignModal(true);
    } else {
      // navigate(
      //   `/pathology-annotation-tool/${currentSlide.slideID}/case-details/tool-editor`,
      //   {
      //     state: {
      //       ...location.state,
      //       tabType,
      //       slides: patientData.slides,
      //       selectedSlide: currentSlide,
      //       caseID,
      //     },
      //   }
      // );
      setShowAnnotationTool(true);
    }
  };

  const displayLatestStatus = () => {
    if (!latestCaseStatus) return patientData?.status;
    const isIncoming =
      userID === latestCaseStatus?.transferredToPathologistId &&
      latestCaseStatus?.newStatus === "REFERRED";

    const isReferred =
      userID === latestCaseStatus?.actionByPathologistId &&
      latestCaseStatus?.newStatus === "REFERRED";

    return isIncoming
      ? "INCOMING"
      : isReferred
      ? "TRANSFERRED"
      : patientData?.status;
  };

  const postUserComment = async (data) => {
    let response;

    try {
      if (editComment) {
        response = await editCommentByID(editID, caseID, data.comment);
      } else {
        response = await addCommentByID(caseID, data.comment);
      }

      if (response?.id) {
        hideCommentModal();
        await fetchCaseData(caseID);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await downloadPathologyReport(caseID);

      if (response) {
        const link = document.createElement("a");
        link.target = "_blank";
        link.href = response;
        link.download = "report.pdf";
        link.click();
      } else {
        throw new Error("Failed to fetch the report.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchCaseComments = async (id) => {
    try {
      const commentList = await getCommentsByID(id);
      setComments(() => commentList);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchCaseData = async () => {
    try {
      const caseData = await getCaseByID(caseID);
      await fetchCaseComments(caseID);

      if (caseData) {
        setPatientData(() => ({
          ...caseData,
          ...{
            patientDetailsDTO: {
              ...caseData.patientDetailsDTO,
              name: `${caseData?.patientDetailsDTO?.firstName} ${caseData?.patientDetailsDTO?.lastName}`,
            },
          },
        }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchCaseStatus = async (id) => {
    try {
      const response = await getCaseSlidesStatus(id);

      if (response.status) {
        setCaseStatus(() => response.status);
      }
    } catch (err) {
      toast.error();
    }
  };

  const fetchLatestCaseStatus = async () => {
    try {
      const response = await getLatestCaseStatus(caseID);
      setLatestCaseStatus(response);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransferStatus = async () => {
    try {
      const response = await getTransferStatus(caseID);
      setTransferStatus(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCaseData();
    if (patientData?.status) {
      fetchTransferStatus();
    }
  }, [patientData.status, reset]);

  useEffect(() => {
    caseID && fetchCaseStatus(caseID);
    fetchLatestCaseStatus();
  }, [caseID, reset]);

  const handleCaseStatusComplete = async () => {
    try {
      const response = await updateCaseStatus(caseID, { status: "COMPLETE" });
      toast.success(response);
    } catch (err) {
      toast.error(err);
    }
  };

  const showUnAssignModal = () => {
    const hasAnnotations = patientData?.slides?.some(
      (slide) => slide.annotationCount > 0
    );
    const userHasCommented = comments?.some(
      (comment) => comment.creationUser === currentUserEmail
    );

    if (hasAnnotations || userHasCommented) {
      setAnnotationModal(() => true);
    } else {
      setUnAssignCaseModal(() => true);
    }
  };

  const isAllSlidesCompleted = (patientData) => {
    return (
      patientData?.slides?.length > 0 &&
      patientData.slides.every((slide) => slide.status === "COMPLETED")
    );
  };

  const handleTransferCase = () => {
    if (isAllSlidesCompleted(patientData)) {
      setCaseDrawer(true);
    } else {
      setTransferCaseModal(true);
    }
  };

  const handleCompleteCase = () => {
    if (isAllSlidesCompleted(patientData)) {
      setCaseDrawer(true);
    } else {
      setCompleteCaseModal(true);
    }
  };

  const hideCaseDrawer = () => {
    setCaseDrawer(() => false);
  };

  const hideModal = () => {
    setUnAssignCaseModal(() => false);
    setAssignToMeModal(() => false);
    setTransferCaseModal(() => false);
    setAnnotationModal(() => false);
    setCompleteCaseModal(() => false);
    setAssignModal(false);
  };

  const handleUnAssignCase = async (isDeleteAnnotations = true) => {
    try {
      await unAssignCaseToMe(caseID, isDeleteAnnotations);
      await fetchCaseData();
      toast.success("Case Unassigned successfully!");
      hideModal();
      handleGoBack()
    } catch (error) {
      toast.error(error);
    }
  };

  const showAssignModal = () => {
    setAssignToMeModal(() => true);
  };

  const handleAssignCase = async () => {
    try {
      await assignCaseToMe(caseID);
      await fetchCaseData();
      toast.success("Case assigned successfully!");
      hideModal();
    } catch (error) {
      toast.error(error);
    }
  };

  const totalSlides = patientData?.slides.length;

  return (
    <DashboardTemplate goBack lessGap handleGoBack={handleGoBack}>
      {commentModal && (
        <Modal
          title={editComment ? "Edit Comment" : "Add Comment"}
          open={commentModal}
          onCancel={hideCommentModal}
          footer={[
            <Button
              key="action-button"
              title="Add"
              disabled={errors?.comment}
              handleClick={handleSubmit(postUserComment)}
            />,
          ]}
        >
          <section className="mt-16">
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  inputType="textarea"
                  label="Comment"
                  placeholder="Add Comment"
                  classes="custom-textarea"
                  required={true}
                  errors={errors}
                />
              )}
            />
          </section>
        </Modal>
      )}

      {unAssignCaseModal && (
        <Modal
          title="Alert"
          alertIcon
          open={unAssignCaseModal}
          onCancel={hideModal}
          footer={[
            <Button
              key="delete"
              title="No"
              classes="simple"
              handleClick={hideModal}
            />,
            <Button
              key="save"
              title="Yes"
              handleClick={() => handleUnAssignCase(false)}
            />,
          ]}
        >
          <p className="status-update">
            Are you sure do you want to unassign this case?
          </p>
        </Modal>
      )}

      {annotationModal && (
        <Modal
          title="Alert"
          alertIcon
          open={annotationModal}
          onCancel={hideModal}
          footer={[
            <Button
              key="delete"
              title="No"
              classes="simple"
              handleClick={() => handleUnAssignCase()}
            />,
            <Button
              key="save"
              title="Yes"
              handleClick={() => handleUnAssignCase(false)}
            />,
          ]}
        >
          <p className="status-update">
            Do you want to save your changes (annotations/comments) before
            unassigning this case?
          </p>
        </Modal>
      )}

      {transferCaseModal && (
        <Modal
          title="Alert"
          alertIcon
          open={transferCaseModal}
          onCancel={hideModal}
          footer={[<Button key="save" title="Ok" handleClick={hideModal} />]}
        >
          <p className="status-update">
            To transfer this case you need to complete all slides.
          </p>
        </Modal>
      )}

      {completeCaseModal && (
        <Modal
          title="Alert"
          alertIcon
          open={completeCaseModal}
          onCancel={hideModal}
          footer={[<Button key="save" title="Ok" handleClick={hideModal} />]}
        >
          <p className="status-update">
            To complete this case, please make sure all slides are completed
          </p>
        </Modal>
      )}

      {assignToMeModal && (
        <Modal
          title="Alert"
          alertIcon
          open={assignToMeModal}
          onCancel={hideModal}
          footer={[
            <Button
              key="no"
              classes="simple"
              title="No"
              handleClick={hideModal}
            />,
            <Button key="yes" title="Yes" handleClick={handleAssignCase} />,
          ]}
        >
          <p className="status-update">
            Are you sure do you want to assign this case to yourself?
          </p>
        </Modal>
      )}

      {assignModal && (
        <Modal
          title="Alert"
          alertIcon
          open={assignModal}
          onCancel={hideModal}
          footer={[
            <Button
              key="no"
              title="No"
              classes="simple"
              handleClick={hideModal}
            />,
            <Button
              key="yes"
              title="Assign now"
              handleClick={handleAssignCase}
            />,
          ]}
        >
          <p className="status-update">
            To annotate this slide you need to assign this case to yourself.
          </p>
        </Modal>
      )}

      <section
        className={`admin-table-fields-container ${fullScreen ? 'radio-hidden' : ''}`}
      >
        <Radio
          options={caseStudyTabOptions}
          value={tabType}
          onChange={handleTabChange}
          defaultValue="patientDetails"
        />
        <article className="table-search-fields-container">
          {displayLatestStatus() == "NEW" && (
            <Button
              title="Assign to me"
              classes="common-actions-button assign"
              handleClick={showAssignModal}
              icon={<AssignIcon />}
            />
          )}

          {displayLatestStatus() == "IN_PROGRESS" && (
            <>
              <Button
                title="Un Assign"
                classes="common-actions-button unassign"
                handleClick={showUnAssignModal}
                icon={<UnAssignIcon />}
              />

              <Button
                title="Transfer Case"
                classes="common-actions-button transfer"
                handleClick={handleTransferCase}
                icon={<TransferCaseIcon />}
              />
            </>
          )}

          {displayLatestStatus() === "INCOMING" && (
            <Button
              title="Complete Case"
              classes="common-actions-button complete"
              handleClick={handleCompleteCase}
              icon={<CheckSquareIcon />}
            />
          )}
        </article>

        {caseDrawer && (
          <CaseTransferDrawer
            open={caseDrawer}
            onClose={hideCaseDrawer}
            patientData={patientData}
            latestCaseStatus={latestCaseStatus}
            caseID={caseID}
            setReset={setReset}
          />
        )}

        {/* {role === "SENIOR_PATHOLOGIST" &&
          patientData.status !== "COMPLETE" &&
          caseStatus !== "NOT_COMPLETED" && (
            <article className="table-search-fields-container">
              <Button
                title="Mark Case Complete"
                classes="custom-button green"
                icon={<CheckEmptyIcon />}
                handleClick={handleCaseStatusComplete}
              />
            </article>
          )} */}
      </section>

      <If condition={tabType === "patientDetails"}>
        <Then>
          <section className="case-study-layout-container">
            <Card heading="Patient Information">
              <section className="patient-information-container">
                {/* <article className="patient-name-wrapper">
                  <p className="patient-avatar">
                    {getUserNameInitials(patientData?.patientDetailsDTO?.name)}
                  </p>
                  <p className="patient-name">
                    {patientData?.patientDetailsDTO?.name}
                  </p>
                </article> */}

                <article className="patient-generic-details-wrapper">
                  
                  <PatientDetail
                    heading="Gender"
                    content={patientData?.patientDetailsDTO?.gender}
                  />

                  <PatientDetail
                    heading="Age"
                    content={
                      patientData?.patientDetailsDTO?.age &&
                      `${patientData?.patientDetailsDTO?.age} yrs`
                    }
                  />

                  <PatientDetail
                    heading="Creation date"
                    content={patientData?.date 
                      ? new Date(patientData.date).toLocaleDateString('en-GB', { 
                          day: '2-digit', month: 'short', year: 'numeric' 
                        }).replace(',', '') 
                      : 'N/A'}
                  />

                </article>

                <article className="patient-generic-details-wrapper">
                  <PatientDetail
                    heading="Case ID"
                    content={patientData?.caseName}
                  />

                  <PatientDetail
                    heading="Praid ID"
                    content={patientData?.patientDetailsDTO?.praidId}
                  />

                  <PatientDetail
                    heading="Slides"
                    content={totalSlides}
                    classes="slides"
                  />

                  <PatientDetail
                    heading="Case Status"
                    content={`• ${displayLatestStatus()}`}
                    classes="slides"
                  />
                </article>
                {getUniqueOrgans(patientData?.slides).length > 0 && (
                  <article className="patient-generic-details-wrapper">
                    <PatientDetail
                      heading="Organ"
                      content={
                        <div className="organ-list">
                          {getUniqueOrgans(patientData?.slides).map((organ, index) => {
                            const colorIndex = organColorMap[organ] ?? index % 5;
                            return (
                              <span
                                key={index}
                                className={`status-box status-box-${colorIndex}`}
                              >
                                {organ.charAt(0).toUpperCase() + organ.slice(1)}
                              </span>
                            );
                          })}
                        </div>
                      }
                    />
                  </article>
                )}

                {(displayLatestStatus() === "TRANSFERRED" ||
                  displayLatestStatus() === "COMPLETE") &&
                  latestCaseStatus?.transferredToPathologistId && (
                    <article className="patient-generic-details-wrapper">
                      <article className="case-transfer-wrapper">
                        <p className="transfer-heading">Case Transferred To:</p>
                        <div className="case-transfer-details">
                          <img
                            src={avatar}
                            className="transfer-avatar"
                            alt="user-icon"
                          />
                          <div className="transfer-info">
                            <p className="transfer-name">
                              {transferStatus?.transferredTo?.fullName}
                            </p>
                            <p className="transfer-designation">
                              {transferStatus?.transferredTo?.userRole}
                            </p>
                          </div>
                        </div>
                        <p className="transfer-date-label">Transferred date</p>
                        <p className="transfer-date">
                          {transferStatus?.transferredTo?.transferredDate &&
                            formatToDate(
                              transferStatus?.transferredTo?.transferredDate
                            )}
                        </p>
                      </article>
                    </article>
                  )}

                {(displayLatestStatus() === "INCOMING" ||
                  displayLatestStatus() === "COMPLETE") && (
                  <article className="patient-generic-details-wrapper">
                    <article className="case-transfer-wrapper">
                      <p className="transfer-heading">Case Transferred By:</p>
                      <div className="case-transfer-details">
                        <img
                          src={avatar}
                          className="transfer-avatar"
                          alt="user-icon"
                        />
                        <div className="transfer-info">
                          <p className="transfer-name">
                            {transferStatus?.transferredBy?.fullName}
                          </p>
                          <p className="transfer-designation">
                            {transferStatus?.transferredBy?.userRole}
                          </p>
                        </div>
                      </div>
                      <p className="transfer-date-label">Transferred date</p>
                      <p className="transfer-date">
                        {transferStatus?.transferredBy?.transferredDate &&
                          formatToDate(
                            transferStatus?.transferredBy?.transferredDate
                          )}
                      </p>
                    </article>
                  </article>
                )}

                {patientData?.status === "COMPLETE" && (
                  <article className="patient-generic-details-wrapper">
                    <section className="content-holding-wrapper">
                      <p className="heading">Patient Report</p>

                      <article className="report-name-and-button">
                        <p className="report-name">Report.pdf</p>

                        <Button
                          buttonType="textOnly"
                          title="Download"
                          icon={<DownloadReportIcon />}
                          classes="download-report-button"
                          handleClick={fetchReport}
                        />
                      </article>
                    </section>
                  </article>
                )}
              </section>
            </Card>

            <Card
              heading="Comments"
              header={
                (displayLatestStatus() === "IN_PROGRESS" || displayLatestStatus() === "INCOMING") ? (
                  <Button
                    title="Add Comment"
                    classes="add-button-with-icon"
                    icon={<AddPencilIcon />}
                    handleClick={showCommentModal}
                  />
                ) : null
              }
            >
              <section className="comments-listing-container">
                {comments?.map((comment) => (
                  <Comment
                    key={`comment-${comment.id}`}
                    comment={comment}
                    handleShowEditModal={handleShowEditModal}
                    displayLatestStatus={displayLatestStatus}
                  />
                ))}
              </section>
            </Card>
          </section>
        </Then>

        <Else>
        {!showAnnotationTool ? (
          <section className="slide-details-layout-container">
            <Card
              heading="Slides"
              count={`(${totalSlides} ${totalSlides > 1 ? "Slides" : "Slide"})`}
            >
              <section className="slides-list-container">
                {patientData?.slides?.map((data, index) => {
                  return (
                    <SlidePreview
                      key={`pathology-slide-${index}`}
                      slide={index + 1}
                      content={patientData?.caseName}
                      status={data?.status}
                      slideData={data}
                      currentSlide={currentSlide}
                      handleSelectSlide={handleSelectSlide}
                    />
                  );
                })}
              </section>
            </Card>

            <Card
              cardClasses={fullScreen && "full-screen-open-sea-dragon"}
              heading={
                currentSlide.slide > -1
                  ? `Slide ${currentSlide.slide + 1} Image ${currentSlide.id}`
                  : "No Slide Selected"
              }
              header={
                currentSlide.slide > -1 && (
                  <Button
                    title="Annotation Tool"
                    classes="add-button-with-icon"
                    icon={<AddPencilIcon />}
                    handleClick={navigateToTool}
                  />
                )
              }
              bodyClasses={
                fullScreen
                  ? "full-screen-card"
                  : !currentSlide.slide
                  ? "full-size"
                  : "full-size"
              }
            >
              <If condition={currentSlide.slide > -1}>
                <Then>
                  <div className="openseadragon-custom-wrapper">
                    <OpenSeaDragonViewer
                      viewerRef={viewerRef}
                      tileSources={`${CANTALOUPE_SERVER}${
                        patientData?.slides[currentSlide.slide]?.slideImagePath
                      }`}
                      showNavigationControl={false}
                      selectedAnnotation={slideDetails}
                    />
                  </div>
                </Then>

                <Else>
                  <section className="no-slide-selected">
                    <NoSlideIcon />
                  </section>
                </Else>
              </If>
            </Card>
          </section>
          ) : (
            <Editor
              caseTabType={tabType}
              patientSlides={patientData?.slides}
              UserSelectedSlide={currentSlide}
              patientCaseID={caseID}
              handleBack={handleBackFromEditor}
            />
          )}
        </Else>
      </If>
    </DashboardTemplate>
  );
};

export default CaseDetails;
