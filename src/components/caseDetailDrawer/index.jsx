import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Switch, Case, Default } from "react-if";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { NationIDIcon } from "@/assets/svg";
import { ChunkUpload } from "@/components";
import { Input, Button, Drawer, Upload, Select } from "@/components/common";
import Form from "./form";
// import { getMainContent } from "./caseDetailDrawerUtils";
import { createPatientCase } from "@/services/caseService";
// import { NATIONAL_ID_REGEX } from "@/utils/regex";
import {
  getDetailsByMRN,
  uploadPatientImage,
  uploadPatientSlide,
} from "@/services/patientService";
import {
  pathologyOrganOption,
  radiologyOrganOption,
  customOrganOption
} from "./caseDetailDrawerUtils";
import { getOrganOptions } from "@/services/slideService";

import "./styles.scss";

const CaseDetailDrawer = (props) => {
  const {
    open,
    caseType,
    onClose,
    redirectTo,
    fileFormat,
    uploadLabel,
    maxFileSize,
    step,
    currentCase,
    setRefresh,
    setReset,
  } = props;

  const navigate = useNavigate();
  const [options, setOptions] = useState([]);

  const MRNSchema = yup.object().shape({
    mrn: yup.string().required("MRN number is required"),
    // .matches(NATIONAL_ID_REGEX, "MRN number should be exactly 13 digits"),
  });

  const uploaderOptionalSchema =
    caseType === "PATHOLOGY"
      ? yup.object().shape({
          organ: yup.string().required("Organ is required"),
          micronPerMeter: yup.string().required("Micron per meter is required"),
        })
      : yup.object().shape({
          organ: yup.string().required("Organ is required"),
        });

  const uploaderOtionalValues =
    caseType === "PATHOLOGY"
      ? {
          organ: "",
          micronPerMeter: "",
        }
      : { organ: "" };

  const {
    control: controlMRN,
    handleSubmit: handleSubmitMRN,
    formState: { errors: errorsMRN },
  } = useForm({
    resolver: yupResolver(MRNSchema),
    defaultValues: { mrn: "" },
    mode: "all",
  });

  const {
    control: uploaderControl,
    watch,
    handleSubmit: handleSubmitMicron,
    formState: { errors: uploaderErrors },
  } = useForm({
    resolver: yupResolver(uploaderOptionalSchema),
    defaultValues: uploaderOtionalValues,
    mode: "all",
  });

  const micronPerMeterValue = watch("micronPerMeter");
  const organValue = watch("organ");
  const newOrganValue = watch("newOrgan");
  const selectedOrganValue = (organValue === "new_organ" ? newOrganValue : organValue)?.toUpperCase();

  const [caseDetails, setCaseDetails] = useState(step || 0);
  const [caseID, setCaseID] = useState("");
  const [existID, setExistID] = useState(undefined);
  const [formData, setFormData] = useState({
    id: "",
    praidId: "",
    gender: "",
    age: "",
    mrn: "",
    decryptedMrn: "",
    formattedPraidId: "",
  });

  const handleShowCaseDetails = () => {
    setCaseDetails((st) => st + 1);
  };

  const handleNavigate = (id) => {
    navigate(`${redirectTo}/${id}/case-details`);
  };

  const fetchOrganOptions = async () => {
    try {
      const response = await getOrganOptions();
      const transformedOptions = [
        customOrganOption,
        ...response.data.map(option => ({
          value: option,  
          label: option,  
        })),
      ];
      setOptions(transformedOptions);  
    } catch (error) {
      console.error("Failed to fetch organ options", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganOptions();
  }, [caseDetails]);

  const DrawerTitle = () => (
    <section className="custom-case-details-drawer-header">
      <p className="heading">Case Details</p>
      <p className="caption"></p>

      <section className="steps-wrapper">
        <span className={`step ${caseDetails > 0 && "active"}`} />
        <span className={`step ${caseDetails > 1 && "active"}`} />
      </section>
    </section>
  );

  const fetchMRNNumber = async ({ mrn }) => {
    try {
      const response = await getDetailsByMRN(mrn);

      if (response?.id) {
        setExistID(() => response?.id);
        setFormData((st) => ({
          ...st,
          id: response?.id,
          praidId: response?.praidId,
          gender: response?.gender,
          age: response?.age,
          mrn: response?.mrn,
          decryptedMrn: response?.decryptedMrn,
          formattedPraidId: response?.formattedPraidId,
        }));

        handleShowCaseDetails();
      }
    } catch (err) {
      if (err.status === 404) {
        setFormData((st) => ({
          ...st,
          mrn: mrn,
        }));
        handleShowCaseDetails();
      } else {
        setFormData((st) => ({
          ...st,
          mrn: mrn,
        }));
        handleShowCaseDetails();
        toast.error(err.message);
      }
    }
  };

  const handleCreateCase = async (data) => {
    const payload = {
      patientDetailsDTO: {
        ...(existID && { id: existID }),
        praidId: 0,
        gender: data.gender,
        age: data.age,
        mrn: data.mrn,
      },
      caseType: caseType,
    };

    try {
      const response = await createPatientCase(payload);

      if (response?.id) {
        setCaseID(() => response.id);
        setReset((prev) => !prev);
        handleShowCaseDetails();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const [state, setState] = useState({
    fileData: [],
    fileUploaded: false,
    isReset: false,
  });

  const setFileData = useCallback((data, error) => {
    setState((st) => ({
      ...st,
      fileData: data,
      fileUploaded: !error,
      isReset: false,
      isFileError: error,
    }));
  }, []);

  const handleResetFileData = () => {
    setState((st) => ({
      ...st,
      fileData: [],
      isReset: true,
    }));
  };

  const handleUploadFile = async () => {
    if (state.fileData && state.fileData.length > 0) {
      const data = new FormData();
      const file = state.fileData[0];
      const name = file?.name?.replace("dcm", "tiff");
      if ("originFileObj" in file) {
        data.append("file", file.originFileObj);
      } else {
        data.append("file", file);
      }
      try {
        const uploadImage = await uploadPatientImage(data);
        if (uploadImage) {
          const payload = {
            caseId: currentCase || caseID,
            slideImagePath: name,
            showImagePath: name,
            organ: selectedOrganValue,
          };
          const uploadPatientSlideData = await uploadPatientSlide(payload);
          if (uploadPatientSlideData?.id) {
            if (currentCase) {
              setRefresh((st) => !st);
            } else {
              handleNavigate(uploadPatientSlideData.caseId);
            }
            toast.success(successMessage(caseType));
          }
        }
      } catch (err) {
        toast.error(err);
      }
    }
  };

  // const options =
  //   caseType === "PATHOLOGY" ? pathologyOrganOption : radiologyOrganOption;
  return (
    <Drawer
      closeIcon
      classes={`radiology-drawer ${caseDetails > 0 && "patient-details"}`}
      title={caseDetails > 0 && caseDetails < 3 && <DrawerTitle />}
      onClose={onClose}
      open={open}
      maskClosable={false}
    >
      <section className="radiology-drawer-inner-form">
        <Switch>
          <Case condition={caseDetails === 0}>
            <span className="form-icon">
              <NationIDIcon />
            </span>

            <p className="main-heading">MRN Detail</p>

            <p className="caption">Please provide your detail</p>

            <Controller
              name="mrn"
              control={controlMRN}
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    label="MRN Number"
                    placeholder="Enter MRN number"
                    height="54px"
                    required={true}
                    errors={errorsMRN}
                    maxLength={13}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.replace(/\D/g, "").slice(0, 13)
                      )
                    }
                  />
                );
              }}
            />

            <Button
              classes="drawer-continue-button"
              title="Continue"
              disabled={errorsMRN?.mrn}
              handleClick={handleSubmitMRN(fetchMRNNumber)}
            />
          </Case>

          <Case condition={caseDetails === 1}>
            <Form
              existID={existID}
              formData={formData}
              handleCreateCase={handleCreateCase}
            />
          </Case>

          <Default>
            {caseType === "PATHOLOGY" ? (
              <>
                <section className="mb-32 w-100">
                  <Controller
                    name="organ"
                    control={uploaderControl}
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          label={
                            caseType === "PATHOLOGY" ? "Organ" : "Scan Type"
                          }
                          required={true}
                          errors={uploaderErrors}
                          options={options}
                          height="54px"
                        />
                      );
                    }}
                  />
                </section>

                {watch("organ") === "new_organ" && (
                  <section className="mb-32 w-100">
                    <Controller
                      name="newOrgan"
                      control={uploaderControl}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Enter New Organ"
                          placeholder="Add new organ"
                          classes="new-type-field"
                          height="54px"
                          required={true}
                          errors={uploaderErrors}
                        />
                      )}
                    />
                  </section>
                )}

                <section className="mb-32 w-100">
                  <Controller
                    name="micronPerMeter"
                    control={uploaderControl}
                    render={({ field }) => {
                      return (
                        <Input
                          {...field}
                          label="Micron per meter"
                          placeholder="Enter Micron per meter"
                          height="54px"
                          required={true}
                          errors={uploaderErrors}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/[^0-9.]/g, "")      
                              .replace(/(\..*)\./g, "$1") 
                
                            field.onChange(value);
                          }}
                        />
                      );
                    }}
                  />
                </section>

                <section className="patient-details-upload-wrapper mb-32">
                  <ChunkUpload
                    fileFormat={fileFormat}
                    label={uploadLabel}
                    currentCase={currentCase}
                    caseID={caseID}
                    setRefresh={setRefresh}
                    handleNavigate={handleNavigate}
                    caseType={caseType}
                    micronPerMeterValue={micronPerMeterValue}
                    organValue={selectedOrganValue}
                    disabled={
                      !selectedOrganValue ||
                      !micronPerMeterValue ||
                      uploaderErrors?.micronPerMeter
                    }
                  />
                </section>
              </>
            ) : (
              <>
                <section className="mb-32 w-100">
                  <Controller
                    name="organ"
                    control={uploaderControl}
                    render={({ field }) => {
                      return (
                        <Select
                          {...field}
                          label={
                            caseType === "PATHOLOGY" ? "Organ" : "Scan Type"
                          }
                          required={true}
                          errors={uploaderErrors}
                          options={options}
                          height="54px"
                        />
                      );
                    }}
                  />
                </section>

                {watch("organ") === "new_organ" && (
                  <section className="mb-32 w-100">
                    <Controller
                      name="newOrgan"
                      control={uploaderControl}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Enter New Organ "
                          placeholder="Add new organ"
                          classes="new-type-field"
                          height="54px"
                          errors={uploaderErrors}
                          required={true}
                        />
                      )}
                    />
                  </section>
                )}

                <section className="patient-details-upload-wrapper">
                  <Upload
                    fileFormat={fileFormat}
                    label={uploadLabel}
                    setFileData={setFileData}
                    maxFileSize={maxFileSize}
                    handleRemove={handleResetFileData}
                    isReset={state.isReset}
                    caseType={caseType}
                    disabled={!selectedOrganValue}
                  />
                </section>

                <Button
                  classes="drawer-continue-button"
                  title="Continue"
                  handleClick={handleUploadFile}
                  disabled={!selectedOrganValue}
                />
              </>
            )}
          </Default>
        </Switch>
      </section>
    </Drawer>
  );
};

export default CaseDetailDrawer;
