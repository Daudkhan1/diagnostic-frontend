import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import _ from "lodash";

import { Drawer, StarRate, Input, Button, Modal } from "@/components/common";
import {
  ratingLabels,
  ratingDescriptions,
  getMainContent,
} from "./caseTransferDrawerUtils";
import Form from "./form";
import { getUserData } from "@/utils/storage";
import {
  createDiagnosis,
  createFeedback,
  postTransferCase,
  postCompleteCase,
} from "@/services/caseService";
import { getTransferUsers } from "@/services/userServices";

import avatar from "@/assets/avatar.png";

import "./style.scss";

const CaseTransferDrawer = (props) => {
  const {
    open,
    onClose,
    patientData,
    latestCaseStatus,
    caseID,
    transfer,
    setReset,
  } = props;

  const { id: userID, role: userRole } = getUserData();

  const [drawerStep, setDrawerStep] = useState(0);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [transferList, setTransferList] = useState({});
  const [selectedUser, setSelectedUser] = useState({});
  const [cancelTransferModal, setCancelTransferModal] = useState(false);
  const [search, setSearch] = useState("");

  const { heading, caption } = getMainContent(drawerStep);

  const feedbackSchema = yup.object().shape({
    rating: yup
      .number()
      .min(1, "Rating is required")
      .required("Rating is required"),
    feedback: yup
      .string()
      .required("Feedback is required")
      .min(6, "Feedback must be at least 6 characters long"),
  });

  const {
    control: controlFeedback,
    handleSubmit: handleSubmitFeedback,
    formState: { errors: errorsFeedback, isValid, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(feedbackSchema),
    mode: "all",
    defaultValues: {
      rating: 0,
      feedback: "",
    },
  });

  const currentRating = watch("rating");
  const [hoveredRating, setHoveredRating] = useState(null);

  const displayDrawerContent = () => {
    const isSameUser = userID === latestCaseStatus?.transferredToPathologistId;
    const isReferredStatus = latestCaseStatus?.newStatus === "REFERRED";

    return isSameUser && isReferredStatus;
  };

  useEffect(() => {
    if (open) {
      setDrawerStep(0);
    }
  }, [open]);

  const DrawerTitle = ({ drawerStep }) => (
    <section className="custom-case-details-drawer-header">
      <p className="heading">{transfer ? "Transfer Case" : "Complete Case"}</p>

      <section className="steps-wrapper">
        <span className={`step ${drawerStep >= 0 ? "active" : ""}`} />
        <span className={`step ${drawerStep >= 1 ? "active" : ""}`} />
        {transfer && (
          <span className={`step ${drawerStep >= 2 ? "active" : ""}`} />
        )}
      </section>
    </section>
  );

  const submitDiagnosisDetail = (data) => {
    const diagnosisPayload = {
      id: patientData?.id,
      caseId: patientData?.slides?.[0]?.caseId ?? caseID,
      gross: data.gross,
      microscopy: data.microscopy,
      diagnosis: data.diagnosis,
      userId: userID,
      deleted: false,
    };

    setDiagnosisData(diagnosisPayload);
    setDrawerStep(1);
  };

  const hideModal = () => {
    setCancelTransferModal(() => false);
    setSearch("");
  };

  const submitFeedbackForm = (data) => {
    const feedbackPayload = {
      id: patientData?.id,
      caseId: patientData?.id ?? caseID,
      userId: userID,
      difficultyLevel: data.rating,
      feedback: data.feedback,
      deleted: false,
    };

    setFeedbackData(feedbackPayload);

    if (!displayDrawerContent()) {
      setDrawerStep(2);
    } else {
      handleComplete(feedbackPayload);
    }
  };

  const handleComplete = async (payloadFeedBack) => {
    try {
      if (diagnosisData) {
        const diagnosisResponse = await createDiagnosis(diagnosisData);
        if (!diagnosisResponse?.id) {
          throw new Error("Failed to submit diagnosis");
        }
      }

      if (payloadFeedBack) {
        const feedbackResponse = await createFeedback(payloadFeedBack);
        if (!feedbackResponse?.id) {
          throw new Error("Failed to submit feedback");
        }
      }

      await postCompleteCase(caseID);

      toast.success("Case has been completed successfully");
      setReset((st) => !st);
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoBack = () => {
    setDrawerStep((st) => st - 1);
  };

  const handleCancelTransfer = () => {
    onClose();
    hideModal();
  };

  const handleTransfer = async () => {
    try {
      if (diagnosisData) {
        const diagnosisResponse = await createDiagnosis(diagnosisData);
        if (!diagnosisResponse?.id) {
          throw new Error("Failed to submit diagnosis");
        }
      }

      if (feedbackData) {
        const feedbackResponse = await createFeedback(feedbackData);
        if (!feedbackResponse?.id) {
          throw new Error("Failed to submit feedback");
        }
      }
      await postTransferCase(caseID, selectedUser.id);

      toast.success("Case transferred successfully!");
      setReset((st) => !st);
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchTransferUsers = async (searchValue) => {
    const searched = searchValue ? `&fullname=${searchValue}` : "";
    const role = `&role=${userRole}`;

    try {
      const response = await getTransferUsers(
        `?status=ACTIVE${role}${searched}`
      );

      if (response.content.length > 0) {
        setTransferList(() => response);
      }
    } catch (err) {
      toast.error(err);
    }
  };

  useEffect(() => {
    fetchTransferUsers();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(() => user);
  };

  const handleSearchDebounce = useCallback(
    _.debounce((searchValue) => fetchTransferUsers(searchValue), 500),
    []
  );

  const handleSearch = (e) => {
    let value = e.target.value;
    setSearch(() => value);

    handleSearchDebounce(value);
  };

  return (
    <Drawer
      closeIcon
      title={<DrawerTitle drawerStep={drawerStep} />}
      open={open}
      classes="transfer-case-drawer"
      onClose={() => {
        if (drawerStep === 2) {
          setCancelTransferModal(true);
        } else {
          onClose();
        }
      }}
    >
      {cancelTransferModal && (
        <Modal
          title="Alert"
          alertIcon
          open={cancelTransferModal}
          onCancel={hideModal}
          footer={[
            <Button
              key="no"
              classes="simple"
              title="No"
              handleClick={hideModal}
            />,
            <Button key="yes" title="Yes" handleClick={handleCancelTransfer} />,
          ]}
        >
          <p className="status-update">
            Are you sure do you want to cancel transferring this case?
          </p>
        </Modal>
      )}

      <>
        <p className="main-heading">{heading}</p>
        <p className="caption">{caption}</p>

        {drawerStep === 0 && (
          <Form
            submitDiagnosisDetail={submitDiagnosisDetail}
            diagnosisData={diagnosisData}
          />
        )}

        {drawerStep === 1 && (
          <>
            <div className="transfer-case-drawer-form-wrapper">
              <section className="rating-main">
                <section className="rating-section">
                  <p className="rating-count">
                    {ratingLabels[(hoveredRating ?? currentRating) - 1]}
                  </p>

                  <p className="rating-description">
                    {ratingDescriptions[(hoveredRating ?? currentRating) - 1]}
                  </p>

                  <Controller
                    name="rating"
                    control={controlFeedback}
                    render={({ field }) => (
                      <StarRate
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        onHoverChange={(val) => {
                          setHoveredRating(val === 0 ? null : val);
                        }}
                      />
                    )}
                  />
                </section>
              </section>

              <div className="feedback-section">
                <Controller
                  name="feedback"
                  control={controlFeedback}
                  rules={{ required: "Feedback is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      inputType="textarea"
                      label="Feedback"
                      placeholder="Enter your feedback"
                      height="190px"
                      required={true}
                      errors={errorsFeedback}
                    />
                  )}
                />
              </div>
            </div>

            <section className="transfer-case-drawer-footer-wrapper">
              <Button
                classes="next-btn"
                title={
                  !transfer && diagnosisData && displayDrawerContent()
                    ? "Complete Case"
                    : "Next"
                }
                handleClick={handleSubmitFeedback(submitFeedbackForm)}
                disabled={!isValid || isSubmitting}
              />

              <Button
                classes="simple"
                title="Back"
                handleClick={handleGoBack}
              />
            </section>
          </>
        )}

        {drawerStep === 2 && (
          <>
            <div className="transfer-case-drawer-form-wrapper">
              <Input
                inputType="searchField"
                placeholder="Search"
                height={44}
                value={search}
                onChange={handleSearch}
              />

              <section className="search-info">
                {transferList?.content?.map((user) => {
                  const { fullName, role } = user;

                  return (
                    <div
                      className={`search-details ${
                        selectedUser.id === user.id && "active"
                      }`}
                      onClick={(e) => handleSelectUser(user)}
                    >
                      <img
                        src={avatar}
                        className="search-avatar"
                        alt="user-icon"
                      />

                      <div className="user-info">
                        <p className="search-name">{fullName}</p>

                        <p className="search-designation">{role}</p>
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>

            <section className="transfer-case-drawer-footer-wrapper">
              <Button
                classes=""
                title="Transfer"
                handleClick={handleTransfer}
              />

              <Button
                classes="simple"
                title="Back"
                handleClick={handleGoBack}
              />
            </section>
          </>
        )}
      </>
    </Drawer>
  );
};

export default CaseTransferDrawer;
