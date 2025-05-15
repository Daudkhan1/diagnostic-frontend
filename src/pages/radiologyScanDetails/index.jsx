import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { If, Then, Else } from "react-if";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";

import { NoSlideIcon, PlusIcon } from "@/assets/svg";
import {
  DashboardTemplate,
  Comment,
  PatientDetail,
  SlidePreview,
  CaseDetailDrawer,
  OpenSeaDragonViewer,
} from "@/components";
import { Radio, Card, Button, Modal } from "@/components/common";

import { getUserNameInitials } from "@/utils/helpers";
import { getUniqueOrgans } from "@/pages/pathologyScanDetails/utils";
import { getCaseByID } from "@/services/caseService";
import { CANTALOUPE_SERVER, RADIOLOGY_MAX_FILE_SIZE, organColorMap } from "@/constants";
import { setFullScreen } from "@/reducers/fullScreen";
import { deletePatientSlideByID } from "@/services/patientService.js";

const RadiologyScanDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const caseID = location.pathname.split("/")[3];

  const dispatch = useDispatch();

  const viewerRef = useRef(null);

  const { fullScreen } = useSelector((state) => state.fullScreen);

  const [tabType, setTabType] = useState("patientDetails");
  const [patientData, setPatientData] = useState();
  const [refresh, setRefresh] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState({
    slide: undefined,
    id: "",
  });
  const [caseDrawer, setCaseDrawer] = useState(false);

  useEffect(() => {
    dispatch(setFullScreen(false));
  }, []);

  const showCaseDrawer = () => {
    setCaseDrawer(() => true);
  };

  const hideCaseDrawer = () => {
    setCaseDrawer(() => false);
  };

  const handleSelectSlide = (slide, id) => {
    setCurrentSlide(() => ({
      slide,
      id,
    }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (patientData?.slides?.length === 0) {
      setCurrentSlide({ slide: undefined, id: "" });
    }
  }, [patientData?.slides]);

  const handleTabChange = (e) => {
    const tabSelected = e.target.value;
    setTabType(() => tabSelected);
  };

  const fetchCaseData = async (id) => {
    hideCaseDrawer();

    try {
      const caseData = await getCaseByID(id);

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

  const showDeleteModal = (slideId) => {
    setDeleteModal(true);
    setSelectedSlideId(slideId);
  };

  const hideDeleteModal = () => {
    setDeleteModal(false);
    setSelectedSlideId(null);
  };

  const handleDeletePatient = async () => {
    if (!selectedSlideId) return;
    try {
      await deletePatientSlideByID(selectedSlideId);
      setPatientData((prevData) => ({
        ...prevData,
        slides: prevData.slides.filter((slide) => slide.id !== selectedSlideId),
      }));
      hideDeleteModal();
      toast.success("Slide deleted successfully!");
    } catch (error) {
      console.error(
        `Failed to delete slide with ID ${selectedSlideId}:`,
        error
      );
    }
  };

  useEffect(() => {
    fetchCaseData(caseID);
  }, [caseID, refresh]);

  const totalSlides = patientData?.slides.length;

  return (
    <DashboardTemplate goBack lessGap handleGoBack={handleGoBack}>
      {caseDrawer && (
        <CaseDetailDrawer
          open={caseDrawer}
          onClose={hideCaseDrawer}
          step={2}
          currentCase={caseID}
          setRefresh={setRefresh}
          caseType="RADIOLOGY"
          fileFormat={["tif", "tiff", "dcm", "dicom"]}
          uploadLabel="Upload Scan"
          maxFileSize={RADIOLOGY_MAX_FILE_SIZE}
        />
      )}
      {deleteModal && (
        <Modal
          title="Alert"
          alertIcon
          open={deleteModal}
          onCancel={hideDeleteModal}
          footer={[
            <Button
              title="No"
              classes="simple"
              handleClick={hideDeleteModal}
            />,
            <Button title="Yes" handleClick={handleDeletePatient} />, // Uses stored slide ID
          ]}
        >
          <p className="status-update">
            Are you sure you want to delete this slide?
          </p>
        </Modal>
      )}
      <section className="admin-table-fields-container">
        <Radio
          options={[
            {
              label: "Patient Details",
              value: "patientDetails",
            },
            {
              label: "Scans",
              value: "scans",
            },
          ]}
          value={tabType}
          onChange={handleTabChange}
          defaultValue="patientDetails"
        />
        {patientData?.status !== "COMPLETE" && (
          <article className="table-search-fields-container">
            <Button
              title="Add Scan"
              classes="add-filter-button"
              icon={<PlusIcon />}
              handleClick={showCaseDrawer}
            />
          </article>
        )}
      </section>

      <If condition={tabType === "scans"}>
        <Then>
          <section className="slide-details-layout-container">
            <Card
              heading="Scans"
              count={`(${totalSlides} ${totalSlides > 1 ? "Scans" : "Scan"})`}
            >
              <section className="slides-list-container">
                {patientData?.slides?.map((data, index) => {
                  return (
                    <SlidePreview
                      key={`radiology-slide-${index}`}
                      slide={index + 1}
                      content={patientData?.caseName}
                      status={patientData?.status}
                      slideData={data}
                      currentSlide={currentSlide}
                      handleSelectSlide={handleSelectSlide}
                      handleDeletePatient={showDeleteModal}
                      showDel={true}
                    />
                  );
                })}
              </section>
            </Card>

            <Card
              cardClasses={fullScreen && "full-screen-open-sea-dragon"}
              heading={
                currentSlide.slide > -1
                  ? `Scan ${currentSlide.slide + 1} Image ${currentSlide.id}`
                  : "No Scan Selected"
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
                      showScale={false}
                      defaultZoom={0.2}
                      minZoomLevel={0.5}
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
        </Then>

        <Else>
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
                    heading="Case ID"
                    content={patientData?.caseName}
                  />

                  <PatientDetail
                    heading="Praid ID"
                    content={patientData?.patientDetailsDTO?.praidId}
                  />

                  <PatientDetail
                    heading="Number of Scans"
                    content={totalSlides}
                    classes="slides"
                  />

                  {/* <PatientDetail heading="Contact Number" content="12345678" /> */}

                  {/* <PatientDetail
                    heading="Number of Scans"
                    content={patientData?.patient_slides[0]?.slides}
                    classes="slides"
                  /> */}
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
                    heading="Creation Date"
                    content={patientData?.date 
                      ? new Date(patientData.date).toLocaleDateString('en-GB', { 
                          day: '2-digit', month: 'short', year: 'numeric' 
                        }).replace(',', '') 
                      : 'N/A'}
                  />
                </article>
              </section>
            </Card>

            <Card heading="Comments">
              <section className="comments-listing-container">
                {patientData?.comments?.map((comment) => (
                  <Comment key={`comment-${comment.id}`} comment={comment} />
                ))}
              </section>
            </Card>
          </section>
        </Else>
      </If>
    </DashboardTemplate>
  );
};

export default RadiologyScanDetails;
