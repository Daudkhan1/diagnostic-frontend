import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, Select } from "@/components/common";
import "../../pathologyTool/editor/styles.scss";

const validationSchema = yup.object().shape({
    spectrumType: yup.string().required("Disease Spectrum").default(""),
    newSpectrumType: yup
      .string()
      .when("spectrumType", ([spectrumType], schema) =>
        spectrumType === "NEW_SPECTRUN"
          ? schema.required("New spectrun type is required")
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
      details: annotationDetails?.description ?? "",
    },
    mode: "all",
  });

  const selectedSpectrumValue = watch("spectrumType");

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