import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, Select } from "@/components/common";
import "./styles.scss";

import { getGradingListBySpectrum } from "@/services/annotationService.js";
import { gradingList } from "./utils.js";

const validationSchema = yup.object().shape({
    spectrumType: yup.string().required("Disease Spectrum").default(""),
    newSpectrumType: yup
      .string()
      .when("spectrumType", ([spectrumType], schema) =>
        spectrumType === "NEW_SPECTRUN"
          ? schema.required("New spectrun type is required")
          : schema.notRequired()
      ),
    grading: yup.string().required("Grading is required").default(""),
    newGradingType: yup
      .string()
      .when("grading", ([grading], schema) =>
        grading === "NEW_GRADING"
          ? schema.required("New grading type is required")
          : schema.notRequired()
      ),
    subType: yup.string().required("Sub Type is required").default(""),
    newSubType: yup
    .string()
    .when("subType", ([subType], schema) =>
      subType === "NEW_SUB_TYPE"
        ? schema.required("New sub type is required")
        : schema.notRequired()
    ),
});

const AnnotationForm  = ({ annotationDetails, annotationTypeList, setFormMethods, resetForm,setAnnotationTypeList  }) => {
  const {
    control: annotationControl,
    handleSubmit,
    watch,
    getValues,
    formState: { errors: annotationErrors, isValid },
    reset: annotationFormReset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      shape: annotationDetails.shape ?? "",
      spectrumType: annotationDetails?.diseaseSpectrum?.name ?? "",
      grading: annotationDetails?.grading?.name ?? "",
      subType: annotationDetails?.subtype?.name ?? "",
      details: annotationDetails?.description ?? "",
    },
    mode: "all",
  });

  const selectedSpectrumValue = watch("spectrumType");
  const [gradingKey, setGradingKey] = React.useState(0);

  const getOrganName = (gradingList) => {
    return gradingList?.find(item => item?.organName != null)?.organName || "";
  };  

  useEffect(() => {
    if (setFormMethods) {
      setFormMethods({
        handleSubmit,
        getValues,
        isValid, 
        annotationFormReset,
      });
    }
  }, [setFormMethods, handleSubmit, getValues, isValid, annotationFormReset,]);

  const fetchGradingListBySpectrum = async () => {
    if (selectedSpectrumValue && selectedSpectrumValue !== "") {
      try {
        const organName = getOrganName(annotationTypeList?.gradingList);
        if (!organName) return;
        
        const response = await getGradingListBySpectrum(organName, selectedSpectrumValue);
        const updatedGradingList = response?.data?.length
          ? response.data.map((item) => ({
              id: item.id,
              name: item.name,
              organName: item.organName,
            }))
          : [];
  
        const mergedGradingList = gradingList.concat(updatedGradingList);
  
        setAnnotationTypeList((st) => ({
          ...st,
          gradingList: mergedGradingList,
        }));
        const gradingName = annotationDetails?.grading?.name;
        if (gradingName && mergedGradingList.some((item) => item.name === gradingName)) {
          annotationFormReset((prev) => ({
            ...prev,
            grading: gradingName,
          }));
        }
        setGradingKey((prev) => prev + 1);
      } catch (err) {
        console.error("Failed to fetch grading list:", err);
      }
    }
  };

  useEffect(() => {
    fetchGradingListBySpectrum();
    annotationFormReset((prevValues) => ({
      ...prevValues,
      grading: "",
    }));
  }, [selectedSpectrumValue]);
  

  useEffect(() => {
    if (setFormMethods) {
      setFormMethods({
        handleSubmit,
        getValues,
        isValid,
        annotationFormReset,
      });
    }
  }, [setFormMethods, handleSubmit, getValues, isValid, annotationFormReset]);

  useEffect(() => {
    if (resetForm) {
      resetForm.current = annotationFormReset;
    }
  }, [resetForm, annotationFormReset]);

  return (
    <>
      <Controller
        name="shape"
        control={annotationControl}
        render={({ field }) => (
          <Input
            {...field}
            label="Shape"
            height="54px"
            disabled
            value={ annotationDetails.shape}
            errors={annotationErrors?.shape}
          />
        )}
      />

      <Controller
        name="spectrumType"
        control={annotationControl}
        render={({ field }) => (
          <Select
            {...field}
            label="Disease Spectrum *"
            errors={annotationErrors}
            options={annotationTypeList.spectrumList.map((item) => ({
              id: item.id,
              value: item.name,
              label: item.organ,
            }))}     
            height="54px"
            value={field.value}
            onChange={(value) => field.onChange(value)} 
          />
        )}
      />

      {watch("spectrumType") === "NEW_SPECTRUN" && (
        <div className={`form-field-wrapper ${watch("spectrumType") === "NEW_SPECTRUN" ? "full-width" : ""}`}>
          <Controller
            name="newSpectrumType"
            control={annotationControl}
            render={({ field }) => (
              <Input
                {...field}
                label="Enter Disease Spectrum *"
                placeholder="Add new Spectrum"
                classes="new-type-field"
                height="54px"
                errors={annotationErrors}
              />
            )}
          />
        </div>
      )}

      <Controller
        name="grading"
        control={annotationControl}
        render={({ field }) => (
          <Select
            key={gradingKey}
            {...field}
            label="Grading *"
            classes="annotation-select-field"
            options={annotationTypeList.gradingList.map((item) => ({
              value: item.name,
              label: item.organ,
            }))}
            height="54px"
            errors={annotationErrors}
            onChange={(options) => field.onChange(options)} 
          />
        )}
      />

      {watch("grading") === "NEW_GRADING" && (
        <div className="form-field-wrapper">
          <Controller
            name="newGradingType"
            control={annotationControl}
            render={({ field }) => (
              <Input
                {...field}
                label="Enter New Grading *"
                placeholder="Add new grading"
                classes="annotation-select-field"
                height="54px"
                errors={annotationErrors}
              />
            )}
          />
        </div>
      )}

      <Controller
        name="subType"
        control={annotationControl}
        render={({ field }) => (
          <Select
            {...field}
            label="Sub Type *"
            classes="annotation-select-field"
            options={annotationTypeList.subTypeList.map((item) => ({
              value: item.name,
              label: item.organ,
            }))}
            height="54px"
            errors={annotationErrors}
            onChange={(value) => field.onChange(value)} 
          />
        )}
      />

      {watch("subType") === "NEW_SUB_TYPE" && (
        <div className="form-field-wrapper">
          <Controller
            name="newSubType"
            control={annotationControl}
            render={({ field }) => (
              <Input
                {...field}
                label="Enter New Sub Type *"
                placeholder="Add new Sub Type"
                classes="annotation-select-field"
                height="54px"
                errors={annotationErrors}
              />
            )}
          />
        </div>
      )}

      <Controller
        name="details"
        control={annotationControl}
        render={({ field }) => (
        <Input
          {...field}
          inputType="textarea"
          label="Description"
          placeholder="Add description"
        />
        )}
      />
    </>
  );
};

export default AnnotationForm;