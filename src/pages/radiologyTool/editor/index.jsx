import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { v4 as uuidV4 } from "uuid";
import OpenSeadragon from "openseadragon";
import classNames from "classnames";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AnnotationForm from "./AnnotationForm";

import { ArrowLeftIcon, AddPencilIcon } from "@/assets/svg";
import {
  OpenSeaDragonViewer,
  DashboardTemplate,
  Loader,
  Annotator,
  EditorCardHeader,
  EditorShaper,
} from "@/components";
import { Modal, Input, Card, Button, Select } from "@/components/common";
import { CANTALOUPE_SERVER } from "@/constants";
import { setFullScreen } from "@/reducers/fullScreen";

import AnnotationCard from "@/pages/pathologyTool/editor/annotationCard";
import {
  fetchImageMetadata,
  getPatientSlideByID,
  updatePatientSlideStatus,
} from "@/services/patientService.js";
import {
  getCaseByID,
  assignCaseByID,
  createReportbyCaseID,
  updateCaseStatus,
  getLatestCaseStatus,
} from "@/services/caseService.js";
import {
  createAnnotationInSlide,
  deleteAnnotationByID,
  getAnnotationTypeList,
  updateAnnotationState,
  updateAllAnnotations,
  getAnnotationDetails,
  getSpectrumList,
  updateAnnotation
} from "@/services/annotationService.js"; 
import {
  smoothZoomTo,
  smoothZoomToManual,
  getAIAnnotations,
  getManualAnnotations,
  displayLatestStatus,
  spectrumList,
} from "@/pages/pathologyTool/editor/utils";
import { getUserData } from "@/utils/storage";

import "../../pathologyTool/editor/styles.scss";

const Editor = (props) => {
  const {
    caseTabType,
    patientSlides,
    UserSelectedSlide,
    patientCaseID,
    handleBack
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = getUserData();
  const { fullScreen } = useSelector((state) => state.fullScreen);

  const tabType = caseTabType ?? "defaultTab";
  const slides = patientSlides ?? [];
  const selectedSlide = UserSelectedSlide ?? {
    slide: 0,
    id: slides[0]?.id ?? "",
    slideID: slides[0]?.slideID ?? "",
  };
  const caseID = patientCaseID;
  const slideID = selectedSlide?.slideID || slides[0]?.slideID || "";

  const schema = yup.object().shape({
    gross: yup.string(),
    microscopy: yup.string(),
    diagnosis: yup
      .string()
      .required("Diagnosis is required")
      .min(20, "Diagnosis too short!")
      .max(1000, "Diagnosis too long!"),
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { gross: "", microscopy: "", diagnosis: "" },
    mode: "all",
  });

  const resetDiagnosisForm = () => {
    setValue("gross", "");
    setValue("microscopy", "");
    setValue("diagnosis", "");
  };

  const annotatorRef = useRef();
  const viewerRef = useRef(null);
  const annotoriousInstance = useRef(null);
  // State for the current annotation being created
  const [currentAnnotation, setCurrentAnnotation] = useState(null);

  const [openSeadragonInstance, setOpenSeadragonInstance] = useState(null);
  const [savedAnnotations, setSavedAnnotations] = useState([]);
  const [allAnnotationsList, setAllAnnotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [modalAnnotation, setModalAnnotation] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteReasonModal, setDeleteReasonModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [reset, setReset] = useState(false);
  const [caseDataState, setCaseDataState] = useState(null);
  const [state, setState] = useState({
    file: "",
    dimensions: {
      height: "",
      width: "",
    },
    caseName: "",
    caseID: "",
    status: "",
    markButton: false,
    annotationCount: 0,
  });

  const [annotationEnabled, setAnnotationEnabled] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const annotationDetailInitialState = {
    shape: "ellipse",
    name: "",
    type: "",
    des: "",
    coordinates: [],
  };
  const [annotationDetails, setAnnotationDetails] = useState(
    annotationDetailInitialState
  );
  const [extractedCoordinates, setExtractedCoordinates] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [extractedAnnotationCoordinates, setExtractedAnnotationCoordinates] =
    useState([]);
  const [extractedManualCoordinates, setExtractedManualCoordinates] = useState(
    []
  );
  const [highlightedShapes, setHighlightedShapes] = useState([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [selectedAnnotationDetail, setSelectedAnnotationDetail] =
    useState(null);
  const [annotationTypeList, setAnnotationTypeList] = useState({
    list: [],
    spectrumList: [],
    loading: false,
  });
  const [formMethods, setFormMethods] = useState(null);
  const resetFormRef = useRef(null);
  const [resetAnnotationList, setResetAnnotationList] = useState(false);

  const [enableAI, setEnableAI] = useState(false);
  const [diagnosisModal, setDiagnosisModal] = useState(false);

  const manualAnnotations = getManualAnnotations(allAnnotationsList);
  const aiAnnotations = getAIAnnotations(allAnnotationsList);
  const manualCount = manualAnnotations.length ?? 0;
  const aiCount = aiAnnotations.length ?? 0;

  const [latestCaseStatus, setLatestCaseStatus] = useState(null);
  const [caseStatus, setCaseStatus] = useState(null);

  const [isChecked, setIsChecked] = useState(false);
  const [annotationState, setAnnotationState] = useState({
    undoAction: {},
    selectedAnnotation: null,
    modalType: null,
  });

  useEffect(() => {
    dispatch(setFullScreen(false));
  }, []);

  const fetchAnnotationTypeList = async () => {
    setAnnotationTypeList((st) => ({
      ...st,
      loading: false,
    }));

    try {
      const response = await getAnnotationTypeList("RADIOLOGY");
      const typeList = response.map((item) => ({
        value: item,
        label: item.replace("_", " "),
      }));
      const customType = { value: "NEW_TYPE", label: "*ENTER NEW TYPE*" };
      const organName = slides[0]?.organ ;
      const responsegetSpectrumList = await getSpectrumList(organName);
      const responseSpectrumList = responsegetSpectrumList?.data?.length
        ? responsegetSpectrumList.data.map((item) => ({
            id: item.id, 
            name: item.name,
            organName: item.organName, 
          }))
        : [];
      
      setAnnotationTypeList((st) => ({
        ...st,
        list: typeList.concat(customType),
        spectrumList: spectrumList.concat(responseSpectrumList),
      }));
    } catch (err) {
      toast.error(err);
    } finally {
      setAnnotationTypeList((st) => ({
        ...st,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    fetchAnnotationTypeList();
  }, [resetAnnotationList]);

  const handleCompleteSlide = async () => {
    try {
      const payload = { status: "COMPLETED" };
      const response = await updatePatientSlideStatus(slideID, payload);

      if (response) {
        toast.success("Slide completed successfully");
        fetchCaseData(state.caseID);
      }
    } catch (error) {
      toast.error(error.message || "Error completing slide");
    }
  };

  const filterAnnotations = (value) => {
    if (value) {
      setSavedAnnotations(aiAnnotations);
    } else {
      setSavedAnnotations(manualAnnotations);
    }
    setEnableAI(value);
  };

  const hideModal = () => {
    setAnnotationState((prev) => ({
      ...prev,
      selectedAnnotation: null,
      modalType: null,
    }));
  };

  const handleAcceptAiModal = (annotation) => {
    setAnnotationState((prev) => ({
      ...prev,
      selectedAnnotation: annotation.annotation_id,
      modalType: "ACCEPTED",
      undoAction: {
        ...prev.undoAction,
        [annotation.annotation_id]: true,
      },
    }));
  };

  const handleRejectAiModal = (annotation) => {
    setAnnotationState((prev) => ({
      ...prev,
      selectedAnnotation: annotation.annotation_id,
      modalType: "REJECTED",
      undoAction: {
        ...prev.undoAction,
        [annotation.annotation_id]: true,
      },
    }));
  };

  const goBack = () => {
    handleBack();
  };

  const handleAnnotationAction = async () => {
    if (annotationState.selectedAnnotation && annotationState.modalType) {
      try {
        const response = await updateAnnotationState(
          slideID,
          annotationState.selectedAnnotation,
          annotationState.modalType
        );
        if (response) {
          setReset((st) => !st);
          setAnnotationState((prev) => ({
            ...prev,
            undoAction: {
              ...prev.undoAction,
              [prev.selectedAnnotation]: true,
            },
            selectedAnnotation: null,
            modalType: null,
          }));
          toast.success(
            `AI Annotation has been ${annotationState.modalType.toLowerCase()} successfully.`
          );
        }
      } catch (error) {
        toast.error("Failed to update annotation state.");
      }
    }
  };

  const handleUndoAction = async (annotation) => {
    try {
      const response = await updateAnnotationState(
        slideID,
        annotation.annotation_id,
        "NEW"
      );

      if (response) {
        setReset((st) => !st);
        setAnnotationState((prev) => ({
          ...prev,
          undoAction: {
            ...prev.undoAction,
            [annotation.annotation_id]: false,
          },
          selectedAnnotation: null,
          modalType: null,
        }));
        toast.success("AI Annotation has been Undo successfully.");
      }
    } catch (error) {
      toast.error("Failed to reset annotation state.");
    }
  };

  const handleAllAnnotationAction = async (modalType) => {
    try {
      await updateAllAnnotations(slideID, modalType);
      toast.success(
        `All AI Annotations have been ${modalType.toLowerCase()} successfully.`
      );
      setReset((st) => !st);
    } catch (error) {
      toast.error(`Failed to ${modalType.toLowerCase()} all annotations.`);
    }
  };

  const toggleAnnotator = (toolName, updateAnnotationData = null) => {  
    if (!updateAnnotationData) {
        setIsEdit(false);
      setActiveTool(toolName);
      setAnnotationEnabled(true);
      setAnnotationDetails((st) => ({ ...st, shape: toolName }));
      setShowForm(!!toolName);
    } else {
      setIsEdit(true);
      setShowForm(true);
      const { 
        biologicalType = "", description = "", diseaseSpectrum = null, subtype = null, grading = null, annotation_id= null } = updateAnnotationData;
      setAnnotationDetails((prev) => ({ 
        ...prev, 
        biologicalType, 
        description, 
        diseaseSpectrum, 
        grading, 
        subtype, 
        annotationId: annotation_id
      }));
    }
  };

  const resetAnnotationState = async () =>  {
    const currentSlide = caseDataState?.slides?.find((slide) => slide.id === slideID);
    if (state?.annotationCount === 0 || currentSlide?.status === "COMPLETED") {
      await updatePatientSlideStatus(slideID, { status: "IN_PROGRESS" });
    }
    setReset((st) => !st);
    setState((st) => ({ ...st, markButton: true }));
    setAnnotationEnabled(false);
    setEnableAI(() => false);
    setShowForm(false);
    setResetAnnotationList((st) => !st);
  };

  const handleCreateAnnotation = async () => {
    await formMethods.handleSubmit(() => {})();
    const formValues = formMethods.getValues();

    const setBiologicalType =
      annotationDetails.type === "NEW_TYPE"
        ? newAnnotationType
        : annotationDetails.type;
        
    const diseaseSpectrum = {
      id: null,
      name: (formValues.spectrumType === "NEW_SPECTRUN"
        ? formValues.newSpectrumType
        : formValues.spectrumType
      ).toUpperCase(),
      organName: slides[0]?.organ || "",
    };
  
    if (!isEdit) {
      if (!currentAnnotation) {
        toast.error("No shape to save.");
        return;
      }
      setAnnotationDetails((st) => ({
        ...st,
        annotatorCoordinates: currentAnnotation,
      }));
      annotoriousInstance?.current?.setDrawingEnabled(true);
      setShowForm(false);

      const newPayload = {
        id: uuidV4(),
        patientSlideId: slideID,
        annotationType: "MANUAL",
        name: annotationDetails.name,
        biologicalType: setBiologicalType.toUpperCase(),
        caseType: "RADIOLOGY",
        shape: annotationDetails.shape,
        description: formValues.details,
        annotatorCoordinates: JSON.stringify(currentAnnotation),
        color: "red",
        isDeleted: false,
        lastModifiedUser: "test",
        diseaseSpectrum, 
        subtype: null,         
        grading: null,   
      };

      try {
        const response = await createAnnotationInSlide(newPayload);
        if (response.id) {
          setAnnotationDetails(annotationDetailInitialState);
          toast.success("Annotation added successfully!");
          resetAnnotationState()
        }
      } catch (error) {
          toast.error(error.message);
      } finally {
        setCurrentAnnotation(null);
      }
    } else {
      const updatedPayload = {
        biologicalType: setBiologicalType.toUpperCase(),
        description: annotationDetails.details,
        diseaseSpectrum,
        subtype: null,
        grading: null,
      };
  
      try {
        await updateAnnotation(slideID, annotationDetails.annotationId, "RADIOLOGY", updatedPayload);
        toast.success("Annotation updated successfully!");
        resetAnnotationState()
      } catch (error) {
        toast.error(error.message);
      } finally {
          setCurrentAnnotation(null);
      }
    }
  };

  const handleFormSubmit = () => {
    formMethods?.handleSubmit(handleCreateAnnotation)();
  };

  const handleAnnotationClick = async (selectedAnnotation) => {
    const imageWidth = state.dimensions.width;
    const imageHeight = state.dimensions.height;

    const { coordinates, manualCoordinates, annotatorCoordinates } =
      selectedAnnotation;

    let selectedCoordinates;

    // Handle manualCoordinates
    if (manualCoordinates && manualCoordinates?.length > 0) {
      selectedCoordinates = manualCoordinates?.map((coord) => ({
        x: parseFloat(coord?.x), // Convert to absolute pixel values
        y: parseFloat(coord?.y),
        width: parseFloat(coord?.width),
        height: parseFloat(coord?.height),
      }));
    }
    // Handle normalized coordinates
    else if (coordinates && coordinates?.length > 0) {
      selectedCoordinates = coordinates?.map((coord) => ({
        x: parseFloat(coord?.x),
        y: parseFloat(coord?.y),
      }));
    } else if (annotatorCoordinates) {
      const coordinatesModel = JSON.parse(annotatorCoordinates);
      selectedCoordinates =
        coordinatesModel?.target?.selector?.geometry?.bounds;
    } else {
      toast.warn("Selected annotation does not contain valid coordinates!");
      return;
    }

    setHighlightedShapes(selectedCoordinates);
    setSelectedAnnotationId(selectedAnnotation.id);
    setSelectedAnnotationDetail({ ...selectedAnnotation, slideID });

    const viewer = viewerRef.current;
    if (!viewer) {
      console.error("Viewer is not initialized.");
      return;
    }

    viewer.viewport.goHome();

    setTimeout(() => {
      if (manualCoordinates && manualCoordinates.length > 0) {
        const manualCoord = selectedCoordinates[0]; // Single manualCoordinate entry
        const viewportBounds = new OpenSeadragon.Rect(
          parseFloat(manualCoord.x), // x-coordinate
          parseFloat(manualCoord.y), // y-coordinate
          parseFloat(manualCoord.width) / viewer.viewport.getContainerSize().x, // width
          parseFloat(manualCoord.height) / viewer.viewport.getContainerSize().y // height
        );
        // viewer.viewport.fitBounds(viewportBounds, true);
        smoothZoomToManual(viewer, viewportBounds);
      } else if (coordinates && coordinates.length > 0) {
        // Compute the bounds for normalized coordinates
        const pixelCoordinates = selectedCoordinates.map((coord) => ({
          x: (coord.x / 100) * imageWidth,
          y: (coord.y / 100) * imageHeight,
        }));

        const xMin = Math.min(...pixelCoordinates.map((coord) => coord.x));
        const xMax = Math.max(...pixelCoordinates.map((coord) => coord.x));
        const yMin = Math.min(...pixelCoordinates.map((coord) => coord.y));
        const yMax = Math.max(...pixelCoordinates.map((coord) => coord.y));

        const paddingFactor = 0.1; // Adjust as necessary
        const width = xMax - xMin;
        const height = yMax - yMin;

        const paddedXMin = xMin - width * paddingFactor;
        const paddedYMin = yMin - height * paddingFactor;
        const paddedWidth = width * (1 + 2 * paddingFactor);
        const paddedHeight = height * (1 + 2 * paddingFactor);

        const viewportBounds = viewer.viewport.imageToViewportRectangle(
          paddedXMin,
          paddedYMin,
          paddedWidth,
          paddedHeight
        );

        smoothZoomTo(viewer, viewportBounds);
      } else if (annotatorCoordinates) {
        const viewportBounds = viewer.viewport.imageToViewportRectangle(
          selectedCoordinates.minX,
          selectedCoordinates.minY,
          selectedCoordinates.maxX - selectedCoordinates.minX,
          selectedCoordinates.maxY - selectedCoordinates.minY
        );
        smoothZoomTo(viewer, viewportBounds);
      }
    }, 1000);
  };

  const hideAnnotationForm = () => {
    setShowForm(false);
    setAnnotationEnabled(false); // Disable annotation mode
    setAnnotationDetails(annotationDetailInitialState);
    setIsEdit(false)
    setAnnotationDetails((st) => ({
      ...st,
      type: "",
      details: "",
    }));
    if (annotatorRef.current) {
      annotatorRef.current.clearCurrentAnnotation(); // Clear the in-progress annotation
    }
    if (resetFormRef.current) {
      resetFormRef.current();
    }
  };

  const onOpen = ({ namespace, instance }) => {
    setOpenSeadragonInstance({ namespace, instance }); // Set the viewer
  };

  const showReasonModal = () => {
    setDeleteReasonModal(() => true);
    hideDeleteModal();
  };

  const hideReasonModal = () => {
    setDeleteReasonModal(() => false);
    setModalAnnotation({});
  };

  const hideDeleteModal = () => {
    setDeleteModal(() => false);
  };

  const showDeleteModal = (record) => {
    setDeleteModal(() => true);
    setModalAnnotation(() => record);
  };

  const handleDeleteAnnotation = async () => {
    try {
      await deleteAnnotationByID(slideID, modalAnnotation.annotation_id);
      hideReasonModal();
      toast.success("Annotation deleted successfully!");

      setReset((st) => !st);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
     fetchLatestCaseStatus();
  }, [caseID]);
   
  useEffect(() => {
    if (latestCaseStatus && user && state) {
      setCaseStatus(displayLatestStatus(latestCaseStatus, user, state));
    }
  }, [latestCaseStatus, user, state]);
  
  const fetchLatestCaseStatus = async () => {
    try {
      const response = await getLatestCaseStatus(caseID);
      setLatestCaseStatus(response);
    } catch (error) {
      console.error(error);
    }
  };

  const imageMetadata = async (slide) => {
    try {
      const metaData = await fetchImageMetadata(slide);

      if (metaData?.height && metaData?.width) {
        const { height, width } = metaData;

        setState((st) => ({
          ...st,
          dimensions: {
            height,
            width,
          },
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch image metadata");
      return null;
    }
  };

  useEffect(() => {
    state?.file && imageMetadata(state.file);
  }, [state.file]);

  const fetchCaseData = async (id) => {
    try {
      const caseData = await getCaseByID(id);
      setCaseDataState(() => caseData);

      if (caseData) {
        setState((st) => ({
          ...st,
          caseName: caseData.caseName,
          status: caseData.status,
          markButton: true,
        }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    state.caseID && fetchCaseData(state.caseID);
  }, [state.caseID, reset]);

  const fetchSlideAnnotations = async () => {
    setLoading(true);

    try {
      const response = await getPatientSlideByID(slideID);
      if (response?.id) {
        setState((st) => ({
          ...st,
          caseID: response.caseId,
          file: response?.slideImagePath,
          annotationCount: response.annotationCount,
        }));

        const annotationsList = response?.annotations?.map((item) => ({
          name: item.name,
          type: item.annotationType,
          shape: item.shape,
          description: item.description,
          coordinates: item.coordinates,
          manualCoordinates: item.manualCoordinates,
          annotatorCoordinates: item.annotatorCoordinates,
          annotation_id: item.id,
          annotation_type: item.annotationType,
          case_id: response.caseId,
          biologicalType: item.biologicalType,
          color: item.color,
          caseType: item.caseType,
          lastModifiedUser: item.lastModifiedUser,
          state: item.state,
          isDeleted: item.isDeleted,
          diseaseSpectrum: item.diseaseSpectrum,
          subtype: item.subtype,
          grading: item.grading
        }));

        setSavedAnnotations(() => annotationsList);
        if (enableAI) {
          setSavedAnnotations(() => getAIAnnotations(annotationsList));
        } else {
          setSavedAnnotations(() => getManualAnnotations(annotationsList));
        }
        setAllAnnotations(() => annotationsList);
        const coordinate = annotationsList
          .filter((row) => row.coordinates)
          .map((row) => row.coordinates);
        setExtractedCoordinates(coordinate);

        const manualCoordinate = annotationsList
          .filter((row) => row.manualCoordinates) // Filters rows where manualCoordinates exists
          .map((row) => row.manualCoordinates);

        setExtractedManualCoordinates(manualCoordinate);

        const annotationCoordinates = annotationsList
          .filter((row) => row.annotatorCoordinates)
          .map((row) => JSON.parse(row.annotatorCoordinates));
        setExtractedAnnotationCoordinates(annotationCoordinates);
        if (!enableAI) {
          setSavedAnnotations(() => getManualAnnotations(annotationsList));
        }
      }
    } catch (error) {
      toast.error(err.message);
    } finally {
      setLoading(() => false);
    }
  };

  useEffect(() => {
    fetchSlideAnnotations();
  }, [reset]);

  // const handleMarkAsCompleteCase = async () => {
  //   setDiagnosisModal(() => true);
  // };

  // const handleAssignCase = async () => {
  //   try {
  //     const response = await assignCaseByID(state.caseID);

  //     if (response) {
  //       toast.success("Case referred to Senior Radiologist");
  //       setReferButton(() => false);

  //       const payload = { status: "REFERRED" };
  //       await updateCaseStatus(caseID, payload);
  //     }
  //   } catch (err) {
  //     toast.error("Senior Radiologist not found.");
  //   }
  // };

  const handleSubmitDiagnosis = async (data) => {
    try {
      const payload = {
        status: "COMPLETED",
      };
      const response = await updatePatientSlideStatus(slideID, payload);

      if (response) {
        const payload = {
          caseId: state.caseID,
          gross: data.gross,
          microscopy: data.microscopy,
          diagnosis: data.diagnosis,
        };

        const response = await createReportbyCaseID(payload);

        if (response.id) {
          setState((st) => ({ ...st, markButton: false }));
          setDiagnosisModal(() => false);
          resetDiagnosisForm();
          toast.success("Case marked as complete and Diagnosis submitted!");
        }
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoBack = () => {
    setAnnotationDetails(annotationDetailInitialState);
    setShowForm(false);
    navigate(`/radiology-annotation-tool/${slideID}/case-details`, {
      state: { ...location.state, tabType, slides, selectedSlide, caseID },
    });
  };

  const fetchAnnotationsSlideDetails = async (annotationSlideData) => {
    try {
      const { slideID, annotation_id } = annotationSlideData;
      const annotationData = await getAnnotationDetails(slideID, annotation_id);
      if (annotationData) {
        setSelectedAnnotationDetail(annotationData);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (selectedAnnotationDetail?.slideID) {
      fetchAnnotationsSlideDetails(selectedAnnotationDetail);
    }
  }, [selectedAnnotationDetail]);

  return (
    <>
      {loading && <Loader />}

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
            <Button title="Yes" handleClick={showReasonModal} />,
          ]}
        >
          <p className="status-update">
            Are you sure do you want to Delete this Annotation?
          </p>
        </Modal>
      )}

      {annotationState.modalType && (
        <Modal
          title="Alert"
          alertIcon
          open={!!annotationState.modalType}
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
              title="Yes"
              handleClick={handleAnnotationAction}
            />,
          ]}
        >
          <p className="status-update">
            {annotationState.modalType === "ACCEPTED"
              ? `Are you sure you want to accept this AI annotation?`
              : `Are you sure you want to reject this AI annotation?`}
          </p>
        </Modal>
      )}

      {diagnosisModal && (
        <Modal
          title="Add Diagnosis"
          open={diagnosisModal}
          onCancel={() => {
            resetDiagnosisForm();
            setDiagnosisModal(false);
          }}
          footer={[
            <Button
              title="Complete Case"
              disabled={errors?.diagnosis?.message}
              handleClick={handleSubmit(handleSubmitDiagnosis)}
            />,
          ]}
        >
          <section className="diagnosis-form-wrapper">
            {/* <section className="mt-16">
              <Controller
                name="gross"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    inputType="textarea"
                    label="Gross"
                    placeholder="Add Gross"
                    classes="custom-textarea"
                  />
                )}
              />
            </section> */}

            {/* <section className="mt-16">
              <Controller
                name="microscopy"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    inputType="textarea"
                    label="Microscopy"
                    placeholder="Add Microscopy"
                    classes="custom-textarea"
                  />
                )}
              />
            </section> */}

            <section className="mt-16">
              <Controller
                name="diagnosis"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    inputType="textarea"
                    label="Diagnosis"
                    placeholder="Add Diagnosis"
                    classes="custom-textarea"
                    required={true}
                    errors={errors}
                  />
                )}
              />
            </section>
          </section>
        </Modal>
      )}

      {deleteReasonModal && (
        <Modal
          title="Delete Annotation!"
          deleteIcon
          open={deleteReasonModal}
          onCancel={hideReasonModal}
          footer={[
            <Button
              title="No"
              classes="simple"
              handleClick={hideReasonModal}
            />,
            <Button title="Yes" handleClick={handleDeleteAnnotation} />,
          ]}
        >
          <section className="mt-16">
            <Input
              inputType="textarea"
              label="Reason"
              placeholder="Add Comment"
              value={deleteReason}
              onChange={(e) => {
                setDeleteReason(() => e?.target?.value);
              }}
            />
          </section>
        </Modal>
      )}

      {/* {user?.role === "SENIOR_RADIOLOGIST" &&
        state.markButton &&
        state.status !== "COMPLETE" && (
          <section className="mark-as-complete-wrapper top-nav-button">
            <Button
              title="Mark as Complete"
              classes="mark-as-complete-button"
              handleClick={handleMarkAsCompleteCase}
            />
          </section>
        )} */}
      <section
        className={classNames({
          "annotation-details-layout-container": true,
          "annotation-details-full-screen-container": fullScreen,
        })}
      >
        <Card
          headerClasses={"annotation-card-custom-header"}
          bodyClasses={classNames({
            "annotations-list-card": true,
            "annotations-list-full-screen-card": fullScreen,
          })}
          header={
            <section className="annotations-card-header-container">
              {showForm ? (
                <section className="anno-header">
                  <Button
                    buttonType="iconOnly"
                    classes="navigate-annotation-button"
                    icon={<ArrowLeftIcon />}
                    handleClick={hideAnnotationForm}
                  />

                  <p className="heading">Annotation Detail</p>
                </section>
              ) : (
                <EditorCardHeader
                  mainHeading={`Slide ${selectedSlide.slide + 1} Details`}
                  manualCount={manualCount}
                  aiCount={aiCount}
                  enableAI={enableAI}
                  filterAnnotations={filterAnnotations}
                  isChecked={isChecked}
                  setIsChecked={setIsChecked}
                  handleAllAnnotationAction={handleAllAnnotationAction}
                  savedAnnotations={savedAnnotations}
                  caseDataState={caseDataState}
                  handleCompleteSlide={handleCompleteSlide}
                  slideID={slideID}
                  caseStatus={caseStatus}
                  handleBack={goBack}
                />
              )}
            </section>
          }
        >
          {showForm ? (
            <section className="annotation-form-wrapper">
              <article className="slide-detail">
              <p className="heading">Annotation Detail</p>
              </article>

              <AnnotationForm
                annotationDetails={annotationDetails}
                annotationTypeList={annotationTypeList}
                setFormMethods={setFormMethods}
                resetForm={resetFormRef}
                setAnnotationTypeList={setAnnotationTypeList}
              />
            </section>
          ) : (
            <>
              <section className="annotation-list-container">
                {savedAnnotations.map((annotation, index) => {
                  const { annotation_id } = annotation;

                  return (
                    <AnnotationCard
                      key={`annotation-card-${annotation_id}`}
                      annotation={annotation}
                      handleAnnotationClick={handleAnnotationClick}
                      selectedAnnotationId={selectedAnnotationId}
                      showDeleteModal={showDeleteModal}
                      handleAcceptAiModal={handleAcceptAiModal}
                      handleRejectAiModal={handleRejectAiModal}
                      handleUndoAction={handleUndoAction}
                      isChecked={isChecked}
                      annotationIndex={index + 1}
                      caseStatus={caseStatus}
                      toggleAnnotator={toggleAnnotator}
                      sideBarTab={"RADIOLOGY"}
                    />
                  );
                })}
              </section>

              {/* {user?.role === "JUNIOR_RADIOLOGIST" &&
                savedAnnotations.length > 0 && (
                  <section className="mark-as-complete-wrapper">
                    <Button
                      title="Refer to Senior"
                      classes="mark-as-complete-button"
                      handleClick={handleAssignCase}
                    />
                  </section>
                )} */}
            </>
          )}
        </Card>

        <Card
          heading={state?.caseName}
          header={
            !showForm && (caseStatus === "IN_PROGRESS" || caseStatus === "INCOMING") ? (
              <Button
                title="Add Annotation"
                classes="add-button-with-icon"
                disabled={annotationTypeList.loading}
                icon={<AddPencilIcon />}
                handleClick={() => toggleAnnotator("rectangle")}
              />
            ) : null
          }
          bodyClasses={classNames({
            relative: true,
            "max-size": !fullScreen,
            "full-screen-card": fullScreen,
            "footer-buttons": showForm,
          })}
        >
          {state?.file && (
            <OpenSeaDragonViewer
              tileSources={`${CANTALOUPE_SERVER}${state.file}/info.json`}
              showNavigationControl={false}
              onOpen={onOpen}
              viewerRef={viewerRef}
              annotoriousInstance={annotoriousInstance}
              defaultZoom={0.2}
              minZoomLevel={0.5}
              showScale={false}
              selectedAnnotation={selectedAnnotationDetail}
              annotationEnabled={annotationEnabled}
              setAnnotationEnabled={setAnnotationEnabled}
              hasAnnotation={currentAnnotation?.id}
              showForm={showForm}
              hideAnnotationForm={hideAnnotationForm}
              handleCreateAnnotation={handleFormSubmit}             
              isValid={formMethods?.isValid}
              isEdit={isEdit}
              sideBarTab={"RADIOLOGY"}
            />
          )}

          {showForm && !isEdit && (
            <EditorShaper
              currentAnnotation={currentAnnotation}
              annotationEnabled={annotationEnabled}
              activeTool={activeTool}
              toggleAnnotator={toggleAnnotator}
            />
          )}

          {openSeadragonInstance && annotoriousInstance && (
            <>
              <Annotator
                ref={annotatorRef}
                openSeadragon={openSeadragonInstance}
                annotoriousInstance={annotoriousInstance}
                annotationEnabled={annotationEnabled}
                annotationDetails={annotationDetails}
                annotationList={savedAnnotations}
                onSave={handleCreateAnnotation}
                coordinates={extractedCoordinates}
                manualCoordinates={extractedManualCoordinates}
                annotationCoordinates={extractedAnnotationCoordinates}
                highlightedShapes={highlightedShapes}
                selectedAnnotation={selectedAnnotation}
                setCurrentAnnotation={setCurrentAnnotation}
                currentAnnotation={currentAnnotation}
                activeTool={activeTool}
              />
            </>
          )}
        </Card>
      </section>
      </>
  );
};

export default Editor;
